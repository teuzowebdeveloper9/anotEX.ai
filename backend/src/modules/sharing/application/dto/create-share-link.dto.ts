import { IsEnum, IsUUID } from 'class-validator';

export enum ResourceTypeDto {
  TRANSCRIPTION = 'transcription',
  AUDIO = 'audio',
  STUDY_MATERIAL = 'study_material',
  STUDY_FOLDER = 'study_folder',
}

export class CreateShareLinkDto {
  @IsEnum(ResourceTypeDto)
  resourceType!: ResourceTypeDto;

  @IsUUID()
  resourceId!: string;
}
