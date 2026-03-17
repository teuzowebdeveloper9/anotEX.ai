import { IsOptional, IsString, MaxLength } from 'class-validator';

export class ListTranscriptionsQueryDto {
  @IsOptional()
  @IsString()
  @MaxLength(200)
  q?: string;
}
