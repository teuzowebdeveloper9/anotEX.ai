import { Injectable } from '@nestjs/common';
import { PostgresService } from '../../../../shared/infrastructure/config/postgres.config.js';
import type { IStudyMaterialRepository } from '../../domain/repositories/study-material.repository.js';
import type {
  CreateStudyMaterialProps,
  FlashcardItem,
  StudyMaterialContent,
  StudyMaterialEntity,
  StudyMaterialStatus,
  StudyMaterialType,
} from '../../domain/entities/study-material.entity.js';

interface StudyMaterialRow {
  id: string;
  transcription_id: string;
  user_id: string;
  type: StudyMaterialType;
  status: StudyMaterialStatus;
  content: StudyMaterialContent | null;
  error_message: string | null;
  created_at: Date | string;
  updated_at: Date | string;
}

function toMessage(err: unknown): string {
  return err instanceof Error ? err.message : String(err);
}

@Injectable()
export class StudyMaterialRepositoryImpl implements IStudyMaterialRepository {
  constructor(private readonly postgresService: PostgresService) {}

  async create(props: CreateStudyMaterialProps): Promise<StudyMaterialEntity> {
    try {
      const result = await this.postgresService.query<StudyMaterialRow>(
        `INSERT INTO study_materials (transcription_id, user_id, type, status)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
        [props.transcriptionId, props.userId, props.type, 'PENDING'],
      );
      return this.toEntity(result.rows[0]);
    } catch (err) {
      throw new Error(`Failed to create study material: ${toMessage(err)}`);
    }
  }

  async findById(id: string): Promise<StudyMaterialEntity | null> {
    const result = await this.postgresService.query<StudyMaterialRow>(
      'SELECT * FROM study_materials WHERE id = $1',
      [id],
    );

    if (result.rows.length === 0) return null;
    return this.toEntity(result.rows[0]);
  }

  async findByTranscriptionId(transcriptionId: string): Promise<StudyMaterialEntity[]> {
    try {
      const result = await this.postgresService.query<StudyMaterialRow>(
        'SELECT * FROM study_materials WHERE transcription_id = $1 ORDER BY created_at ASC',
        [transcriptionId],
      );
      return result.rows.map((row) => this.toEntity(row));
    } catch (err) {
      throw new Error(`Failed to fetch study materials: ${toMessage(err)}`);
    }
  }

  async findByTranscriptionIdAndType(
    transcriptionId: string,
    type: StudyMaterialType,
  ): Promise<StudyMaterialEntity | null> {
    const result = await this.postgresService.query<StudyMaterialRow>(
      'SELECT * FROM study_materials WHERE transcription_id = $1 AND type = $2',
      [transcriptionId, type],
    );

    if (result.rows.length === 0) return null;
    return this.toEntity(result.rows[0]);
  }

  async updateStatus(id: string, status: StudyMaterialStatus, errorMessage?: string): Promise<void> {
    try {
      await this.postgresService.query(
        'UPDATE study_materials SET status = $1, error_message = $2, updated_at = NOW() WHERE id = $3',
        [status, errorMessage ?? null, id],
      );
    } catch (err) {
      throw new Error(`Failed to update study material status: ${toMessage(err)}`);
    }
  }

  async deleteById(id: string): Promise<void> {
    try {
      await this.postgresService.query('DELETE FROM study_materials WHERE id = $1', [id]);
    } catch (err) {
      throw new Error(`Failed to delete study material: ${toMessage(err)}`);
    }
  }

  async updateContent(id: string, content: StudyMaterialContent): Promise<void> {
    try {
      await this.postgresService.query(
        'UPDATE study_materials SET content = $1::jsonb, updated_at = NOW() WHERE id = $2',
        [JSON.stringify(content), id],
      );
    } catch (err) {
      throw new Error(`Failed to update study material content: ${toMessage(err)}`);
    }
  }

  async findAllFlashcardsByUserId(userId: string): Promise<StudyMaterialEntity[]> {
    try {
      const result = await this.postgresService.query<StudyMaterialRow>(
        `SELECT * FROM study_materials
         WHERE user_id = $1 AND type = $2 AND status = $3
         ORDER BY created_at DESC`,
        [userId, 'flashcards', 'COMPLETED'],
      );
      return result.rows.map((row) => this.toEntity(row));
    } catch (err) {
      throw new Error(`Failed to fetch flashcard materials: ${toMessage(err)}`);
    }
  }

  async updateFlashcardsContent(id: string, flashcards: FlashcardItem[]): Promise<void> {
    try {
      await this.postgresService.query(
        'UPDATE study_materials SET content = $1::jsonb, updated_at = NOW() WHERE id = $2',
        [JSON.stringify(flashcards), id],
      );
    } catch (err) {
      throw new Error(`Failed to update flashcards content: ${toMessage(err)}`);
    }
  }

  private toEntity(row: StudyMaterialRow): StudyMaterialEntity {
    return {
      id: row.id,
      transcriptionId: row.transcription_id,
      userId: row.user_id,
      type: row.type,
      status: row.status,
      content: row.content ?? null,
      errorMessage: row.error_message ?? null,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }
}
