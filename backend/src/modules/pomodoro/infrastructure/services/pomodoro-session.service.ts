import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { PomodoroSettingsInput } from '../../domain/entities/pomodoro-settings.entity.js';
import {
  DEFAULT_POMODORO_SETTINGS,
  type PomodoroSettingsEntity,
} from '../../domain/entities/pomodoro-settings.entity.js';
import type { PomodoroCycleEntity } from '../../domain/entities/pomodoro-cycle.entity.js';
import {
  type PomodoroContextType,
  type PomodoroPhaseType,
  type PomodoroSessionEntity,
  type UpdatePomodoroSessionProps,
} from '../../domain/entities/pomodoro-session.entity.js';
import {
  POMODORO_SETTINGS_REPOSITORY,
  type IPomodoroSettingsRepository,
} from '../../domain/repositories/pomodoro-settings.repository.js';
import {
  POMODORO_SESSION_REPOSITORY,
  type IPomodoroSessionRepository,
} from '../../domain/repositories/pomodoro-session.repository.js';
import {
  POMODORO_CYCLE_REPOSITORY,
  type IPomodoroCycleRepository,
} from '../../domain/repositories/pomodoro-cycle.repository.js';
import { PomodoroTimeService } from './pomodoro-time.service.js';

const MAX_PAUSED_AGE_MS = 12 * 60 * 60 * 1000;

export interface StartPomodoroSessionInput extends PomodoroSettingsInput {
  readonly contextType?: PomodoroContextType;
  readonly contextId?: string;
  readonly contextLabel?: string;
}

export interface PomodoroSessionSnapshot {
  readonly session: PomodoroSessionEntity;
  readonly currentCycle: PomodoroCycleEntity | null;
  readonly nextPhaseType: PomodoroPhaseType;
  readonly phaseDurationMs: number;
  readonly elapsedMs: number;
  readonly remainingMs: number;
  readonly serverNow: string;
}

export interface PomodoroStats {
  readonly range: '7d' | '30d' | '90d';
  readonly totalFocusMs: number;
  readonly completedFocusCycles: number;
  readonly completedSessions: number;
  readonly focusTodayMs: number;
  readonly activeDaysStreak: number;
  readonly goalDaysStreak: number;
}

@Injectable()
export class PomodoroSessionService {
  constructor(
    @Inject(POMODORO_SETTINGS_REPOSITORY)
    private readonly settingsRepository: IPomodoroSettingsRepository,
    @Inject(POMODORO_SESSION_REPOSITORY)
    private readonly sessionRepository: IPomodoroSessionRepository,
    @Inject(POMODORO_CYCLE_REPOSITORY)
    private readonly cycleRepository: IPomodoroCycleRepository,
    private readonly timeService: PomodoroTimeService,
  ) {}

  async getSettings(userId: string): Promise<PomodoroSettingsEntity> {
    const settings = await this.settingsRepository.findByUserId(userId);
    return settings ?? this.buildDefaultSettings(userId);
  }

  async updateSettings(userId: string, input: PomodoroSettingsInput): Promise<PomodoroSettingsEntity> {
    const merged = this.mergeSettings(await this.getSettings(userId), input);
    return this.settingsRepository.upsert(userId, {
      focusDurationMinutes: merged.focusDurationMinutes,
      shortBreakMinutes: merged.shortBreakMinutes,
      longBreakMinutes: merged.longBreakMinutes,
      longBreakInterval: merged.longBreakInterval,
      autoStartBreaks: merged.autoStartBreaks,
      autoStartFocus: merged.autoStartFocus,
      dailyFocusGoalMinutes: merged.dailyFocusGoalMinutes,
    });
  }

  async getActiveSession(userId: string): Promise<PomodoroSessionSnapshot | null> {
    const active = await this.sessionRepository.findActiveByUserId(userId);
    if (!active) return null;

    const normalized = await this.normalizeSession(active);
    if (!this.isSessionActive(normalized.session.status)) return null;
    return this.toSnapshot(normalized.session, normalized.currentCycle, new Date());
  }

  async startSession(userId: string, input: StartPomodoroSessionInput): Promise<PomodoroSessionSnapshot> {
    const existing = await this.getActiveSession(userId);
    if (existing) {
      throw new ConflictException('Já existe uma sessão Pomodoro ativa');
    }

    const settings = this.mergeSettings(await this.getSettings(userId), input);
    const now = new Date();
    const phaseDurationMs = this.timeService.toMs(settings.focusDurationMinutes);
    const phaseEnd = new Date(now.getTime() + phaseDurationMs);

    const session = await this.sessionRepository.create({
      userId,
      status: 'running',
      currentPhaseType: 'focus',
      currentCycleSequence: 1,
      focusDurationMinutes: settings.focusDurationMinutes,
      shortBreakMinutes: settings.shortBreakMinutes,
      longBreakMinutes: settings.longBreakMinutes,
      longBreakInterval: settings.longBreakInterval,
      autoStartBreaks: settings.autoStartBreaks,
      autoStartFocus: settings.autoStartFocus,
      startedAt: now,
      phaseStartedAt: now,
      phaseTargetEndsAt: phaseEnd,
      contextType: input.contextType ?? null,
      contextId: input.contextId ?? null,
      contextLabel: input.contextLabel ?? null,
    });

    const cycle = await this.cycleRepository.create({
      sessionId: session.id,
      userId,
      sequence: 1,
      phaseType: 'focus',
      status: 'running',
      plannedDurationMs: phaseDurationMs,
      startedAt: now,
    });

    return this.toSnapshot(session, cycle, now);
  }

  async pauseSession(userId: string, sessionId: string): Promise<PomodoroSessionSnapshot> {
    const { session, currentCycle } = await this.getOwnedActiveSession(userId, sessionId);
    if (session.status !== 'running' || !currentCycle) {
      throw new BadRequestException('A sessão Pomodoro não está em execução');
    }

    const now = new Date();
    const updatedSession = await this.sessionRepository.update(session.id, {
      status: 'paused',
      pausedAt: now,
      version: session.version + 1,
    });
    const updatedCycle = await this.cycleRepository.update(currentCycle.id, {
      status: 'paused',
      pausedAt: now,
    });

    return this.toSnapshot(updatedSession, updatedCycle, now);
  }

  async resumeSession(userId: string, sessionId: string): Promise<PomodoroSessionSnapshot> {
    const { session, currentCycle } = await this.getOwnedActiveSession(userId, sessionId);
    if (session.status !== 'paused' || !currentCycle || !session.pausedAt || !currentCycle.pausedAt || !session.phaseTargetEndsAt) {
      throw new BadRequestException('A sessão Pomodoro não está pausada');
    }

    const now = new Date();
    const pauseDelta = now.getTime() - session.pausedAt.getTime();
    const newTarget = new Date(session.phaseTargetEndsAt.getTime() + pauseDelta);
    const updatedSession = await this.sessionRepository.update(session.id, {
      status: 'running',
      pausedAt: null,
      phaseTargetEndsAt: newTarget,
      currentPhasePausedMs: session.currentPhasePausedMs + pauseDelta,
      totalPausedMs: session.totalPausedMs + pauseDelta,
      version: session.version + 1,
    });
    const updatedCycle = await this.cycleRepository.update(currentCycle.id, {
      status: 'running',
      pausedAt: null,
      pausedTotalMs: currentCycle.pausedTotalMs + pauseDelta,
    });

    return this.toSnapshot(updatedSession, updatedCycle, now);
  }

  async stopSession(userId: string, sessionId: string): Promise<void> {
    const session = await this.sessionRepository.findById(sessionId);
    if (!session) throw new NotFoundException('Sessão Pomodoro não encontrada');
    if (session.userId !== userId) throw new ForbiddenException('Acesso negado');
    if (!this.isSessionActive(session.status)) {
      throw new BadRequestException('A sessão Pomodoro já foi encerrada');
    }

    const currentCycle = await this.cycleRepository.findCurrentBySessionId(session.id);
    const now = new Date();

    if (currentCycle) {
      await this.cycleRepository.update(currentCycle.id, {
        status: 'stopped',
        endedAt: now,
        effectiveDurationMs: this.timeService.computeCycleElapsedMs(currentCycle, now),
      });
    }

    await this.sessionRepository.update(session.id, {
      status: 'stopped',
      endedAt: now,
      pausedAt: null,
      version: session.version + 1,
    });
  }

  async advanceSession(userId: string, sessionId: string): Promise<PomodoroSessionSnapshot> {
    const session = await this.sessionRepository.findById(sessionId);
    if (!session) throw new NotFoundException('Sessão Pomodoro não encontrada');
    if (session.userId !== userId) throw new ForbiddenException('Acesso negado');

    const normalized = await this.normalizeSession(session);
    if (normalized.session.status !== 'awaiting_next_phase') {
      throw new BadRequestException('A sessão não está aguardando a próxima fase');
    }

    const now = new Date();
    const phaseType: PomodoroPhaseType = 'focus';
    const plannedDurationMs = this.timeService.getPhaseDurationMs(normalized.session, phaseType);
    const nextCycle = await this.cycleRepository.create({
      sessionId: normalized.session.id,
      userId,
      sequence: normalized.session.currentCycleSequence,
      phaseType,
      status: 'running',
      plannedDurationMs,
      startedAt: now,
    });
    const updatedSession = await this.sessionRepository.update(normalized.session.id, {
      status: 'running',
      currentPhaseType: phaseType,
      phaseStartedAt: now,
      phaseTargetEndsAt: new Date(now.getTime() + plannedDurationMs),
      pausedAt: null,
      currentPhasePausedMs: 0,
      version: normalized.session.version + 1,
    });

    return this.toSnapshot(updatedSession, nextCycle, now);
  }

  async getHistory(userId: string, limit = 20): Promise<PomodoroSessionEntity[]> {
    return this.sessionRepository.listByUserId(userId, limit);
  }

  async getStats(userId: string, range: '7d' | '30d' | '90d'): Promise<PomodoroStats> {
    const days = range === '7d' ? 7 : range === '30d' ? 30 : 90;
    const since = new Date();
    since.setUTCDate(since.getUTCDate() - (days - 1));
    since.setUTCHours(0, 0, 0, 0);

    const focusCycles = await this.cycleRepository.listCompletedFocusCyclesByUserIdSince(userId, since);
    const settings = await this.getSettings(userId);
    const sessions = await this.sessionRepository.listByUserId(userId, 100);
    const completedSessions = sessions.filter((session) => session.status === 'completed' || session.status === 'stopped').length;

    const totalFocusMs = focusCycles.reduce((acc, cycle) => acc + (cycle.effectiveDurationMs ?? cycle.plannedDurationMs), 0);
    const todayKey = this.toDayKey(new Date());
    const byDay = new Map<string, number>();
    for (const cycle of focusCycles) {
      const key = this.toDayKey(cycle.startedAt);
      byDay.set(key, (byDay.get(key) ?? 0) + (cycle.effectiveDurationMs ?? cycle.plannedDurationMs));
    }

    const focusTodayMs = byDay.get(todayKey) ?? 0;
    return {
      range,
      totalFocusMs,
      completedFocusCycles: focusCycles.length,
      completedSessions,
      focusTodayMs,
      activeDaysStreak: this.calculateStreak(byDay, 1),
      goalDaysStreak: this.calculateStreak(byDay, this.timeService.toMs(settings.dailyFocusGoalMinutes)),
    };
  }

  private async getOwnedActiveSession(userId: string, sessionId: string): Promise<{
    session: PomodoroSessionEntity;
    currentCycle: PomodoroCycleEntity | null;
  }> {
    const session = await this.sessionRepository.findById(sessionId);
    if (!session) throw new NotFoundException('Sessão Pomodoro não encontrada');
    if (session.userId !== userId) throw new ForbiddenException('Acesso negado');

    const normalized = await this.normalizeSession(session);
    if (!this.isSessionActive(normalized.session.status)) {
      throw new BadRequestException('A sessão Pomodoro já foi encerrada');
    }

    return normalized;
  }

  private async normalizeSession(session: PomodoroSessionEntity): Promise<{
    session: PomodoroSessionEntity;
    currentCycle: PomodoroCycleEntity | null;
  }> {
    let currentSession = session;
    let currentCycle = await this.cycleRepository.findCurrentBySessionId(session.id);
    const now = new Date();

    if (currentSession.status === 'paused' && currentSession.pausedAt && now.getTime() - currentSession.pausedAt.getTime() >= MAX_PAUSED_AGE_MS) {
      currentSession = await this.sessionRepository.update(currentSession.id, {
        status: 'abandoned',
        endedAt: now,
        version: currentSession.version + 1,
      });
      if (currentCycle) {
        currentCycle = await this.cycleRepository.update(currentCycle.id, {
          status: 'abandoned',
          endedAt: now,
          effectiveDurationMs: this.timeService.computeCycleElapsedMs(currentCycle, now),
        });
      }

      return { session: currentSession, currentCycle: null };
    }

    let guard = 0;
    while (
      currentSession.status === 'running' &&
      currentSession.phaseTargetEndsAt &&
      currentSession.phaseTargetEndsAt.getTime() <= now.getTime()
    ) {
      guard += 1;
      if (guard > 20) break;

      if (!currentCycle) break;

      const effectiveDurationMs = currentCycle.plannedDurationMs;
      const phaseEnd = currentSession.phaseTargetEndsAt;
      currentCycle = await this.cycleRepository.update(currentCycle.id, {
        status: 'completed',
        endedAt: phaseEnd,
        effectiveDurationMs,
        completedAutomatically: true,
      });

      let sessionUpdate: UpdatePomodoroSessionProps = {
        version: currentSession.version + 1,
      };

      if (currentCycle.phaseType === 'focus') {
        sessionUpdate = {
          ...sessionUpdate,
          completedFocusCycles: currentSession.completedFocusCycles + 1,
          totalFocusMs: currentSession.totalFocusMs + effectiveDurationMs,
        };

        const nextPhaseType = this.getNextPhaseAfterFocus({
          ...currentSession,
          completedFocusCycles: currentSession.completedFocusCycles + 1,
        });
        const nextDurationMs = this.timeService.getPhaseDurationMs(currentSession, nextPhaseType);
        const nextStartedAt = phaseEnd;
        const nextEndsAt = new Date(nextStartedAt.getTime() + nextDurationMs);

        const nextCycle = await this.cycleRepository.create({
          sessionId: currentSession.id,
          userId: currentSession.userId,
          sequence: currentCycle.sequence + 1,
          phaseType: nextPhaseType,
          status: 'running',
          plannedDurationMs: nextDurationMs,
          startedAt: nextStartedAt,
        });

        currentSession = await this.sessionRepository.update(currentSession.id, {
          ...sessionUpdate,
          status: 'running',
          currentPhaseType: nextPhaseType,
          currentCycleSequence: nextCycle.sequence,
          phaseStartedAt: nextStartedAt,
          phaseTargetEndsAt: nextEndsAt,
          pausedAt: null,
          currentPhasePausedMs: 0,
        });
        currentCycle = nextCycle;
        continue;
      }

      if (currentCycle.phaseType === 'short_break') {
        sessionUpdate = {
          ...sessionUpdate,
          completedShortBreakCycles: currentSession.completedShortBreakCycles + 1,
        };
      } else {
        sessionUpdate = {
          ...sessionUpdate,
          completedLongBreakCycles: currentSession.completedLongBreakCycles + 1,
        };
      }
      sessionUpdate = {
        ...sessionUpdate,
        totalBreakMs: currentSession.totalBreakMs + effectiveDurationMs,
      };

      if (!currentSession.autoStartFocus) {
        currentSession = await this.sessionRepository.update(currentSession.id, {
          ...sessionUpdate,
          status: 'awaiting_next_phase',
          currentPhaseType: 'focus',
          currentCycleSequence: currentCycle.sequence + 1,
          phaseStartedAt: null,
          phaseTargetEndsAt: null,
          pausedAt: null,
          currentPhasePausedMs: 0,
        });
        return { session: currentSession, currentCycle: null };
      }

      const nextDurationMs = this.timeService.getPhaseDurationMs(currentSession, 'focus');
      const nextStartedAt = phaseEnd;
      const nextEndsAt = new Date(nextStartedAt.getTime() + nextDurationMs);
      const nextCycle = await this.cycleRepository.create({
        sessionId: currentSession.id,
        userId: currentSession.userId,
        sequence: currentCycle.sequence + 1,
        phaseType: 'focus',
        status: 'running',
        plannedDurationMs: nextDurationMs,
        startedAt: nextStartedAt,
      });

      currentSession = await this.sessionRepository.update(currentSession.id, {
        ...sessionUpdate,
        status: 'running',
        currentPhaseType: 'focus',
        currentCycleSequence: nextCycle.sequence,
        phaseStartedAt: nextStartedAt,
        phaseTargetEndsAt: nextEndsAt,
        pausedAt: null,
        currentPhasePausedMs: 0,
      });
      currentCycle = nextCycle;
    }

    return { session: currentSession, currentCycle };
  }

  private toSnapshot(
    session: PomodoroSessionEntity,
    currentCycle: PomodoroCycleEntity | null,
    now: Date,
  ): PomodoroSessionSnapshot {
    const nextPhaseType = session.status === 'awaiting_next_phase' ? 'focus' : session.currentPhaseType;
    const phaseDurationMs = this.timeService.getPhaseDurationMs(session, nextPhaseType);
    const elapsedMs =
      session.status === 'awaiting_next_phase'
        ? 0
        : this.timeService.computeSessionElapsedMs(session, now);
    const remainingMs = session.status === 'awaiting_next_phase'
      ? phaseDurationMs
      : Math.max(0, phaseDurationMs - elapsedMs);

    return {
      session,
      currentCycle,
      nextPhaseType,
      phaseDurationMs,
      elapsedMs,
      remainingMs,
      serverNow: now.toISOString(),
    };
  }

  private buildDefaultSettings(userId: string): PomodoroSettingsEntity {
    const now = new Date();
    return {
      userId,
      ...DEFAULT_POMODORO_SETTINGS,
      createdAt: now,
      updatedAt: now,
    };
  }

  private mergeSettings(
    settings: PomodoroSettingsEntity,
    overrides: PomodoroSettingsInput,
  ): PomodoroSettingsEntity {
    return {
      ...settings,
      focusDurationMinutes: overrides.focusDurationMinutes ?? settings.focusDurationMinutes,
      shortBreakMinutes: overrides.shortBreakMinutes ?? settings.shortBreakMinutes,
      longBreakMinutes: overrides.longBreakMinutes ?? settings.longBreakMinutes,
      longBreakInterval: overrides.longBreakInterval ?? settings.longBreakInterval,
      autoStartBreaks: overrides.autoStartBreaks ?? settings.autoStartBreaks,
      autoStartFocus: overrides.autoStartFocus ?? settings.autoStartFocus,
      dailyFocusGoalMinutes: overrides.dailyFocusGoalMinutes ?? settings.dailyFocusGoalMinutes,
    };
  }

  private getNextPhaseAfterFocus(session: Pick<PomodoroSessionEntity, 'completedFocusCycles' | 'longBreakInterval'>): PomodoroPhaseType {
    return session.completedFocusCycles % session.longBreakInterval === 0 ? 'long_break' : 'short_break';
  }

  private isSessionActive(status: PomodoroSessionEntity['status']): boolean {
    return status === 'running' || status === 'paused' || status === 'awaiting_next_phase';
  }

  private toDayKey(date: Date): string {
    return date.toISOString().slice(0, 10);
  }

  private calculateStreak(byDay: Map<string, number>, thresholdMs: number): number {
    let streak = 0;
    const current = new Date();
    current.setUTCHours(0, 0, 0, 0);

    while (true) {
      const key = this.toDayKey(current);
      const value = byDay.get(key) ?? 0;
      if (value < thresholdMs) break;
      streak += 1;
      current.setUTCDate(current.getUTCDate() - 1);
    }

    return streak;
  }
}
