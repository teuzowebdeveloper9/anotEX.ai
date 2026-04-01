import { IsBoolean, IsInt, IsOptional, Max, Min } from 'class-validator';

export class UpdatePomodoroSettingsDto {
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
  @IsInt()
  @Min(5)
  @Max(600)
  dailyFocusGoalMinutes?: number;
}
