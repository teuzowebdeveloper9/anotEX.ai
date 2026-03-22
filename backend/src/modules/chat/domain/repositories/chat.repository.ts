import type { ChatMessageEntity, CreateChatMessageProps } from '../entities/chat-message.entity.js';

export interface ConversationSummary {
  readonly transcriptionId: string;
  readonly audioId: string;
  readonly transcriptionTitle: string | null;
  readonly lastMessage: string;
  readonly lastMessageRole: 'user' | 'assistant';
  readonly lastMessageAt: Date;
  readonly messageCount: number;
}

export interface IChatRepository {
  saveMessage(props: CreateChatMessageProps): Promise<ChatMessageEntity>;
  getHistory(transcriptionId: string, userId: string, limit?: number): Promise<ChatMessageEntity[]>;
  clearHistory(transcriptionId: string, userId: string): Promise<void>;
  getConversations(userId: string): Promise<ConversationSummary[]>;
}

export const CHAT_REPOSITORY = Symbol('IChatRepository');
