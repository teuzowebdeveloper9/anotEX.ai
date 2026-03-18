export type GroupRole = 'owner' | 'member';

export interface StudyGroupEntity {
  readonly id: string;
  readonly name: string;
  readonly description: string | null;
  readonly ownerId: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export interface GroupMemberEntity {
  readonly id: string;
  readonly groupId: string;
  readonly userId: string;
  readonly userEmail: string;
  readonly role: GroupRole;
  readonly joinedAt: Date;
}

export interface GroupShareEntity {
  readonly id: string;
  readonly groupId: string;
  readonly sharedLinkId: string;
  readonly sharedBy: string;
  readonly sharedAt: Date;
  // Join data from shared_links
  readonly shareToken: string;
  readonly resourceType: string;
  readonly resourceId: string;
  readonly isPublic: boolean;
  readonly ownerEmail: string | null;
  // Optional: enriched resource title
  readonly resourceTitle: string | null;
}

export interface CreateGroupProps {
  readonly name: string;
  readonly description: string | null;
  readonly ownerId: string;
}

export interface GroupWithMemberCount extends StudyGroupEntity {
  readonly memberCount: number;
  readonly shareCount: number;
  readonly role: GroupRole;
}
