import { Injectable } from '@nestjs/common';
import { PostgresService } from '../../../../shared/infrastructure/config/postgres.config.js';
import type { IPomodoroCycleRepository } from '../../domain/repositories/pomodoro-cycle.repository.js';
import type {
  CreatePomodoroCycleProps,
  PomodoroCycleEntity,
  UpdatePomodoroCycleProps,
} from '../../domain/entities/pomodoro-cycle.entity.js';

interface PomodoroCycleRow {
  id: string;
  session_id: string;
  user_id: string;
  sequence: number;
  phase_type: PomodoroCycleEntity['phaseType'];
  status: PomodoroCycleEntity['status'];
  planned_duration_ms: string | number;
  started_at: Date | string;
  ended_at: Date | string | null;
  paused_at: Date | string | null;
  paused_total_ms: string | number;
  effective_duration_ms: string | number | null;
  completed_automatically: boolean;
  created_at: Date | string;
  updated_at: Date | string;
}

function toMessage(err: unknown): string {
  return err instanceof Error ? err.message : String(err);
}

@Injectable()
export class PomodoroCycleRepositoryImpl implements IPomodoroCycleRepository {
  constructor(private readonly postgresService: PostgresService) {}

  async create(props: CreatePomodoroCycleProps): Promise<PomodoroCycleEntity> {
    try {
      const result = await this.postgresService.query<PomodoroCycleRow>(
        `INSERT INTO pomodoro_cycles (
           session_id, user_id, sequence, phase_type, status,
           planned_duration_ms, started_at, ended_at, paused_at,
           paused_total_ms, effective_duration_ms, completed_automatically
         )
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
         RETURNING *`,
        [
          props.sessionId,
          props.userId,
          props.sequence,
          props.phaseType,
          props.status,
          props.plannedDurationMs,
          props.startedAt.toISOString(),
          props.endedAt?.toISOString() ?? null,
          props.pausedAt?.toISOString() ?? null,
          props.pausedTotalMs ?? 0,
          props.effectiveDurationMs ?? null,
          props.completedAutomatically ?? false,
        ],
      );
      return this.toEntity(result.rows[0]);
    } catch (err) {
      throw new Error(`Failed to create pomodoro cycle: ${toMessage(err)}`);
    }
  }

  async findCurrentBySessionId(sessionId: string): Promise<PomodoroCycleEntity | null> {
    const result = await this.postgresService.query<PomodoroCycleRow>(
      `SELECT * FROM pomodoro_cycles
       WHERE session_id = $1 AND status IN ('running', 'paused')
       ORDER BY sequence DESC
       LIMIT 1`,
      [sessionId],
    );

    if (result.rows.length === 0) return null;
    return this.toEntity(result.rows[0]);
  }

  async findLatestBySessionId(sessionId: string): Promise<PomodoroCycleEntity | null> {
    const result = await this.postgresService.query<PomodoroCycleRow>(
      `SELECT * FROM pomodoro_cycles
       WHERE session_id = $1
       ORDER BY sequence DESC
       LIMIT 1`,
      [sessionId],
    );

    if (result.rows.length === 0) return null;
    return this.toEntity(result.rows[0]);
  }

  async update(id: string, props: UpdatePomodoroCycleProps): Promise<PomodoroCycleEntity> {
    const sets: string[] = ['updated_at = NOW()'];
    const params: unknown[] = [];
    const add = (column: string, value: unknown): void => {
      params.push(value);
      sets.push(`${column} = $${params.length}`);
    };

    if (props.status !== undefined) add('status', props.status);
    if (props.endedAt !== undefined) add('ended_at', props.endedAt?.toISOString() ?? null);
    if (props.pausedAt !== undefined) add('paused_at', props.pausedAt?.toISOString() ?? null);
    if (props.pausedTotalMs !== undefined) add('paused_total_ms', props.pausedTotalMs);
    if (props.effectiveDurationMs !== undefined) add('effective_duration_ms', props.effectiveDurationMs);
    if (props.completedAutomatically !== undefined) add('completed_automatically', props.completedAutomatically);

    params.push(id);

    try {
      const result = await this.postgresService.query<PomodoroCycleRow>(
        `UPDATE pomodoro_cycles SET ${sets.join(', ')} WHERE id = $${params.length} RETURNING *`,
        params,
      );
      return this.toEntity(result.rows[0]);
    } catch (err) {
      throw new Error(`Failed to update pomodoro cycle: ${toMessage(err)}`);
    }
  }

  async listCompletedFocusCyclesByUserIdSince(userId: string, since: Date): Promise<PomodoroCycleEntity[]> {
    try {
      const result = await this.postgresService.query<PomodoroCycleRow>(
        `SELECT * FROM pomodoro_cycles
         WHERE user_id = $1 AND phase_type = 'focus' AND status = 'completed' AND started_at >= $2
         ORDER BY started_at ASC`,
        [userId, since.toISOString()],
      );
      return result.rows.map((row) => this.toEntity(row));
    } catch (err) {
      throw new Error(`Failed to list focus cycles: ${toMessage(err)}`);
    }
  }

  private toEntity(row: PomodoroCycleRow): PomodoroCycleEntity {
    return {
      id: row.id,
      sessionId: row.session_id,
      userId: row.user_id,
      sequence: row.sequence,
      phaseType: row.phase_type,
      status: row.status,
      plannedDurationMs: Number(row.planned_duration_ms),
      startedAt: new Date(row.started_at),
      endedAt: row.ended_at ? new Date(row.ended_at) : null,
      pausedAt: row.paused_at ? new Date(row.paused_at) : null,
      pausedTotalMs: Number(row.paused_total_ms),
      effectiveDurationMs: row.effective_duration_ms === null ? null : Number(row.effective_duration_ms),
      completedAutomatically: row.completed_automatically,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }
}
