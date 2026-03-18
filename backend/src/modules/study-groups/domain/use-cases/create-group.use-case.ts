import { Inject, Injectable } from '@nestjs/common';
import { ok, Result } from '../../../../shared/domain/result.js';
import type { StudyGroupEntity } from '../entities/study-group.entity.js';
import { STUDY_GROUP_REPOSITORY, type IStudyGroupRepository } from '../repositories/study-group.repository.js';

export interface CreateGroupInput {
  readonly name: string;
  readonly description: string | null;
  readonly userId: string;
}

@Injectable()
export class CreateGroupUseCase {
  constructor(
    @Inject(STUDY_GROUP_REPOSITORY)
    private readonly studyGroupRepository: IStudyGroupRepository,
  ) {}

  async execute(input: CreateGroupInput): Promise<Result<StudyGroupEntity>> {
    const group = await this.studyGroupRepository.createGroup({
      name: input.name,
      description: input.description,
      ownerId: input.userId,
    });

    // Owner is also a member with role 'owner'
    await this.studyGroupRepository.addMember(group.id, input.userId, 'owner');

    return ok(group);
  }
}
