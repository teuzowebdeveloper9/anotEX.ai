import { Injectable } from '@nestjs/common';
import { PostgresService } from '../../../../shared/infrastructure/config/postgres.config.js';
import type { IPomodoroSessionRepository } from '../../domain/repositories/pomodoro-session.repository.js';
import type {
  CreatePomodoroSessionProps,
  PomodoroSessionEntity,
  UpdatePomodoroSessionProps,
} from '../../domain/entities/pomodoro-session.entity.js';

interface PomodoroSessionRow {
  id: string;
  user_id: string;
  status: PomodoroSessionEntity['status'];
  current_phase_type: PomodoroSessionEntity['currentPhaseType'];
  current_cycle_sequence: number;
  completed_focus_cycles: number;
  completed_short_break_cycles: number;
  completed_long_break_cycles: number;
  focus_duration_minutes: number;
  short_break_minutes: number;
  long_break_minutes: number;
  long_break_interval: number;
  auto_start_breaks: boolean;
  auto_start_focus: boolean;
  started_at: Date | string;
  ended_at: Date | string | null;
  phase_started_at: Date | string | null;
  phase_target_ends_at: Date | string | null;
  paused_at: Date | string | null;
  current_phase_paused_ms: string | number;
  total_paused_ms: string | number;
  total_focus_ms: string | number;
  total_break_ms: string | number;
  context_type: PomodoroSessionEntity['contextType'] | null;
  context_id: string | null;
  context_label: string | null;
  version: number;
  created_at: Date | string;
  updated_at: Date | string;
}

function toMessage(err: unknown): string {
  return err instanceof Error ? err.message : String(err);
}

@Injectable()
export class PomodoroSessionRepositoryImpl implements IPomodoroSessionRepository {
  constructor(private readonly postgresService: PostgresService) {}

  async create(props: CreatePomodoroSessionProps): Promise<PomodoroSessionEntity> {
    try {
      const result = await this.postgresService.query<PomodoroSessionRow>(
        `INSERT INTO pomodoro_sessions (
           user_id, status, current_phase_type, current_cycle_sequence,
           completed_focus_cycles, completed_short_break_cycles, completed_long_break_cycles,
           focus_duration_minutes, short_break_minutes, long_break_minutes, long_break_interval,
           auto_start_breaks, auto_start_focus,
           started_at, phase_started_at, phase_target_ends_at,
           context_type, context_id, context_label
         )
         VALUES ($1, $2, $3, $4, 0, 0, 0, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
         RETURNING *`,
        [
          props.userId,
          props.status,
          props.currentPhaseType,
          props.currentCycleSequence,
          props.focusDurationMinutes,
          props.shortBreakMinutes,
          props.longBreakMinutes,
          props.longBreakInterval,
          props.autoStartBreaks,
          props.autoStartFocus,
          props.startedAt.toISOString(),
          props.phaseStartedAt?.toISOString() ?? null,
          props.phaseTargetEndsAt?.toISOString() ?? null,
          props.contextType,
          props.contextId,
          props.contextLabel,
        ],
      );
      return this.toEntity(result.rows[0]);
    } catch (err) {
      throw new Error(`Failed to create pomodoro session: ${toMessage(err)}`);
    }
  }

  async findById(id: string): Promise<PomodoroSessionEntity | null> {
    const result = await this.postgresService.query<PomodoroSessionRow>(
      'SELECT * FROM pomodoro_sessions WHERE id = $1',
      [id],
    );

    if (result.rows.length === 0) return null;
    return this.toEntity(result.rows[0]);
  }

  async findActiveByUserId(userId: string): Promise<PomodoroSessionEntity | null> {
    const result = await this.postgresService.query<PomodoroSessionRow>(
      `SELECT * FROM pomodoro_sessions
       WHERE user_id = $1 AND status IN ('running', 'paused', 'awaiting_next_phase')
       ORDER BY created_at DESC
       LIMIT 1`,
      [userId],
    );

    if (result.rows.length === 0) return null;
    return this.toEntity(result.rows[0]);
  }

  async update(id: string, props: UpdatePomodoroSessionProps): Promise<PomodoroSessionEntity> {
    const sets: string[] = ['updated_at = NOW()'];
    const params: unknown[] = [];
    const add = (column: string, value: unknown): void => {
      params.push(value);
      sets.push(`${column} = $${params.length}`);
    };

    if (props.status !== undefined) add('status', props.status);
    if (props.currentPhaseType !== undefined) add('current_phase_type', props.currentPhaseType);
    if (props.currentCycleSequence !== undefined) add('current_cycle_sequence', props.currentCycleSequence);
    if (props.completedFocusCycles !== undefined) add('completed_focus_cycles', props.completedFocusCycles);
    if (props.completedShortBreakCycles !== undefined) add('completed_short_break_cycles', props.completedShortBreakCycles);
    if (props.completedLongBreakCycles !== undefined) add('completed_long_break_cycles', props.completedLongBreakCycles);
    if (props.endedAt !== undefined) add('ended_at', props.endedAt?.toISOString() ?? null);
    if (props.phaseStartedAt !== undefined) add('phase_started_at', props.phaseStartedAt?.toISOString() ?? null);
    if (props.phaseTargetEndsAt !== undefined) add('phase_target_ends_at', props.phaseTargetEndsAt?.toISOString() ?? null);
    if (props.pausedAt !== undefined) add('paused_at', props.pausedAt?.toISOString() ?? null);
    if (props.currentPhasePausedMs !== undefined) add('current_phase_paused_ms', props.currentPhasePausedMs);
    if (props.totalPausedMs !== undefined) add('total_paused_ms', props.totalPausedMs);
    if (props.totalFocusMs !== undefined) add('total_focus_ms', props.totalFocusMs);
    if (props.totalBreakMs !== undefined) add('total_break_ms', props.totalBreakMs);
    if (props.version !== undefined) add('version', props.version);

    params.push(id);

    try {
      const result = await this.postgresService.query<PomodoroSessionRow>(
        `UPDATE pomodoro_sessions SET ${sets.join(', ')} WHERE id = $${params.length} RETURNING *`,
        params,
      );
      return this.toEntity(result.rows[0]);
    } catch (err) {
      throw new Error(`Failed to update pomodoro session: ${toMessage(err)}`);
    }
  }

  async listByUserId(userId: string, limit: number): Promise<PomodoroSessionEntity[]> {
    try {
      const result = await this.postgresService.query<PomodoroSessionRow>(
        `SELECT * FROM pomodoro_sessions
         WHERE user_id = $1
         ORDER BY started_at DESC
         LIMIT $2`,
        [userId, limit],
      );
      return result.rows.map((row) => this.toEntity(row));
    } catch (err) {
      throw new Error(`Failed to list pomodoro sessions: ${toMessage(err)}`);
    }
  }

  private toEntity(row: PomodoroSessionRow): PomodoroSessionEntity {
    return {
      id: row.id,
      userId: row.user_id,
      status: row.status,
      currentPhaseType: row.current_phase_type,
      currentCycleSequence: row.current_cycle_sequence,
      completedFocusCycles: row.completed_focus_cycles,
      completedShortBreakCycles: row.completed_short_break_cycles,
      completedLongBreakCycles: row.completed_long_break_cycles,
      focusDurationMinutes: row.focus_duration_minutes,
      shortBreakMinutes: row.short_break_minutes,
      longBreakMinutes: row.long_break_minutes,
      longBreakInterval: row.long_break_interval,
      autoStartBreaks: row.auto_start_breaks,
      autoStartFocus: row.auto_start_focus,
      startedAt: new Date(row.started_at),
      endedAt: row.ended_at ? new Date(row.ended_at) : null,
      phaseStartedAt: row.phase_started_at ? new Date(row.phase_started_at) : null,
      phaseTargetEndsAt: row.phase_target_ends_at ? new Date(row.phase_target_ends_at) : null,
      pausedAt: row.paused_at ? new Date(row.paused_at) : null,
      currentPhasePausedMs: Number(row.current_phase_paused_ms),
      totalPausedMs: Number(row.total_paused_ms),
      totalFocusMs: Number(row.total_focus_ms),
      totalBreakMs: Number(row.total_break_ms),
      contextType: row.context_type ?? null,
      contextId: row.context_id ?? null,
      contextLabel: row.context_label ?? null,
      version: row.version,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }
}
