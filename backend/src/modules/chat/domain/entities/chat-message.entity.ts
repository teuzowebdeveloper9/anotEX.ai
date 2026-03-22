export type ChatMessageRole = 'user' | 'assistant';

export interface ChatMessageEntity {
  readonly id: string;
  readonly transcriptionId: string;
  readonly userId: string;
  readonly role: ChatMessageRole;
  readonly content: string;
  readonly createdAt: Date;
}

export interface CreateChatMessageProps {
  readonly transcriptionId: string;
  readonly userId: string;
  readonly role: ChatMessageRole;
  readonly content: string;
}
