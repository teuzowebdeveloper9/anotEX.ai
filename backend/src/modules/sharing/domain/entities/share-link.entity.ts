export type ResourceType = 'transcription' | 'audio' | 'study_material' | 'study_folder';

export interface ShareLinkEntity {
  readonly id: string;
  readonly token: string;
  readonly ownerId: string;
  readonly resourceType: ResourceType;
  readonly resourceId: string;
  readonly isPublic: boolean;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export interface CreateShareLinkProps {
  readonly ownerId: string;
  readonly resourceType: ResourceType;
  readonly resourceId: string;
}
