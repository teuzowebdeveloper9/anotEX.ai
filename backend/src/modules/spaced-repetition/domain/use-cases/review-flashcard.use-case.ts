import { Injectable, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { STUDY_MATERIAL_REPOSITORY } from '../../../study-materials/domain/repositories/study-material.repository.js';
import type { IStudyMaterialRepository } from '../../../study-materials/domain/repositories/study-material.repository.js';
import { FLASHCARD_REVIEW_REPOSITORY } from '../repositories/flashcard-review.repository.js';
import type { IFlashcardReviewRepository } from '../repositories/flashcard-review.repository.js';
import type {
  FlashcardItem,
  FlashcardReviewData,
} from '../../../study-materials/domain/entities/study-material.entity.js';
import { StudyMaterialType } from '../../../study-materials/domain/entities/study-material.entity.js';
import { FlashcardReviewEntity } from '../entities/flashcard-review.entity.js';
import { Sm2Helper } from '../../infrastructure/helpers/sm2.helper.js';

@Injectable()
export class ReviewFlashcardUseCase {
  constructor(
    @Inject(STUDY_MATERIAL_REPOSITORY)
    private readonly studyMaterialRepository: IStudyMaterialRepository,
    @Inject(FLASHCARD_REVIEW_REPOSITORY)
    private readonly reviewRepository: IFlashcardReviewRepository,
    private readonly sm2: Sm2Helper,
  ) {}

  async execute(params: {
    userId: string;
    studyMaterialId: string;
    flashcardIndex: number;
    quality: 0 | 1 | 2 | 3 | 4 | 5;
  }): Promise<FlashcardReviewData> {
    const material = await this.studyMaterialRepository.findById(params.studyMaterialId);

    if (!material || material.userId !== params.userId) {
      throw new NotFoundException('Material de estudo não encontrado');
    }

    if (material.type !== StudyMaterialType.FLASHCARDS) {
      throw new BadRequestException('Material não é do tipo flashcards');
    }

    const flashcards = (material.content as FlashcardItem[]) ?? [];

    if (params.flashcardIndex < 0 || params.flashcardIndex >= flashcards.length) {
      throw new BadRequestException('Índice de flashcard inválido');
    }

    const card = flashcards[params.flashcardIndex];
    const newReviewData = this.sm2.calculate(card.reviewData, params.quality);

    const updatedFlashcards: FlashcardItem[] = flashcards.map((c, i) =>
      i === params.flashcardIndex ? { ...c, reviewData: newReviewData } : c,
    );

    await this.studyMaterialRepository.updateFlashcardsContent(
      params.studyMaterialId,
      updatedFlashcards,
    );

    const reviewEntity = FlashcardReviewEntity.create({
      userId: params.userId,
      studyMaterialId: params.studyMaterialId,
      flashcardIndex: params.flashcardIndex,
      quality: params.quality,
    });
    await this.reviewRepository.save(reviewEntity);

    return newReviewData;
  }
}
