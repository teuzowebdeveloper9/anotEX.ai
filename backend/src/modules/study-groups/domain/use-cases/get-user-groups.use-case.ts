import { Inject, Injectable } from '@nestjs/common';
import { ok, Result } from '../../../../shared/domain/result.js';
import type { GroupWithMemberCount } from '../entities/study-group.entity.js';
import { STUDY_GROUP_REPOSITORY, type IStudyGroupRepository } from '../repositories/study-group.repository.js';

@Injectable()
export class GetUserGroupsUseCase {
  constructor(
    @Inject(STUDY_GROUP_REPOSITORY)
    private readonly studyGroupRepository: IStudyGroupRepository,
  ) {}

  async execute(userId: string): Promise<Result<GroupWithMemberCount[]>> {
    const groups = await this.studyGroupRepository.findGroupsByUserId(userId);
    return ok(groups);
  }
}
