import { Inject, Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { ok, fail, Result } from '../../../../shared/domain/result.js';
import { STUDY_GROUP_REPOSITORY, type IStudyGroupRepository } from '../repositories/study-group.repository.js';

export interface RemoveGroupMemberInput {
  readonly groupId: string;
  readonly requestingUserId: string;
  readonly targetUserId: string;
}

@Injectable()
export class RemoveGroupMemberUseCase {
  constructor(
    @Inject(STUDY_GROUP_REPOSITORY)
    private readonly studyGroupRepository: IStudyGroupRepository,
  ) {}

  async execute(input: RemoveGroupMemberInput): Promise<Result<void>> {
    const group = await this.studyGroupRepository.findGroupById(input.groupId);

    if (!group) {
      return fail(new NotFoundException('Group not found'));
    }

    const isOwner = group.ownerId === input.requestingUserId;
    const isSelf = input.requestingUserId === input.targetUserId;

    if (!isOwner && !isSelf) {
      return fail(new ForbiddenException('Access denied'));
    }

    // Cannot remove the owner
    if (input.targetUserId === group.ownerId) {
      return fail(new ForbiddenException('Cannot remove the group owner'));
    }

    const member = await this.studyGroupRepository.findMember(input.groupId, input.targetUserId);

    if (!member) {
      return fail(new NotFoundException('Member not found'));
    }

    await this.studyGroupRepository.removeMember(input.groupId, input.targetUserId);
    return ok(undefined);
  }
}
