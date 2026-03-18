import { Inject, Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { ok, fail, Result } from '../../../../shared/domain/result.js';
import type { GroupMemberEntity, GroupShareEntity, StudyGroupEntity } from '../entities/study-group.entity.js';
import { STUDY_GROUP_REPOSITORY, type IStudyGroupRepository } from '../repositories/study-group.repository.js';

export interface GroupDetailData {
  readonly group: StudyGroupEntity;
  readonly members: GroupMemberEntity[];
  readonly shares: GroupShareEntity[];
}

@Injectable()
export class GetGroupDetailUseCase {
  constructor(
    @Inject(STUDY_GROUP_REPOSITORY)
    private readonly studyGroupRepository: IStudyGroupRepository,
  ) {}

  async execute(groupId: string, userId: string): Promise<Result<GroupDetailData>> {
    const group = await this.studyGroupRepository.findGroupById(groupId);

    if (!group) {
      return fail(new NotFoundException('Group not found'));
    }

    const member = await this.studyGroupRepository.findMember(groupId, userId);

    if (!member) {
      return fail(new ForbiddenException('You are not a member of this group'));
    }

    const [members, shares] = await Promise.all([
      this.studyGroupRepository.findMembers(groupId),
      this.studyGroupRepository.findShares(groupId),
    ]);

    return ok({ group, members, shares });
  }
}
