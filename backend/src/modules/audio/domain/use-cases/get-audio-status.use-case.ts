import { Inject, Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import type { AudioEntity } from '../entities/audio.entity.js';
import type { IAudioRepository } from '../repositories/audio.repository.js';
import { AUDIO_REPOSITORY } from '../repositories/audio.repository.js';
import { ok, fail, Result } from '../../../../shared/domain/result.js';

export interface GetAudioStatusInput {
  audioId: string;
  userId: string;
}

@Injectable()
export class GetAudioStatusUseCase {
  constructor(
    @Inject(AUDIO_REPOSITORY) private readonly audioRepository: IAudioRepository,
  ) {}

  async execute(input: GetAudioStatusInput): Promise<Result<AudioEntity>> {
    const audio = await this.audioRepository.findById(input.audioId);

    if (!audio) {
      return fail(new NotFoundException('Audio not found'));
    }

    if (audio.userId !== input.userId) {
      return fail(new ForbiddenException('Access denied'));
    }

    return ok(audio);
  }
}
