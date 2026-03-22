import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { GetTranscriptionUseCase } from './get-transcription.use-case.js';
import type { ITranscriptionRepository } from '../repositories/transcription.repository.js';
import { TranscriptionStatus } from '../entities/transcription.entity.js';

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

describe('GetTranscriptionUseCase', () => {
  let useCase: GetTranscriptionUseCase;
  let transcriptionRepository: jest.Mocked<ITranscriptionRepository>;

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

    useCase = new GetTranscriptionUseCase(transcriptionRepository);
  });

  describe('execute', () => {
    it('deve retornar erro se a transcrição não for encontrada', async () => {
      transcriptionRepository.findByAudioId.mockResolvedValue(null);

      const result = await useCase.execute({ audioId: 'audio-1', userId: 'user-1' });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeInstanceOf(NotFoundException);
      }
    });

    it('deve retornar erro se a transcrição pertencer a outro usuário', async () => {
      transcriptionRepository.findByAudioId.mockResolvedValue(
        makeTranscription({ userId: 'outro-user' }),
      );

      const result = await useCase.execute({ audioId: 'audio-1', userId: 'user-1' });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeInstanceOf(ForbiddenException);
      }
    });

    it('deve retornar a transcrição com sucesso', async () => {
      transcriptionRepository.findByAudioId.mockResolvedValue(makeTranscription());

      const result = await useCase.execute({ audioId: 'audio-1', userId: 'user-1' });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.id).toBe('transcription-1');
        expect(result.data.audioId).toBe('audio-1');
      }
    });

    it('deve retornar transcrição completa com texto e resumo', async () => {
      transcriptionRepository.findByAudioId.mockResolvedValue(
        makeTranscription({
          status: TranscriptionStatus.COMPLETED,
          transcriptionText: 'Texto da aula...',
          summaryText: 'Resumo da aula...',
        }),
      );

      const result = await useCase.execute({ audioId: 'audio-1', userId: 'user-1' });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.transcriptionText).toBe('Texto da aula...');
        expect(result.data.summaryText).toBe('Resumo da aula...');
        expect(result.data.status).toBe(TranscriptionStatus.COMPLETED);
      }
    });
  });
});
