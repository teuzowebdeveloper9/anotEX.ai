import type { ChatMessageEntity, CreateChatMessageProps } from '../entities/chat-message.entity.js';

export interface IChatRepository {
  saveMessage(props: CreateChatMessageProps): Promise<ChatMessageEntity>;
  getHistory(transcriptionId: string, userId: string, limit?: number): Promise<ChatMessageEntity[]>;
  clearHistory(transcriptionId: string, userId: string): Promise<void>;
}

export const CHAT_REPOSITORY = Symbol('IChatRepository');
