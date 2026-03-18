export type GroupRole = 'owner' | 'member'

export interface StudyGroup {
  id: string
  name: string
  description: string | null
  ownerId: string
  createdAt: string
  updatedAt: string
}

export interface GroupWithMeta extends StudyGroup {
  memberCount: number
  shareCount: number
  role: GroupRole
}

export interface GroupMember {
  id: string
  groupId: string
  userId: string
  userEmail: string
  role: GroupRole
  joinedAt: string
}

export interface GroupShare {
  id: string
  groupId: string
  sharedLinkId: string
  sharedBy: string
  sharedAt: string
  shareToken: string
  resourceType: string
  resourceId: string
  isPublic: boolean
  ownerEmail: string | null
  resourceTitle: string | null
}

export interface GroupDetail {
  group: StudyGroup
  members: GroupMember[]
  shares: GroupShare[]
}
