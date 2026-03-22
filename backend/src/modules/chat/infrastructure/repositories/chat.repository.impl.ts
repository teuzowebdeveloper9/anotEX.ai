import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../../../../shared/infrastructure/config/supabase.config.js';
import type { IChatRepository, ConversationSummary } from '../../domain/repositories/chat.repository.js';
import type { ChatMessageEntity, CreateChatMessageProps } from '../../domain/entities/chat-message.entity.js';

@Injectable()
export class ChatRepositoryImpl implements IChatRepository {
  constructor(private readonly supabaseService: SupabaseService) {}

  async saveMessage(props: CreateChatMessageProps): Promise<ChatMessageEntity> {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('chat_messages')
      .insert({
        transcription_id: props.transcriptionId,
        user_id: props.userId,
        role: props.role,
        content: props.content,
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to save chat message: ${error.message}`);
    return this.toEntity(data);
  }

  async getHistory(transcriptionId: string, userId: string, limit = 50): Promise<ChatMessageEntity[]> {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('chat_messages')
      .select()
      .eq('transcription_id', transcriptionId)
      .eq('user_id', userId)
      .order('created_at', { ascending: true })
      .limit(limit);

    if (error) throw new Error(`Failed to fetch chat history: ${error.message}`);
    return (data ?? []).map(row => this.toEntity(row));
  }

  async clearHistory(transcriptionId: string, userId: string): Promise<void> {
    const { error } = await this.supabaseService
      .getClient()
      .from('chat_messages')
      .delete()
      .eq('transcription_id', transcriptionId)
      .eq('user_id', userId);

    if (error) throw new Error(`Failed to clear chat history: ${error.message}`);
  }

  async getConversations(userId: string): Promise<ConversationSummary[]> {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('chat_messages')
      .select('transcription_id, content, role, created_at, transcriptions(id, title, audio_id)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw new Error(`Failed to fetch conversations: ${error.message}`);

    // Group by transcription_id, keeping only the most recent message per conversation
    const seen = new Map<string, ConversationSummary>();
    const counts = new Map<string, number>();

    for (const row of data ?? []) {
      const tid = row.transcription_id as string;
      counts.set(tid, (counts.get(tid) ?? 0) + 1);

      if (!seen.has(tid)) {
        const transcription = (Array.isArray(row.transcriptions) ? row.transcriptions[0] : row.transcriptions) as { id: string; title: string | null; audio_id: string } | null;
        seen.set(tid, {
          transcriptionId: tid,
          audioId: transcription?.audio_id ?? '',
          transcriptionTitle: transcription?.title ?? null,
          lastMessage: row.content as string,
          lastMessageRole: row.role as 'user' | 'assistant',
          lastMessageAt: new Date(row.created_at as string),
          messageCount: 0, // filled below
        });
      }
    }

    return Array.from(seen.values()).map(conv => ({
      ...conv,
      messageCount: counts.get(conv.transcriptionId) ?? 0,
    }));
  }

  private toEntity(raw: Record<string, unknown>): ChatMessageEntity {
    return {
      id: raw.id as string,
      transcriptionId: raw.transcription_id as string,
      userId: raw.user_id as string,
      role: raw.role as 'user' | 'assistant',
      content: raw.content as string,
      createdAt: new Date(raw.created_at as string),
    };
  }
}
