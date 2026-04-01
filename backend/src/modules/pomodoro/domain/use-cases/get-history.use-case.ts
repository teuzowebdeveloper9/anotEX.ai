import { Injectable } from '@nestjs/common';
import { PomodoroSessionService } from '../../infrastructure/services/pomodoro-session.service.js';
import type { PomodoroSessionEntity } from '../entities/pomodoro-session.entity.js';

@Injectable()
export class GetPomodoroHistoryUseCase {
  constructor(private readonly pomodoroSessionService: PomodoroSessionService) {}

  async execute(userId: string, limit = 20): Promise<PomodoroSessionEntity[]> {
    return this.pomodoroSessionService.getHistory(userId, limit);
  }
}
