import { Module } from '@nestjs/common';
import { UserController } from './presentation/controllers/user.controller.js';
import { DeleteAccountUseCase } from './domain/use-cases/delete-account.use-case.js';
import { ExportUserDataUseCase } from './domain/use-cases/export-user-data.use-case.js';
import { SupabaseService } from '../../shared/infrastructure/config/supabase.config.js';
import { AUDIO_REPOSITORY } from '../audio/domain/repositories/audio.repository.js';
import { AudioRepositoryImpl } from '../audio/infrastructure/repositories/audio.repository.impl.js';
import { STORAGE_REPOSITORY } from '../audio/domain/repositories/storage.repository.js';
import { StorageRepositoryImpl } from '../audio/infrastructure/repositories/storage.repository.impl.js';
import { TRANSCRIPTION_REPOSITORY } from '../transcription/domain/repositories/transcription.repository.js';
import { TranscriptionRepositoryImpl } from '../transcription/infrastructure/repositories/transcription.repository.impl.js';

@Module({
  controllers: [UserController],
  providers: [
    SupabaseService,
    DeleteAccountUseCase,
    ExportUserDataUseCase,
    { provide: AUDIO_REPOSITORY, useClass: AudioRepositoryImpl },
    { provide: STORAGE_REPOSITORY, useClass: StorageRepositoryImpl },
    { provide: TRANSCRIPTION_REPOSITORY, useClass: TranscriptionRepositoryImpl },
  ],
})
export class UserModule {}
