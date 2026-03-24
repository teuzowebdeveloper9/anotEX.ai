import { Module, type MiddlewareConsumer, type NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { BullModule } from '@nestjs/bull';
import { APP_GUARD } from '@nestjs/core';
import { envValidationSchema } from './shared/infrastructure/config/env.validation.js';
import { AudioModule } from './modules/audio/audio.module.js';
import { TranscriptionModule } from './modules/transcription/transcription.module.js';
import { StudyMaterialModule } from './modules/study-materials/study-material.module.js';
import { StudyFolderModule } from './modules/study-folders/study-folder.module.js';
import { SharingModule } from './modules/sharing/sharing.module.js';
import { StudyGroupModule } from './modules/study-groups/study-group.module.js';
import { ChatModule } from './modules/chat/chat.module.js';
import { SpacedRepetitionModule } from './modules/spaced-repetition/spaced-repetition.module.js';
import { UserModule } from './modules/user/user.module.js';
import { HealthController } from './shared/presentation/controllers/health.controller.js';
import { SupabaseAuthGuard } from './modules/audio/presentation/guards/auth.guard.js';
import { LoggingMiddleware } from './shared/presentation/middlewares/logging.middleware.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: envValidationSchema,
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 100,
      },
    ]),
    BullModule.forRootAsync({
      useFactory: () => {
        const redisUrl = process.env.UPSTASH_REDIS_URL ?? '';
        const host = redisUrl.replace(/^https?:\/\//, '');
        return {
          redis: {
            host,
            port: 6379,
            password: process.env.UPSTASH_REDIS_TOKEN ?? '',
            tls: {},
          },
        };
      },
    }),
    AudioModule,
    TranscriptionModule,
    StudyMaterialModule,
    StudyFolderModule,
    SharingModule,
    StudyGroupModule,
    ChatModule,
    SpacedRepetitionModule,
    UserModule,
  ],
  controllers: [HealthController],
  providers: [
    // Rate limiting global por IP — 100 req/min
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    // Auth global — todo controller protegido por padrão; use @Public() para rotas abertas
    {
      provide: APP_GUARD,
      useClass: SupabaseAuthGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(LoggingMiddleware).forRoutes('*');
  }
}
