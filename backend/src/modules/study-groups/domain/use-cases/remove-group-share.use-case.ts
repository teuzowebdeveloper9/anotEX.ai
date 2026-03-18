import { Inject, Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { ok, fail, Result } from '../../../../shared/domain/result.js';
import { STUDY_GROUP_REPOSITORY, type IStudyGroupRepository } from '../repositories/study-group.repository.js';

export interface RemoveGroupShareInput {
  readonly groupId: string;
  readonly shareLinkId: string;
  readonly requestingUserId: string;
}

@Injectable()
export class RemoveGroupShareUseCase {
  constructor(
    @Inject(STUDY_GROUP_REPOSITORY)
    private readonly studyGroupRepository: IStudyGroupRepository,
  ) {}

  async execute(input: RemoveGroupShareInput): Promise<Result<void>> {
    const group = await this.studyGroupRepository.findGroupById(input.groupId);

    if (!group) {
      return fail(new NotFoundException('Group not found'));
    }

    const member = await this.studyGroupRepository.findMember(input.groupId, input.requestingUserId);

    if (!member) {
      return fail(new ForbiddenException('You are not a member of this group'));
    }

    const shares = await this.studyGroupRepository.findShares(input.groupId);
    const share = shares.find((s) => s.sharedLinkId === input.shareLinkId);

    if (!share) {
      return fail(new NotFoundException('Share not found'));
    }

    const isOwner = group.ownerId === input.requestingUserId;
    const isSharer = share.sharedBy === input.requestingUserId;

    if (!isOwner && !isSharer) {
      return fail(new ForbiddenException('Access denied'));
    }

    await this.studyGroupRepository.removeShare(input.groupId, input.shareLinkId);
    return ok(undefined);
  }
}
