import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../../../../shared/infrastructure/config/supabase.config.js';
import type { IShareLinkRepository } from '../../domain/repositories/share-link.repository.js';
import type { CreateShareLinkProps, ShareLinkEntity } from '../../domain/entities/share-link.entity.js';

@Injectable()
export class ShareLinkRepositoryImpl implements IShareLinkRepository {
  constructor(private readonly supabaseService: SupabaseService) {}

  async findOrCreate(props: CreateShareLinkProps): Promise<ShareLinkEntity> {
    // Try to find existing first
    const { data: existing } = await this.supabaseService
      .getClient()
      .from('shared_links')
      .select()
      .eq('owner_id', props.ownerId)
      .eq('resource_type', props.resourceType)
      .eq('resource_id', props.resourceId)
      .single();

    if (existing) return this.toEntity(existing);

    const { data, error } = await this.supabaseService
      .getClient()
      .from('shared_links')
      .insert({
        owner_id: props.ownerId,
        resource_type: props.resourceType,
        resource_id: props.resourceId,
        is_public: false,
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to create share link: ${error.message}`);
    return this.toEntity(data);
  }

  async findByToken(token: string): Promise<ShareLinkEntity | null> {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('shared_links')
      .select()
      .eq('token', token)
      .single();

    if (error || !data) return null;
    return this.toEntity(data);
  }

  async findByOwnerId(ownerId: string): Promise<ShareLinkEntity[]> {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('shared_links')
      .select()
      .eq('owner_id', ownerId)
      .order('created_at', { ascending: false });

    if (error) throw new Error(`Failed to fetch share links: ${error.message}`);
    return (data ?? []).map((row) => this.toEntity(row));
  }

  async findById(id: string): Promise<ShareLinkEntity | null> {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('shared_links')
      .select()
      .eq('id', id)
      .single();

    if (error || !data) return null;
    return this.toEntity(data);
  }

  async updateVisibility(id: string, isPublic: boolean): Promise<ShareLinkEntity> {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('shared_links')
      .update({ is_public: isPublic, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(`Failed to update share link visibility: ${error.message}`);
    return this.toEntity(data);
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabaseService
      .getClient()
      .from('shared_links')
      .delete()
      .eq('id', id);

    if (error) throw new Error(`Failed to delete share link: ${error.message}`);
  }

  private toEntity(raw: Record<string, unknown>): ShareLinkEntity {
    return {
      id: raw.id as string,
      token: raw.token as string,
      ownerId: raw.owner_id as string,
      resourceType: raw.resource_type as ShareLinkEntity['resourceType'],
      resourceId: raw.resource_id as string,
      isPublic: raw.is_public as boolean,
      createdAt: new Date(raw.created_at as string),
      updatedAt: new Date(raw.updated_at as string),
    };
  }
}
