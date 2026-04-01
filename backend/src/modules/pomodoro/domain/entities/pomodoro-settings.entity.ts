export interface PomodoroSettingsEntity {
  readonly userId: string;
  readonly focusDurationMinutes: number;
  readonly shortBreakMinutes: number;
  readonly longBreakMinutes: number;
  readonly longBreakInterval: number;
  readonly autoStartBreaks: boolean;
  readonly autoStartFocus: boolean;
  readonly dailyFocusGoalMinutes: number;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export interface PomodoroSettingsInput {
  readonly focusDurationMinutes?: number;
  readonly shortBreakMinutes?: number;
  readonly longBreakMinutes?: number;
  readonly longBreakInterval?: number;
  readonly autoStartBreaks?: boolean;
  readonly autoStartFocus?: boolean;
  readonly dailyFocusGoalMinutes?: number;
}

export const DEFAULT_POMODORO_SETTINGS: Omit<PomodoroSettingsEntity, 'userId' | 'createdAt' | 'updatedAt'> = {
  focusDurationMinutes: 25,
  shortBreakMinutes: 5,
  longBreakMinutes: 15,
  longBreakInterval: 4,
  autoStartBreaks: true,
  autoStartFocus: false,
  dailyFocusGoalMinutes: 100,
};
