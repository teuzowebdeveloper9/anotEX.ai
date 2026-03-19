export enum FolderItemType {
  SUMMARY = 'SUMMARY',
  TRANSCRIPTION = 'TRANSCRIPTION',
  FLASHCARDS = 'FLASHCARDS',
  MINDMAP = 'MINDMAP',
  QUIZ = 'QUIZ',
}

export const RECOMMENDATIONS_THRESHOLD = 5;

export interface StudyFolderEntity {
  readonly id: string;
  readonly userId: string;
  readonly name: string;
  readonly description: string | null;
  readonly itemCount: number;
  readonly recommendationsUnlocked: boolean;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export interface StudyFolderItemEntity {
  readonly id: string;
  readonly folderId: string;
  readonly userId: string;
  readonly transcriptionId: string;
  readonly audioId: string;
  readonly itemType: FolderItemType;
  readonly title: string;
  readonly createdAt: Date;
}

export interface YouTubeVideoResult {
  readonly videoId: string;
  readonly title: string;
  readonly channelTitle: string;
  readonly thumbnail: string;
  readonly publishedAt: string;
  readonly description: string;
}

export interface FolderContext {
  readonly folderName: string;
  readonly folderDescription: string | null;
  readonly materials: string[];
}

export interface CreateFolderProps {
  readonly userId: string;
  readonly name: string;
  readonly description?: string;
}

export interface AddItemProps {
  readonly folderId: string;
  readonly userId: string;
  readonly transcriptionId: string;
  readonly audioId: string;
  readonly itemType: FolderItemType;
  readonly title: string;
}
