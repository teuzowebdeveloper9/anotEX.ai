import { Inject, Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import type { IChatRepository } from '../repositories/chat.repository.js';
import { CHAT_REPOSITORY } from '../repositories/chat.repository.js';
import type { ITranscriptionRepository } from '../../../transcription/domain/repositories/transcription.repository.js';
import { TRANSCRIPTION_REPOSITORY } from '../../../transcription/domain/repositories/transcription.repository.js';
import { ok, fail, type Result } from '../../../../shared/domain/result.js';

export interface ClearChatHistoryInput {
  transcriptionId: string;
  userId: string;
}

@Injectable()
export class ClearChatHistoryUseCase {
  constructor(
    @Inject(CHAT_REPOSITORY) private readonly chatRepository: IChatRepository,
    @Inject(TRANSCRIPTION_REPOSITORY) private readonly transcriptionRepository: ITranscriptionRepository,
  ) {}

  async execute(input: ClearChatHistoryInput): Promise<Result<void>> {
    const transcription = await this.transcriptionRepository.findById(input.transcriptionId);

    if (!transcription) {
      return fail(new NotFoundException('Transcrição não encontrada'));
    }

    if (transcription.userId !== input.userId) {
      return fail(new ForbiddenException('Acesso negado'));
    }

    await this.chatRepository.clearHistory(input.transcriptionId, input.userId);
    return ok(undefined);
  }
}
