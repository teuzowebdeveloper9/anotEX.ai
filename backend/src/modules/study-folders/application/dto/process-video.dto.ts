import { IsString, IsNotEmpty, Length } from 'class-validator';

export class ProcessVideoDto {
  @IsString()
  @IsNotEmpty()
  @Length(1, 20)
  videoId!: string;

  @IsString()
  @IsNotEmpty()
  @Length(1, 500)
  videoTitle!: string;
}
