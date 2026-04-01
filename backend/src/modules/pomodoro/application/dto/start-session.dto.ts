import {
  IsBoolean,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
} from 'class-validator';
import type { PomodoroContextType } from '../../domain/entities/pomodoro-session.entity.js';

export class StartPomodoroSessionDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(180)
  focusDurationMinutes?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(60)
  shortBreakMinutes?: number;

  @IsOptional()
  @IsInt()
  @Min(5)
  @Max(120)
  longBreakMinutes?: number;

  @IsOptional()
  @IsInt()
  @Min(2)
  @Max(12)
  longBreakInterval?: number;

  @IsOptional()
  @IsBoolean()
  autoStartBreaks?: boolean;

  @IsOptional()
  @IsBoolean()
  autoStartFocus?: boolean;

  @IsOptional()
  @IsIn(['general', 'review', 'transcription', 'chat', 'study_folder'])
  contextType?: PomodoroContextType;

  @IsOptional()
  @IsUUID()
  contextId?: string;

  @IsOptional()
  @IsString()
  contextLabel?: string;
}
