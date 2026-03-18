import { Inject, Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { ok, fail, Result } from '../../../../shared/domain/result.js';
import { SHARE_LINK_REPOSITORY, type IShareLinkRepository } from '../repositories/share-link.repository.js';

export interface DeleteShareLinkInput {
  readonly shareLinkId: string;
  readonly userId: string;
}

@Injectable()
export class DeleteShareLinkUseCase {
  constructor(
    @Inject(SHARE_LINK_REPOSITORY)
    private readonly shareLinkRepository: IShareLinkRepository,
  ) {}

  async execute(input: DeleteShareLinkInput): Promise<Result<void>> {
    const shareLink = await this.shareLinkRepository.findById(input.shareLinkId);

    if (!shareLink) {
      return fail(new NotFoundException('Share link not found'));
    }

    if (shareLink.ownerId !== input.userId) {
      return fail(new ForbiddenException('Access denied'));
    }

    await this.shareLinkRepository.delete(input.shareLinkId);
    return ok(undefined);
  }
}
