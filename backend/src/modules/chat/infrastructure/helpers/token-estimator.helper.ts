import { Injectable } from '@nestjs/common';

// Heurística: 1 palavra ≈ 1.3 tokens em português
const TOKENS_PER_WORD = 1.3;

@Injectable()
export class TokenEstimatorHelper {
  estimate(text: string): number {
    const wordCount = text.trim().split(/\s+/).length;
    return Math.ceil(wordCount * TOKENS_PER_WORD);
  }
}
