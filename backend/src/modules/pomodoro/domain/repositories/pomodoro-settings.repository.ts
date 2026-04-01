import type {
  PomodoroSettingsEntity,
  PomodoroSettingsInput,
} from '../entities/pomodoro-settings.entity.js';

export interface IPomodoroSettingsRepository {
  findByUserId(userId: string): Promise<PomodoroSettingsEntity | null>;
  upsert(userId: string, input: PomodoroSettingsInput): Promise<PomodoroSettingsEntity>;
}

export const POMODORO_SETTINGS_REPOSITORY = Symbol('IPomodoroSettingsRepository');
