import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { ConfigModule } from '@nestjs/config';
import { AudioController } from './presentation/controllers/audio.controller.js';
import { UploadAudioUseCase } from './domain/use-cases/upload-audio.use-case.js';
import { GetAudioStatusUseCase } from './domain/use-cases/get-audio-status.use-case.js';
import { AudioRepositoryImpl } from './infrastructure/repositories/audio.repository.impl.js';
import { StorageRepositoryImpl } from './infrastructure/repositories/storage.repository.impl.js';
import { SupabaseAuthGuard } from './presentation/guards/auth.guard.js';
import { AUDIO_REPOSITORY } from './domain/repositories/audio.repository.js';
import { STORAGE_REPOSITORY } from './domain/repositories/storage.repository.js';
import { TRANSCRIPTION_REPOSITORY } from '../transcription/domain/repositories/transcription.repository.js';
import { TranscriptionRepositoryImpl } from '../transcription/infrastructure/repositories/transcription.repository.impl.js';
import { SupabaseService } from '../../shared/infrastructure/config/supabase.config.js';
import { TRANSCRIPTION_QUEUE } from '../transcription/application/services/transcription-queue.processor.js';

@Module({
  imports: [
    ConfigModule,
    BullModule.registerQueue({ name: TRANSCRIPTION_QUEUE }),
  ],
  controllers: [AudioController],
  providers: [
    SupabaseService,
    SupabaseAuthGuard,
    UploadAudioUseCase,
    GetAudioStatusUseCase,
    { provide: AUDIO_REPOSITORY, useClass: AudioRepositoryImpl },
    { provide: STORAGE_REPOSITORY, useClass: StorageRepositoryImpl },
    { provide: TRANSCRIPTION_REPOSITORY, useClass: TranscriptionRepositoryImpl },
  ],
  exports: [
    { provide: AUDIO_REPOSITORY, useClass: AudioRepositoryImpl },
    { provide: STORAGE_REPOSITORY, useClass: StorageRepositoryImpl },
    SupabaseService,
  ],
})
export class AudioModule {}
