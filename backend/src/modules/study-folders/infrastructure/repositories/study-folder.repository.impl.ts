import { Injectable } from '@nestjs/common';
import { PostgresService } from '../../../../shared/infrastructure/config/postgres.config.js';
import type { IStudyFolderRepository } from '../../domain/repositories/study-folder.repository.js';
import type {
  AddItemProps,
  CreateFolderProps,
  FolderItemType,
  StudyFolderEntity,
  StudyFolderItemEntity,
} from '../../domain/entities/study-folder.entity.js';

interface StudyFolderRow {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  item_count: number;
  recommendations_unlocked: boolean;
  created_at: Date | string;
  updated_at: Date | string;
}

interface StudyFolderItemRow {
  id: string;
  folder_id: string;
  user_id: string;
  transcription_id: string;
  audio_id: string;
  item_type: FolderItemType;
  title: string;
  created_at: Date | string;
}

function toMessage(err: unknown): string {
  return err instanceof Error ? err.message : String(err);
}

@Injectable()
export class StudyFolderRepositoryImpl implements IStudyFolderRepository {
  constructor(private readonly postgresService: PostgresService) {}

  async create(props: CreateFolderProps): Promise<StudyFolderEntity> {
    try {
      const result = await this.postgresService.query<StudyFolderRow>(
        `INSERT INTO study_folders (user_id, name, description, item_count, recommendations_unlocked)
         VALUES ($1, $2, $3, 0, false)
         RETURNING *`,
        [props.userId, props.name, props.description ?? null],
      );
      return this.toEntity(result.rows[0]);
    } catch (err) {
      throw new Error(`Failed to create folder: ${toMessage(err)}`);
    }
  }

  async findById(id: string): Promise<StudyFolderEntity | null> {
    const result = await this.postgresService.query<StudyFolderRow>(
      'SELECT * FROM study_folders WHERE id = $1',
      [id],
    );

    if (result.rows.length === 0) return null;
    return this.toEntity(result.rows[0]);
  }

  async findByUserId(userId: string): Promise<StudyFolderEntity[]> {
    try {
      const result = await this.postgresService.query<StudyFolderRow>(
        'SELECT * FROM study_folders WHERE user_id = $1 ORDER BY created_at DESC',
        [userId],
      );
      return result.rows.map((r) => this.toEntity(r));
    } catch (err) {
      throw new Error(`Failed to fetch folders: ${toMessage(err)}`);
    }
  }

  async update(
    id: string,
    data: { name?: string; description?: string | null },
  ): Promise<StudyFolderEntity> {
    const sets: string[] = ['updated_at = NOW()'];
    const params: unknown[] = [];

    if (data.name !== undefined) {
      params.push(data.name);
      sets.push(`name = $${params.length}`);
    }
    if (data.description !== undefined) {
      params.push(data.description);
      sets.push(`description = $${params.length}`);
    }

    params.push(id);

    try {
      const result = await this.postgresService.query<StudyFolderRow>(
        `UPDATE study_folders SET ${sets.join(', ')} WHERE id = $${params.length} RETURNING *`,
        params,
      );
      return this.toEntity(result.rows[0]);
    } catch (err) {
      throw new Error(`Failed to update folder: ${toMessage(err)}`);
    }
  }

  async deleteById(id: string): Promise<void> {
    try {
      await this.postgresService.query('DELETE FROM study_folders WHERE id = $1', [id]);
    } catch (err) {
      throw new Error(`Failed to delete folder: ${toMessage(err)}`);
    }
  }

  async addItem(props: AddItemProps): Promise<StudyFolderItemEntity> {
    let row: StudyFolderItemRow;
    try {
      const result = await this.postgresService.query<StudyFolderItemRow>(
        `INSERT INTO study_folder_items (folder_id, user_id, transcription_id, audio_id, item_type, title)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [
          props.folderId,
          props.userId,
          props.transcriptionId,
          props.audioId,
          props.itemType,
          props.title,
        ],
      );
      row = result.rows[0];
    } catch (err) {
      throw new Error(`Failed to add item to folder: ${toMessage(err)}`);
    }

    await this.syncFolderCount(props.folderId);

    return this.toItemEntity(row);
  }

  async removeItem(itemId: string): Promise<void> {
    const found = await this.postgresService.query<{ folder_id: string }>(
      'SELECT folder_id FROM study_folder_items WHERE id = $1',
      [itemId],
    );
    const folderId = found.rows[0]?.folder_id ?? null;

    try {
      await this.postgresService.query('DELETE FROM study_folder_items WHERE id = $1', [itemId]);
    } catch (err) {
      throw new Error(`Failed to remove item: ${toMessage(err)}`);
    }

    if (folderId) {
      await this.syncFolderCount(folderId);
    }
  }

  async findItemsByFolderId(folderId: string): Promise<StudyFolderItemEntity[]> {
    try {
      const result = await this.postgresService.query<StudyFolderItemRow>(
        'SELECT * FROM study_folder_items WHERE folder_id = $1 ORDER BY created_at ASC',
        [folderId],
      );
      return result.rows.map((r) => this.toItemEntity(r));
    } catch (err) {
      throw new Error(`Failed to fetch folder items: ${toMessage(err)}`);
    }
  }

  async findItemById(itemId: string): Promise<StudyFolderItemEntity | null> {
    const result = await this.postgresService.query<StudyFolderItemRow>(
      'SELECT * FROM study_folder_items WHERE id = $1',
      [itemId],
    );

    if (result.rows.length === 0) return null;
    return this.toItemEntity(result.rows[0]);
  }

  async itemExists(
    folderId: string,
    transcriptionId: string,
    itemType: FolderItemType,
  ): Promise<boolean> {
    const result = await this.postgresService.query<{ id: string }>(
      `SELECT id FROM study_folder_items
       WHERE folder_id = $1 AND transcription_id = $2 AND item_type = $3
       LIMIT 1`,
      [folderId, transcriptionId, itemType],
    );

    return result.rows.length > 0;
  }

  private async syncFolderCount(folderId: string): Promise<void> {
    const countResult = await this.postgresService.query<{ count: string | number }>(
      'SELECT COUNT(*) AS count FROM study_folder_items WHERE folder_id = $1',
      [folderId],
    );

    const itemCount = Number(countResult.rows[0]?.count ?? 0);

    await this.postgresService.query(
      `UPDATE study_folders
       SET item_count = $1, recommendations_unlocked = $2, updated_at = NOW()
       WHERE id = $3`,
      [itemCount, itemCount >= 5, folderId],
    );
  }

  private toEntity(row: StudyFolderRow): StudyFolderEntity {
    return {
      id: row.id,
      userId: row.user_id,
      name: row.name,
      description: row.description ?? null,
      itemCount: row.item_count,
      recommendationsUnlocked: row.recommendations_unlocked,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }

  private toItemEntity(row: StudyFolderItemRow): StudyFolderItemEntity {
    return {
      id: row.id,
      folderId: row.folder_id,
      userId: row.user_id,
      transcriptionId: row.transcription_id,
      audioId: row.audio_id,
      itemType: row.item_type,
      title: row.title,
      createdAt: new Date(row.created_at),
    };
  }
}
