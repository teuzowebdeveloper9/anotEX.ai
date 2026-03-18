import type { CreateShareLinkProps, ShareLinkEntity } from '../entities/share-link.entity.js';

export const SHARE_LINK_REPOSITORY = Symbol('IShareLinkRepository');

export interface IShareLinkRepository {
  findOrCreate(props: CreateShareLinkProps): Promise<ShareLinkEntity>;
  findByToken(token: string): Promise<ShareLinkEntity | null>;
  findByOwnerId(ownerId: string): Promise<ShareLinkEntity[]>;
  findById(id: string): Promise<ShareLinkEntity | null>;
  updateVisibility(id: string, isPublic: boolean): Promise<ShareLinkEntity>;
  delete(id: string): Promise<void>;
}
