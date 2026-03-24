export class FlashcardReviewEntity {
  constructor(
    readonly id: string,
    readonly userId: string,
    readonly studyMaterialId: string,
    readonly flashcardIndex: number,
    readonly quality: number,
    readonly reviewedAt: Date,
  ) {}

  static create(params: {
    userId: string;
    studyMaterialId: string;
    flashcardIndex: number;
    quality: number;
  }): FlashcardReviewEntity {
    return new FlashcardReviewEntity(
      crypto.randomUUID(),
      params.userId,
      params.studyMaterialId,
      params.flashcardIndex,
      params.quality,
      new Date(),
    );
  }
}
