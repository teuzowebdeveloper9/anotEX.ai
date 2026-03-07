import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { ConfigModule } from '@nestjs/config';
import { StudyMaterialQueueProcessor, STUDY_MATERIAL_QUEUE } from './application/services/study-material-queue.processor.js';
import { GenerateStudyMaterialsUseCase } from './domain/use-cases/generate-study-materials.use-case.js';
import { GetStudyMaterialsUseCase } from './domain/use-cases/get-study-materials.use-case.js';
import { StudyMaterialRepositoryImpl } from './infrastructure/repositories/study-material.repository.impl.js';
import { GroqStudyMaterialProviderImpl } from './infrastructure/providers/groq-study-material.provider.impl.js';
import { StudyMaterialController } from './presentation/controllers/study-material.controller.js';
import { STUDY_MATERIAL_REPOSITORY } from './domain/repositories/study-material.repository.js';
import { STUDY_MATERIAL_PROVIDER } from './domain/repositories/study-material.provider.js';
import { TRANSCRIPTION_REPOSITORY } from '../transcription/domain/repositories/transcription.repository.js';
import { TranscriptionRepositoryImpl } from '../transcription/infrastructure/repositories/transcription.repository.impl.js';
import { SupabaseService } from '../../shared/infrastructure/config/supabase.config.js';

@Module({
  imports: [
    ConfigModule,
    BullModule.registerQueue({ name: STUDY_MATERIAL_QUEUE }),
  ],
  controllers: [StudyMaterialController],
  providers: [
    SupabaseService,
    GenerateStudyMaterialsUseCase,
    GetStudyMaterialsUseCase,
    StudyMaterialQueueProcessor,
    { provide: STUDY_MATERIAL_REPOSITORY, useClass: StudyMaterialRepositoryImpl },
    { provide: STUDY_MATERIAL_PROVIDER, useClass: GroqStudyMaterialProviderImpl },
    { provide: TRANSCRIPTION_REPOSITORY, useClass: TranscriptionRepositoryImpl },
  ],
})
export class StudyMaterialModule {}
