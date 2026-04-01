import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
  Req,
} from '@nestjs/common';
import type { AuthenticatedRequest } from '../../../audio/presentation/guards/auth.guard.js';
import { StartPomodoroSessionDto } from '../../application/dto/start-session.dto.js';
import { UpdatePomodoroSettingsDto } from '../../application/dto/update-settings.dto.js';
import { GetPomodoroStatsQueryDto } from '../../application/dto/get-stats-query.dto.js';
import { GetActivePomodoroSessionUseCase } from '../../domain/use-cases/get-active-session.use-case.js';
import { StartPomodoroSessionUseCase } from '../../domain/use-cases/start-session.use-case.js';
import { PausePomodoroSessionUseCase } from '../../domain/use-cases/pause-session.use-case.js';
import { ResumePomodoroSessionUseCase } from '../../domain/use-cases/resume-session.use-case.js';
import { StopPomodoroSessionUseCase } from '../../domain/use-cases/stop-session.use-case.js';
import { AdvancePomodoroSessionUseCase } from '../../domain/use-cases/advance-session.use-case.js';
import { GetPomodoroSettingsUseCase } from '../../domain/use-cases/get-settings.use-case.js';
import { UpdatePomodoroSettingsUseCase } from '../../domain/use-cases/update-settings.use-case.js';
import { GetPomodoroStatsUseCase } from '../../domain/use-cases/get-stats.use-case.js';
import { GetPomodoroHistoryUseCase } from '../../domain/use-cases/get-history.use-case.js';
import type { PomodoroSessionSnapshot, PomodoroStats } from '../../infrastructure/services/pomodoro-session.service.js';
import type { PomodoroSettingsEntity } from '../../domain/entities/pomodoro-settings.entity.js';
import type { PomodoroSessionEntity } from '../../domain/entities/pomodoro-session.entity.js';

@Controller('pomodoro')
export class PomodoroController {
  constructor(
    private readonly getActiveSessionUseCase: GetActivePomodoroSessionUseCase,
    private readonly startSessionUseCase: StartPomodoroSessionUseCase,
    private readonly pauseSessionUseCase: PausePomodoroSessionUseCase,
    private readonly resumeSessionUseCase: ResumePomodoroSessionUseCase,
    private readonly stopSessionUseCase: StopPomodoroSessionUseCase,
    private readonly advanceSessionUseCase: AdvancePomodoroSessionUseCase,
    private readonly getSettingsUseCase: GetPomodoroSettingsUseCase,
    private readonly updateSettingsUseCase: UpdatePomodoroSettingsUseCase,
    private readonly getStatsUseCase: GetPomodoroStatsUseCase,
    private readonly getHistoryUseCase: GetPomodoroHistoryUseCase,
  ) {}

  @Get('active')
  async getActiveSession(@Req() req: AuthenticatedRequest): Promise<PomodoroSessionSnapshot | null> {
    return this.getActiveSessionUseCase.execute(req.user.id);
  }

  @Post('start')
  @HttpCode(HttpStatus.OK)
  async startSession(
    @Req() req: AuthenticatedRequest,
    @Body() dto: StartPomodoroSessionDto,
  ): Promise<PomodoroSessionSnapshot> {
    return this.startSessionUseCase.execute(req.user.id, dto);
  }

  @Post(':sessionId/pause')
  @HttpCode(HttpStatus.OK)
  async pauseSession(
    @Req() req: AuthenticatedRequest,
    @Param('sessionId', ParseUUIDPipe) sessionId: string,
  ): Promise<PomodoroSessionSnapshot> {
    return this.pauseSessionUseCase.execute(req.user.id, sessionId);
  }

  @Post(':sessionId/resume')
  @HttpCode(HttpStatus.OK)
  async resumeSession(
    @Req() req: AuthenticatedRequest,
    @Param('sessionId', ParseUUIDPipe) sessionId: string,
  ): Promise<PomodoroSessionSnapshot> {
    return this.resumeSessionUseCase.execute(req.user.id, sessionId);
  }

  @Post(':sessionId/advance')
  @HttpCode(HttpStatus.OK)
  async advanceSession(
    @Req() req: AuthenticatedRequest,
    @Param('sessionId', ParseUUIDPipe) sessionId: string,
  ): Promise<PomodoroSessionSnapshot> {
    return this.advanceSessionUseCase.execute(req.user.id, sessionId);
  }

  @Post(':sessionId/stop')
  @HttpCode(HttpStatus.NO_CONTENT)
  async stopSession(
    @Req() req: AuthenticatedRequest,
    @Param('sessionId', ParseUUIDPipe) sessionId: string,
  ): Promise<void> {
    await this.stopSessionUseCase.execute(req.user.id, sessionId);
  }

  @Get('settings')
  async getSettings(@Req() req: AuthenticatedRequest): Promise<PomodoroSettingsEntity> {
    return this.getSettingsUseCase.execute(req.user.id);
  }

  @Put('settings')
  async updateSettings(
    @Req() req: AuthenticatedRequest,
    @Body() dto: UpdatePomodoroSettingsDto,
  ): Promise<PomodoroSettingsEntity> {
    return this.updateSettingsUseCase.execute(req.user.id, dto);
  }

  @Get('stats')
  async getStats(
    @Req() req: AuthenticatedRequest,
    @Query() query: GetPomodoroStatsQueryDto,
  ): Promise<PomodoroStats> {
    return this.getStatsUseCase.execute(req.user.id, query.range ?? '7d');
  }

  @Get('history')
  async getHistory(@Req() req: AuthenticatedRequest): Promise<PomodoroSessionEntity[]> {
    return this.getHistoryUseCase.execute(req.user.id);
  }
}
