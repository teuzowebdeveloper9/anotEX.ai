import { Inject, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import type { AuthSession } from '../entities/auth-session.entity.js';
import type { IAuthTokenRepository } from '../repositories/auth-token.repository.js';
import { AUTH_TOKEN_REPOSITORY } from '../repositories/auth-token.repository.js';
import type { IUserRepository } from '../repositories/user.repository.js';
import { USER_REPOSITORY } from '../repositories/user.repository.js';
import { CreateSessionUseCase, sha256Hex } from './create-session.use-case.js';
import { ok, fail, Result } from '../../../../shared/domain/result.js';

export interface RefreshTokenInput {
  refreshToken: string;
}

@Injectable()
export class RefreshTokenUseCase {
  private readonly logger = new Logger(RefreshTokenUseCase.name);

  constructor(
    @Inject(AUTH_TOKEN_REPOSITORY) private readonly authTokenRepository: IAuthTokenRepository,
    @Inject(USER_REPOSITORY) private readonly userRepository: IUserRepository,
    private readonly createSessionUseCase: CreateSessionUseCase,
  ) {}

  async execute(input: RefreshTokenInput): Promise<Result<AuthSession>> {
    // Rotação: revoga o token antigo de forma atômica antes de emitir o novo par
    const consumed = await this.authTokenRepository.consumeRefreshToken(
      sha256Hex(input.refreshToken),
    );

    if (!consumed) {
      this.logger.warn('Refresh rejeitado: token inválido, expirado ou revogado');
      return fail(new UnauthorizedException('Invalid or expired refresh token'));
    }

    const user = await this.userRepository.findById(consumed.userId);
    if (!user) {
      this.logger.warn(`Refresh rejeitado: usuário não encontrado | userId=${consumed.userId}`);
      return fail(new UnauthorizedException('Invalid or expired refresh token'));
    }

    const session = await this.createSessionUseCase.execute({ id: user.id, email: user.email });
    return ok(session);
  }
}
