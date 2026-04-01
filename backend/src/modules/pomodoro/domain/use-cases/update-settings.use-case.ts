import { Injectable } from '@nestjs/common';
import { PomodoroSessionService } from '../../infrastructure/services/pomodoro-session.service.js';
import type { PomodoroSettingsEntity, PomodoroSettingsInput } from '../entities/pomodoro-settings.entity.js';

@Injectable()
export class UpdatePomodoroSettingsUseCase {
  constructor(private readonly pomodoroSessionService: PomodoroSessionService) {}

  async execute(userId: string, input: PomodoroSettingsInput): Promise<PomodoroSettingsEntity> {
    return this.pomodoroSessionService.updateSettings(userId, input);
  }
}
