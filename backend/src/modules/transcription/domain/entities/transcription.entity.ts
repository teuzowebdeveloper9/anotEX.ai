export enum TranscriptionStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

export interface TranscriptionEntity {
  readonly id: string;
  readonly audioId: string;
  readonly userId: string;
  readonly transcriptionText: string | null;
  readonly summaryText: string | null;
  readonly language: string;
  readonly status: TranscriptionStatus;
  readonly errorMessage: string | null;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export interface CreateTranscriptionProps {
  readonly audioId: string;
  readonly userId: string;
  readonly language: string;
}
