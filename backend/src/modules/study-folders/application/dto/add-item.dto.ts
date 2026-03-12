import { IsEnum, IsUUID } from 'class-validator';
import { FolderItemType } from '../../domain/entities/study-folder.entity.js';

export class AddItemDto {
  @IsUUID()
  transcriptionId!: string;

  @IsEnum(FolderItemType)
  itemType!: FolderItemType;
}
