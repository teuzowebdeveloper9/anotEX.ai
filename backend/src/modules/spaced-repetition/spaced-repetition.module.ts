import { Module } from '@nestjs/common';
import { SpacedRepetitionController } from './presentation/controllers/spaced-repetition.controller.js';
import { GetDueCardsUseCase } from './domain/use-cases/get-due-cards.use-case.js';
import { ReviewFlashcardUseCase } from './domain/use-cases/review-flashcard.use-case.js';
import { FlashcardReviewRepositoryImpl } from './infrastructure/repositories/flashcard-review.repository.impl.js';
import { Sm2Helper } from './infrastructure/helpers/sm2.helper.js';
import { FLASHCARD_REVIEW_REPOSITORY } from './domain/repositories/flashcard-review.repository.js';
import { STUDY_MATERIAL_REPOSITORY } from '../study-materials/domain/repositories/study-material.repository.js';
import { StudyMaterialRepositoryImpl } from '../study-materials/infrastructure/repositories/study-material.repository.impl.js';
import { SupabaseService } from '../../shared/infrastructure/config/supabase.config.js';

@Module({
  controllers: [SpacedRepetitionController],
  providers: [
    SupabaseService,
    GetDueCardsUseCase,
    ReviewFlashcardUseCase,
    Sm2Helper,
    { provide: FLASHCARD_REVIEW_REPOSITORY, useClass: FlashcardReviewRepositoryImpl },
    { provide: STUDY_MATERIAL_REPOSITORY, useClass: StudyMaterialRepositoryImpl },
  ],
})
export class SpacedRepetitionModule {}
