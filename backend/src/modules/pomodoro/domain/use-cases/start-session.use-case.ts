import { Injectable } from '@nestjs/common';
import { PomodoroSessionService, type PomodoroSessionSnapshot, type StartPomodoroSessionInput } from '../../infrastructure/services/pomodoro-session.service.js';

@Injectable()
export class StartPomodoroSessionUseCase {
  constructor(private readonly pomodoroSessionService: PomodoroSessionService) {}

  async execute(userId: string, input: StartPomodoroSessionInput): Promise<PomodoroSessionSnapshot> {
    return this.pomodoroSessionService.startSession(userId, input);
  }
}
