import { Injectable } from '@nestjs/common';
import { PomodoroSessionService, type PomodoroSessionSnapshot } from '../../infrastructure/services/pomodoro-session.service.js';

@Injectable()
export class GetActivePomodoroSessionUseCase {
  constructor(private readonly pomodoroSessionService: PomodoroSessionService) {}

  async execute(userId: string): Promise<PomodoroSessionSnapshot | null> {
    return this.pomodoroSessionService.getActiveSession(userId);
  }
}
