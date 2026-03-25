import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  Req,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';
import type { AuthenticatedRequest } from '../../../audio/presentation/guards/auth.guard.js';
import { CreateGroupUseCase } from '../../domain/use-cases/create-group.use-case.js';
import { GetUserGroupsUseCase } from '../../domain/use-cases/get-user-groups.use-case.js';
import { AddGroupMemberUseCase } from '../../domain/use-cases/add-group-member.use-case.js';
import { RemoveGroupMemberUseCase } from '../../domain/use-cases/remove-group-member.use-case.js';
import { ShareToGroupUseCase } from '../../domain/use-cases/share-to-group.use-case.js';
import { GetGroupDetailUseCase } from '../../domain/use-cases/get-group-detail.use-case.js';
import { DeleteGroupUseCase } from '../../domain/use-cases/delete-group.use-case.js';
import { RemoveGroupShareUseCase } from '../../domain/use-cases/remove-group-share.use-case.js';
import { UpdateGroupUseCase } from '../../domain/use-cases/update-group.use-case.js';
import { CreateGroupDto } from '../../application/dto/create-group.dto.js';
import { UpdateGroupDto } from '../../application/dto/update-group.dto.js';
import { AddMemberDto } from '../../application/dto/add-member.dto.js';
import { ShareToGroupDto } from '../../application/dto/share-to-group.dto.js';

@Controller('groups')
export class StudyGroupController {
  constructor(
    private readonly createGroupUseCase: CreateGroupUseCase,
    private readonly getUserGroupsUseCase: GetUserGroupsUseCase,
    private readonly addGroupMemberUseCase: AddGroupMemberUseCase,
    private readonly removeGroupMemberUseCase: RemoveGroupMemberUseCase,
    private readonly shareToGroupUseCase: ShareToGroupUseCase,
    private readonly getGroupDetailUseCase: GetGroupDetailUseCase,
    private readonly deleteGroupUseCase: DeleteGroupUseCase,
    private readonly removeGroupShareUseCase: RemoveGroupShareUseCase,
    private readonly updateGroupUseCase: UpdateGroupUseCase,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createGroup(
    @Body() dto: CreateGroupDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const result = await this.createGroupUseCase.execute({
      name: dto.name,
      description: dto.description ?? null,
      userId: req.user.id,
    });

    if (!result.success) throw result.error;
    return result.data;
  }

  @Get()
  async getMyGroups(@Req() req: AuthenticatedRequest) {
    const result = await this.getUserGroupsUseCase.execute(req.user.id);
    if (!result.success) throw result.error;
    return result.data;
  }

  @Get(':id')
  async getGroupDetail(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: AuthenticatedRequest,
  ) {
    const result = await this.getGroupDetailUseCase.execute(id, req.user.id);
    if (!result.success) throw result.error;
    return result.data;
  }

  @Patch(':id')
  async updateGroup(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateGroupDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const result = await this.updateGroupUseCase.execute({
      groupId: id,
      userId: req.user.id,
      name: dto.name,
      description: dto.description,
    });

    if (!result.success) throw result.error;
    return result.data;
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteGroup(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: AuthenticatedRequest,
  ) {
    const result = await this.deleteGroupUseCase.execute({ groupId: id, userId: req.user.id });
    if (!result.success) throw result.error;
  }

  @Post(':id/members')
  @HttpCode(HttpStatus.CREATED)
  async addMember(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AddMemberDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const result = await this.addGroupMemberUseCase.execute({
      groupId: id,
      requestingUserId: req.user.id,
      memberEmail: dto.email,
    });

    if (!result.success) throw result.error;
    return result.data;
  }

  @Delete(':id/members/:userId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeMember(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('userId', ParseUUIDPipe) userId: string,
    @Req() req: AuthenticatedRequest,
  ) {
    const result = await this.removeGroupMemberUseCase.execute({
      groupId: id,
      requestingUserId: req.user.id,
      targetUserId: userId,
    });

    if (!result.success) throw result.error;
  }

  @Post(':id/shares')
  @HttpCode(HttpStatus.CREATED)
  async shareToGroup(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ShareToGroupDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const result = await this.shareToGroupUseCase.execute({
      groupId: id,
      shareLinkId: dto.shareLinkId,
      requestingUserId: req.user.id,
    });

    if (!result.success) throw result.error;
    return result.data;
  }

  @Delete(':id/shares/:shareLinkId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeShare(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('shareLinkId', ParseUUIDPipe) shareLinkId: string,
    @Req() req: AuthenticatedRequest,
  ) {
    const result = await this.removeGroupShareUseCase.execute({
      groupId: id,
      shareLinkId,
      requestingUserId: req.user.id,
    });

    if (!result.success) throw result.error;
  }
}
