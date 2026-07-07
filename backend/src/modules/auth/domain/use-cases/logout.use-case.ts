import { Inject, Injectable } from '@nestjs/common';
import type { IAuthTokenRepository } from '../repositories/auth-token.repository.js';
import { AUTH_TOKEN_REPOSITORY } from '../repositories/auth-token.repository.js';
import { sha256Hex } from './create-session.use-case.js';

export interface LogoutInput {
  refreshToken: string;
}

@Injectable()
export class LogoutUseCase {
  constructor(
    @Inject(AUTH_TOKEN_REPOSITORY) private readonly authTokenRepository: IAuthTokenRepository,
  ) {}

  async execute(input: LogoutInput): Promise<void> {
    // Idempotente — revogar um token já revogado ou inexistente não é erro
    await this.authTokenRepository.revokeRefreshToken(sha256Hex(input.refreshToken));
  }
}
