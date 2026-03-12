import {
  Injectable,
  Inject,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { ok, fail, Result } from '../../../../shared/domain/result.js';
import type { YouTubeVideoResult } from '../entities/study-folder.entity.js';
import type { IStudyFolderRepository } from '../repositories/study-folder.repository.js';
import { STUDY_FOLDER_REPOSITORY } from '../repositories/study-folder.repository.js';
import type { IYouTubeProvider } from '../repositories/youtube.provider.js';
import { YOUTUBE_PROVIDER } from '../repositories/youtube.provider.js';
import type { ITranscriptionRepository } from '../../../transcription/domain/repositories/transcription.repository.js';
import { TRANSCRIPTION_REPOSITORY } from '../../../transcription/domain/repositories/transcription.repository.js';

@Injectable()
export class GetFolderRecommendationsUseCase {
  constructor(
    @Inject(STUDY_FOLDER_REPOSITORY)
    private readonly folderRepo: IStudyFolderRepository,
    @Inject(TRANSCRIPTION_REPOSITORY)
    private readonly transcriptionRepo: ITranscriptionRepository,
    @Inject(YOUTUBE_PROVIDER)
    private readonly youtubeProvider: IYouTubeProvider,
  ) {}

  async execute(input: {
    folderId: string;
    userId: string;
  }): Promise<Result<YouTubeVideoResult[]>> {
    const folder = await this.folderRepo.findById(input.folderId);
    if (!folder) return fail(new NotFoundException('Pasta não encontrada'));
    if (folder.userId !== input.userId) return fail(new ForbiddenException('Acesso negado'));
    if (!folder.recommendationsUnlocked) {
      return fail(
        new BadRequestException(
          'Adicione pelo menos 5 materiais para desbloquear as recomendações',
        ),
      );
    }

    const items = await this.folderRepo.findItemsByFolderId(input.folderId);
    const uniqueTranscriptionIds = [...new Set(items.map((i) => i.transcriptionId))];

    const materials: string[] = [];
    for (const transcriptionId of uniqueTranscriptionIds.slice(0, 5)) {
      const transcription = await this.transcriptionRepo.findById(transcriptionId);
      if (transcription?.summaryText) {
        materials.push(transcription.summaryText);
      } else if (transcription?.transcriptionText) {
        materials.push(transcription.transcriptionText.slice(0, 500));
      }
    }

    const videos = await this.youtubeProvider.getRecommendations({
      folderName: folder.name,
      folderDescription: folder.description,
      materials,
    });

    return ok(videos);
  }
}
