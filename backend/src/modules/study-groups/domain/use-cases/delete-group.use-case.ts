import { Inject, Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { ok, fail, Result } from '../../../../shared/domain/result.js';
import { STUDY_GROUP_REPOSITORY, type IStudyGroupRepository } from '../repositories/study-group.repository.js';

export interface DeleteGroupInput {
  readonly groupId: string;
  readonly userId: string;
}

@Injectable()
export class DeleteGroupUseCase {
  constructor(
    @Inject(STUDY_GROUP_REPOSITORY)
    private readonly studyGroupRepository: IStudyGroupRepository,
  ) {}

  async execute(input: DeleteGroupInput): Promise<Result<void>> {
    const group = await this.studyGroupRepository.findGroupById(input.groupId);

    if (!group) {
      return fail(new NotFoundException('Group not found'));
    }

    if (group.ownerId !== input.userId) {
      return fail(new ForbiddenException('Only the group owner can delete it'));
    }

    await this.studyGroupRepository.deleteGroup(input.groupId);
    return ok(undefined);
  }
}
