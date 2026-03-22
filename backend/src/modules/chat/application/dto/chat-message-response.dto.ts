import type { ChatMessageEntity } from '../../domain/entities/chat-message.entity.js';

export class ChatMessageResponseDto {
  id!: string;
  role!: 'user' | 'assistant';
  content!: string;
  createdAt!: string;

  static fromEntity(entity: ChatMessageEntity): ChatMessageResponseDto {
    const dto = new ChatMessageResponseDto();
    dto.id = entity.id;
    dto.role = entity.role;
    dto.content = entity.content;
    dto.createdAt = entity.createdAt.toISOString();
    return dto;
  }
}
