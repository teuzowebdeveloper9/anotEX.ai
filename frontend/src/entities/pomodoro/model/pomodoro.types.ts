export type PomodoroPhaseType = 'focus' | 'short_break' | 'long_break'
export type PomodoroSessionStatus =
  | 'running'
  | 'paused'
  | 'awaiting_next_phase'
  | 'stopped'
  | 'completed'
  | 'abandoned'
export type PomodoroCycleStatus =
  | 'running'
  | 'paused'
  | 'completed'
  | 'stopped'
  | 'skipped'
  | 'abandoned'
export type PomodoroContextType = 'general' | 'review' | 'transcription' | 'chat' | 'study_folder'

export interface PomodoroSettingsEntity {
  userId: string
  focusDurationMinutes: number
  shortBreakMinutes: number
  longBreakMinutes: number
  longBreakInterval: number
  autoStartBreaks: boolean
  autoStartFocus: boolean
  dailyFocusGoalMinutes: number
  createdAt: string
  updatedAt: string
}

export interface PomodoroSessionEntity {
  id: string
  userId: string
  status: PomodoroSessionStatus
  currentPhaseType: PomodoroPhaseType
  currentCycleSequence: number
  completedFocusCycles: number
  completedShortBreakCycles: number
  completedLongBreakCycles: number
  focusDurationMinutes: number
  shortBreakMinutes: number
  longBreakMinutes: number
  longBreakInterval: number
  autoStartBreaks: boolean
  autoStartFocus: boolean
  startedAt: string
  endedAt: string | null
  phaseStartedAt: string | null
  phaseTargetEndsAt: string | null
  pausedAt: string | null
  currentPhasePausedMs: number
  totalPausedMs: number
  totalFocusMs: number
  totalBreakMs: number
  contextType: PomodoroContextType | null
  contextId: string | null
  contextLabel: string | null
  version: number
  createdAt: string
  updatedAt: string
}

export interface PomodoroCycleEntity {
  id: string
  sessionId: string
  userId: string
  sequence: number
  phaseType: PomodoroPhaseType
  status: PomodoroCycleStatus
  plannedDurationMs: number
  startedAt: string
  endedAt: string | null
  pausedAt: string | null
  pausedTotalMs: number
  effectiveDurationMs: number | null
  completedAutomatically: boolean
  createdAt: string
  updatedAt: string
}

export interface PomodoroSessionSnapshot {
  session: PomodoroSessionEntity
  currentCycle: PomodoroCycleEntity | null
  nextPhaseType: PomodoroPhaseType
  phaseDurationMs: number
  elapsedMs: number
  remainingMs: number
  serverNow: string
}

export interface PomodoroStats {
  range: '7d' | '30d' | '90d'
  totalFocusMs: number
  completedFocusCycles: number
  completedSessions: number
  focusTodayMs: number
  activeDaysStreak: number
  goalDaysStreak: number
}

export interface StartPomodoroPayload {
  focusDurationMinutes?: number
  shortBreakMinutes?: number
  longBreakMinutes?: number
  longBreakInterval?: number
  autoStartBreaks?: boolean
  autoStartFocus?: boolean
  contextType?: PomodoroContextType
  contextId?: string
  contextLabel?: string
}

export interface UpdatePomodoroSettingsPayload {
  focusDurationMinutes?: number
  shortBreakMinutes?: number
  longBreakMinutes?: number
  longBreakInterval?: number
  autoStartBreaks?: boolean
  autoStartFocus?: boolean
  dailyFocusGoalMinutes?: number
}
