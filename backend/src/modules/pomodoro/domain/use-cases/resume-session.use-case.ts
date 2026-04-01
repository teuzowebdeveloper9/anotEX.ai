import { Injectable } from '@nestjs/common';
import { PomodoroSessionService, type PomodoroSessionSnapshot } from '../../infrastructure/services/pomodoro-session.service.js';

@Injectable()
export class ResumePomodoroSessionUseCase {
  constructor(private readonly pomodoroSessionService: PomodoroSessionService) {}

  async execute(userId: string, sessionId: string): Promise<PomodoroSessionSnapshot> {
    return this.pomodoroSessionService.resumeSession(userId, sessionId);
  }
}
