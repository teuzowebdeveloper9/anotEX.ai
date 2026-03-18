export type ResourceType = 'transcription' | 'audio' | 'study_material'

export interface ShareLink {
  id: string
  token: string
  ownerId: string
  resourceType: ResourceType
  resourceId: string
  isPublic: boolean
  createdAt: string
  updatedAt: string
}
