export enum StudyMaterialType {
  FLASHCARDS = 'flashcards',
  MINDMAP = 'mindmap',
  QUIZ = 'quiz',
}

export enum StudyMaterialStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

export interface FlashcardReviewData {
  readonly nextReview: string; // ISO date "YYYY-MM-DD"
  readonly interval: number;
  readonly repetitions: number;
  readonly easeFactor: number;
}

export interface FlashcardItem {
  readonly front: string;
  readonly back: string;
  readonly difficulty: 'easy' | 'medium' | 'hard';
  readonly topic: string;
  readonly reviewData?: FlashcardReviewData;
}

export interface MindmapContent {
  readonly markdown: string;
}

export interface QuizItem {
  readonly question: string;
  readonly options: readonly [string, string, string, string];
  readonly correct: 0 | 1 | 2 | 3;
  readonly explanation: string;
}

export type StudyMaterialContent = FlashcardItem[] | MindmapContent | QuizItem[];

export interface StudyMaterialEntity {
  readonly id: string;
  readonly transcriptionId: string;
  readonly userId: string;
  readonly type: StudyMaterialType;
  readonly status: StudyMaterialStatus;
  readonly content: StudyMaterialContent | null;
  readonly errorMessage: string | null;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export interface CreateStudyMaterialProps {
  readonly transcriptionId: string;
  readonly userId: string;
  readonly type: StudyMaterialType;
}
