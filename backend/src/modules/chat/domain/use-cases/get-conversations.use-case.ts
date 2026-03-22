import { Inject, Injectable } from '@nestjs/common';
import type { IChatRepository, ConversationSummary } from '../repositories/chat.repository.js';
import { CHAT_REPOSITORY } from '../repositories/chat.repository.js';

export interface GetConversationsInput {
  userId: string;
}

@Injectable()
export class GetConversationsUseCase {
  constructor(
    @Inject(CHAT_REPOSITORY) private readonly chatRepository: IChatRepository,
  ) {}

  async execute(input: GetConversationsInput): Promise<ConversationSummary[]> {
    return this.chatRepository.getConversations(input.userId);
  }
}
