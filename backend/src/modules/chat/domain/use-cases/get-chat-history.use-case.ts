import { Inject, Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import type { ChatMessageEntity } from '../entities/chat-message.entity.js';
import type { IChatRepository } from '../repositories/chat.repository.js';
import { CHAT_REPOSITORY } from '../repositories/chat.repository.js';
import type { ITranscriptionRepository } from '../../../transcription/domain/repositories/transcription.repository.js';
import { TRANSCRIPTION_REPOSITORY } from '../../../transcription/domain/repositories/transcription.repository.js';
import { ok, fail, type Result } from '../../../../shared/domain/result.js';

export interface GetChatHistoryInput {
  transcriptionId: string;
  userId: string;
}

@Injectable()
export class GetChatHistoryUseCase {
  constructor(
    @Inject(CHAT_REPOSITORY) private readonly chatRepository: IChatRepository,
    @Inject(TRANSCRIPTION_REPOSITORY) private readonly transcriptionRepository: ITranscriptionRepository,
  ) {}

  async execute(input: GetChatHistoryInput): Promise<Result<ChatMessageEntity[]>> {
    const transcription = await this.transcriptionRepository.findById(input.transcriptionId);

    if (!transcription) {
      return fail(new NotFoundException('Transcrição não encontrada'));
    }

    if (transcription.userId !== input.userId) {
      return fail(new ForbiddenException('Acesso negado'));
    }

    const messages = await this.chatRepository.getHistory(input.transcriptionId, input.userId);
    return ok(messages);
  }
}
