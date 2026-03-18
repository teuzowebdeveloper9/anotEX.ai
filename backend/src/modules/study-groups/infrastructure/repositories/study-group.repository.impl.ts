import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../../../../shared/infrastructure/config/supabase.config.js';
import type { IStudyGroupRepository } from '../../domain/repositories/study-group.repository.js';
import type {
  CreateGroupProps,
  GroupMemberEntity,
  GroupShareEntity,
  GroupWithMemberCount,
  StudyGroupEntity,
} from '../../domain/entities/study-group.entity.js';

@Injectable()
export class StudyGroupRepositoryImpl implements IStudyGroupRepository {
  constructor(private readonly supabaseService: SupabaseService) {}

  async createGroup(props: CreateGroupProps): Promise<StudyGroupEntity> {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('study_groups')
      .insert({
        name: props.name,
        description: props.description ?? null,
        owner_id: props.ownerId,
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to create group: ${error.message}`);
    return this.toGroupEntity(data);
  }

  async findGroupById(id: string): Promise<StudyGroupEntity | null> {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('study_groups')
      .select()
      .eq('id', id)
      .single();

    if (error || !data) return null;
    return this.toGroupEntity(data);
  }

  async findGroupsByUserId(userId: string): Promise<GroupWithMemberCount[]> {
    // Get groups where user is owner or member
    const { data: memberRows, error: memberError } = await this.supabaseService
      .getClient()
      .from('study_group_members')
      .select('group_id, role')
      .eq('user_id', userId);

    if (memberError) throw new Error(`Failed to fetch user groups: ${memberError.message}`);
    if (!memberRows || memberRows.length === 0) return [];

    const groupIds = memberRows.map((r) => r.group_id as string);
    const roleMap = new Map(memberRows.map((r) => [r.group_id as string, r.role as string]));

    const { data: groups, error: groupsError } = await this.supabaseService
      .getClient()
      .from('study_groups')
      .select('*')
      .in('id', groupIds)
      .order('created_at', { ascending: false });

    if (groupsError) throw new Error(`Failed to fetch groups: ${groupsError.message}`);

    // Get member counts and share counts per group
    const [memberCountsResult, shareCountsResult] = await Promise.all([
      this.supabaseService
        .getClient()
        .from('study_group_members')
        .select('group_id')
        .in('group_id', groupIds),
      this.supabaseService
        .getClient()
        .from('study_group_shares')
        .select('group_id')
        .in('group_id', groupIds),
    ]);

    const memberCounts = new Map<string, number>();
    const shareCounts = new Map<string, number>();

    for (const row of memberCountsResult.data ?? []) {
      const gid = row.group_id as string;
      memberCounts.set(gid, (memberCounts.get(gid) ?? 0) + 1);
    }

    for (const row of shareCountsResult.data ?? []) {
      const gid = row.group_id as string;
      shareCounts.set(gid, (shareCounts.get(gid) ?? 0) + 1);
    }

    return (groups ?? []).map((g) => ({
      ...this.toGroupEntity(g),
      memberCount: memberCounts.get(g.id as string) ?? 0,
      shareCount: shareCounts.get(g.id as string) ?? 0,
      role: (roleMap.get(g.id as string) ?? 'member') as 'owner' | 'member',
    }));
  }

  async updateGroup(id: string, name: string, description: string | null): Promise<StudyGroupEntity> {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('study_groups')
      .update({ name, description, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(`Failed to update group: ${error.message}`);
    return this.toGroupEntity(data);
  }

  async deleteGroup(id: string): Promise<void> {
    const { error } = await this.supabaseService
      .getClient()
      .from('study_groups')
      .delete()
      .eq('id', id);

    if (error) throw new Error(`Failed to delete group: ${error.message}`);
  }

  async addMember(groupId: string, userId: string, role: 'owner' | 'member' = 'member'): Promise<GroupMemberEntity> {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('study_group_members')
      .insert({ group_id: groupId, user_id: userId, role })
      .select()
      .single();

    if (error) throw new Error(`Failed to add member: ${error.message}`);

    const email = await this.getEmailById(userId);
    return this.toMemberEntity(data, email);
  }

  async findMember(groupId: string, userId: string): Promise<GroupMemberEntity | null> {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('study_group_members')
      .select()
      .eq('group_id', groupId)
      .eq('user_id', userId)
      .single();

    if (error || !data) return null;
    const email = await this.getEmailById(userId);
    return this.toMemberEntity(data, email);
  }

  async findMembers(groupId: string): Promise<GroupMemberEntity[]> {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('study_group_members')
      .select()
      .eq('group_id', groupId)
      .order('joined_at', { ascending: true });

    if (error) throw new Error(`Failed to fetch members: ${error.message}`);

    const members = data ?? [];
    const emails = await Promise.all(
      members.map((m) => this.getEmailById(m.user_id as string)),
    );

    return members.map((m, i) => this.toMemberEntity(m, emails[i]));
  }

  async removeMember(groupId: string, userId: string): Promise<void> {
    const { error } = await this.supabaseService
      .getClient()
      .from('study_group_members')
      .delete()
      .eq('group_id', groupId)
      .eq('user_id', userId);

    if (error) throw new Error(`Failed to remove member: ${error.message}`);
  }

  async addShare(groupId: string, sharedLinkId: string, sharedBy: string): Promise<GroupShareEntity> {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('study_group_shares')
      .insert({ group_id: groupId, shared_link_id: sharedLinkId, shared_by: sharedBy })
      .select()
      .single();

    if (error) throw new Error(`Failed to add share: ${error.message}`);

    const shares = await this.findShares(groupId);
    return shares.find((s) => s.id === (data.id as string)) ?? this.toGroupShareEntity(data, null, null, null);
  }

  async findShares(groupId: string): Promise<GroupShareEntity[]> {
    const { data: shareRows, error } = await this.supabaseService
      .getClient()
      .from('study_group_shares')
      .select('*, shared_links(*)')
      .eq('group_id', groupId)
      .order('shared_at', { ascending: false });

    if (error) throw new Error(`Failed to fetch group shares: ${error.message}`);

    return (shareRows ?? []).map((row) => {
      const link = row.shared_links as Record<string, unknown> | null;
      return this.toGroupShareEntity(
        row,
        link,
        null,
        null,
      );
    });
  }

  async removeShare(groupId: string, sharedLinkId: string): Promise<void> {
    const { error } = await this.supabaseService
      .getClient()
      .from('study_group_shares')
      .delete()
      .eq('group_id', groupId)
      .eq('shared_link_id', sharedLinkId);

    if (error) throw new Error(`Failed to remove share: ${error.message}`);
  }

  async findUserIdByEmail(email: string): Promise<string | null> {
    const { data, error } = await this.supabaseService
      .getClient()
      .rpc('get_user_id_by_email', { user_email: email });

    if (error || !data) return null;
    return data as string;
  }

  private async getEmailById(userId: string): Promise<string | null> {
    try {
      const { data, error } = await this.supabaseService
        .getClient()
        .auth.admin.getUserById(userId);
      if (error || !data.user) return null;
      return data.user.email ?? null;
    } catch {
      return null;
    }
  }

  private toGroupEntity(raw: Record<string, unknown>): StudyGroupEntity {
    return {
      id: raw.id as string,
      name: raw.name as string,
      description: (raw.description as string | null) ?? null,
      ownerId: raw.owner_id as string,
      createdAt: new Date(raw.created_at as string),
      updatedAt: new Date(raw.updated_at as string),
    };
  }

  private toMemberEntity(raw: Record<string, unknown>, email: string | null): GroupMemberEntity {
    return {
      id: raw.id as string,
      groupId: raw.group_id as string,
      userId: raw.user_id as string,
      userEmail: email ?? '',
      role: raw.role as 'owner' | 'member',
      joinedAt: new Date(raw.joined_at as string),
    };
  }

  private toGroupShareEntity(
    raw: Record<string, unknown>,
    link: Record<string, unknown> | null,
    _ownerEmail: string | null,
    _resourceTitle: string | null,
  ): GroupShareEntity {
    return {
      id: raw.id as string,
      groupId: raw.group_id as string,
      sharedLinkId: raw.shared_link_id as string,
      sharedBy: raw.shared_by as string,
      sharedAt: new Date(raw.shared_at as string),
      shareToken: (link?.token as string | null) ?? '',
      resourceType: (link?.resource_type as string | null) ?? '',
      resourceId: (link?.resource_id as string | null) ?? '',
      isPublic: (link?.is_public as boolean | null) ?? false,
      ownerEmail: null,
      resourceTitle: null,
    };
  }
}
