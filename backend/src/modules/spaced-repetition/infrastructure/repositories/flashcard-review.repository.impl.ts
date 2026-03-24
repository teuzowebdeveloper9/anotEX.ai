import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../../../../shared/infrastructure/config/supabase.config.js';
import type { IFlashcardReviewRepository } from '../../domain/repositories/flashcard-review.repository.js';
import type { FlashcardReviewEntity } from '../../domain/entities/flashcard-review.entity.js';

@Injectable()
export class FlashcardReviewRepositoryImpl implements IFlashcardReviewRepository {
  constructor(private readonly supabaseService: SupabaseService) {}

  async save(review: FlashcardReviewEntity): Promise<void> {
    const { error } = await this.supabaseService
      .getClient()
      .from('flashcard_reviews')
      .insert({
        id: review.id,
        user_id: review.userId,
        study_material_id: review.studyMaterialId,
        flashcard_index: review.flashcardIndex,
        quality: review.quality,
        reviewed_at: review.reviewedAt.toISOString(),
      });

    if (error) throw new Error(`Failed to save flashcard review: ${error.message}`);
  }
}
