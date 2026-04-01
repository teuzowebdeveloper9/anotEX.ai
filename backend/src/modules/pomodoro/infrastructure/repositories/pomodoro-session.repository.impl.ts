import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../../../../shared/infrastructure/config/supabase.config.js';
import type { IPomodoroSessionRepository } from '../../domain/repositories/pomodoro-session.repository.js';
import type {
  CreatePomodoroSessionProps,
  PomodoroSessionEntity,
  UpdatePomodoroSessionProps,
} from '../../domain/entities/pomodoro-session.entity.js';

@Injectable()
export class PomodoroSessionRepositoryImpl implements IPomodoroSessionRepository {
  constructor(private readonly supabaseService: SupabaseService) {}

  async create(props: CreatePomodoroSessionProps): Promise<PomodoroSessionEntity> {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('pomodoro_sessions')
      .insert({
        user_id: props.userId,
        status: props.status,
        current_phase_type: props.currentPhaseType,
        current_cycle_sequence: props.currentCycleSequence,
        completed_focus_cycles: 0,
        completed_short_break_cycles: 0,
        completed_long_break_cycles: 0,
        focus_duration_minutes: props.focusDurationMinutes,
        short_break_minutes: props.shortBreakMinutes,
        long_break_minutes: props.longBreakMinutes,
        long_break_interval: props.longBreakInterval,
        auto_start_breaks: props.autoStartBreaks,
        auto_start_focus: props.autoStartFocus,
        started_at: props.startedAt.toISOString(),
        phase_started_at: props.phaseStartedAt?.toISOString() ?? null,
        phase_target_ends_at: props.phaseTargetEndsAt?.toISOString() ?? null,
        context_type: props.contextType,
        context_id: props.contextId,
        context_label: props.contextLabel,
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to create pomodoro session: ${error.message}`);
    return this.toEntity(data);
  }

  async findById(id: string): Promise<PomodoroSessionEntity | null> {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('pomodoro_sessions')
      .select()
      .eq('id', id)
      .maybeSingle();

    if (error || !data) return null;
    return this.toEntity(data);
  }

  async findActiveByUserId(userId: string): Promise<PomodoroSessionEntity | null> {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('pomodoro_sessions')
      .select()
      .eq('user_id', userId)
      .in('status', ['running', 'paused', 'awaiting_next_phase'])
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error || !data) return null;
    return this.toEntity(data);
  }

  async update(id: string, props: UpdatePomodoroSessionProps): Promise<PomodoroSessionEntity> {
    const payload: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (props.status !== undefined) payload.status = props.status;
    if (props.currentPhaseType !== undefined) payload.current_phase_type = props.currentPhaseType;
    if (props.currentCycleSequence !== undefined) payload.current_cycle_sequence = props.currentCycleSequence;
    if (props.completedFocusCycles !== undefined) payload.completed_focus_cycles = props.completedFocusCycles;
    if (props.completedShortBreakCycles !== undefined) payload.completed_short_break_cycles = props.completedShortBreakCycles;
    if (props.completedLongBreakCycles !== undefined) payload.completed_long_break_cycles = props.completedLongBreakCycles;
    if (props.endedAt !== undefined) payload.ended_at = props.endedAt?.toISOString() ?? null;
    if (props.phaseStartedAt !== undefined) payload.phase_started_at = props.phaseStartedAt?.toISOString() ?? null;
    if (props.phaseTargetEndsAt !== undefined) payload.phase_target_ends_at = props.phaseTargetEndsAt?.toISOString() ?? null;
    if (props.pausedAt !== undefined) payload.paused_at = props.pausedAt?.toISOString() ?? null;
    if (props.currentPhasePausedMs !== undefined) payload.current_phase_paused_ms = props.currentPhasePausedMs;
    if (props.totalPausedMs !== undefined) payload.total_paused_ms = props.totalPausedMs;
    if (props.totalFocusMs !== undefined) payload.total_focus_ms = props.totalFocusMs;
    if (props.totalBreakMs !== undefined) payload.total_break_ms = props.totalBreakMs;
    if (props.version !== undefined) payload.version = props.version;

    const { data, error } = await this.supabaseService
      .getClient()
      .from('pomodoro_sessions')
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(`Failed to update pomodoro session: ${error.message}`);
    return this.toEntity(data);
  }

  async listByUserId(userId: string, limit: number): Promise<PomodoroSessionEntity[]> {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('pomodoro_sessions')
      .select()
      .eq('user_id', userId)
      .order('started_at', { ascending: false })
      .limit(limit);

    if (error) throw new Error(`Failed to list pomodoro sessions: ${error.message}`);
    return (data ?? []).map((row) => this.toEntity(row));
  }

  private toEntity(raw: Record<string, unknown>): PomodoroSessionEntity {
    return {
      id: raw.id as string,
      userId: raw.user_id as string,
      status: raw.status as PomodoroSessionEntity['status'],
      currentPhaseType: raw.current_phase_type as PomodoroSessionEntity['currentPhaseType'],
      currentCycleSequence: raw.current_cycle_sequence as number,
      completedFocusCycles: raw.completed_focus_cycles as number,
      completedShortBreakCycles: raw.completed_short_break_cycles as number,
      completedLongBreakCycles: raw.completed_long_break_cycles as number,
      focusDurationMinutes: raw.focus_duration_minutes as number,
      shortBreakMinutes: raw.short_break_minutes as number,
      longBreakMinutes: raw.long_break_minutes as number,
      longBreakInterval: raw.long_break_interval as number,
      autoStartBreaks: raw.auto_start_breaks as boolean,
      autoStartFocus: raw.auto_start_focus as boolean,
      startedAt: new Date(raw.started_at as string),
      endedAt: raw.ended_at ? new Date(raw.ended_at as string) : null,
      phaseStartedAt: raw.phase_started_at ? new Date(raw.phase_started_at as string) : null,
      phaseTargetEndsAt: raw.phase_target_ends_at ? new Date(raw.phase_target_ends_at as string) : null,
      pausedAt: raw.paused_at ? new Date(raw.paused_at as string) : null,
      currentPhasePausedMs: raw.current_phase_paused_ms as number,
      totalPausedMs: raw.total_paused_ms as number,
      totalFocusMs: raw.total_focus_ms as number,
      totalBreakMs: raw.total_break_ms as number,
      contextType: (raw.context_type as PomodoroSessionEntity['contextType']) ?? null,
      contextId: (raw.context_id as string | null) ?? null,
      contextLabel: (raw.context_label as string | null) ?? null,
      version: raw.version as number,
      createdAt: new Date(raw.created_at as string),
      updatedAt: new Date(raw.updated_at as string),
    };
  }
}
