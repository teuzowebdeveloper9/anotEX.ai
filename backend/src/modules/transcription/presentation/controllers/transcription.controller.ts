import {
  Controller,
  Get,
  Param,
  UseGuards,
  Req,
  ParseUUIDPipe,
} from '@nestjs/common';
import { SupabaseAuthGuard } from '../../../audio/presentation/guards/auth.guard.js';
import type { AuthenticatedRequest } from '../../../audio/presentation/guards/auth.guard.js';
import { GetTranscriptionUseCase } from '../../domain/use-cases/get-transcription.use-case.js';
import type { ITranscriptionRepository } from '../../domain/repositories/transcription.repository.js';
import { TRANSCRIPTION_REPOSITORY } from '../../domain/repositories/transcription.repository.js';
import { Inject } from '@nestjs/common';

@Controller('transcription')
@UseGuards(SupabaseAuthGuard)
export class TranscriptionController {
  constructor(
    private readonly getTranscriptionUseCase: GetTranscriptionUseCase,
    @Inject(TRANSCRIPTION_REPOSITORY)
    private readonly transcriptionRepository: ITranscriptionRepository,
  ) {}

  @Get()
  async listMyTranscriptions(@Req() req: AuthenticatedRequest) {
    const transcriptions = await this.transcriptionRepository.findByUserId(req.user.id);
    return transcriptions.map((t) => ({
      id: t.id,
      audioId: t.audioId,
      status: t.status,
      language: t.language,
      transcriptionText: t.transcriptionText,
      summaryText: t.summaryText,
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
      transcriptionText: result.data.transcriptionText,
      summaryText: result.data.summaryText,
      errorMessage: result.data.errorMessage,
      createdAt: result.data.createdAt,
      updatedAt: result.data.updatedAt,
    };
  }
}
