import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ProcessVideoUseCase } from './process-video.use-case.js';
import type { IStudyFolderRepository } from '../repositories/study-folder.repository.js';
import type { IAudioRepository } from '../../../audio/domain/repositories/audio.repository.js';
import type { IStorageRepository } from '../../../audio/domain/repositories/storage.repository.js';
import type { ITranscriptionRepository } from '../../../transcription/domain/repositories/transcription.repository.js';
import { AudioStatus } from '../../../audio/domain/entities/audio.entity.js';

jest.mock('fs/promises', () => ({
  readFile: jest.fn(),
  unlink: jest.fn().mockResolvedValue(undefined),
  chmod: jest.fn().mockResolvedValue(undefined),
}));

const { readFile, unlink } = jest.requireMock('fs/promises') as {
  readFile: jest.Mock;
  unlink: jest.Mock;
};

const makeFolder = (overrides = {}) => ({
  id: 'folder-1',
  userId: 'user-1',
  name: 'Pasta',
  description: null,
  itemCount: 0,
  recommendationsUnlocked: false,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

describe('ProcessVideoUseCase', () => {
  let useCase: ProcessVideoUseCase;
  let folderRepository: jest.Mocked<IStudyFolderRepository>;
  let audioRepository: jest.Mocked<IAudioRepository>;
  let storageRepository: jest.Mocked<IStorageRepository>;
  let transcriptionRepository: jest.Mocked<ITranscriptionRepository>;
  let transcriptionQueue: { add: jest.Mock };
  let configService: jest.Mocked<ConfigService>;
  let execPromise: jest.Mock;

  beforeEach(() => {
    folderRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      findByUserId: jest.fn(),
      update: jest.fn(),
      deleteById: jest.fn(),
      addItem: jest.fn(),
      removeItem: jest.fn(),
      findItemsByFolderId: jest.fn(),
      findItemById: jest.fn(),
      itemExists: jest.fn(),
    } as jest.Mocked<IStudyFolderRepository>;

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

    transcriptionRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      findByAudioId: jest.fn(),
      findByUserId: jest.fn(),
      updateStatus: jest.fn(),
      updateResult: jest.fn(),
      deleteByAudioId: jest.fn(),
    } as jest.Mocked<ITranscriptionRepository>;

    transcriptionQueue = { add: jest.fn().mockResolvedValue(undefined) };
    configService = {
      get: jest.fn().mockReturnValue(undefined),
      getOrThrow: jest.fn(),
    } as unknown as jest.Mocked<ConfigService>;

    useCase = new ProcessVideoUseCase(
      folderRepository,
      audioRepository,
      storageRepository,
      transcriptionRepository,
      transcriptionQueue as never,
      configService,
    );

    execPromise = jest.fn();
    Object.assign(useCase as object, {
      ytDlp: { execPromise },
    });

    readFile.mockResolvedValue(Buffer.from('audio-webm'));
    unlink.mockResolvedValue(undefined);
  });

  it('deve retornar erro quando a pasta não existir', async () => {
    folderRepository.findById.mockResolvedValue(null);

    const result = await useCase.execute({
      folderId: 'folder-1',
      userId: 'user-1',
      videoId: 'abc123',
      videoTitle: 'Video',
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBeInstanceOf(NotFoundException);
    }
  });

  it('deve retornar erro quando o usuário não for dono da pasta', async () => {
    folderRepository.findById.mockResolvedValue(makeFolder({ userId: 'other-user' }));

    const result = await useCase.execute({
      folderId: 'folder-1',
      userId: 'user-1',
      videoId: 'abc123',
      videoTitle: 'Video',
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBeInstanceOf(ForbiddenException);
    }
  });

  it('deve tentar fallback com js-runtime e cliente alternativo antes de falhar', async () => {
    folderRepository.findById.mockResolvedValue(makeFolder());
    execPromise
      .mockRejectedValueOnce(new Error('sign in to confirm you are not a bot'))
      .mockRejectedValueOnce(new Error('still blocked'))
      .mockResolvedValueOnce(undefined);
    storageRepository.upload.mockResolvedValue(undefined);
    audioRepository.create.mockResolvedValue({
      id: 'audio-1',
      userId: 'user-1',
      fileName: 'Video.webm',
      mimeType: 'audio/webm',
      sizeBytes: 10,
      storageKey: 'audios/user-1/audio.webm',
      status: AudioStatus.PENDING,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as never);
    transcriptionRepository.create.mockResolvedValue({
      id: 'transcription-1',
    } as never);

    const result = await useCase.execute({
      folderId: 'folder-1',
      userId: 'user-1',
      videoId: 'abc123',
      videoTitle: 'Video',
    });

    expect(result.success).toBe(true);
    expect(execPromise).toHaveBeenCalledTimes(3);
    expect(execPromise.mock.calls[1][0]).toEqual(
      expect.arrayContaining([
        '--js-runtimes',
        'node',
        '--extractor-args',
        'youtube:player-client=android,-web_creator',
      ]),
    );
    expect(execPromise.mock.calls[2][0]).toEqual(
      expect.arrayContaining([
        '--js-runtimes',
        'node',
        '--extractor-args',
        'youtube:player-client=ios,android,-web_creator',
      ]),
    );
    expect(storageRepository.upload).toHaveBeenCalledWith(
      expect.stringContaining('audios/user-1/'),
      expect.any(Buffer),
      'audio/webm',
    );
    expect(transcriptionQueue.add).toHaveBeenCalledTimes(1);
  });

  it('deve incluir cookies configurados nas tentativas do yt-dlp', async () => {
    folderRepository.findById.mockResolvedValue(makeFolder());
    configService.get.mockImplementation((key: string) =>
      key === 'YTDLP_COOKIES_PATH' ? '/run/secrets/youtube-cookies.txt' : undefined,
    );
    execPromise.mockRejectedValue(new Error('bot check'));

    const result = await useCase.execute({
      folderId: 'folder-1',
      userId: 'user-1',
      videoId: 'abc123',
      videoTitle: 'Video',
    });

    expect(result.success).toBe(false);
    expect(execPromise.mock.calls[0][0]).toEqual(
      expect.arrayContaining(['--cookies', '/run/secrets/youtube-cookies.txt']),
    );
    if (!result.success) {
      expect(result.error).toBeInstanceOf(BadRequestException);
    }
  });
});
