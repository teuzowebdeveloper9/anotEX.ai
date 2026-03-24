import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import { AppModule } from './app.module.js';
import { HttpExceptionFilter } from './shared/presentation/filters/http-exception.filter.js';
import { LoggingInterceptor } from './shared/presentation/interceptors/logging.interceptor.js';

async function bootstrapWorker() {
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn', 'log'],
  });
  await app.init();
}

async function bootstrapApi() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log'],
  });

  const configService = app.get(ConfigService);
  const port = 3000;
  const allowedOrigins = configService
    .get<string>('ALLOWED_ORIGINS', '')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);

  app.use(helmet());

  app.enableCors({
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new LoggingInterceptor());

  app.setGlobalPrefix('api/v1');

  await app.listen(port, '0.0.0.0');
}

if (process.env.WORKER_ONLY === 'true') {
  bootstrapWorker().catch((err) => {
    console.error('[Worker] Fatal error during bootstrap:', err);
    process.exit(1);
  });
} else {
  bootstrapApi().catch((err) => {
    console.error('[API] Fatal error during bootstrap:', err);
    process.exit(1);
  });
}
