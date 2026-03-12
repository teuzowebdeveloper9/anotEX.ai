import { Injectable, Inject, NotFoundException, ForbiddenException } from '@nestjs/common';
import { ok, fail, Result } from '../../../../shared/domain/result.js';
import type { IStudyFolderRepository } from '../repositories/study-folder.repository.js';
import { STUDY_FOLDER_REPOSITORY } from '../repositories/study-folder.repository.js';

@Injectable()
export class RemoveItemFromFolderUseCase {
  constructor(
    @Inject(STUDY_FOLDER_REPOSITORY)
    private readonly repo: IStudyFolderRepository,
  ) {}

  async execute(input: { itemId: string; userId: string }): Promise<Result<void>> {
    const item = await this.repo.findItemById(input.itemId);
    if (!item) return fail(new NotFoundException('Item não encontrado'));
    if (item.userId !== input.userId) return fail(new ForbiddenException('Acesso negado'));

    await this.repo.removeItem(input.itemId);
    return ok(undefined);
  }
}
