import { Injectable, Inject, NotFoundException, ForbiddenException } from '@nestjs/common';
import { ok, fail, Result } from '../../../../shared/domain/result.js';
import type { StudyFolderEntity } from '../entities/study-folder.entity.js';
import type { IStudyFolderRepository } from '../repositories/study-folder.repository.js';
import { STUDY_FOLDER_REPOSITORY } from '../repositories/study-folder.repository.js';

@Injectable()
export class UpdateFolderUseCase {
  constructor(
    @Inject(STUDY_FOLDER_REPOSITORY)
    private readonly repo: IStudyFolderRepository,
  ) {}

  async execute(input: {
    folderId: string;
    userId: string;
    name?: string;
    description?: string | null;
  }): Promise<Result<StudyFolderEntity>> {
    const folder = await this.repo.findById(input.folderId);
    if (!folder) return fail(new NotFoundException('Pasta não encontrada'));
    if (folder.userId !== input.userId) return fail(new ForbiddenException('Acesso negado'));

    const updated = await this.repo.update(input.folderId, {
      name: input.name?.trim(),
      description: input.description,
    });
    return ok(updated);
  }
}
