import { Inject, Injectable } from '@nestjs/common';
import { createHash, randomBytes } from 'crypto';
import type { AuthSession } from '../entities/auth-session.entity.js';
import type { AuthenticatedUser } from '../entities/user.entity.js';
import type { IAuthTokenRepository } from '../repositories/auth-token.repository.js';
import { AUTH_TOKEN_REPOSITORY } from '../repositories/auth-token.repository.js';
import type { ITokenProvider } from '../repositories/token.provider.js';
import { TOKEN_PROVIDER } from '../repositories/token.provider.js';

export const REFRESH_TOKEN_BYTES = 48;
export const REFRESH_TOKEN_TTL_DAYS = 30;

export function sha256Hex(value: string): string {
  return createHash('sha256').update(value).digest('hex');
}

/**
 * Emite um par accessToken (JWT) + refreshToken (opaco) para o usuário.
 * O refresh token é armazenado apenas como sha256 na tabela refresh_tokens.
 */
@Injectable()
export class CreateSessionUseCase {
  constructor(
    @Inject(TOKEN_PROVIDER) private readonly tokenProvider: ITokenProvider,
    @Inject(AUTH_TOKEN_REPOSITORY) private readonly authTokenRepository: IAuthTokenRepository,
  ) {}

  async execute(user: AuthenticatedUser): Promise<AuthSession> {
    const accessToken = this.tokenProvider.signAccessToken({ sub: user.id, email: user.email });

    const refreshToken = randomBytes(REFRESH_TOKEN_BYTES).toString('hex');
    const expiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000);
    await this.authTokenRepository.createRefreshToken(user.id, sha256Hex(refreshToken), expiresAt);

    return {
      accessToken,
      refreshToken,
      user: { id: user.id, email: user.email },
    };
  }
}
