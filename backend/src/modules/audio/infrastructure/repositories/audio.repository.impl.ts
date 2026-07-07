import { Injectable } from '@nestjs/common';
import { PostgresService } from '../../../../shared/infrastructure/config/postgres.config.js';
import { IAudioRepository } from '../../domain/repositories/audio.repository.js';
import { AudioEntity, AudioStatus, CreateAudioProps } from '../../domain/entities/audio.entity.js';

interface AudioRow {
  id: string;
  user_id: string;
  file_name: string;
  mime_type: string;
  size_bytes: string | number;
  storage_key: string;
  status: AudioStatus;
  created_at: Date | string;
  updated_at: Date | string;
}

function toMessage(err: unknown): string {
  return err instanceof Error ? err.message : String(err);
}

@Injectable()
export class AudioRepositoryImpl implements IAudioRepository {
  constructor(private readonly postgresService: PostgresService) {}

  async create(props: CreateAudioProps): Promise<AudioEntity> {
    try {
      const result = await this.postgresService.query<AudioRow>(
        `INSERT INTO audios (user_id, file_name, mime_type, size_bytes, storage_key, status)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [
          props.userId,
          props.fileName,
          props.mimeType,
          props.sizeBytes,
          props.storageKey,
          AudioStatus.PENDING,
        ],
      );
      return this.toEntity(result.rows[0]);
    } catch (err) {
      throw new Error(`Failed to create audio: ${toMessage(err)}`);
    }
  }

  async findById(id: string): Promise<AudioEntity | null> {
    const result = await this.postgresService.query<AudioRow>(
      'SELECT * FROM audios WHERE id = $1',
      [id],
    );

    if (result.rows.length === 0) return null;
    return this.toEntity(result.rows[0]);
  }

  async findByUserId(userId: string): Promise<AudioEntity[]> {
    try {
      const result = await this.postgresService.query<AudioRow>(
        'SELECT * FROM audios WHERE user_id = $1 ORDER BY created_at DESC',
        [userId],
      );
      return result.rows.map((row) => this.toEntity(row));
    } catch (err) {
      throw new Error(`Failed to fetch audios: ${toMessage(err)}`);
    }
  }

  async updateStatus(id: string, status: AudioStatus, errorMessage?: string): Promise<void> {
    try {
      await this.postgresService.query(
        'UPDATE audios SET status = $1, error_message = $2, updated_at = NOW() WHERE id = $3',
        [status, errorMessage ?? null, id],
      );
    } catch (err) {
      throw new Error(`Failed to update audio status: ${toMessage(err)}`);
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await this.postgresService.query('DELETE FROM audios WHERE id = $1', [id]);
    } catch (err) {
      throw new Error(`Failed to delete audio: ${toMessage(err)}`);
    }
  }

  private toEntity(row: AudioRow): AudioEntity {
    return {
      id: row.id,
      userId: row.user_id,
      fileName: row.file_name,
      mimeType: row.mime_type,
      sizeBytes: Number(row.size_bytes),
      storageKey: row.storage_key,
      status: row.status,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }
}
