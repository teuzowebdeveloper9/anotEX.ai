import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { StudyFolderController } from './presentation/controllers/study-folder.controller.js';
import { CreateFolderUseCase } from './domain/use-cases/create-folder.use-case.js';
import { ListFoldersUseCase } from './domain/use-cases/list-folders.use-case.js';
import { GetFolderUseCase } from './domain/use-cases/get-folder.use-case.js';
import { UpdateFolderUseCase } from './domain/use-cases/update-folder.use-case.js';
import { DeleteFolderUseCase } from './domain/use-cases/delete-folder.use-case.js';
import { AddItemToFolderUseCase } from './domain/use-cases/add-item-to-folder.use-case.js';
import { RemoveItemFromFolderUseCase } from './domain/use-cases/remove-item-from-folder.use-case.js';
import { GetFolderRecommendationsUseCase } from './domain/use-cases/get-folder-recommendations.use-case.js';
import { StudyFolderRepositoryImpl } from './infrastructure/repositories/study-folder.repository.impl.js';
import { YouTubeProviderImpl } from './infrastructure/providers/youtube.provider.impl.js';
import { STUDY_FOLDER_REPOSITORY } from './domain/repositories/study-folder.repository.js';
import { YOUTUBE_PROVIDER } from './domain/repositories/youtube.provider.js';
import { TRANSCRIPTION_REPOSITORY } from '../transcription/domain/repositories/transcription.repository.js';
import { TranscriptionRepositoryImpl } from '../transcription/infrastructure/repositories/transcription.repository.impl.js';
import { SupabaseService } from '../../shared/infrastructure/config/supabase.config.js';

@Module({
  imports: [ConfigModule],
  controllers: [StudyFolderController],
  providers: [
    SupabaseService,
    CreateFolderUseCase,
    ListFoldersUseCase,
    GetFolderUseCase,
    UpdateFolderUseCase,
    DeleteFolderUseCase,
    AddItemToFolderUseCase,
    RemoveItemFromFolderUseCase,
    GetFolderRecommendationsUseCase,
    { provide: STUDY_FOLDER_REPOSITORY, useClass: StudyFolderRepositoryImpl },
    { provide: YOUTUBE_PROVIDER, useClass: YouTubeProviderImpl },
    { provide: TRANSCRIPTION_REPOSITORY, useClass: TranscriptionRepositoryImpl },
  ],
})
export class StudyFolderModule {}
