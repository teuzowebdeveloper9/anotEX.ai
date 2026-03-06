import { BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UploadAudioUseCase } from './upload-audio.use-case.js';
import type { IAudioRepository } from '../repositories/audio.repository.js';
import type { IStorageRepository } from '../repositories/storage.repository.js';
import { AudioStatus } from '../entities/audio.entity.js';

const makeFile = (overrides: Partial<Express.Multer.File> = {}): Express.Multer.File => ({
  fieldname: 'audio',
  originalname: 'aula.webm',
  encoding: '7bit',
  mimetype: 'audio/webm',
  size: 1024,
  buffer: Buffer.from('audio'),
  destination: '',
  filename: '',
  path: '',
  stream: null as never,
  ...overrides,
});

describe('UploadAudioUseCase', () => {
  let useCase: UploadAudioUseCase;
  let audioRepository: jest.Mocked<IAudioRepository>;
  let storageRepository: jest.Mocked<IStorageRepository>;
  let configService: jest.Mocked<ConfigService>;

  beforeEach(() => {
    audioRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      findByUserId: jest.fn(),
      updateStatus: jest.fn(),
      delete: jest.fn(),
    } as jest.Mocked<IAudioRepository>;

    storageRepository = {
      upload: jest.fn(),
      getSignedUrl: jest.fn(),
      delete: jest.fn(),
    } as jest.Mocked<IStorageRepository>;

    configService = {
      get: jest.fn().mockReturnValue(100),
      getOrThrow: jest.fn(),
    } as unknown as jest.Mocked<ConfigService>;

    useCase = new UploadAudioUseCase(audioRepository, storageRepository, configService);
  });

  describe('execute', () => {
    it('deve retornar erro se o MIME type não for permitido', async () => {
      const result = await useCase.execute({
        userId: 'user-1',
        file: makeFile({ mimetype: 'video/mp4' }),
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeInstanceOf(BadRequestException);
        expect(result.error.message).toContain('Unsupported audio format');
      }
    });

    it('deve retornar erro se o arquivo exceder o tamanho máximo', async () => {
      configService.get = jest.fn().mockReturnValue(1); // 1MB max
      const result = await useCase.execute({
        userId: 'user-1',
        file: makeFile({ size: 2 * 1024 * 1024 }), // 2MB
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeInstanceOf(BadRequestException);
        expect(result.error.message).toContain('exceeds maximum size');
      }
    });

    it('deve sanitizar o nome do arquivo removendo caracteres especiais', async () => {
      const createdAudio = {
        id: 'audio-1',
        userId: 'user-1',
        fileName: 'aula_com_acento.webm',
        mimeType: 'audio/webm',
        sizeBytes: 1024,
        storageKey: 'audios/user-1/uuid-aula_com_acento.webm',
        status: AudioStatus.PENDING,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      storageRepository.upload.mockResolvedValue(undefined);
      audioRepository.create.mockResolvedValue(createdAudio);

      await useCase.execute({
        userId: 'user-1',
        file: makeFile({ originalname: 'aula com acento!.webm' }),
      });

      const createCall = audioRepository.create.mock.calls[0][0];
      expect(createCall.fileName).not.toContain(' ');
      expect(createCall.fileName).not.toContain('!');
    });

    it('deve salvar no storage e criar registro no banco com sucesso', async () => {
      const createdAudio = {
        id: 'audio-1',
        userId: 'user-1',
        fileName: 'aula.webm',
        mimeType: 'audio/webm',
        sizeBytes: 1024,
        storageKey: 'audios/user-1/uuid-aula.webm',
        status: AudioStatus.PENDING,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      storageRepository.upload.mockResolvedValue(undefined);
      audioRepository.create.mockResolvedValue(createdAudio);

      const result = await useCase.execute({
        userId: 'user-1',
        file: makeFile(),
      });

      expect(result.success).toBe(true);
      expect(storageRepository.upload).toHaveBeenCalledTimes(1);
      expect(audioRepository.create).toHaveBeenCalledTimes(1);
      if (result.success) {
        expect(result.data.id).toBe('audio-1');
      }
    });

    it('deve incluir o userId no storage key', async () => {
      storageRepository.upload.mockResolvedValue(undefined);
      audioRepository.create.mockResolvedValue({
        id: 'audio-1',
        userId: 'user-abc',
        fileName: 'aula.webm',
        mimeType: 'audio/webm',
        sizeBytes: 1024,
        storageKey: 'audios/user-abc/uuid-aula.webm',
        status: AudioStatus.PENDING,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await useCase.execute({ userId: 'user-abc', file: makeFile() });

      const createCall = audioRepository.create.mock.calls[0][0];
      expect(createCall.storageKey).toContain('audios/user-abc/');
    });
  });
});
