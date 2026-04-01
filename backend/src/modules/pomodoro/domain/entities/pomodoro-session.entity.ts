export type PomodoroPhaseType = 'focus' | 'short_break' | 'long_break';
export type PomodoroSessionStatus =
  | 'running'
  | 'paused'
  | 'awaiting_next_phase'
  | 'stopped'
  | 'completed'
  | 'abandoned';
export type PomodoroContextType = 'general' | 'review' | 'transcription' | 'chat' | 'study_folder';

export interface PomodoroSessionEntity {
  readonly id: string;
  readonly userId: string;
  readonly status: PomodoroSessionStatus;
  readonly currentPhaseType: PomodoroPhaseType;
  readonly currentCycleSequence: number;
  readonly completedFocusCycles: number;
  readonly completedShortBreakCycles: number;
  readonly completedLongBreakCycles: number;
  readonly focusDurationMinutes: number;
  readonly shortBreakMinutes: number;
  readonly longBreakMinutes: number;
  readonly longBreakInterval: number;
  readonly autoStartBreaks: boolean;
  readonly autoStartFocus: boolean;
  readonly startedAt: Date;
  readonly endedAt: Date | null;
  readonly phaseStartedAt: Date | null;
  readonly phaseTargetEndsAt: Date | null;
  readonly pausedAt: Date | null;
  readonly currentPhasePausedMs: number;
  readonly totalPausedMs: number;
  readonly totalFocusMs: number;
  readonly totalBreakMs: number;
  readonly contextType: PomodoroContextType | null;
  readonly contextId: string | null;
  readonly contextLabel: string | null;
  readonly version: number;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export interface CreatePomodoroSessionProps {
  readonly userId: string;
  readonly status: PomodoroSessionStatus;
  readonly currentPhaseType: PomodoroPhaseType;
  readonly currentCycleSequence: number;
  readonly focusDurationMinutes: number;
  readonly shortBreakMinutes: number;
  readonly longBreakMinutes: number;
  readonly longBreakInterval: number;
  readonly autoStartBreaks: boolean;
  readonly autoStartFocus: boolean;
  readonly startedAt: Date;
  readonly phaseStartedAt: Date | null;
  readonly phaseTargetEndsAt: Date | null;
  readonly contextType: PomodoroContextType | null;
  readonly contextId: string | null;
  readonly contextLabel: string | null;
}

export interface UpdatePomodoroSessionProps {
  readonly status?: PomodoroSessionStatus;
  readonly currentPhaseType?: PomodoroPhaseType;
  readonly currentCycleSequence?: number;
  readonly completedFocusCycles?: number;
  readonly completedShortBreakCycles?: number;
  readonly completedLongBreakCycles?: number;
  readonly endedAt?: Date | null;
  readonly phaseStartedAt?: Date | null;
  readonly phaseTargetEndsAt?: Date | null;
  readonly pausedAt?: Date | null;
  readonly currentPhasePausedMs?: number;
  readonly totalPausedMs?: number;
  readonly totalFocusMs?: number;
  readonly totalBreakMs?: number;
  readonly version?: number;
}
