import { Injectable } from '@nestjs/common';
import { PomodoroSessionService } from '../../infrastructure/services/pomodoro-session.service.js';
import type { PomodoroSettingsEntity } from '../entities/pomodoro-settings.entity.js';

@Injectable()
export class GetPomodoroSettingsUseCase {
  constructor(private readonly pomodoroSessionService: PomodoroSessionService) {}

  async execute(userId: string): Promise<PomodoroSettingsEntity> {
    return this.pomodoroSessionService.getSettings(userId);
  }
}
