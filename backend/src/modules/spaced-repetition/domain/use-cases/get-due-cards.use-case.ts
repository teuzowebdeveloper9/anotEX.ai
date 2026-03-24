import { Injectable, Inject } from '@nestjs/common';
import { STUDY_MATERIAL_REPOSITORY } from '../../../study-materials/domain/repositories/study-material.repository.js';
import type { IStudyMaterialRepository } from '../../../study-materials/domain/repositories/study-material.repository.js';
import type { FlashcardItem } from '../../../study-materials/domain/entities/study-material.entity.js';
import { Sm2Helper } from '../../infrastructure/helpers/sm2.helper.js';

export interface DueCardItem {
  studyMaterialId: string;
  transcriptionId: string;
  flashcardIndex: number;
  front: string;
  back: string;
  difficulty: 'easy' | 'medium' | 'hard';
  topic: string;
  reviewData: FlashcardItem['reviewData'] | null;
}

@Injectable()
export class GetDueCardsUseCase {
  constructor(
    @Inject(STUDY_MATERIAL_REPOSITORY)
    private readonly studyMaterialRepository: IStudyMaterialRepository,
    private readonly sm2: Sm2Helper,
  ) {}

  async execute(userId: string): Promise<DueCardItem[]> {
    const materials = await this.studyMaterialRepository.findAllFlashcardsByUserId(userId);
    const dueCards: DueCardItem[] = [];

    for (const material of materials) {
      const flashcards = (material.content as FlashcardItem[]) ?? [];

      flashcards.forEach((card, index) => {
        if (this.sm2.isDue(card.reviewData)) {
          dueCards.push({
            studyMaterialId: material.id,
            transcriptionId: material.transcriptionId,
            flashcardIndex: index,
            front: card.front,
            back: card.back,
            difficulty: card.difficulty,
            topic: card.topic,
            reviewData: card.reviewData ?? null,
          });
        }
      });
    }

    return dueCards;
  }
}
