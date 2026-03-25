import { Inject, Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { ok, fail, Result } from '../../../../shared/domain/result.js';
import { STUDY_GROUP_REPOSITORY, type IStudyGroupRepository } from '../repositories/study-group.repository.js';
import type { StudyGroupEntity } from '../entities/study-group.entity.js';

export interface UpdateGroupInput {
  readonly groupId: string;
  readonly userId: string;
  readonly name?: string;
  readonly description?: string;
}

@Injectable()
export class UpdateGroupUseCase {
  constructor(
    @Inject(STUDY_GROUP_REPOSITORY)
    private readonly studyGroupRepository: IStudyGroupRepository,
  ) {}

  async execute(input: UpdateGroupInput): Promise<Result<StudyGroupEntity>> {
    const group = await this.studyGroupRepository.findGroupById(input.groupId);

    if (!group) {
      return fail(new NotFoundException('Group not found'));
    }

    if (group.ownerId !== input.userId) {
      return fail(new ForbiddenException('Only the group owner can update it'));
    }

    const name = input.name ?? group.name;
    const description = input.description !== undefined ? input.description : group.description;

    const updated = await this.studyGroupRepository.updateGroup(input.groupId, name, description);
    return ok(updated);
  }
}
