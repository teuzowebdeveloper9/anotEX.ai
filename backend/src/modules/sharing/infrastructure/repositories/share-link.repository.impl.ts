import { Injectable } from '@nestjs/common';
import { PostgresService } from '../../../../shared/infrastructure/config/postgres.config.js';
import type { IShareLinkRepository } from '../../domain/repositories/share-link.repository.js';
import type { CreateShareLinkProps, ShareLinkEntity } from '../../domain/entities/share-link.entity.js';

interface ShareLinkRow {
  id: string;
  token: string;
  owner_id: string;
  resource_type: ShareLinkEntity['resourceType'];
  resource_id: string;
  is_public: boolean;
  created_at: Date | string;
  updated_at: Date | string;
}

function toMessage(err: unknown): string {
  return err instanceof Error ? err.message : String(err);
}

@Injectable()
export class ShareLinkRepositoryImpl implements IShareLinkRepository {
  constructor(private readonly postgresService: PostgresService) {}

  async findOrCreate(props: CreateShareLinkProps): Promise<ShareLinkEntity> {
    // Try to find existing first
    const existing = await this.postgresService.query<ShareLinkRow>(
      `SELECT * FROM shared_links
       WHERE owner_id = $1 AND resource_type = $2 AND resource_id = $3`,
      [props.ownerId, props.resourceType, props.resourceId],
    );

    if (existing.rows.length > 0) return this.toEntity(existing.rows[0]);

    try {
      const result = await this.postgresService.query<ShareLinkRow>(
        `INSERT INTO shared_links (owner_id, resource_type, resource_id, is_public)
         VALUES ($1, $2, $3, false)
         RETURNING *`,
        [props.ownerId, props.resourceType, props.resourceId],
      );
      return this.toEntity(result.rows[0]);
    } catch (err) {
      throw new Error(`Failed to create share link: ${toMessage(err)}`);
    }
  }

  async findByToken(token: string): Promise<ShareLinkEntity | null> {
    const result = await this.postgresService.query<ShareLinkRow>(
      'SELECT * FROM shared_links WHERE token = $1',
      [token],
    );

    if (result.rows.length === 0) return null;
    return this.toEntity(result.rows[0]);
  }

  async findByOwnerId(ownerId: string): Promise<ShareLinkEntity[]> {
    try {
      const result = await this.postgresService.query<ShareLinkRow>(
        'SELECT * FROM shared_links WHERE owner_id = $1 ORDER BY created_at DESC',
        [ownerId],
      );
      return result.rows.map((row) => this.toEntity(row));
    } catch (err) {
      throw new Error(`Failed to fetch share links: ${toMessage(err)}`);
    }
  }

  async findById(id: string): Promise<ShareLinkEntity | null> {
    const result = await this.postgresService.query<ShareLinkRow>(
      'SELECT * FROM shared_links WHERE id = $1',
      [id],
    );

    if (result.rows.length === 0) return null;
    return this.toEntity(result.rows[0]);
  }

  async updateVisibility(id: string, isPublic: boolean): Promise<ShareLinkEntity> {
    try {
      const result = await this.postgresService.query<ShareLinkRow>(
        `UPDATE shared_links
         SET is_public = $1, updated_at = NOW()
         WHERE id = $2
         RETURNING *`,
        [isPublic, id],
      );
      return this.toEntity(result.rows[0]);
    } catch (err) {
      throw new Error(`Failed to update share link visibility: ${toMessage(err)}`);
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await this.postgresService.query('DELETE FROM shared_links WHERE id = $1', [id]);
    } catch (err) {
      throw new Error(`Failed to delete share link: ${toMessage(err)}`);
    }
  }

  private toEntity(row: ShareLinkRow): ShareLinkEntity {
    return {
      id: row.id,
      token: row.token,
      ownerId: row.owner_id,
      resourceType: row.resource_type,
      resourceId: row.resource_id,
      isPublic: row.is_public,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }
}
