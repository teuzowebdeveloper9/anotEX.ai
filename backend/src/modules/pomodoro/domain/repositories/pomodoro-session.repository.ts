import type {
  CreatePomodoroSessionProps,
  PomodoroSessionEntity,
  UpdatePomodoroSessionProps,
} from '../entities/pomodoro-session.entity.js';

export interface IPomodoroSessionRepository {
  create(props: CreatePomodoroSessionProps): Promise<PomodoroSessionEntity>;
  findById(id: string): Promise<PomodoroSessionEntity | null>;
  findActiveByUserId(userId: string): Promise<PomodoroSessionEntity | null>;
  update(id: string, props: UpdatePomodoroSessionProps): Promise<PomodoroSessionEntity>;
  listByUserId(userId: string, limit: number): Promise<PomodoroSessionEntity[]>;
}

export const POMODORO_SESSION_REPOSITORY = Symbol('IPomodoroSessionRepository');
