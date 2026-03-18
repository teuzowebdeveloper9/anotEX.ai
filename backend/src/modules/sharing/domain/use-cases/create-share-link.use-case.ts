import { Inject, Injectable } from '@nestjs/common';
import { ok, Result } from '../../../../shared/domain/result.js';
import type { ShareLinkEntity, ResourceType } from '../entities/share-link.entity.js';
import { SHARE_LINK_REPOSITORY, type IShareLinkRepository } from '../repositories/share-link.repository.js';

export interface CreateShareLinkInput {
  readonly userId: string;
  readonly resourceType: ResourceType;
  readonly resourceId: string;
}

@Injectable()
export class CreateShareLinkUseCase {
  constructor(
    @Inject(SHARE_LINK_REPOSITORY)
    private readonly shareLinkRepository: IShareLinkRepository,
  ) {}

  async execute(input: CreateShareLinkInput): Promise<Result<ShareLinkEntity>> {
    const shareLink = await this.shareLinkRepository.findOrCreate({
      ownerId: input.userId,
      resourceType: input.resourceType,
      resourceId: input.resourceId,
    });
    return ok(shareLink);
  }
}
