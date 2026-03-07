import type { FlashcardItem, MindmapContent, QuizItem } from '../entities/study-material.entity.js';

export interface IStudyMaterialProvider {
  generateFlashcards(summaryText: string): Promise<FlashcardItem[]>;
  generateMindmap(summaryText: string): Promise<MindmapContent>;
  generateQuiz(summaryText: string): Promise<QuizItem[]>;
}

export const STUDY_MATERIAL_PROVIDER = Symbol('IStudyMaterialProvider');
