import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { ConfigModule } from '@nestjs/config';
import { TranscriptionQueueProcessor, TRANSCRIPTION_QUEUE } from './application/services/transcription-queue.processor.js';
import { ProcessTranscriptionUseCase } from './domain/use-cases/process-transcription.use-case.js';
import { GetTranscriptionUseCase } from './domain/use-cases/get-transcription.use-case.js';
import { TranscriptionRepositoryImpl } from './infrastructure/repositories/transcription.repository.impl.js';
import { OpenAiWhisperProviderImpl } from './infrastructure/providers/openai-whisper.provider.impl.js';
import { OpenAiGptProviderImpl } from './infrastructure/providers/openai-gpt.provider.impl.js';
import { TRANSCRIPTION_REPOSITORY } from './domain/repositories/transcription.repository.js';
import { TRANSCRIPTION_PROVIDER, SUMMARY_PROVIDER } from './domain/repositories/transcription.provider.js';
import { AUDIO_REPOSITORY } from '../audio/domain/repositories/audio.repository.js';
import { STORAGE_REPOSITORY } from '../audio/domain/repositories/storage.repository.js';
import { AudioRepositoryImpl } from '../audio/infrastructure/repositories/audio.repository.impl.js';
import { AzureBlobStorageRepositoryImpl } from '../audio/infrastructure/repositories/azure-blob-storage.repository.impl.js';
import { TranscriptionController } from './presentation/controllers/transcription.controller.js';

@Module({
  imports: [
    ConfigModule,
    BullModule.registerQueue({ name: TRANSCRIPTION_QUEUE }),
    BullModule.registerQueue({ name: 'study-material' }),
  ],
  controllers: [TranscriptionController],
  providers: [
    TranscriptionQueueProcessor,
    ProcessTranscriptionUseCase,
    GetTranscriptionUseCase,
    { provide: TRANSCRIPTION_REPOSITORY, useClass: TranscriptionRepositoryImpl },
    { provide: AUDIO_REPOSITORY, useClass: AudioRepositoryImpl },
    { provide: STORAGE_REPOSITORY, useClass: AzureBlobStorageRepositoryImpl },
    { provide: TRANSCRIPTION_PROVIDER, useClass: OpenAiWhisperProviderImpl },
    { provide: SUMMARY_PROVIDER, useClass: OpenAiGptProviderImpl },
  ],
  exports: [GetTranscriptionUseCase],
})
export class TranscriptionModule {}
