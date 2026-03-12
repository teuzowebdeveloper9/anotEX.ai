import { Injectable, Inject, NotFoundException, ForbiddenException } from '@nestjs/common';
import { ok, fail, Result } from '../../../../shared/domain/result.js';
import type { IStudyFolderRepository } from '../repositories/study-folder.repository.js';
import { STUDY_FOLDER_REPOSITORY } from '../repositories/study-folder.repository.js';

@Injectable()
export class DeleteFolderUseCase {
  constructor(
    @Inject(STUDY_FOLDER_REPOSITORY)
    private readonly repo: IStudyFolderRepository,
  ) {}

  async execute(input: {
    folderId: string;
    userId: string;
  }): Promise<Result<void>> {
    const folder = await this.repo.findById(input.folderId);
    if (!folder) return fail(new NotFoundException('Pasta não encontrada'));
    if (folder.userId !== input.userId) return fail(new ForbiddenException('Acesso negado'));

    await this.repo.deleteById(input.folderId);
    return ok(undefined);
  }
}
