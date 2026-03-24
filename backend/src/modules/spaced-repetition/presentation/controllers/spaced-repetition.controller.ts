import {
  Controller,
  Get,
  Post,
  Body,
  HttpCode,
  Request,
} from '@nestjs/common';
import { GetDueCardsUseCase } from '../../domain/use-cases/get-due-cards.use-case.js';
import { ReviewFlashcardUseCase } from '../../domain/use-cases/review-flashcard.use-case.js';
import { ReviewFlashcardDto } from '../../application/dto/review-flashcard.dto.js';
import type { DueCardItem } from '../../domain/use-cases/get-due-cards.use-case.js';
import type { FlashcardReviewData } from '../../../study-materials/domain/entities/study-material.entity.js';

@Controller('review')
export class SpacedRepetitionController {
  constructor(
    private readonly getDueCardsUseCase: GetDueCardsUseCase,
    private readonly reviewFlashcardUseCase: ReviewFlashcardUseCase,
  ) {}

  @Get('due')
  async getDueCards(@Request() req: { user: { id: string } }): Promise<DueCardItem[]> {
    return this.getDueCardsUseCase.execute(req.user.id);
  }

  @Post()
  @HttpCode(200)
  async reviewCard(
    @Body() dto: ReviewFlashcardDto,
    @Request() req: { user: { id: string } },
  ): Promise<FlashcardReviewData> {
    return this.reviewFlashcardUseCase.execute({
      userId: req.user.id,
      studyMaterialId: dto.studyMaterialId,
      flashcardIndex: dto.flashcardIndex,
      quality: dto.quality,
    });
  }
}
