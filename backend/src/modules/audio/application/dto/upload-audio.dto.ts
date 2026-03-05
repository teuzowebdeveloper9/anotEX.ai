import { IsOptional, IsString, IsIn } from 'class-validator';

export class UploadAudioDto {
  @IsOptional()
  @IsString()
  @IsIn(['pt', 'en', 'es'])
  language?: string = 'pt';
}

export class AudioResponseDto {
  id!: string;
  status!: string;
  fileName!: string;
  createdAt!: string;
}
