import type { PomodoroPhaseType } from './pomodoro-session.entity.js';

export type PomodoroCycleStatus =
  | 'running'
  | 'paused'
  | 'completed'
  | 'stopped'
  | 'skipped'
  | 'abandoned';

export interface PomodoroCycleEntity {
  readonly id: string;
  readonly sessionId: string;
  readonly userId: string;
  readonly sequence: number;
  readonly phaseType: PomodoroPhaseType;
  readonly status: PomodoroCycleStatus;
  readonly plannedDurationMs: number;
  readonly startedAt: Date;
  readonly endedAt: Date | null;
  readonly pausedAt: Date | null;
  readonly pausedTotalMs: number;
  readonly effectiveDurationMs: number | null;
  readonly completedAutomatically: boolean;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export interface CreatePomodoroCycleProps {
  readonly sessionId: string;
  readonly userId: string;
  readonly sequence: number;
  readonly phaseType: PomodoroPhaseType;
  readonly status: PomodoroCycleStatus;
  readonly plannedDurationMs: number;
  readonly startedAt: Date;
  readonly endedAt?: Date | null;
  readonly pausedAt?: Date | null;
  readonly pausedTotalMs?: number;
  readonly effectiveDurationMs?: number | null;
  readonly completedAutomatically?: boolean;
}

export interface UpdatePomodoroCycleProps {
  readonly status?: PomodoroCycleStatus;
  readonly endedAt?: Date | null;
  readonly pausedAt?: Date | null;
  readonly pausedTotalMs?: number;
  readonly effectiveDurationMs?: number | null;
  readonly completedAutomatically?: boolean;
}
