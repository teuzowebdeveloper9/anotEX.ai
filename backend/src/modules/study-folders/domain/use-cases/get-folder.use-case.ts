import { Injectable, Inject, NotFoundException, ForbiddenException } from '@nestjs/common';
import { ok, fail, Result } from '../../../../shared/domain/result.js';
import type { StudyFolderEntity, StudyFolderItemEntity } from '../entities/study-folder.entity.js';
import type { IStudyFolderRepository } from '../repositories/study-folder.repository.js';
import { STUDY_FOLDER_REPOSITORY } from '../repositories/study-folder.repository.js';

export interface GetFolderOutput {
  folder: StudyFolderEntity;
  items: StudyFolderItemEntity[];
}

@Injectable()
export class GetFolderUseCase {
  constructor(
    @Inject(STUDY_FOLDER_REPOSITORY)
    private readonly repo: IStudyFolderRepository,
  ) {}

  async execute(input: {
    folderId: string;
    userId: string;
  }): Promise<Result<GetFolderOutput>> {
    const folder = await this.repo.findById(input.folderId);
    if (!folder) return fail(new NotFoundException('Pasta não encontrada'));
    if (folder.userId !== input.userId) return fail(new ForbiddenException('Acesso negado'));

    const items = await this.repo.findItemsByFolderId(input.folderId);
    return ok({ folder, items });
  }
}
