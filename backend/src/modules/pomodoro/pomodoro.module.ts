import { Module } from '@nestjs/common';
import { SupabaseService } from '../../shared/infrastructure/config/supabase.config.js';
import { PomodoroController } from './presentation/controllers/pomodoro.controller.js';
import { GetActivePomodoroSessionUseCase } from './domain/use-cases/get-active-session.use-case.js';
import { StartPomodoroSessionUseCase } from './domain/use-cases/start-session.use-case.js';
import { PausePomodoroSessionUseCase } from './domain/use-cases/pause-session.use-case.js';
import { ResumePomodoroSessionUseCase } from './domain/use-cases/resume-session.use-case.js';
import { StopPomodoroSessionUseCase } from './domain/use-cases/stop-session.use-case.js';
import { AdvancePomodoroSessionUseCase } from './domain/use-cases/advance-session.use-case.js';
import { GetPomodoroSettingsUseCase } from './domain/use-cases/get-settings.use-case.js';
import { UpdatePomodoroSettingsUseCase } from './domain/use-cases/update-settings.use-case.js';
import { GetPomodoroStatsUseCase } from './domain/use-cases/get-stats.use-case.js';
import { GetPomodoroHistoryUseCase } from './domain/use-cases/get-history.use-case.js';
import { PomodoroSessionService } from './infrastructure/services/pomodoro-session.service.js';
import { PomodoroTimeService } from './infrastructure/services/pomodoro-time.service.js';
import { PomodoroSettingsRepositoryImpl } from './infrastructure/repositories/pomodoro-settings.repository.impl.js';
import { PomodoroSessionRepositoryImpl } from './infrastructure/repositories/pomodoro-session.repository.impl.js';
import { PomodoroCycleRepositoryImpl } from './infrastructure/repositories/pomodoro-cycle.repository.impl.js';
import { POMODORO_SETTINGS_REPOSITORY } from './domain/repositories/pomodoro-settings.repository.js';
import { POMODORO_SESSION_REPOSITORY } from './domain/repositories/pomodoro-session.repository.js';
import { POMODORO_CYCLE_REPOSITORY } from './domain/repositories/pomodoro-cycle.repository.js';

@Module({
  controllers: [PomodoroController],
  providers: [
    SupabaseService,
    PomodoroSessionService,
    PomodoroTimeService,
    GetActivePomodoroSessionUseCase,
    StartPomodoroSessionUseCase,
    PausePomodoroSessionUseCase,
    ResumePomodoroSessionUseCase,
    StopPomodoroSessionUseCase,
    AdvancePomodoroSessionUseCase,
    GetPomodoroSettingsUseCase,
    UpdatePomodoroSettingsUseCase,
    GetPomodoroStatsUseCase,
    GetPomodoroHistoryUseCase,
    { provide: POMODORO_SETTINGS_REPOSITORY, useClass: PomodoroSettingsRepositoryImpl },
    { provide: POMODORO_SESSION_REPOSITORY, useClass: PomodoroSessionRepositoryImpl },
    { provide: POMODORO_CYCLE_REPOSITORY, useClass: PomodoroCycleRepositoryImpl },
  ],
})
export class PomodoroModule {}
