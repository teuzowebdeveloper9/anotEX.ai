import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../../../../shared/infrastructure/config/supabase.config.js';
import type { IPomodoroCycleRepository } from '../../domain/repositories/pomodoro-cycle.repository.js';
import type {
  CreatePomodoroCycleProps,
  PomodoroCycleEntity,
  UpdatePomodoroCycleProps,
} from '../../domain/entities/pomodoro-cycle.entity.js';

@Injectable()
export class PomodoroCycleRepositoryImpl implements IPomodoroCycleRepository {
  constructor(private readonly supabaseService: SupabaseService) {}

  async create(props: CreatePomodoroCycleProps): Promise<PomodoroCycleEntity> {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('pomodoro_cycles')
      .insert({
        session_id: props.sessionId,
        user_id: props.userId,
        sequence: props.sequence,
        phase_type: props.phaseType,
        status: props.status,
        planned_duration_ms: props.plannedDurationMs,
        started_at: props.startedAt.toISOString(),
        ended_at: props.endedAt?.toISOString() ?? null,
        paused_at: props.pausedAt?.toISOString() ?? null,
        paused_total_ms: props.pausedTotalMs ?? 0,
        effective_duration_ms: props.effectiveDurationMs ?? null,
        completed_automatically: props.completedAutomatically ?? false,
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to create pomodoro cycle: ${error.message}`);
    return this.toEntity(data);
  }

  async findCurrentBySessionId(sessionId: string): Promise<PomodoroCycleEntity | null> {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('pomodoro_cycles')
      .select()
      .eq('session_id', sessionId)
      .in('status', ['running', 'paused'])
      .order('sequence', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error || !data) return null;
    return this.toEntity(data);
  }

  async findLatestBySessionId(sessionId: string): Promise<PomodoroCycleEntity | null> {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('pomodoro_cycles')
      .select()
      .eq('session_id', sessionId)
      .order('sequence', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error || !data) return null;
    return this.toEntity(data);
  }

  async update(id: string, props: UpdatePomodoroCycleProps): Promise<PomodoroCycleEntity> {
    const payload: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (props.status !== undefined) payload.status = props.status;
    if (props.endedAt !== undefined) payload.ended_at = props.endedAt?.toISOString() ?? null;
    if (props.pausedAt !== undefined) payload.paused_at = props.pausedAt?.toISOString() ?? null;
    if (props.pausedTotalMs !== undefined) payload.paused_total_ms = props.pausedTotalMs;
    if (props.effectiveDurationMs !== undefined) payload.effective_duration_ms = props.effectiveDurationMs;
    if (props.completedAutomatically !== undefined) payload.completed_automatically = props.completedAutomatically;

    const { data, error } = await this.supabaseService
      .getClient()
      .from('pomodoro_cycles')
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(`Failed to update pomodoro cycle: ${error.message}`);
    return this.toEntity(data);
  }

  async listCompletedFocusCyclesByUserIdSince(userId: string, since: Date): Promise<PomodoroCycleEntity[]> {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('pomodoro_cycles')
      .select()
      .eq('user_id', userId)
      .eq('phase_type', 'focus')
      .eq('status', 'completed')
      .gte('started_at', since.toISOString())
      .order('started_at', { ascending: true });

    if (error) throw new Error(`Failed to list focus cycles: ${error.message}`);
    return (data ?? []).map((row) => this.toEntity(row));
  }

  private toEntity(raw: Record<string, unknown>): PomodoroCycleEntity {
    return {
      id: raw.id as string,
      sessionId: raw.session_id as string,
      userId: raw.user_id as string,
      sequence: raw.sequence as number,
      phaseType: raw.phase_type as PomodoroCycleEntity['phaseType'],
      status: raw.status as PomodoroCycleEntity['status'],
      plannedDurationMs: raw.planned_duration_ms as number,
      startedAt: new Date(raw.started_at as string),
      endedAt: raw.ended_at ? new Date(raw.ended_at as string) : null,
      pausedAt: raw.paused_at ? new Date(raw.paused_at as string) : null,
      pausedTotalMs: raw.paused_total_ms as number,
      effectiveDurationMs: (raw.effective_duration_ms as number | null) ?? null,
      completedAutomatically: raw.completed_automatically as boolean,
      createdAt: new Date(raw.created_at as string),
      updatedAt: new Date(raw.updated_at as string),
    };
  }
}
