
import { Injectable } from '@nestjs/common';
import type { FlashcardReviewData } from '../../../study-materials/domain/entities/study-material.entity.js';

@Injectable()
export class Sm2Helper {

  calculate(reviewData: FlashcardReviewData | undefined, quality: number): FlashcardReviewData {
    const interval = reviewData?.interval ?? 0;
    const repetitions = reviewData?.repetitions ?? 0;
    const easeFactor = reviewData?.easeFactor ?? 2.5;

    let newInterval: number;
    let newRepetitions: number;
    let newEaseFactor: number;

    if (quality < 3) {
      newInterval = 1;
      newRepetitions = 0;
      newEaseFactor = Math.max(1.3, easeFactor - 0.2);
    } else {
      newEaseFactor = Math.max(1.3, easeFactor + 0.1 - (5 - quality) * 0.18);

      if (repetitions === 0) {
        newInterval = 1;
      } else if (repetitions === 1) {
        newInterval = 6;
      } else {
        newInterval = Math.round(interval * newEaseFactor);
      }

      newRepetitions = repetitions + 1;
    }

    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + newInterval);

    return {
      nextReview: nextDate.toISOString().split('T')[0],
      interval: newInterval,
      repetitions: newRepetitions,
      easeFactor: newEaseFactor,
    };
  }

  isDue(reviewData: FlashcardReviewData | undefined): boolean {
    if (!reviewData) return true;
    const today = new Date().toISOString().split('T')[0];
    return reviewData.nextReview <= today;
  }
}
