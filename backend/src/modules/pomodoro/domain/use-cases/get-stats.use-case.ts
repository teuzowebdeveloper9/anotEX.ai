import { Injectable } from '@nestjs/common';
import { PomodoroSessionService, type PomodoroStats } from '../../infrastructure/services/pomodoro-session.service.js';

@Injectable()
export class GetPomodoroStatsUseCase {
  constructor(private readonly pomodoroSessionService: PomodoroSessionService) {}

  async execute(userId: string, range: '7d' | '30d' | '90d'): Promise<PomodoroStats> {
    return this.pomodoroSessionService.getStats(userId, range);
  }
}
