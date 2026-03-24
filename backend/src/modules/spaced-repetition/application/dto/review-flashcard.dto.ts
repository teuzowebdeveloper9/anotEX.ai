import { IsUUID, IsInt, Min, Max } from 'class-validator';

export class ReviewFlashcardDto {
  @IsUUID()
  studyMaterialId!: string;

  @IsInt()
  @Min(0)
  flashcardIndex!: number;

  @IsInt()
  @Min(0)
  @Max(5)
  quality!: 0 | 1 | 2 | 3 | 4 | 5;
}
