import { IsString, MaxLength, IsOptional } from 'class-validator';

export class CreateGroupDto {
  @IsString()
  @MaxLength(100)
  name!: string;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  description?: string;
}
