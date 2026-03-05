export enum AudioStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

export interface AudioEntity {
  readonly id: string;
  readonly userId: string;
  readonly fileName: string;
  readonly mimeType: string;
  readonly sizeBytes: number;
  readonly storageKey: string;
  readonly status: AudioStatus;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export interface CreateAudioProps {
  readonly userId: string;
  readonly fileName: string;
  readonly mimeType: string;
  readonly sizeBytes: number;
  readonly storageKey: string;
}
