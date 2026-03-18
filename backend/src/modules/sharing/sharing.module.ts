import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SupabaseService } from '../../shared/infrastructure/config/supabase.config.js';
import { SharingController } from './presentation/controllers/sharing.controller.js';
import { CreateShareLinkUseCase } from './domain/use-cases/create-share-link.use-case.js';
import { ToggleShareVisibilityUseCase } from './domain/use-cases/toggle-share-visibility.use-case.js';
import { GetMyShareLinksUseCase } from './domain/use-cases/get-my-share-links.use-case.js';
import { DeleteShareLinkUseCase } from './domain/use-cases/delete-share-link.use-case.js';
import { GetSharedResourceUseCase } from './domain/use-cases/get-shared-resource.use-case.js';
import { ShareLinkRepositoryImpl } from './infrastructure/repositories/share-link.repository.impl.js';
import { SHARE_LINK_REPOSITORY } from './domain/repositories/share-link.repository.js';
import { AUDIO_REPOSITORY } from '../audio/domain/repositories/audio.repository.js';
import { TRANSCRIPTION_REPOSITORY } from '../transcription/domain/repositories/transcription.repository.js';
import { STUDY_MATERIAL_REPOSITORY } from '../study-materials/domain/repositories/study-material.repository.js';
import { AudioRepositoryImpl } from '../audio/infrastructure/repositories/audio.repository.impl.js';
import { TranscriptionRepositoryImpl } from '../transcription/infrastructure/repositories/transcription.repository.impl.js';
import { StudyMaterialRepositoryImpl } from '../study-materials/infrastructure/repositories/study-material.repository.impl.js';

@Module({
  imports: [ConfigModule],
  controllers: [SharingController],
  providers: [
    SupabaseService,
    CreateShareLinkUseCase,
    ToggleShareVisibilityUseCase,
    GetMyShareLinksUseCase,
    DeleteShareLinkUseCase,
    GetSharedResourceUseCase,
    { provide: SHARE_LINK_REPOSITORY, useClass: ShareLinkRepositoryImpl },
    { provide: AUDIO_REPOSITORY, useClass: AudioRepositoryImpl },
    { provide: TRANSCRIPTION_REPOSITORY, useClass: TranscriptionRepositoryImpl },
    { provide: STUDY_MATERIAL_REPOSITORY, useClass: StudyMaterialRepositoryImpl },
  ],
  exports: [SHARE_LINK_REPOSITORY],
})
export class SharingModule {}
