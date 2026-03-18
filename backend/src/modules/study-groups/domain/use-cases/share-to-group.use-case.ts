import { Inject, Injectable, ForbiddenException, NotFoundException, ConflictException } from '@nestjs/common';
import { ok, fail, Result } from '../../../../shared/domain/result.js';
import type { GroupShareEntity } from '../entities/study-group.entity.js';
import { STUDY_GROUP_REPOSITORY, type IStudyGroupRepository } from '../repositories/study-group.repository.js';
import { SHARE_LINK_REPOSITORY, type IShareLinkRepository } from '../../../sharing/domain/repositories/share-link.repository.js';

export interface ShareToGroupInput {
  readonly groupId: string;
  readonly shareLinkId: string;
  readonly requestingUserId: string;
}

@Injectable()
export class ShareToGroupUseCase {
  constructor(
    @Inject(STUDY_GROUP_REPOSITORY)
    private readonly studyGroupRepository: IStudyGroupRepository,
    @Inject(SHARE_LINK_REPOSITORY)
    private readonly shareLinkRepository: IShareLinkRepository,
  ) {}

  async execute(input: ShareToGroupInput): Promise<Result<GroupShareEntity>> {
    const group = await this.studyGroupRepository.findGroupById(input.groupId);

    if (!group) {
      return fail(new NotFoundException('Group not found'));
    }

    const member = await this.studyGroupRepository.findMember(input.groupId, input.requestingUserId);

    if (!member) {
      return fail(new ForbiddenException('You are not a member of this group'));
    }

    const shareLink = await this.shareLinkRepository.findById(input.shareLinkId);

    if (!shareLink) {
      return fail(new NotFoundException('Share link not found'));
    }

    if (shareLink.ownerId !== input.requestingUserId) {
      return fail(new ForbiddenException('You can only share your own links'));
    }

    // Ensure the link is public before sharing to group
    if (!shareLink.isPublic) {
      await this.shareLinkRepository.updateVisibility(input.shareLinkId, true);
    }

    try {
      const groupShare = await this.studyGroupRepository.addShare(
        input.groupId,
        input.shareLinkId,
        input.requestingUserId,
      );
      return ok(groupShare);
    } catch (err) {
      if (err instanceof Error && err.message.includes('duplicate')) {
        return fail(new ConflictException('This resource is already shared in this group'));
      }
      throw err;
    }
  }
}
