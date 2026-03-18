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

export interface TranscriptionSegment {
  start: number
  end: number
  text: string
}

export interface TranscriptionEntity {
  id: string
  audioId: string
  userId: string
  status: TranscriptionStatus
  language: string
  title: string | null
  transcriptionText: string | null
  summaryText: string | null
  segments: TranscriptionSegment[] | null
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

export type StudyMaterialType = 'flashcards' | 'mindmap' | 'quiz'
export type StudyMaterialStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED'

export interface FlashcardItem {
  front: string
  back: string
  difficulty: 'easy' | 'medium' | 'hard'
  topic: string
}

export interface MindmapContent {
  markdown: string
}

export interface QuizItem {
  question: string
  options: [string, string, string, string]
  correct: 0 | 1 | 2 | 3
  explanation: string
}

export interface StudyMaterialEntity {
  id: string
  type: StudyMaterialType
  status: StudyMaterialStatus
  content: FlashcardItem[] | MindmapContent | QuizItem[] | null
  errorMessage: string | null
  createdAt: string
  updatedAt: string
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
    title: string | null
    transcriptionText: string | null
    summaryText: string | null
    segments: TranscriptionSegment[] | null
    errorMessage: string | null
  } | null
}
