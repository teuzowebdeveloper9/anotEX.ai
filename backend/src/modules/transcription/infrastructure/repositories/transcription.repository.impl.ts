import { Injectable } from '@nestjs/common';
import { PostgresService } from '../../../../shared/infrastructure/config/postgres.config.js';
import { ITranscriptionRepository } from '../../domain/repositories/transcription.repository.js';
import {
  CreateTranscriptionProps,
  TranscriptionEntity,
  TranscriptionSegment,
  TranscriptionStatus,
} from '../../domain/entities/transcription.entity.js';

interface TranscriptionRow {
  id: string;
  audio_id: string;
  user_id: string;
  title: string | null;
  transcription_text: string | null;
  summary_text: string | null;
  segments: TranscriptionSegment[] | null;
  language: string;
  status: TranscriptionStatus;
  error_message: string | null;
  created_at: Date | string;
  updated_at: Date | string;
}

function toMessage(err: unknown): string {
  return err instanceof Error ? err.message : String(err);
}

@Injectable()
export class TranscriptionRepositoryImpl implements ITranscriptionRepository {
  constructor(private readonly postgresService: PostgresService) {}

  async create(props: CreateTranscriptionProps): Promise<TranscriptionEntity> {
    try {
      const result = await this.postgresService.query<TranscriptionRow>(
        `INSERT INTO transcriptions (audio_id, user_id, language, status)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
        [props.audioId, props.userId, props.language, TranscriptionStatus.PENDING],
      );
      return this.toEntity(result.rows[0]);
    } catch (err) {
      throw new Error(`Failed to create transcription: ${toMessage(err)}`);
    }
  }

  async findById(id: string): Promise<TranscriptionEntity | null> {
    const result = await this.postgresService.query<TranscriptionRow>(
      'SELECT * FROM transcriptions WHERE id = $1',
      [id],
    );

    if (result.rows.length === 0) return null;
    return this.toEntity(result.rows[0]);
  }

  async findByAudioId(audioId: string): Promise<TranscriptionEntity | null> {
    const result = await this.postgresService.query<TranscriptionRow>(
      'SELECT * FROM transcriptions WHERE audio_id = $1',
      [audioId],
    );

    if (result.rows.length === 0) return null;
    return this.toEntity(result.rows[0]);
  }

  async findByUserId(userId: string, search?: string): Promise<TranscriptionEntity[]> {
    try {
      // Escapa os coringas do LIKE (% _ \) para que o termo de busca seja tratado
      // como literal — evita match amplo / degradação de performance por input
      const escapedSearch = search?.replace(/[\\%_]/g, '\\$&');
      const result = search
        ? await this.postgresService.query<TranscriptionRow>(
            `SELECT * FROM transcriptions
             WHERE user_id = $1 AND (title ILIKE $2 OR transcription_text ILIKE $2)
             ORDER BY created_at DESC`,
            [userId, `%${escapedSearch}%`],
          )
        : await this.postgresService.query<TranscriptionRow>(
            'SELECT * FROM transcriptions WHERE user_id = $1 ORDER BY created_at DESC',
            [userId],
          );

      return result.rows.map((row) => this.toEntity(row));
    } catch (err) {
      throw new Error(`Failed to fetch transcriptions: ${toMessage(err)}`);
    }
  }

  async updateStatus(
    id: string,
    status: TranscriptionStatus,
    errorMessage?: string,
  ): Promise<void> {
    try {
      await this.postgresService.query(
        'UPDATE transcriptions SET status = $1, error_message = $2, updated_at = NOW() WHERE id = $3',
        [status, errorMessage ?? null, id],
      );
    } catch (err) {
      throw new Error(`Failed to update transcription status: ${toMessage(err)}`);
    }
  }

  async updateResult(
    id: string,
    transcriptionText: string,
    summaryText: string,
    title: string,
    segments: TranscriptionSegment[],
  ): Promise<void> {
    try {
      await this.postgresService.query(
        `UPDATE transcriptions
         SET title = $1,
             transcription_text = $2,
             summary_text = $3,
             segments = $4::jsonb,
             updated_at = NOW()
         WHERE id = $5`,
        [
          title,
          transcriptionText,
          summaryText,
          segments.length > 0 ? JSON.stringify(segments) : null,
          id,
        ],
      );
    } catch (err) {
      throw new Error(`Failed to update transcription result: ${toMessage(err)}`);
    }
  }

  async deleteByAudioId(audioId: string): Promise<void> {
    try {
      await this.postgresService.query('DELETE FROM transcriptions WHERE audio_id = $1', [audioId]);
    } catch (err) {
      throw new Error(`Failed to delete transcription: ${toMessage(err)}`);
    }
  }

  private toEntity(row: TranscriptionRow): TranscriptionEntity {
    return {
      id: row.id,
      audioId: row.audio_id,
      userId: row.user_id,
      title: row.title ?? null,
      transcriptionText: row.transcription_text,
      summaryText: row.summary_text,
      segments: row.segments ?? null,
      language: row.language,
      status: row.status,
      errorMessage: row.error_message,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }
}
