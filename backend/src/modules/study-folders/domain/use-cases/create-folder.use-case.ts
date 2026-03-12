import { Injectable, Inject } from '@nestjs/common';
import { ok, Result } from '../../../../shared/domain/result.js';
import type { StudyFolderEntity } from '../entities/study-folder.entity.js';
import type { IStudyFolderRepository } from '../repositories/study-folder.repository.js';
import { STUDY_FOLDER_REPOSITORY } from '../repositories/study-folder.repository.js';

export interface CreateFolderInput {
  userId: string;
  name: string;
  description?: string;
}

@Injectable()
export class CreateFolderUseCase {
  constructor(
    @Inject(STUDY_FOLDER_REPOSITORY)
    private readonly repo: IStudyFolderRepository,
  ) {}

  async execute(input: CreateFolderInput): Promise<Result<StudyFolderEntity>> {
    const folder = await this.repo.create({
      userId: input.userId,
      name: input.name.trim(),
      description: input.description?.trim(),
    });
    return ok(folder);
  }
}
