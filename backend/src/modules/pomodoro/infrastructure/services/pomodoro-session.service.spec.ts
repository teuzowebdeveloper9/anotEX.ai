import { PomodoroSessionService } from './pomodoro-session.service.js';
import { PomodoroTimeService } from './pomodoro-time.service.js';
import type { IPomodoroSettingsRepository } from '../../domain/repositories/pomodoro-settings.repository.js';
import type { IPomodoroSessionRepository } from '../../domain/repositories/pomodoro-session.repository.js';
import type { IPomodoroCycleRepository } from '../../domain/repositories/pomodoro-cycle.repository.js';
import type {
  PomodoroSettingsEntity,
  PomodoroSettingsInput,
} from '../../domain/entities/pomodoro-settings.entity.js';
import type {
  CreatePomodoroSessionProps,
  PomodoroSessionEntity,
  UpdatePomodoroSessionProps,
} from '../../domain/entities/pomodoro-session.entity.js';
import type {
  CreatePomodoroCycleProps,
  PomodoroCycleEntity,
  UpdatePomodoroCycleProps,
} from '../../domain/entities/pomodoro-cycle.entity.js';

class InMemoryPomodoroSettingsRepository implements IPomodoroSettingsRepository {
  private settings = new Map<string, PomodoroSettingsEntity>();

  async findByUserId(userId: string): Promise<PomodoroSettingsEntity | null> {
    return this.settings.get(userId) ?? null;
  }

  async upsert(userId: string, input: PomodoroSettingsInput): Promise<PomodoroSettingsEntity> {
    const now = new Date();
    const current = this.settings.get(userId);
    const next: PomodoroSettingsEntity = {
      userId,
      focusDurationMinutes: input.focusDurationMinutes ?? current?.focusDurationMinutes ?? 25,
      shortBreakMinutes: input.shortBreakMinutes ?? current?.shortBreakMinutes ?? 5,
      longBreakMinutes: input.longBreakMinutes ?? current?.longBreakMinutes ?? 15,
      longBreakInterval: input.longBreakInterval ?? current?.longBreakInterval ?? 4,
      autoStartBreaks: input.autoStartBreaks ?? current?.autoStartBreaks ?? true,
      autoStartFocus: input.autoStartFocus ?? current?.autoStartFocus ?? false,
      dailyFocusGoalMinutes: input.dailyFocusGoalMinutes ?? current?.dailyFocusGoalMinutes ?? 100,
      createdAt: current?.createdAt ?? now,
      updatedAt: now,
    };

    this.settings.set(userId, next);
    return next;
  }
}

class InMemoryPomodoroSessionRepository implements IPomodoroSessionRepository {
  private sessions = new Map<string, PomodoroSessionEntity>();

  async create(props: CreatePomodoroSessionProps): Promise<PomodoroSessionEntity> {
    const now = new Date();
    const session: PomodoroSessionEntity = {
      id: crypto.randomUUID(),
      userId: props.userId,
      status: props.status,
      currentPhaseType: props.currentPhaseType,
      currentCycleSequence: props.currentCycleSequence,
      completedFocusCycles: 0,
      completedShortBreakCycles: 0,
      completedLongBreakCycles: 0,
      focusDurationMinutes: props.focusDurationMinutes,
      shortBreakMinutes: props.shortBreakMinutes,
      longBreakMinutes: props.longBreakMinutes,
      longBreakInterval: props.longBreakInterval,
      autoStartBreaks: props.autoStartBreaks,
      autoStartFocus: props.autoStartFocus,
      startedAt: props.startedAt,
      endedAt: null,
      phaseStartedAt: props.phaseStartedAt,
      phaseTargetEndsAt: props.phaseTargetEndsAt,
      pausedAt: null,
      currentPhasePausedMs: 0,
      totalPausedMs: 0,
      totalFocusMs: 0,
      totalBreakMs: 0,
      contextType: props.contextType,
      contextId: props.contextId,
      contextLabel: props.contextLabel,
      version: 1,
      createdAt: now,
      updatedAt: now,
    };

    this.sessions.set(session.id, session);
    return session;
  }

  async findById(id: string): Promise<PomodoroSessionEntity | null> {
    return this.sessions.get(id) ?? null;
  }

  async findActiveByUserId(userId: string): Promise<PomodoroSessionEntity | null> {
    const active = Array.from(this.sessions.values())
      .filter((session) => session.userId === userId && ['running', 'paused', 'awaiting_next_phase'].includes(session.status))
      .sort((a, b) => b.startedAt.getTime() - a.startedAt.getTime());

    return active[0] ?? null;
  }

  async update(id: string, props: UpdatePomodoroSessionProps): Promise<PomodoroSessionEntity> {
    const current = this.sessions.get(id);
    if (!current) throw new Error('session not found');

    const next: PomodoroSessionEntity = {
      ...current,
      status: props.status ?? current.status,
      currentPhaseType: props.currentPhaseType ?? current.currentPhaseType,
      currentCycleSequence: props.currentCycleSequence ?? current.currentCycleSequence,
      completedFocusCycles: props.completedFocusCycles ?? current.completedFocusCycles,
      completedShortBreakCycles: props.completedShortBreakCycles ?? current.completedShortBreakCycles,
      completedLongBreakCycles: props.completedLongBreakCycles ?? current.completedLongBreakCycles,
      endedAt: props.endedAt !== undefined ? props.endedAt : current.endedAt,
      phaseStartedAt: props.phaseStartedAt !== undefined ? props.phaseStartedAt : current.phaseStartedAt,
      phaseTargetEndsAt: props.phaseTargetEndsAt !== undefined ? props.phaseTargetEndsAt : current.phaseTargetEndsAt,
      pausedAt: props.pausedAt !== undefined ? props.pausedAt : current.pausedAt,
      currentPhasePausedMs: props.currentPhasePausedMs ?? current.currentPhasePausedMs,
      totalPausedMs: props.totalPausedMs ?? current.totalPausedMs,
      totalFocusMs: props.totalFocusMs ?? current.totalFocusMs,
      totalBreakMs: props.totalBreakMs ?? current.totalBreakMs,
      version: props.version ?? current.version,
      updatedAt: new Date(),
    };

    this.sessions.set(id, next);
    return next;
  }

  async listByUserId(userId: string, limit: number): Promise<PomodoroSessionEntity[]> {
    return Array.from(this.sessions.values())
      .filter((session) => session.userId === userId)
      .sort((a, b) => b.startedAt.getTime() - a.startedAt.getTime())
      .slice(0, limit);
  }
}

class InMemoryPomodoroCycleRepository implements IPomodoroCycleRepository {
  private cycles = new Map<string, PomodoroCycleEntity>();

  async create(props: CreatePomodoroCycleProps): Promise<PomodoroCycleEntity> {
    const now = new Date();
    const cycle: PomodoroCycleEntity = {
      id: crypto.randomUUID(),
      sessionId: props.sessionId,
      userId: props.userId,
      sequence: props.sequence,
      phaseType: props.phaseType,
      status: props.status,
      plannedDurationMs: props.plannedDurationMs,
      startedAt: props.startedAt,
      endedAt: props.endedAt ?? null,
      pausedAt: props.pausedAt ?? null,
      pausedTotalMs: props.pausedTotalMs ?? 0,
      effectiveDurationMs: props.effectiveDurationMs ?? null,
      completedAutomatically: props.completedAutomatically ?? false,
      createdAt: now,
      updatedAt: now,
    };

    this.cycles.set(cycle.id, cycle);
    return cycle;
  }

  async findCurrentBySessionId(sessionId: string): Promise<PomodoroCycleEntity | null> {
    const current = Array.from(this.cycles.values())
      .filter((cycle) => cycle.sessionId === sessionId && ['running', 'paused'].includes(cycle.status))
      .sort((a, b) => b.sequence - a.sequence);

    return current[0] ?? null;
  }

  async findLatestBySessionId(sessionId: string): Promise<PomodoroCycleEntity | null> {
    const latest = Array.from(this.cycles.values())
      .filter((cycle) => cycle.sessionId === sessionId)
      .sort((a, b) => b.sequence - a.sequence);

    return latest[0] ?? null;
  }

  async update(id: string, props: UpdatePomodoroCycleProps): Promise<PomodoroCycleEntity> {
    const current = this.cycles.get(id);
    if (!current) throw new Error('cycle not found');

    const next: PomodoroCycleEntity = {
      ...current,
      status: props.status ?? current.status,
      endedAt: props.endedAt !== undefined ? props.endedAt : current.endedAt,
      pausedAt: props.pausedAt !== undefined ? props.pausedAt : current.pausedAt,
      pausedTotalMs: props.pausedTotalMs ?? current.pausedTotalMs,
      effectiveDurationMs: props.effectiveDurationMs !== undefined ? props.effectiveDurationMs : current.effectiveDurationMs,
      completedAutomatically: props.completedAutomatically ?? current.completedAutomatically,
      updatedAt: new Date(),
    };

    this.cycles.set(id, next);
    return next;
  }

  async listCompletedFocusCyclesByUserIdSince(userId: string, since: Date): Promise<PomodoroCycleEntity[]> {
    return Array.from(this.cycles.values())
      .filter(
        (cycle) =>
          cycle.userId === userId &&
          cycle.phaseType === 'focus' &&
          cycle.status === 'completed' &&
          cycle.startedAt.getTime() >= since.getTime(),
      )
      .sort((a, b) => a.startedAt.getTime() - b.startedAt.getTime());
  }
}

describe('PomodoroSessionService', () => {
  let service: PomodoroSessionService;

  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-04-01T12:00:00.000Z'));

    service = new PomodoroSessionService(
      new InMemoryPomodoroSettingsRepository(),
      new InMemoryPomodoroSessionRepository(),
      new InMemoryPomodoroCycleRepository(),
      new PomodoroTimeService(),
    );
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('inicia uma sessão nova com ciclo de foco ativo', async () => {
    const snapshot = await service.startSession('user-1', {});

    expect(snapshot.session.status).toBe('running');
    expect(snapshot.session.currentPhaseType).toBe('focus');
    expect(snapshot.session.currentCycleSequence).toBe(1);
    expect(snapshot.currentCycle?.phaseType).toBe('focus');
    expect(snapshot.currentCycle?.status).toBe('running');
  });

  it('pausa e retoma a sessão preservando o ciclo atual', async () => {
    const started = await service.startSession('user-1', {});
    jest.setSystemTime(new Date('2026-04-01T12:05:00.000Z'));

    const paused = await service.pauseSession('user-1', started.session.id);
    expect(paused.session.status).toBe('paused');
    expect(paused.currentCycle?.status).toBe('paused');

    jest.setSystemTime(new Date('2026-04-01T12:08:00.000Z'));
    const resumed = await service.resumeSession('user-1', started.session.id);

    expect(resumed.session.status).toBe('running');
    expect(resumed.currentCycle?.status).toBe('running');
    expect(resumed.session.totalPausedMs).toBe(3 * 60 * 1000);
  });

  it('avança automaticamente do foco para a pausa curta e depois aguarda novo foco', async () => {
    await service.startSession('user-1', {
      focusDurationMinutes: 1,
      shortBreakMinutes: 1,
      longBreakMinutes: 2,
      longBreakInterval: 4,
      autoStartBreaks: true,
      autoStartFocus: false,
    });

    jest.setSystemTime(new Date('2026-04-01T12:01:05.000Z'));
    const duringBreak = await service.getActiveSession('user-1');
    expect(duringBreak?.session.currentPhaseType).toBe('short_break');
    expect(duringBreak?.currentCycle?.phaseType).toBe('short_break');

    jest.setSystemTime(new Date('2026-04-01T12:02:05.000Z'));
    const awaiting = await service.getActiveSession('user-1');
    expect(awaiting?.session.status).toBe('awaiting_next_phase');
    expect(awaiting?.currentCycle).toBeNull();
    expect(awaiting?.nextPhaseType).toBe('focus');
  });

  it('encerra e reseta a sessão ativa permitindo começar outra do zero', async () => {
    const started = await service.startSession('user-1', {
      focusDurationMinutes: 1,
    });

    jest.setSystemTime(new Date('2026-04-01T12:00:20.000Z'));
    await service.stopSession('user-1', started.session.id);

    const active = await service.getActiveSession('user-1');
    expect(active).toBeNull();

    const restarted = await service.startSession('user-1', {});
    expect(restarted.session.currentCycleSequence).toBe(1);
    expect(restarted.session.completedFocusCycles).toBe(0);
    expect(restarted.session.status).toBe('running');
  });
});
