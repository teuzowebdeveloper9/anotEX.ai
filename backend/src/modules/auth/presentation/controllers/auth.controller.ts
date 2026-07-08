import { Body, Controller, Get, HttpCode, HttpStatus, Post, Req } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { Public } from '../../../../shared/presentation/decorators/public.decorator.js';
import type { AuthenticatedRequest } from '../../../audio/presentation/guards/auth.guard.js';
import type { AuthSession } from '../../domain/entities/auth-session.entity.js';
import { RequestMagicLinkUseCase } from '../../domain/use-cases/request-magic-link.use-case.js';
import { VerifyMagicLinkUseCase } from '../../domain/use-cases/verify-magic-link.use-case.js';
import { RegisterUseCase } from '../../domain/use-cases/register.use-case.js';
import { LoginUseCase } from '../../domain/use-cases/login.use-case.js';
import { RefreshTokenUseCase } from '../../domain/use-cases/refresh-token.use-case.js';
import { LogoutUseCase } from '../../domain/use-cases/logout.use-case.js';
import { RequestMagicLinkDto } from '../../application/dto/request-magic-link.dto.js';
import { VerifyMagicLinkDto } from '../../application/dto/verify-magic-link.dto.js';
import { RegisterDto } from '../../application/dto/register.dto.js';
import { LoginDto } from '../../application/dto/login.dto.js';
import { RefreshTokenDto } from '../../application/dto/refresh-token.dto.js';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly requestMagicLinkUseCase: RequestMagicLinkUseCase,
    private readonly verifyMagicLinkUseCase: VerifyMagicLinkUseCase,
    private readonly registerUseCase: RegisterUseCase,
    private readonly loginUseCase: LoginUseCase,
    private readonly refreshTokenUseCase: RefreshTokenUseCase,
    private readonly logoutUseCase: LogoutUseCase,
  ) {}

  // 5 pedidos de magic link por minuto por IP — mitiga abuso de envio de email
  @Public()
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('magic-link')
  @HttpCode(HttpStatus.OK)
  async requestMagicLink(@Body() dto: RequestMagicLinkDto): Promise<{ message: string }> {
    await this.requestMagicLinkUseCase.execute({ email: dto.email });
    return { message: 'Magic link sent' };
  }

  // 10 tentativas de verificação por minuto por IP
  @Public()
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @Post('verify')
  @HttpCode(HttpStatus.OK)
  async verify(@Body() dto: VerifyMagicLinkDto): Promise<AuthSession> {
    const result = await this.verifyMagicLinkUseCase.execute({ token: dto.token });
    if (!result.success) throw result.error;
    return result.data;
  }

  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() dto: RegisterDto): Promise<AuthSession> {
    const result = await this.registerUseCase.execute({
      email: dto.email,
      password: dto.password,
    });
    if (!result.success) throw result.error;
    return result.data;
  }

  // 10 tentativas de login por minuto por IP — mitiga brute-force de senha
  @Public()
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto): Promise<AuthSession> {
    const result = await this.loginUseCase.execute({
      email: dto.email,
      password: dto.password,
    });
    if (!result.success) throw result.error;
    return result.data;
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Body() dto: RefreshTokenDto): Promise<AuthSession> {
    const result = await this.refreshTokenUseCase.execute({ refreshToken: dto.refreshToken });
    if (!result.success) throw result.error;
    return result.data;
  }

  @Public()
  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(@Body() dto: RefreshTokenDto): Promise<void> {
    await this.logoutUseCase.execute({ refreshToken: dto.refreshToken });
  }

  @Get('me')
  me(@Req() req: AuthenticatedRequest): { id: string; email: string } {
    return { id: req.user.id, email: req.user.email };
  }
}
