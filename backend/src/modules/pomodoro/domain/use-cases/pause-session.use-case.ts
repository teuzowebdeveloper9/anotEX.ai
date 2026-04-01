import { Injectable } from '@nestjs/common';
import { PomodoroSessionService, type PomodoroSessionSnapshot } from '../../infrastructure/services/pomodoro-session.service.js';

@Injectable()
export class PausePomodoroSessionUseCase {
  constructor(private readonly pomodoroSessionService: PomodoroSessionService) {}

  async execute(userId: string, sessionId: string): Promise<PomodoroSessionSnapshot> {
    return this.pomodoroSessionService.pauseSession(userId, sessionId);
  }
}
