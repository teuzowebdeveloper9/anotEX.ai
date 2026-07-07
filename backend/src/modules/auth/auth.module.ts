import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthController } from './presentation/controllers/auth.controller.js';
import { CreateSessionUseCase } from './domain/use-cases/create-session.use-case.js';
import { RequestMagicLinkUseCase } from './domain/use-cases/request-magic-link.use-case.js';
import { VerifyMagicLinkUseCase } from './domain/use-cases/verify-magic-link.use-case.js';
import { RegisterUseCase } from './domain/use-cases/register.use-case.js';
import { LoginUseCase } from './domain/use-cases/login.use-case.js';
import { RefreshTokenUseCase } from './domain/use-cases/refresh-token.use-case.js';
import { LogoutUseCase } from './domain/use-cases/logout.use-case.js';
import { USER_REPOSITORY } from './domain/repositories/user.repository.js';
import { AUTH_TOKEN_REPOSITORY } from './domain/repositories/auth-token.repository.js';
import { EMAIL_PROVIDER } from './domain/repositories/email.provider.js';
import { TOKEN_PROVIDER } from './domain/repositories/token.provider.js';
import { UserRepositoryImpl } from './infrastructure/repositories/user.repository.impl.js';
import { AuthTokenRepositoryImpl } from './infrastructure/repositories/auth-token.repository.impl.js';
import { AcsEmailProviderImpl } from './infrastructure/providers/acs-email.provider.impl.js';
import { JwtTokenProviderImpl } from './infrastructure/providers/jwt-token.provider.impl.js';

@Module({
  imports: [ConfigModule],
  controllers: [AuthController],
  providers: [
    CreateSessionUseCase,
    RequestMagicLinkUseCase,
    VerifyMagicLinkUseCase,
    RegisterUseCase,
    LoginUseCase,
    RefreshTokenUseCase,
    LogoutUseCase,
    { provide: USER_REPOSITORY, useClass: UserRepositoryImpl },
    { provide: AUTH_TOKEN_REPOSITORY, useClass: AuthTokenRepositoryImpl },
    { provide: EMAIL_PROVIDER, useClass: AcsEmailProviderImpl },
    { provide: TOKEN_PROVIDER, useClass: JwtTokenProviderImpl },
  ],
})
export class AuthModule {}
