import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import { AppModule } from './app.module.js';
import { HttpExceptionFilter } from './shared/presentation/filters/http-exception.filter.js';
import { LoggingInterceptor } from './shared/presentation/interceptors/logging.interceptor.js';

function getAllowedOrigins(rawOrigins: string, nodeEnv: string | undefined): string[] {
  const configuredOrigins = rawOrigins
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  if (nodeEnv === 'development') {
    const localOrigins = [
      'http://localhost:5173',
      'http://127.0.0.1:5173',
      'http://localhost:4173',
      'http://127.0.0.1:4173',
      'http://localhost:3000',
      'http://127.0.0.1:3000',
    ];

    return Array.from(new Set([...configuredOrigins, ...localOrigins]));
  }

  return configuredOrigins;
}

async function bootstrapWorker() {
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn', 'log'],
  });
  await app.init();
}

async function bootstrapApi() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log'],
    rawBody: true,
  });

  const configService = app.get(ConfigService);
  const port = 3000;
  const nodeEnv = configService.get<string>('NODE_ENV', 'development');
  const allowedOrigins = getAllowedOrigins(
    configService.get<string>('ALLOWED_ORIGINS', ''),
    nodeEnv,
  );

  app.use(helmet());

  // Atrás do ingress do Azure Container Apps: confia no 1º proxy para que req.ip
  // seja o IP real do cliente — sem isso o rate limit por IP e os logs de auth
  // ficam todos no IP do ingress (throttling inútil / auditoria cega).
  app.getHttpAdapter().getInstance().set('trust proxy', 1);

  app.enableCors({
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    // Auth é por Bearer token (não cookies) — credentials desnecessário
    credentials: false,
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
