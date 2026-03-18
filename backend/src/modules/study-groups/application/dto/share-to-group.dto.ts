import { IsUUID } from 'class-validator';

export class ShareToGroupDto {
  @IsUUID()
  shareLinkId!: string;
}
