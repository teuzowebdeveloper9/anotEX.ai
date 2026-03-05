import {
  CreateTranscriptionProps,
  TranscriptionEntity,
  TranscriptionStatus,
} from '../entities/transcription.entity.js';

export interface ITranscriptionRepository {
  create(props: CreateTranscriptionProps): Promise<TranscriptionEntity>;
  findById(id: string): Promise<TranscriptionEntity | null>;
  findByAudioId(audioId: string): Promise<TranscriptionEntity | null>;
  findByUserId(userId: string): Promise<TranscriptionEntity[]>;
  updateStatus(
    id: string,
    status: TranscriptionStatus,
    errorMessage?: string,
  ): Promise<void>;
  updateResult(
    id: string,
    transcriptionText: string,
    summaryText: string,
  ): Promise<void>;
}

export const TRANSCRIPTION_REPOSITORY = Symbol('ITranscriptionRepository');
