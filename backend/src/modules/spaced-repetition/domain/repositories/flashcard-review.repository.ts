import type { FlashcardReviewEntity } from '../entities/flashcard-review.entity.js';

export interface IFlashcardReviewRepository {
  save(review: FlashcardReviewEntity): Promise<void>;
}

export const FLASHCARD_REVIEW_REPOSITORY = Symbol('IFlashcardReviewRepository');
