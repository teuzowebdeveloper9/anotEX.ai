import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../../../../shared/infrastructure/config/supabase.config.js';
import type { IStudyMaterialRepository } from '../../domain/repositories/study-material.repository.js';
import type {
  CreateStudyMaterialProps,
  FlashcardItem,
  StudyMaterialContent,
  StudyMaterialEntity,
  StudyMaterialStatus,
  StudyMaterialType,
} from '../../domain/entities/study-material.entity.js';

@Injectable()
export class StudyMaterialRepositoryImpl implements IStudyMaterialRepository {
  constructor(private readonly supabaseService: SupabaseService) {}

  async create(props: CreateStudyMaterialProps): Promise<StudyMaterialEntity> {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('study_materials')
      .insert({
        transcription_id: props.transcriptionId,
        user_id: props.userId,
        type: props.type,
        status: 'PENDING',
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to create study material: ${error.message}`);
    return this.toEntity(data);
  }

  async findById(id: string): Promise<StudyMaterialEntity | null> {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('study_materials')
      .select()
      .eq('id', id)
      .single();

    if (error || !data) return null;
    return this.toEntity(data);
  }

  async findByTranscriptionId(transcriptionId: string): Promise<StudyMaterialEntity[]> {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('study_materials')
      .select()
      .eq('transcription_id', transcriptionId)
      .order('created_at', { ascending: true });

    if (error) throw new Error(`Failed to fetch study materials: ${error.message}`);
    return (data ?? []).map(this.toEntity);
  }

  async findByTranscriptionIdAndType(
    transcriptionId: string,
    type: StudyMaterialType,
  ): Promise<StudyMaterialEntity | null> {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('study_materials')
      .select()
      .eq('transcription_id', transcriptionId)
      .eq('type', type)
      .single();

    if (error || !data) return null;
    return this.toEntity(data);
  }

  async updateStatus(id: string, status: StudyMaterialStatus, errorMessage?: string): Promise<void> {
    const { error } = await this.supabaseService
      .getClient()
      .from('study_materials')
      .update({ status, error_message: errorMessage ?? null, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) throw new Error(`Failed to update study material status: ${error.message}`);
  }

  async deleteById(id: string): Promise<void> {
    const { error } = await this.supabaseService
      .getClient()
      .from('study_materials')
      .delete()
      .eq('id', id);

    if (error) throw new Error(`Failed to delete study material: ${error.message}`);
  }

  async updateContent(id: string, content: StudyMaterialContent): Promise<void> {
    const { error } = await this.supabaseService
      .getClient()
      .from('study_materials')
      .update({ content, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) throw new Error(`Failed to update study material content: ${error.message}`);
  }

  async findAllFlashcardsByUserId(userId: string): Promise<StudyMaterialEntity[]> {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('study_materials')
      .select()
      .eq('user_id', userId)
      .eq('type', 'flashcards')
      .eq('status', 'COMPLETED')
      .order('created_at', { ascending: false });

    if (error) throw new Error(`Failed to fetch flashcard materials: ${error.message}`);
    return (data ?? []).map(this.toEntity);
  }

  async updateFlashcardsContent(id: string, flashcards: FlashcardItem[]): Promise<void> {
    const { error } = await this.supabaseService
      .getClient()
      .from('study_materials')
      .update({ content: flashcards, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) throw new Error(`Failed to update flashcards content: ${error.message}`);
  }

  private toEntity(raw: Record<string, unknown>): StudyMaterialEntity {
    return {
      id: raw.id as string,
      transcriptionId: raw.transcription_id as string,
      userId: raw.user_id as string,
      type: raw.type as StudyMaterialType,
      status: raw.status as StudyMaterialStatus,
      content: (raw.content as StudyMaterialContent) ?? null,
      errorMessage: (raw.error_message as string | null) ?? null,
      createdAt: new Date(raw.created_at as string),
      updatedAt: new Date(raw.updated_at as string),
    };
  }
}
