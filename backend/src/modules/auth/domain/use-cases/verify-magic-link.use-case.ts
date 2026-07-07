import { Inject, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import type { AuthSession } from '../entities/auth-session.entity.js';
import type { IAuthTokenRepository } from '../repositories/auth-token.repository.js';
import { AUTH_TOKEN_REPOSITORY } from '../repositories/auth-token.repository.js';
import type { IUserRepository } from '../repositories/user.repository.js';
import { USER_REPOSITORY } from '../repositories/user.repository.js';
import { CreateSessionUseCase, sha256Hex } from './create-session.use-case.js';
import { ok, fail, Result } from '../../../../shared/domain/result.js';

export interface VerifyMagicLinkInput {
  token: string;
}

@Injectable()
export class VerifyMagicLinkUseCase {
  private readonly logger = new Logger(VerifyMagicLinkUseCase.name);

  constructor(
    @Inject(AUTH_TOKEN_REPOSITORY) private readonly authTokenRepository: IAuthTokenRepository,
    @Inject(USER_REPOSITORY) private readonly userRepository: IUserRepository,
    private readonly createSessionUseCase: CreateSessionUseCase,
  ) {}

  async execute(input: VerifyMagicLinkInput): Promise<Result<AuthSession>> {
    const consumed = await this.authTokenRepository.consumeMagicLinkToken(sha256Hex(input.token));

    if (!consumed) {
      this.logger.warn('Magic link rejeitado: token inválido, expirado ou já usado');
      return fail(new UnauthorizedException('Invalid or expired token'));
    }

    const user = await this.userRepository.findById(consumed.userId);
    if (!user) {
      this.logger.warn(`Magic link rejeitado: usuário não encontrado | userId=${consumed.userId}`);
      return fail(new UnauthorizedException('Invalid or expired token'));
    }

    const session = await this.createSessionUseCase.execute({ id: user.id, email: user.email });
    this.logger.log(`Login via magic link | userId=${user.id}`);
    return ok(session);
  }
}
