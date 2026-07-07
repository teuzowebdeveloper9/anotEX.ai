import { DeleteAccountUseCase } from './delete-account.use-case.js';
import type { PostgresService } from '../../../../shared/infrastructure/config/postgres.config.js';
import type { IAudioRepository } from '../../../audio/domain/repositories/audio.repository.js';
import type { IStorageRepository } from '../../../audio/domain/repositories/storage.repository.js';
import type { AudioEntity } from '../../../audio/domain/entities/audio.entity.js';
import { AudioStatus } from '../../../audio/domain/entities/audio.entity.js';

const makeAudio = (overrides: Partial<AudioEntity> = {}): AudioEntity => ({
  id: 'audio-1',
  userId: 'user-1',
  fileName: 'aula.webm',
  mimeType: 'audio/webm',
  sizeBytes: 1000,
  storageKey: 'audios/user-1/aula.webm',
  status: AudioStatus.COMPLETED,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

describe('DeleteAccountUseCase', () => {
  let useCase: DeleteAccountUseCase;
  let postgresService: jest.Mocked<PostgresService>;
  let audioRepository: jest.Mocked<IAudioRepository>;
  let storageRepository: jest.Mocked<IStorageRepository>;

  beforeEach(() => {
    postgresService = {
      query: jest.fn().mockResolvedValue({ rows: [], rowCount: 1 }),
    } as unknown as jest.Mocked<PostgresService>;

    audioRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      findByUserId: jest.fn().mockResolvedValue([]),
      updateStatus: jest.fn(),
      delete: jest.fn(),
    } as unknown as jest.Mocked<IAudioRepository>;

    storageRepository = {
      upload: jest.fn(),
      getSignedUrl: jest.fn(),
      delete: jest.fn().mockResolvedValue(undefined),
    } as unknown as jest.Mocked<IStorageRepository>;

    useCase = new DeleteAccountUseCase(postgresService, audioRepository, storageRepository);
  });

  describe('execute', () => {
    it('deve deletar os arquivos do storage e o usuário do banco', async () => {
      audioRepository.findByUserId.mockResolvedValue([
        makeAudio({ storageKey: 'audios/user-1/a.webm' }),
        makeAudio({ id: 'audio-2', storageKey: 'audios/user-1/b.webm' }),
      ]);

      await useCase.execute('user-1');

      expect(storageRepository.delete).toHaveBeenCalledWith('audios/user-1/a.webm');
      expect(storageRepository.delete).toHaveBeenCalledWith('audios/user-1/b.webm');
      expect(postgresService.query).toHaveBeenCalledWith('DELETE FROM users WHERE id = $1', [
        'user-1',
      ]);
    });

    it('deve deletar o usuário mesmo sem áudios', async () => {
      audioRepository.findByUserId.mockResolvedValue([]);

      await useCase.execute('user-1');

      expect(storageRepository.delete).not.toHaveBeenCalled();
      expect(postgresService.query).toHaveBeenCalledWith('DELETE FROM users WHERE id = $1', [
        'user-1',
      ]);
    });

    it('deve continuar a deleção mesmo se o storage falhar (best-effort)', async () => {
      audioRepository.findByUserId.mockResolvedValue([makeAudio()]);
      storageRepository.delete.mockRejectedValue(new Error('storage unavailable'));

      await expect(useCase.execute('user-1')).resolves.toBeUndefined();

      expect(postgresService.query).toHaveBeenCalledWith('DELETE FROM users WHERE id = $1', [
        'user-1',
      ]);
    });

    it('deve continuar a deleção mesmo se o storage falhar com erro não-Error', async () => {
      audioRepository.findByUserId.mockResolvedValue([makeAudio()]);
      storageRepository.delete.mockRejectedValue('string error');

      await expect(useCase.execute('user-1')).resolves.toBeUndefined();

      expect(postgresService.query).toHaveBeenCalledWith('DELETE FROM users WHERE id = $1', [
        'user-1',
      ]);
    });

    it('deve propagar erro se a deleção no banco falhar', async () => {
      audioRepository.findByUserId.mockResolvedValue([]);
      postgresService.query.mockRejectedValue(new Error('db down'));

      await expect(useCase.execute('user-1')).rejects.toThrow('db down');
    });
  });
});
