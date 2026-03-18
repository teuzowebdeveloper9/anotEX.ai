import { Inject, Injectable, ForbiddenException, NotFoundException, ConflictException } from '@nestjs/common';
import { ok, fail, Result } from '../../../../shared/domain/result.js';
import type { GroupMemberEntity } from '../entities/study-group.entity.js';
import { STUDY_GROUP_REPOSITORY, type IStudyGroupRepository } from '../repositories/study-group.repository.js';

export interface AddGroupMemberInput {
  readonly groupId: string;
  readonly requestingUserId: string;
  readonly memberEmail: string;
}

@Injectable()
export class AddGroupMemberUseCase {
  constructor(
    @Inject(STUDY_GROUP_REPOSITORY)
    private readonly studyGroupRepository: IStudyGroupRepository,
  ) {}

  async execute(input: AddGroupMemberInput): Promise<Result<GroupMemberEntity>> {
    const group = await this.studyGroupRepository.findGroupById(input.groupId);

    if (!group) {
      return fail(new NotFoundException('Group not found'));
    }

    if (group.ownerId !== input.requestingUserId) {
      return fail(new ForbiddenException('Only the group owner can add members'));
    }

    const targetUserId = await this.studyGroupRepository.findUserIdByEmail(input.memberEmail);

    if (!targetUserId) {
      return fail(new NotFoundException(`No user found with email ${input.memberEmail}`));
    }

    const existing = await this.studyGroupRepository.findMember(input.groupId, targetUserId);

    if (existing) {
      return fail(new ConflictException('User is already a member of this group'));
    }

    const member = await this.studyGroupRepository.addMember(input.groupId, targetUserId, 'member');
    return ok(member);
  }
}
