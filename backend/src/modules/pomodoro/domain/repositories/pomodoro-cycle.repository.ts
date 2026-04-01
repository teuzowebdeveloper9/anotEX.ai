import type {
  CreatePomodoroCycleProps,
  PomodoroCycleEntity,
  UpdatePomodoroCycleProps,
} from '../entities/pomodoro-cycle.entity.js';

export interface IPomodoroCycleRepository {
  create(props: CreatePomodoroCycleProps): Promise<PomodoroCycleEntity>;
  findCurrentBySessionId(sessionId: string): Promise<PomodoroCycleEntity | null>;
  findLatestBySessionId(sessionId: string): Promise<PomodoroCycleEntity | null>;
  update(id: string, props: UpdatePomodoroCycleProps): Promise<PomodoroCycleEntity>;
  listCompletedFocusCyclesByUserIdSince(userId: string, since: Date): Promise<PomodoroCycleEntity[]>;
}

export const POMODORO_CYCLE_REPOSITORY = Symbol('IPomodoroCycleRepository');
