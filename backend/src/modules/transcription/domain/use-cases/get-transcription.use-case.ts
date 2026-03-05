import { Inject, Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import type { TranscriptionEntity } from '../entities/transcription.entity.js';
import type { ITranscriptionRepository } from '../repositories/transcription.repository.js';
import { TRANSCRIPTION_REPOSITORY } from '../repositories/transcription.repository.js';
import { ok, fail, Result } from '../../../../shared/domain/result.js';

export interface GetTranscriptionInput {
  audioId: string;
  userId: string;
}

@Injectable()
export class GetTranscriptionUseCase {
  constructor(
    @Inject(TRANSCRIPTION_REPOSITORY)
    private readonly transcriptionRepository: ITranscriptionRepository,
  ) {}

  async execute(input: GetTranscriptionInput): Promise<Result<TranscriptionEntity>> {
    const transcription = await this.transcriptionRepository.findByAudioId(input.audioId);

    if (!transcription) {
      return fail(new NotFoundException('Transcription not found'));
    }

    if (transcription.userId !== input.userId) {
      return fail(new ForbiddenException('Access denied'));
    }

    return ok(transcription);
  }
}
