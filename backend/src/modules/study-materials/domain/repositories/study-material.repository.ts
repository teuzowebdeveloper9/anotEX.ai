import type {
  CreateStudyMaterialProps,
  FlashcardItem,
  StudyMaterialContent,
  StudyMaterialEntity,
  StudyMaterialStatus,
  StudyMaterialType,
} from '../entities/study-material.entity.js';

export interface IStudyMaterialRepository {
  create(props: CreateStudyMaterialProps): Promise<StudyMaterialEntity>;
  findById(id: string): Promise<StudyMaterialEntity | null>;
  findByTranscriptionId(transcriptionId: string): Promise<StudyMaterialEntity[]>;
  findByTranscriptionIdAndType(
    transcriptionId: string,
    type: StudyMaterialType,
  ): Promise<StudyMaterialEntity | null>;
  updateStatus(id: string, status: StudyMaterialStatus, errorMessage?: string): Promise<void>;
  updateContent(id: string, content: StudyMaterialContent): Promise<void>;
  deleteById(id: string): Promise<void>;
  findAllFlashcardsByUserId(userId: string): Promise<StudyMaterialEntity[]>;
  updateFlashcardsContent(id: string, flashcards: FlashcardItem[]): Promise<void>;
}

export const STUDY_MATERIAL_REPOSITORY = Symbol('IStudyMaterialRepository');
