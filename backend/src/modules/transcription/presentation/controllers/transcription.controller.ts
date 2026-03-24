import {
  Controller,
  Get,
  Param,
  Query,
  Req,
  ParseUUIDPipe,
  Inject,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import type { AuthenticatedRequest } from '../../../audio/presentation/guards/auth.guard.js';
import { GetTranscriptionUseCase } from '../../domain/use-cases/get-transcription.use-case.js';
import type { ITranscriptionRepository } from '../../domain/repositories/transcription.repository.js';
import { TRANSCRIPTION_REPOSITORY } from '../../domain/repositories/transcription.repository.js';
import { ListTranscriptionsQueryDto } from '../../application/dto/list-transcriptions-query.dto.js';

@Throttle({ default: { limit: 30, ttl: 60000 } })
@Controller('transcription')
export class TranscriptionController {
  constructor(
    private readonly getTranscriptionUseCase: GetTranscriptionUseCase,
    @Inject(TRANSCRIPTION_REPOSITORY)
    private readonly transcriptionRepository: ITranscriptionRepository,
  ) {}

  @Get()
  async listMyTranscriptions(
    @Req() req: AuthenticatedRequest,
    @Query() query: ListTranscriptionsQueryDto,
  ) {
    const transcriptions = await this.transcriptionRepository.findByUserId(
      req.user.id,
      query.q?.trim() || undefined,
    );
    return transcriptions.map((t) => ({
      id: t.id,
      audioId: t.audioId,
      status: t.status,
      language: t.language,
      title: t.title,
      transcriptionText: t.transcriptionText,
      summaryText: t.summaryText,
      segments: t.segments ?? null,
      createdAt: t.createdAt,
    }));
  }

  @Get(':audioId')
  async getByAudioId(
    @Param('audioId', ParseUUIDPipe) audioId: string,
    @Req() req: AuthenticatedRequest,
  ) {
    const result = await this.getTranscriptionUseCase.execute({
      audioId,
      userId: req.user.id,
    });

    if (!result.success) throw result.error;

    return {
      id: result.data.id,
      audioId: result.data.audioId,
      status: result.data.status,
      language: result.data.language,
      title: result.data.title,
      transcriptionText: result.data.transcriptionText,
      summaryText: result.data.summaryText,
      segments: result.data.segments ?? null,
      errorMessage: result.data.errorMessage,
      createdAt: result.data.createdAt,
      updatedAt: result.data.updatedAt,
    };
  }
}
