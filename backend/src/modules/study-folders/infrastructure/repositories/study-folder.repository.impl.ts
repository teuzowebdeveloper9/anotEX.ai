import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../../../../shared/infrastructure/config/supabase.config.js';
import type { IStudyFolderRepository } from '../../domain/repositories/study-folder.repository.js';
import type {
  AddItemProps,
  CreateFolderProps,
  FolderItemType,
  StudyFolderEntity,
  StudyFolderItemEntity,
} from '../../domain/entities/study-folder.entity.js';

@Injectable()
export class StudyFolderRepositoryImpl implements IStudyFolderRepository {
  constructor(private readonly supabaseService: SupabaseService) {}

  async create(props: CreateFolderProps): Promise<StudyFolderEntity> {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('study_folders')
      .insert({
        user_id: props.userId,
        name: props.name,
        description: props.description ?? null,
        item_count: 0,
        recommendations_unlocked: false,
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to create folder: ${error.message}`);
    return this.toEntity(data);
  }

  async findById(id: string): Promise<StudyFolderEntity | null> {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('study_folders')
      .select()
      .eq('id', id)
      .single();

    if (error || !data) return null;
    return this.toEntity(data);
  }

  async findByUserId(userId: string): Promise<StudyFolderEntity[]> {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('study_folders')
      .select()
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw new Error(`Failed to fetch folders: ${error.message}`);
    return (data ?? []).map((r) => this.toEntity(r));
  }

  async update(
    id: string,
    data: { name?: string; description?: string | null },
  ): Promise<StudyFolderEntity> {
    const updatePayload: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (data.name !== undefined) updatePayload.name = data.name;
    if (data.description !== undefined) updatePayload.description = data.description;

    const { data: updated, error } = await this.supabaseService
      .getClient()
      .from('study_folders')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(`Failed to update folder: ${error.message}`);
    return this.toEntity(updated);
  }

  async deleteById(id: string): Promise<void> {
    const { error } = await this.supabaseService
      .getClient()
      .from('study_folders')
      .delete()
      .eq('id', id);

    if (error) throw new Error(`Failed to delete folder: ${error.message}`);
  }

  async addItem(props: AddItemProps): Promise<StudyFolderItemEntity> {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('study_folder_items')
      .insert({
        folder_id: props.folderId,
        user_id: props.userId,
        transcription_id: props.transcriptionId,
        audio_id: props.audioId,
        item_type: props.itemType,
        title: props.title,
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to add item to folder: ${error.message}`);

    await this.syncFolderCount(props.folderId);

    return this.toItemEntity(data);
  }

  async removeItem(itemId: string): Promise<void> {
    const { data: item } = await this.supabaseService
      .getClient()
      .from('study_folder_items')
      .select('folder_id')
      .eq('id', itemId)
      .single();

    const { error } = await this.supabaseService
      .getClient()
      .from('study_folder_items')
      .delete()
      .eq('id', itemId);

    if (error) throw new Error(`Failed to remove item: ${error.message}`);

    if (item?.folder_id) {
      await this.syncFolderCount(item.folder_id as string);
    }
  }

  async findItemsByFolderId(folderId: string): Promise<StudyFolderItemEntity[]> {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('study_folder_items')
      .select()
      .eq('folder_id', folderId)
      .order('created_at', { ascending: true });

    if (error) throw new Error(`Failed to fetch folder items: ${error.message}`);
    return (data ?? []).map((r) => this.toItemEntity(r));
  }

  async findItemById(itemId: string): Promise<StudyFolderItemEntity | null> {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('study_folder_items')
      .select()
      .eq('id', itemId)
      .single();

    if (error || !data) return null;
    return this.toItemEntity(data);
  }

  async itemExists(
    folderId: string,
    transcriptionId: string,
    itemType: FolderItemType,
  ): Promise<boolean> {
    const { data } = await this.supabaseService
      .getClient()
      .from('study_folder_items')
      .select('id')
      .eq('folder_id', folderId)
      .eq('transcription_id', transcriptionId)
      .eq('item_type', itemType)
      .maybeSingle();

    return !!data;
  }

  private async syncFolderCount(folderId: string): Promise<void> {
    const { count } = await this.supabaseService
      .getClient()
      .from('study_folder_items')
      .select('*', { count: 'exact', head: true })
      .eq('folder_id', folderId);

    const itemCount = count ?? 0;

    await this.supabaseService
      .getClient()
      .from('study_folders')
      .update({
        item_count: itemCount,
        recommendations_unlocked: itemCount >= 5,
        updated_at: new Date().toISOString(),
      })
      .eq('id', folderId);
  }

  private toEntity(raw: Record<string, unknown>): StudyFolderEntity {
    return {
      id: raw.id as string,
      userId: raw.user_id as string,
      name: raw.name as string,
      description: (raw.description as string | null) ?? null,
      itemCount: raw.item_count as number,
      recommendationsUnlocked: raw.recommendations_unlocked as boolean,
      createdAt: new Date(raw.created_at as string),
      updatedAt: new Date(raw.updated_at as string),
    };
  }

  private toItemEntity(raw: Record<string, unknown>): StudyFolderItemEntity {
    return {
      id: raw.id as string,
      folderId: raw.folder_id as string,
      userId: raw.user_id as string,
      transcriptionId: raw.transcription_id as string,
      audioId: raw.audio_id as string,
      itemType: raw.item_type as FolderItemType,
      title: raw.title as string,
      createdAt: new Date(raw.created_at as string),
    };
  }
}
