import { Injectable } from '@nestjs/common';
import { PostgresService } from '../../../../shared/infrastructure/config/postgres.config.js';
import type { IFlashcardReviewRepository } from '../../domain/repositories/flashcard-review.repository.js';
import type { FlashcardReviewEntity } from '../../domain/entities/flashcard-review.entity.js';

function toMessage(err: unknown): string {
  return err instanceof Error ? err.message : String(err);
}

@Injectable()
export class FlashcardReviewRepositoryImpl implements IFlashcardReviewRepository {
  constructor(private readonly postgresService: PostgresService) {}

  async save(review: FlashcardReviewEntity): Promise<void> {
    try {
      await this.postgresService.query(
        `INSERT INTO flashcard_reviews (id, user_id, study_material_id, flashcard_index, quality, reviewed_at)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          review.id,
          review.userId,
          review.studyMaterialId,
          review.flashcardIndex,
          review.quality,
          review.reviewedAt.toISOString(),
        ],
      );
    } catch (err) {
      throw new Error(`Failed to save flashcard review: ${toMessage(err)}`);
    }
  }
}
