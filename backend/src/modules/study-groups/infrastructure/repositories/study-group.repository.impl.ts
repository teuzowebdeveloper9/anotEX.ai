import { Injectable } from '@nestjs/common';
import { PostgresService } from '../../../../shared/infrastructure/config/postgres.config.js';
import type { IStudyGroupRepository } from '../../domain/repositories/study-group.repository.js';
import type {
  CreateGroupProps,
  GroupMemberEntity,
  GroupShareEntity,
  GroupWithMemberCount,
  StudyGroupEntity,
} from '../../domain/entities/study-group.entity.js';

interface StudyGroupRow {
  id: string;
  name: string;
  description: string | null;
  owner_id: string;
  created_at: Date | string;
  updated_at: Date | string;
}

interface GroupWithCountsRow extends StudyGroupRow {
  member_role: 'owner' | 'member';
  member_count: string | number;
  share_count: string | number;
}

interface GroupMemberRow {
  id: string;
  group_id: string;
  user_id: string;
  role: 'owner' | 'member';
  joined_at: Date | string;
}

interface GroupMemberWithEmailRow extends GroupMemberRow {
  user_email: string | null;
}

interface GroupShareRow {
  id: string;
  group_id: string;
  shared_link_id: string;
  shared_by: string;
  shared_at: Date | string;
}

interface GroupShareWithLinkRow extends GroupShareRow {
  link_token: string | null;
  link_resource_type: string | null;
  link_resource_id: string | null;
  link_is_public: boolean | null;
}

function toMessage(err: unknown): string {
  return err instanceof Error ? err.message : String(err);
}

@Injectable()
export class StudyGroupRepositoryImpl implements IStudyGroupRepository {
  constructor(private readonly postgresService: PostgresService) {}

  async createGroup(props: CreateGroupProps): Promise<StudyGroupEntity> {
    try {
      const result = await this.postgresService.query<StudyGroupRow>(
        `INSERT INTO study_groups (name, description, owner_id)
         VALUES ($1, $2, $3)
         RETURNING *`,
        [props.name, props.description ?? null, props.ownerId],
      );
      return this.toGroupEntity(result.rows[0]);
    } catch (err) {
      throw new Error(`Failed to create group: ${toMessage(err)}`);
    }
  }

  async findGroupById(id: string): Promise<StudyGroupEntity | null> {
    const result = await this.postgresService.query<StudyGroupRow>(
      'SELECT * FROM study_groups WHERE id = $1',
      [id],
    );

    if (result.rows.length === 0) return null;
    return this.toGroupEntity(result.rows[0]);
  }

  async findGroupsByUserId(userId: string): Promise<GroupWithMemberCount[]> {
    try {
      // Groups where user is owner or member, with member and share counts
      const result = await this.postgresService.query<GroupWithCountsRow>(
        `SELECT g.*,
                m.role AS member_role,
                (SELECT COUNT(*) FROM study_group_members mm WHERE mm.group_id = g.id) AS member_count,
                (SELECT COUNT(*) FROM study_group_shares ss WHERE ss.group_id = g.id) AS share_count
         FROM study_group_members m
         JOIN study_groups g ON g.id = m.group_id
         WHERE m.user_id = $1
         ORDER BY g.created_at DESC`,
        [userId],
      );

      return result.rows.map((row) => ({
        ...this.toGroupEntity(row),
        memberCount: Number(row.member_count),
        shareCount: Number(row.share_count),
        role: (row.member_role ?? 'member') as 'owner' | 'member',
      }));
    } catch (err) {
      throw new Error(`Failed to fetch user groups: ${toMessage(err)}`);
    }
  }

  async updateGroup(id: string, name: string, description: string | null): Promise<StudyGroupEntity> {
    try {
      const result = await this.postgresService.query<StudyGroupRow>(
        `UPDATE study_groups
         SET name = $1, description = $2, updated_at = NOW()
         WHERE id = $3
         RETURNING *`,
        [name, description, id],
      );
      return this.toGroupEntity(result.rows[0]);
    } catch (err) {
      throw new Error(`Failed to update group: ${toMessage(err)}`);
    }
  }

  async deleteGroup(id: string): Promise<void> {
    try {
      await this.postgresService.query('DELETE FROM study_groups WHERE id = $1', [id]);
    } catch (err) {
      throw new Error(`Failed to delete group: ${toMessage(err)}`);
    }
  }

  async addMember(groupId: string, userId: string, role: 'owner' | 'member' = 'member'): Promise<GroupMemberEntity> {
    let row: GroupMemberRow;
    try {
      const result = await this.postgresService.query<GroupMemberRow>(
        `INSERT INTO study_group_members (group_id, user_id, role)
         VALUES ($1, $2, $3)
         RETURNING *`,
        [groupId, userId, role],
      );
      row = result.rows[0];
    } catch (err) {
      throw new Error(`Failed to add member: ${toMessage(err)}`);
    }

    const email = await this.getEmailById(userId);
    return this.toMemberEntity(row, email);
  }

  async findMember(groupId: string, userId: string): Promise<GroupMemberEntity | null> {
    const result = await this.postgresService.query<GroupMemberWithEmailRow>(
      `SELECT m.*, u.email AS user_email
       FROM study_group_members m
       LEFT JOIN users u ON u.id = m.user_id
       WHERE m.group_id = $1 AND m.user_id = $2`,
      [groupId, userId],
    );

    if (result.rows.length === 0) return null;
    const row = result.rows[0];
    return this.toMemberEntity(row, row.user_email ?? null);
  }

  async findMembers(groupId: string): Promise<GroupMemberEntity[]> {
    try {
      const result = await this.postgresService.query<GroupMemberWithEmailRow>(
        `SELECT m.*, u.email AS user_email
         FROM study_group_members m
         LEFT JOIN users u ON u.id = m.user_id
         WHERE m.group_id = $1
         ORDER BY m.joined_at ASC`,
        [groupId],
      );

      return result.rows.map((row) => this.toMemberEntity(row, row.user_email ?? null));
    } catch (err) {
      throw new Error(`Failed to fetch members: ${toMessage(err)}`);
    }
  }

  async removeMember(groupId: string, userId: string): Promise<void> {
    try {
      await this.postgresService.query(
        'DELETE FROM study_group_members WHERE group_id = $1 AND user_id = $2',
        [groupId, userId],
      );
    } catch (err) {
      throw new Error(`Failed to remove member: ${toMessage(err)}`);
    }
  }

  async addShare(groupId: string, sharedLinkId: string, sharedBy: string): Promise<GroupShareEntity> {
    let row: GroupShareRow;
    try {
      const result = await this.postgresService.query<GroupShareRow>(
        `INSERT INTO study_group_shares (group_id, shared_link_id, shared_by)
         VALUES ($1, $2, $3)
         RETURNING *`,
        [groupId, sharedLinkId, sharedBy],
      );
      row = result.rows[0];
    } catch (err) {
      throw new Error(`Failed to add share: ${toMessage(err)}`);
    }

    const shares = await this.findShares(groupId);
    return (
      shares.find((s) => s.id === row.id) ??
      this.toGroupShareEntity({
        ...row,
        link_token: null,
        link_resource_type: null,
        link_resource_id: null,
        link_is_public: null,
      })
    );
  }

  async findShares(groupId: string): Promise<GroupShareEntity[]> {
    try {
      const result = await this.postgresService.query<GroupShareWithLinkRow>(
        `SELECT s.*,
                l.token AS link_token,
                l.resource_type AS link_resource_type,
                l.resource_id AS link_resource_id,
                l.is_public AS link_is_public
         FROM study_group_shares s
         LEFT JOIN shared_links l ON l.id = s.shared_link_id
         WHERE s.group_id = $1
         ORDER BY s.shared_at DESC`,
        [groupId],
      );

      return result.rows.map((row) => this.toGroupShareEntity(row));
    } catch (err) {
      throw new Error(`Failed to fetch group shares: ${toMessage(err)}`);
    }
  }

  async removeShare(groupId: string, sharedLinkId: string): Promise<void> {
    try {
      await this.postgresService.query(
        'DELETE FROM study_group_shares WHERE group_id = $1 AND shared_link_id = $2',
        [groupId, sharedLinkId],
      );
    } catch (err) {
      throw new Error(`Failed to remove share: ${toMessage(err)}`);
    }
  }

  async findUserIdByEmail(email: string): Promise<string | null> {
    try {
      const result = await this.postgresService.query<{ id: string }>(
        'SELECT id FROM users WHERE lower(email) = lower($1)',
        [email],
      );
      return result.rows[0]?.id ?? null;
    } catch {
      return null;
    }
  }

  private async getEmailById(userId: string): Promise<string | null> {
    try {
      const result = await this.postgresService.query<{ email: string | null }>(
        'SELECT email FROM users WHERE id = $1',
        [userId],
      );
      return result.rows[0]?.email ?? null;
    } catch {
      return null;
    }
  }

  private toGroupEntity(row: StudyGroupRow): StudyGroupEntity {
    return {
      id: row.id,
      name: row.name,
      description: row.description ?? null,
      ownerId: row.owner_id,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }

  private toMemberEntity(row: GroupMemberRow, email: string | null): GroupMemberEntity {
    return {
      id: row.id,
      groupId: row.group_id,
      userId: row.user_id,
      userEmail: email ?? '',
      role: row.role,
      joinedAt: new Date(row.joined_at),
    };
  }

  private toGroupShareEntity(row: GroupShareWithLinkRow): GroupShareEntity {
    return {
      id: row.id,
      groupId: row.group_id,
      sharedLinkId: row.shared_link_id,
      sharedBy: row.shared_by,
      sharedAt: new Date(row.shared_at),
      shareToken: row.link_token ?? '',
      resourceType: row.link_resource_type ?? '',
      resourceId: row.link_resource_id ?? '',
      isPublic: row.link_is_public ?? false,
      ownerEmail: null,
      resourceTitle: null,
    };
  }
}
