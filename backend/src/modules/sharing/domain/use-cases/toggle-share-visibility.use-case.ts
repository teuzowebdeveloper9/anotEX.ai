import { Inject, Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { ok, fail, Result } from '../../../../shared/domain/result.js';
import type { ShareLinkEntity } from '../entities/share-link.entity.js';
import { SHARE_LINK_REPOSITORY, type IShareLinkRepository } from '../repositories/share-link.repository.js';

export interface ToggleShareVisibilityInput {
  readonly shareLinkId: string;
  readonly userId: string;
  readonly isPublic: boolean;
}

@Injectable()
export class ToggleShareVisibilityUseCase {
  constructor(
    @Inject(SHARE_LINK_REPOSITORY)
    private readonly shareLinkRepository: IShareLinkRepository,
  ) {}

  async execute(input: ToggleShareVisibilityInput): Promise<Result<ShareLinkEntity>> {
    const shareLink = await this.shareLinkRepository.findById(input.shareLinkId);

    if (!shareLink) {
      return fail(new NotFoundException('Share link not found'));
    }

    if (shareLink.ownerId !== input.userId) {
      return fail(new ForbiddenException('Access denied'));
    }

    const updated = await this.shareLinkRepository.updateVisibility(input.shareLinkId, input.isPublic);
    return ok(updated);
  }
}
