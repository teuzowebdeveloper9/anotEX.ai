import { ProcessTranscriptionUseCase } from './process-transcription.use-case.js';
import type { ITranscriptionRepository } from '../repositories/transcription.repository.js';
import type { ITranscriptionProvider, ISummaryProvider } from '../repositories/transcription.provider.js';
import type { IAudioRepository } from '../../../audio/domain/repositories/audio.repository.js';
import type { IStorageRepository } from '../../../audio/domain/repositories/storage.repository.js';
import { AudioStatus } from '../../../audio/domain/entities/audio.entity.js';
import { TranscriptionStatus } from '../entities/transcription.entity.js';

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

const makeTranscription = (overrides = {}) => ({
  id: 'transcription-1',
  audioId: 'audio-1',
  userId: 'user-1',
  title: null,
  transcriptionText: null,
  summaryText: null,
  segments: null,
  language: 'pt',
  status: TranscriptionStatus.PENDING,
  errorMessage: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

describe('ProcessTranscriptionUseCase', () => {
  let useCase: ProcessTranscriptionUseCase;
  let transcriptionRepository: jest.Mocked<ITranscriptionRepository>;
  let audioRepository: jest.Mocked<IAudioRepository>;
  let storageRepository: jest.Mocked<IStorageRepository>;
  let transcriptionProvider: jest.Mocked<ITranscriptionProvider>;
  let summaryProvider: jest.Mocked<ISummaryProvider>;

  beforeEach(() => {
    transcriptionRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      findByAudioId: jest.fn(),
      findByUserId: jest.fn(),
      updateStatus: jest.fn(),
      updateResult: jest.fn(),
      deleteByAudioId: jest.fn(),
    } as jest.Mocked<ITranscriptionRepository>;

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

    transcriptionProvider = { transcribe: jest.fn() } as jest.Mocked<ITranscriptionProvider>;
    summaryProvider = { summarize: jest.fn(), generateTitle: jest.fn() } as jest.Mocked<ISummaryProvider>;

    useCase = new ProcessTranscriptionUseCase(
      transcriptionRepository,
      audioRepository,
      storageRepository,
      transcriptionProvider,
      summaryProvider,
    );
  });

  describe('execute', () => {
    it('deve retornar sem erro se a transcrição não for encontrada', async () => {
      transcriptionRepository.findById.mockResolvedValue(null);

      await expect(
        useCase.execute({ transcriptionId: 'transcription-1', audioId: 'audio-1' }),
      ).resolves.toBe(false);
    });

    it('deve marcar como FAILED se o áudio não for encontrado', async () => {
      transcriptionRepository.findById.mockResolvedValue(makeTranscription());
      audioRepository.findById.mockResolvedValue(null);

      await useCase.execute({ transcriptionId: 'transcription-1', audioId: 'audio-1' });

      expect(transcriptionRepository.updateStatus).toHaveBeenCalledWith(
        'transcription-1',
        TranscriptionStatus.FAILED,
        'Audio not found',
      );
    });

    it('deve processar com sucesso: transcrição + resumo + status COMPLETED', async () => {
      transcriptionRepository.findById.mockResolvedValue(makeTranscription());
      audioRepository.findById.mockResolvedValue(makeAudio());
      storageRepository.getSignedUrl.mockResolvedValue('https://signed-url.com/audio.webm');
      global.fetch = jest.fn().mockResolvedValue({
        arrayBuffer: jest.fn().mockResolvedValue(new ArrayBuffer(8)),
      } as unknown as Response);
      transcriptionProvider.transcribe.mockResolvedValue({ text: 'Texto transcrito da aula', segments: [] });
      summaryProvider.summarize.mockResolvedValue('Resumo da aula');
      summaryProvider.generateTitle.mockResolvedValue('Título da aula');

      await useCase.execute({ transcriptionId: 'transcription-1', audioId: 'audio-1' });

      expect(transcriptionRepository.updateResult).toHaveBeenCalledWith(
        'transcription-1',
        'Texto transcrito da aula',
        'Resumo da aula',
        'Título da aula',
      );
      expect(transcriptionRepository.updateStatus).toHaveBeenCalledWith(
        'transcription-1',
        TranscriptionStatus.COMPLETED,
      );
      expect(audioRepository.updateStatus).toHaveBeenCalledWith(
        'audio-1',
        AudioStatus.COMPLETED,
      );
    });

    it('deve marcar como FAILED se o provider lançar erro', async () => {
      transcriptionRepository.findById.mockResolvedValue(makeTranscription());
      audioRepository.findById.mockResolvedValue(makeAudio());
      storageRepository.getSignedUrl.mockResolvedValue('https://signed-url.com/audio.webm');
      global.fetch = jest.fn().mockResolvedValue({
        arrayBuffer: jest.fn().mockResolvedValue(new ArrayBuffer(8)),
      } as unknown as Response);
      transcriptionProvider.transcribe.mockRejectedValue(new Error('Rate limit exceeded'));

      await useCase.execute({ transcriptionId: 'transcription-1', audioId: 'audio-1' });

      expect(transcriptionRepository.updateStatus).toHaveBeenLastCalledWith(
        'transcription-1',
        TranscriptionStatus.FAILED,
        'Rate limit exceeded',
      );
      expect(audioRepository.updateStatus).toHaveBeenLastCalledWith(
        'audio-1',
        AudioStatus.FAILED,
        'Rate limit exceeded',
      );
    });
  });
});
