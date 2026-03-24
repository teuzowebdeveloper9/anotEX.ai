import { IsOptional, IsString, MaxLength } from 'class-validator';

export class ListTranscriptionsQueryDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  q?: string;
}
