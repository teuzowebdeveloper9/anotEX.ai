import type { FolderContext, YouTubeVideoResult } from '../entities/study-folder.entity.js';

export interface IYouTubeProvider {
  getRecommendations(context: FolderContext): Promise<YouTubeVideoResult[]>;
}

export const YOUTUBE_PROVIDER = Symbol('IYouTubeProvider');
