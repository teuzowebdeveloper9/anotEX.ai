import { Injectable } from '@nestjs/common';
import { PomodoroSessionService } from '../../infrastructure/services/pomodoro-session.service.js';

@Injectable()
export class StopPomodoroSessionUseCase {
  constructor(private readonly pomodoroSessionService: PomodoroSessionService) {}

  async execute(userId: string, sessionId: string): Promise<void> {
    await this.pomodoroSessionService.stopSession(userId, sessionId);
  }
}
