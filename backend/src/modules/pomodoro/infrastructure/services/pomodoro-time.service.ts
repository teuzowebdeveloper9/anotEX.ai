import { Injectable } from '@nestjs/common';
import type { PomodoroCycleEntity } from '../../domain/entities/pomodoro-cycle.entity.js';
import type {
  PomodoroPhaseType,
  PomodoroSessionEntity,
} from '../../domain/entities/pomodoro-session.entity.js';

@Injectable()
export class PomodoroTimeService {
  toMs(minutes: number): number {
    return minutes * 60 * 1000;
  }

  getPhaseDurationMs(session: Pick<PomodoroSessionEntity, 'focusDurationMinutes' | 'shortBreakMinutes' | 'longBreakMinutes'>, phaseType: PomodoroPhaseType): number {
    if (phaseType === 'focus') return this.toMs(session.focusDurationMinutes);
    if (phaseType === 'short_break') return this.toMs(session.shortBreakMinutes);
    return this.toMs(session.longBreakMinutes);
  }

  computeSessionElapsedMs(session: Pick<PomodoroSessionEntity, 'status' | 'phaseStartedAt' | 'phaseTargetEndsAt' | 'pausedAt' | 'currentPhasePausedMs'>, now: Date): number {
    if (!session.phaseStartedAt || !session.phaseTargetEndsAt) return 0;

    if (session.status === 'paused' && session.pausedAt) {
      return Math.max(
        0,
        session.pausedAt.getTime() - session.phaseStartedAt.getTime() - session.currentPhasePausedMs,
      );
    }

    const boundedNow = Math.min(now.getTime(), session.phaseTargetEndsAt.getTime());
    return Math.max(0, boundedNow - session.phaseStartedAt.getTime() - session.currentPhasePausedMs);
  }

  computeCycleElapsedMs(cycle: Pick<PomodoroCycleEntity, 'startedAt' | 'endedAt' | 'pausedAt' | 'pausedTotalMs' | 'plannedDurationMs' | 'status'>, now: Date): number {
    if (cycle.status === 'paused' && cycle.pausedAt) {
      return Math.max(0, cycle.pausedAt.getTime() - cycle.startedAt.getTime() - cycle.pausedTotalMs);
    }

    const reference = cycle.endedAt?.getTime() ?? now.getTime();
    const bounded = Math.min(reference, cycle.startedAt.getTime() + cycle.plannedDurationMs + cycle.pausedTotalMs);
    return Math.max(0, bounded - cycle.startedAt.getTime() - cycle.pausedTotalMs);
  }
}
