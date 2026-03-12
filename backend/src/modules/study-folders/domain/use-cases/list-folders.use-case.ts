import { Injectable, Inject } from '@nestjs/common';
import { ok, Result } from '../../../../shared/domain/result.js';
import type { StudyFolderEntity } from '../entities/study-folder.entity.js';
import type { IStudyFolderRepository } from '../repositories/study-folder.repository.js';
import { STUDY_FOLDER_REPOSITORY } from '../repositories/study-folder.repository.js';

@Injectable()
export class ListFoldersUseCase {
  constructor(
    @Inject(STUDY_FOLDER_REPOSITORY)
    private readonly repo: IStudyFolderRepository,
  ) {}

  async execute(userId: string): Promise<Result<StudyFolderEntity[]>> {
    const folders = await this.repo.findByUserId(userId);
    return ok(folders);
  }
}
