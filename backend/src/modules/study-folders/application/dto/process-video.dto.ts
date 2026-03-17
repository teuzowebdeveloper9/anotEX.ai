import { IsString, IsNotEmpty, Length, Matches } from 'class-validator';

export class ProcessVideoDto {
  @IsString()
  @IsNotEmpty()
  @Length(1, 20)
  @Matches(/^[a-zA-Z0-9_-]{11}$/, {
    message: 'videoId must be a valid YouTube video ID',
  })
  videoId!: string;

  @IsString()
  @IsNotEmpty()
  @Length(1, 500)
  videoTitle!: string;
}
