import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../../../../shared/infrastructure/config/supabase.config.js';
import { IAudioRepository } from '../../domain/repositories/audio.repository.js';
import { AudioEntity, AudioStatus, CreateAudioProps } from '../../domain/entities/audio.entity.js';

@Injectable()
export class AudioRepositoryImpl implements IAudioRepository {
  constructor(private readonly supabaseService: SupabaseService) {}

  async create(props: CreateAudioProps): Promise<AudioEntity> {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('audios')
      .insert({
        user_id: props.userId,
        file_name: props.fileName,
        mime_type: props.mimeType,
        size_bytes: props.sizeBytes,
        storage_key: props.storageKey,
        status: AudioStatus.PENDING,
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to create audio: ${error.message}`);
    return this.toEntity(data);
  }

  async findById(id: string): Promise<AudioEntity | null> {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('audios')
      .select()
      .eq('id', id)
      .single();

    if (error || !data) return null;
    return this.toEntity(data);
  }

  async findByUserId(userId: string): Promise<AudioEntity[]> {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('audios')
      .select()
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw new Error(`Failed to fetch audios: ${error.message}`);
    return (data ?? []).map(this.toEntity);
  }

  async updateStatus(id: string, status: AudioStatus, errorMessage?: string): Promise<void> {
    const { error } = await this.supabaseService
      .getClient()
      .from('audios')
      .update({ status, error_message: errorMessage ?? null, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) throw new Error(`Failed to update audio status: ${error.message}`);
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabaseService
      .getClient()
      .from('audios')
      .delete()
      .eq('id', id);

    if (error) throw new Error(`Failed to delete audio: ${error.message}`);
  }

  private toEntity(raw: Record<string, unknown>): AudioEntity {
    return {
      id: raw.id as string,
      userId: raw.user_id as string,
      fileName: raw.file_name as string,
      mimeType: raw.mime_type as string,
      sizeBytes: raw.size_bytes as number,
      storageKey: raw.storage_key as string,
      status: raw.status as AudioStatus,
      createdAt: new Date(raw.created_at as string),
      updatedAt: new Date(raw.updated_at as string),
    };
  }
}
