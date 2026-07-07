import { Injectable } from '@nestjs/common';
import { PostgresService } from '../../../../shared/infrastructure/config/postgres.config.js';
import type { IPomodoroSettingsRepository } from '../../domain/repositories/pomodoro-settings.repository.js';
import type {
  PomodoroSettingsEntity,
  PomodoroSettingsInput,
} from '../../domain/entities/pomodoro-settings.entity.js';

interface PomodoroSettingsRow {
  user_id: string;
  focus_duration_minutes: number;
  short_break_minutes: number;
  long_break_minutes: number;
  long_break_interval: number;
  auto_start_breaks: boolean;
  auto_start_focus: boolean;
  daily_focus_goal_minutes: number;
  created_at: Date | string;
  updated_at: Date | string;
}

function toMessage(err: unknown): string {
  return err instanceof Error ? err.message : String(err);
}

@Injectable()
export class PomodoroSettingsRepositoryImpl implements IPomodoroSettingsRepository {
  constructor(private readonly postgresService: PostgresService) {}

  async findByUserId(userId: string): Promise<PomodoroSettingsEntity | null> {
    const result = await this.postgresService.query<PomodoroSettingsRow>(
      'SELECT * FROM pomodoro_settings WHERE user_id = $1',
      [userId],
    );

    if (result.rows.length === 0) return null;
    return this.toEntity(result.rows[0]);
  }

  async upsert(userId: string, input: PomodoroSettingsInput): Promise<PomodoroSettingsEntity> {
    try {
      const result = await this.postgresService.query<PomodoroSettingsRow>(
        `INSERT INTO pomodoro_settings (
           user_id, focus_duration_minutes, short_break_minutes, long_break_minutes,
           long_break_interval, auto_start_breaks, auto_start_focus, daily_focus_goal_minutes,
           updated_at
         )
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
         ON CONFLICT (user_id) DO UPDATE SET
           focus_duration_minutes = EXCLUDED.focus_duration_minutes,
           short_break_minutes = EXCLUDED.short_break_minutes,
           long_break_minutes = EXCLUDED.long_break_minutes,
           long_break_interval = EXCLUDED.long_break_interval,
           auto_start_breaks = EXCLUDED.auto_start_breaks,
           auto_start_focus = EXCLUDED.auto_start_focus,
           daily_focus_goal_minutes = EXCLUDED.daily_focus_goal_minutes,
           updated_at = NOW()
         RETURNING *`,
        [
          userId,
          input.focusDurationMinutes,
          input.shortBreakMinutes,
          input.longBreakMinutes,
          input.longBreakInterval,
          input.autoStartBreaks,
          input.autoStartFocus,
          input.dailyFocusGoalMinutes,
        ],
      );
      return this.toEntity(result.rows[0]);
    } catch (err) {
      throw new Error(`Failed to upsert pomodoro settings: ${toMessage(err)}`);
    }
  }

  private toEntity(row: PomodoroSettingsRow): PomodoroSettingsEntity {
    return {
      userId: row.user_id,
      focusDurationMinutes: row.focus_duration_minutes,
      shortBreakMinutes: row.short_break_minutes,
      longBreakMinutes: row.long_break_minutes,
      longBreakInterval: row.long_break_interval,
      autoStartBreaks: row.auto_start_breaks,
      autoStartFocus: row.auto_start_focus,
      dailyFocusGoalMinutes: row.daily_focus_goal_minutes,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }
}
