import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../../../../shared/infrastructure/config/supabase.config.js';
import type { IPomodoroSettingsRepository } from '../../domain/repositories/pomodoro-settings.repository.js';
import type {
  PomodoroSettingsEntity,
  PomodoroSettingsInput,
} from '../../domain/entities/pomodoro-settings.entity.js';

@Injectable()
export class PomodoroSettingsRepositoryImpl implements IPomodoroSettingsRepository {
  constructor(private readonly supabaseService: SupabaseService) {}

  async findByUserId(userId: string): Promise<PomodoroSettingsEntity | null> {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('pomodoro_settings')
      .select()
      .eq('user_id', userId)
      .maybeSingle();

    if (error || !data) return null;
    return this.toEntity(data);
  }

  async upsert(userId: string, input: PomodoroSettingsInput): Promise<PomodoroSettingsEntity> {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('pomodoro_settings')
      .upsert(
        {
          user_id: userId,
          focus_duration_minutes: input.focusDurationMinutes,
          short_break_minutes: input.shortBreakMinutes,
          long_break_minutes: input.longBreakMinutes,
          long_break_interval: input.longBreakInterval,
          auto_start_breaks: input.autoStartBreaks,
          auto_start_focus: input.autoStartFocus,
          daily_focus_goal_minutes: input.dailyFocusGoalMinutes,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id' },
      )
      .select()
      .single();

    if (error) throw new Error(`Failed to upsert pomodoro settings: ${error.message}`);
    return this.toEntity(data);
  }

  private toEntity(raw: Record<string, unknown>): PomodoroSettingsEntity {
    return {
      userId: raw.user_id as string,
      focusDurationMinutes: raw.focus_duration_minutes as number,
      shortBreakMinutes: raw.short_break_minutes as number,
      longBreakMinutes: raw.long_break_minutes as number,
      longBreakInterval: raw.long_break_interval as number,
      autoStartBreaks: raw.auto_start_breaks as boolean,
      autoStartFocus: raw.auto_start_focus as boolean,
      dailyFocusGoalMinutes: raw.daily_focus_goal_minutes as number,
      createdAt: new Date(raw.created_at as string),
      updatedAt: new Date(raw.updated_at as string),
    };
  }
}
