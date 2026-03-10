import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../../../../shared/infrastructure/config/supabase.config.js';
import { ITranscriptionRepository } from '../../domain/repositories/transcription.repository.js';
import {
  CreateTranscriptionProps,
  TranscriptionEntity,
  TranscriptionStatus,
} from '../../domain/entities/transcription.entity.js';

@Injectable()
export class TranscriptionRepositoryImpl implements ITranscriptionRepository {
  constructor(private readonly supabaseService: SupabaseService) {}

  async create(props: CreateTranscriptionProps): Promise<TranscriptionEntity> {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('transcriptions')
      .insert({
        audio_id: props.audioId,
        user_id: props.userId,
        language: props.language,
        status: TranscriptionStatus.PENDING,
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to create transcription: ${error.message}`);
    return this.toEntity(data);
  }

  async findById(id: string): Promise<TranscriptionEntity | null> {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('transcriptions')
      .select()
      .eq('id', id)
      .single();

    if (error || !data) return null;
    return this.toEntity(data);
  }

  async findByAudioId(audioId: string): Promise<TranscriptionEntity | null> {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('transcriptions')
      .select()
      .eq('audio_id', audioId)
      .single();

    if (error || !data) return null;
    return this.toEntity(data);
  }

  async findByUserId(userId: string, search?: string): Promise<TranscriptionEntity[]> {
    let query = this.supabaseService
      .getClient()
      .from('transcriptions')
      .select()
      .eq('user_id', userId);

    if (search) {
      query = query.or(`title.ilike.%${search}%,transcription_text.ilike.%${search}%`);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw new Error(`Failed to fetch transcriptions: ${error.message}`);
    return (data ?? []).map(this.toEntity);
  }

  async updateStatus(
    id: string,
    status: TranscriptionStatus,
    errorMessage?: string,
  ): Promise<void> {
    const { error } = await this.supabaseService
      .getClient()
      .from('transcriptions')
      .update({ status, error_message: errorMessage ?? null, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) throw new Error(`Failed to update transcription status: ${error.message}`);
  }

  async updateResult(
    id: string,
    transcriptionText: string,
    summaryText: string,
    title: string,
  ): Promise<void> {
    const { error } = await this.supabaseService
      .getClient()
      .from('transcriptions')
      .update({
        title,
        transcription_text: transcriptionText,
        summary_text: summaryText,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) throw new Error(`Failed to update transcription result: ${error.message}`);
  }

  async deleteByAudioId(audioId: string): Promise<void> {
    const { error } = await this.supabaseService
      .getClient()
      .from('transcriptions')
      .delete()
      .eq('audio_id', audioId);

    if (error) throw new Error(`Failed to delete transcription: ${error.message}`);
  }

  private toEntity(raw: Record<string, unknown>): TranscriptionEntity {
    return {
      id: raw.id as string,
      audioId: raw.audio_id as string,
      userId: raw.user_id as string,
      title: (raw.title as string | null) ?? null,
      transcriptionText: raw.transcription_text as string | null,
      summaryText: raw.summary_text as string | null,
      language: raw.language as string,
      status: raw.status as TranscriptionStatus,
      errorMessage: raw.error_message as string | null,
      createdAt: new Date(raw.created_at as string),
      updatedAt: new Date(raw.updated_at as string),
    };
  }
}
