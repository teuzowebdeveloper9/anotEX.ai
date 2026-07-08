import { Module, type MiddlewareConsumer, type NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { BullModule } from '@nestjs/bull';
import { APP_GUARD } from '@nestjs/core';
import { envValidationSchema } from './shared/infrastructure/config/env.validation.js';
import { PostgresModule } from './shared/infrastructure/config/postgres.module.js';
import { AuthModule } from './modules/auth/auth.module.js';
import { AudioModule } from './modules/audio/audio.module.js';
import { TranscriptionModule } from './modules/transcription/transcription.module.js';
import { StudyMaterialModule } from './modules/study-materials/study-material.module.js';
import { StudyFolderModule } from './modules/study-folders/study-folder.module.js';
import { SharingModule } from './modules/sharing/sharing.module.js';
import { StudyGroupModule } from './modules/study-groups/study-group.module.js';
import { ChatModule } from './modules/chat/chat.module.js';
import { SpacedRepetitionModule } from './modules/spaced-repetition/spaced-repetition.module.js';
import { UserModule } from './modules/user/user.module.js';
import { PaymentModule } from './modules/payments/payment.module.js';
import { PomodoroModule } from './modules/pomodoro/pomodoro.module.js';
import { HealthController } from './shared/presentation/controllers/health.controller.js';
import { JwtAuthGuard } from './modules/audio/presentation/guards/auth.guard.js';
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
        const host = process.env.REDIS_HOST ?? 'localhost';
        const useTls = (process.env.REDIS_TLS ?? 'true') === 'true';
        return {
          // Hash-tag no prefixo força todas as chaves das filas ao MESMO slot do
          // Redis Cluster (Azure Managed Redis usa clustering). Sem isso, os scripts
          // Lua do Bull que tocam várias chaves (wait/paused/...) falham com CROSSSLOT.
          prefix: '{bull}',
          redis: {
            host,
            port: Number(process.env.REDIS_PORT ?? 10000),
            password: process.env.REDIS_PASSWORD ?? '',
            // Azure Managed Redis fecha conexões ociosas — keepAlive evita queda das
            // conexões bloqueantes do Bull; TLS exige SNI com o hostname
            keepAlive: 30_000,
            ...(useTls ? { tls: { servername: host } } : {}),
          },
        };
      },
    }),
    PostgresModule,
    AuthModule,
    AudioModule,
    TranscriptionModule,
    StudyMaterialModule,
    StudyFolderModule,
    SharingModule,
    StudyGroupModule,
    ChatModule,
    SpacedRepetitionModule,
    UserModule,
    PaymentModule,
    PomodoroModule,
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
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(LoggingMiddleware).forRoutes('*');
  }
}
