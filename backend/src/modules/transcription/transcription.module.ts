import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { ConfigModule } from '@nestjs/config';
import { TranscriptionQueueProcessor, TRANSCRIPTION_QUEUE } from './application/services/transcription-queue.processor.js';
import { ProcessTranscriptionUseCase } from './domain/use-cases/process-transcription.use-case.js';
import { GetTranscriptionUseCase } from './domain/use-cases/get-transcription.use-case.js';
import { TranscriptionRepositoryImpl } from './infrastructure/repositories/transcription.repository.impl.js';
import { GroqWhisperProviderImpl } from './infrastructure/providers/groq-whisper.provider.impl.js';
import { GroqLlamaProviderImpl } from './infrastructure/providers/groq-llama.provider.impl.js';
import { TRANSCRIPTION_REPOSITORY } from './domain/repositories/transcription.repository.js';
import { TRANSCRIPTION_PROVIDER, SUMMARY_PROVIDER } from './domain/repositories/transcription.provider.js';
import { AUDIO_REPOSITORY } from '../audio/domain/repositories/audio.repository.js';
import { STORAGE_REPOSITORY } from '../audio/domain/repositories/storage.repository.js';
import { AudioRepositoryImpl } from '../audio/infrastructure/repositories/audio.repository.impl.js';
import { StorageRepositoryImpl } from '../audio/infrastructure/repositories/storage.repository.impl.js';
import { SupabaseService } from '../../shared/infrastructure/config/supabase.config.js';

@Module({
  imports: [
    ConfigModule,
    BullModule.registerQueue({ name: TRANSCRIPTION_QUEUE }),
  ],
  providers: [
    SupabaseService,
    TranscriptionQueueProcessor,
    ProcessTranscriptionUseCase,
    GetTranscriptionUseCase,
    { provide: TRANSCRIPTION_REPOSITORY, useClass: TranscriptionRepositoryImpl },
    { provide: AUDIO_REPOSITORY, useClass: AudioRepositoryImpl },
    { provide: STORAGE_REPOSITORY, useClass: StorageRepositoryImpl },
    { provide: TRANSCRIPTION_PROVIDER, useClass: GroqWhisperProviderImpl },
    { provide: SUMMARY_PROVIDER, useClass: GroqLlamaProviderImpl },
  ],
  exports: [GetTranscriptionUseCase],
})
export class TranscriptionModule {}
