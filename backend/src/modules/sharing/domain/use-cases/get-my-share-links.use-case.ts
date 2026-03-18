import { Inject, Injectable } from '@nestjs/common';
import { ok, Result } from '../../../../shared/domain/result.js';
import type { ShareLinkEntity } from '../entities/share-link.entity.js';
import { SHARE_LINK_REPOSITORY, type IShareLinkRepository } from '../repositories/share-link.repository.js';

@Injectable()
export class GetMyShareLinksUseCase {
  constructor(
    @Inject(SHARE_LINK_REPOSITORY)
    private readonly shareLinkRepository: IShareLinkRepository,
  ) {}

  async execute(userId: string): Promise<Result<ShareLinkEntity[]>> {
    const links = await this.shareLinkRepository.findByOwnerId(userId);
    return ok(links);
  }
}
