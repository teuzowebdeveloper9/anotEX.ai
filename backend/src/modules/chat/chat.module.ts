import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SupabaseService } from '../../shared/infrastructure/config/supabase.config.js';
import { TranscriptionRepositoryImpl } from '../transcription/infrastructure/repositories/transcription.repository.impl.js';
import { TRANSCRIPTION_REPOSITORY } from '../transcription/domain/repositories/transcription.repository.js';
import { ChatController } from './presentation/controllers/chat.controller.js';
import { SendMessageUseCase } from './domain/use-cases/send-message.use-case.js';
import { GetChatHistoryUseCase } from './domain/use-cases/get-chat-history.use-case.js';
import { ClearChatHistoryUseCase } from './domain/use-cases/clear-chat-history.use-case.js';
import { GetConversationsUseCase } from './domain/use-cases/get-conversations.use-case.js';
import { ChatRepositoryImpl } from './infrastructure/repositories/chat.repository.impl.js';
import { GroqChatProviderImpl } from './infrastructure/providers/groq-chat.provider.impl.js';
import { TokenEstimatorHelper } from './infrastructure/helpers/token-estimator.helper.js';
import { TfIdfHelper } from './infrastructure/helpers/tfidf.helper.js';
import { CHAT_REPOSITORY } from './domain/repositories/chat.repository.js';
import { CHAT_PROVIDER } from './domain/repositories/chat.provider.js';

@Module({
  imports: [ConfigModule],
  controllers: [ChatController],
  providers: [
    SupabaseService,
    SendMessageUseCase,
    GetChatHistoryUseCase,
    ClearChatHistoryUseCase,
    GetConversationsUseCase,
    TokenEstimatorHelper,
    TfIdfHelper,
    { provide: CHAT_REPOSITORY, useClass: ChatRepositoryImpl },
    { provide: CHAT_PROVIDER, useClass: GroqChatProviderImpl },
    { provide: TRANSCRIPTION_REPOSITORY, useClass: TranscriptionRepositoryImpl },
  ],
})
export class ChatModule {}
