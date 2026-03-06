export type AudioStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED'
export type TranscriptionStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED'

export interface AudioEntity {
  id: string
  userId: string
  fileName: string
  mimeType: string
  sizeBytes: number
  status: AudioStatus
  storageKey: string
  createdAt: string
  updatedAt: string
}

export interface TranscriptionEntity {
  id: string
  audioId: string
  userId: string
  status: TranscriptionStatus
  language: string
  transcriptionText: string | null
  summaryText: string | null
  errorMessage: string | null
  createdAt: string
  updatedAt: string
}

export interface UploadAudioResponse {
  audioId: string
  transcriptionId: string
  status: AudioStatus
  fileName: string
  createdAt: string
}

export interface AudioStatusResponse {
  audio: {
    id: string
    status: AudioStatus
    fileName: string
  }
  transcription: {
    id: string
    status: TranscriptionStatus
    transcriptionText: string | null
    summaryText: string | null
    errorMessage: string | null
  } | null
}
