import { Injectable } from '@nestjs/common';
import { PostgresService } from '../../../../shared/infrastructure/config/postgres.config.js';
import type { IChatRepository, ConversationSummary } from '../../domain/repositories/chat.repository.js';
import type { ChatMessageEntity, CreateChatMessageProps } from '../../domain/entities/chat-message.entity.js';

interface ChatMessageRow {
  id: string;
  transcription_id: string;
  user_id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: Date | string;
}

interface ConversationRow {
  transcription_id: string;
  content: string;
  role: 'user' | 'assistant';
  created_at: Date | string;
  transcription_title: string | null;
  transcription_audio_id: string | null;
}

function toMessage(err: unknown): string {
  return err instanceof Error ? err.message : String(err);
}

@Injectable()
export class ChatRepositoryImpl implements IChatRepository {
  constructor(private readonly postgresService: PostgresService) {}

  async saveMessage(props: CreateChatMessageProps): Promise<ChatMessageEntity> {
    try {
      const result = await this.postgresService.query<ChatMessageRow>(
        `INSERT INTO chat_messages (transcription_id, user_id, role, content)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
        [props.transcriptionId, props.userId, props.role, props.content],
      );
      return this.toEntity(result.rows[0]);
    } catch (err) {
      throw new Error(`Failed to save chat message: ${toMessage(err)}`);
    }
  }

  async getHistory(transcriptionId: string, userId: string, limit = 50): Promise<ChatMessageEntity[]> {
    try {
      const result = await this.postgresService.query<ChatMessageRow>(
        `SELECT * FROM chat_messages
         WHERE transcription_id = $1 AND user_id = $2
         ORDER BY created_at ASC
         LIMIT $3`,
        [transcriptionId, userId, limit],
      );
      return result.rows.map((row) => this.toEntity(row));
    } catch (err) {
      throw new Error(`Failed to fetch chat history: ${toMessage(err)}`);
    }
  }

  async clearHistory(transcriptionId: string, userId: string): Promise<void> {
    try {
      await this.postgresService.query(
        'DELETE FROM chat_messages WHERE transcription_id = $1 AND user_id = $2',
        [transcriptionId, userId],
      );
    } catch (err) {
      throw new Error(`Failed to clear chat history: ${toMessage(err)}`);
    }
  }

  async getConversations(userId: string): Promise<ConversationSummary[]> {
    let rows: ConversationRow[];
    try {
      const result = await this.postgresService.query<ConversationRow>(
        `SELECT cm.transcription_id,
                cm.content,
                cm.role,
                cm.created_at,
                t.title AS transcription_title,
                t.audio_id AS transcription_audio_id
         FROM chat_messages cm
         LEFT JOIN transcriptions t ON t.id = cm.transcription_id
         WHERE cm.user_id = $1
         ORDER BY cm.created_at DESC`,
        [userId],
      );
      rows = result.rows;
    } catch (err) {
      throw new Error(`Failed to fetch conversations: ${toMessage(err)}`);
    }

    // Group by transcription_id, keeping only the most recent message per conversation
    const seen = new Map<string, ConversationSummary>();
    const counts = new Map<string, number>();

    for (const row of rows) {
      const tid = row.transcription_id;
      counts.set(tid, (counts.get(tid) ?? 0) + 1);

      if (!seen.has(tid)) {
        seen.set(tid, {
          transcriptionId: tid,
          audioId: row.transcription_audio_id ?? '',
          transcriptionTitle: row.transcription_title ?? null,
          lastMessage: row.content,
          lastMessageRole: row.role,
          lastMessageAt: new Date(row.created_at),
          messageCount: 0, // filled below
        });
      }
    }

    return Array.from(seen.values()).map((conv) => ({
      ...conv,
      messageCount: counts.get(conv.transcriptionId) ?? 0,
    }));
  }

  private toEntity(row: ChatMessageRow): ChatMessageEntity {
    return {
      id: row.id,
      transcriptionId: row.transcription_id,
      userId: row.user_id,
      role: row.role,
      content: row.content,
      createdAt: new Date(row.created_at),
    };
  }
}
