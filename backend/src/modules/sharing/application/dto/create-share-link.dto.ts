import { IsEnum, IsUUID } from 'class-validator';

export enum ResourceTypeDto {
  TRANSCRIPTION = 'transcription',
  AUDIO = 'audio',
  STUDY_MATERIAL = 'study_material',
}

export class CreateShareLinkDto {
  @IsEnum(ResourceTypeDto)
  resourceType!: ResourceTypeDto;

  @IsUUID()
  resourceId!: string;
}
