import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { GetAudioStatusUseCase } from './get-audio-status.use-case.js';
import type { IAudioRepository } from '../repositories/audio.repository.js';
import { AudioStatus } from '../entities/audio.entity.js';

const makeAudio = (overrides = {}) => ({
  id: 'audio-1',
  userId: 'user-1',
  fileName: 'aula.webm',
  mimeType: 'audio/webm',
  sizeBytes: 1024,
  storageKey: 'audios/user-1/aula.webm',
  status: AudioStatus.PENDING,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

describe('GetAudioStatusUseCase', () => {
  let useCase: GetAudioStatusUseCase;
  let audioRepository: jest.Mocked<IAudioRepository>;

  beforeEach(() => {
    audioRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      findByUserId: jest.fn(),
      updateStatus: jest.fn(),
      delete: jest.fn(),
    } as jest.Mocked<IAudioRepository>;

    useCase = new GetAudioStatusUseCase(audioRepository);
  });

  describe('execute', () => {
    it('deve retornar erro se o áudio não for encontrado', async () => {
      audioRepository.findById.mockResolvedValue(null);

      const result = await useCase.execute({ audioId: 'audio-1', userId: 'user-1' });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeInstanceOf(NotFoundException);
      }
    });

    it('deve retornar erro se o áudio pertencer a outro usuário', async () => {
      audioRepository.findById.mockResolvedValue(makeAudio({ userId: 'outro-user' }));

      const result = await useCase.execute({ audioId: 'audio-1', userId: 'user-1' });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeInstanceOf(ForbiddenException);
      }
    });

    it('deve retornar o áudio com sucesso', async () => {
      const audio = makeAudio();
      audioRepository.findById.mockResolvedValue(audio);

      const result = await useCase.execute({ audioId: 'audio-1', userId: 'user-1' });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.id).toBe('audio-1');
      }
    });
  });
});
