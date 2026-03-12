export type FolderItemType = 'SUMMARY' | 'TRANSCRIPTION' | 'FLASHCARDS' | 'MINDMAP'

export const FOLDER_ITEM_TYPE_LABELS: Record<FolderItemType, string> = {
  SUMMARY: 'Resumo',
  TRANSCRIPTION: 'Transcrição',
  FLASHCARDS: 'Flashcards',
  MINDMAP: 'Mapa Mental',
}

export const FOLDER_ITEM_TYPE_TAB: Record<FolderItemType, string> = {
  SUMMARY: 'resumo',
  TRANSCRIPTION: 'transcricao',
  FLASHCARDS: 'flashcards',
  MINDMAP: 'mapa-mental',
}

export interface StudyFolder {
  id: string
  userId: string
  name: string
  description: string | null
  itemCount: number
  recommendationsUnlocked: boolean
  createdAt: string
  updatedAt: string
}

export interface StudyFolderItem {
  id: string
  folderId: string
  userId: string
  transcriptionId: string
  audioId: string
  itemType: FolderItemType
  title: string
  createdAt: string
}

export interface YouTubeVideo {
  videoId: string
  title: string
  channelTitle: string
  thumbnail: string
  publishedAt: string
  description: string
}

export interface FolderWithItems {
  folder: StudyFolder
  items: StudyFolderItem[]
}
