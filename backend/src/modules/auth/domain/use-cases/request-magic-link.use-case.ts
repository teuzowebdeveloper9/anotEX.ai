import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomBytes } from 'crypto';
import type { IUserRepository } from '../repositories/user.repository.js';
import { USER_REPOSITORY } from '../repositories/user.repository.js';
import type { IAuthTokenRepository } from '../repositories/auth-token.repository.js';
import { AUTH_TOKEN_REPOSITORY } from '../repositories/auth-token.repository.js';
import type { IEmailProvider } from '../repositories/email.provider.js';
import { EMAIL_PROVIDER } from '../repositories/email.provider.js';
import { sha256Hex } from './create-session.use-case.js';

export const MAGIC_LINK_TOKEN_BYTES = 48;

export interface RequestMagicLinkInput {
  email: string;
}

@Injectable()
export class RequestMagicLinkUseCase {
  private readonly logger = new Logger(RequestMagicLinkUseCase.name);

  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: IUserRepository,
    @Inject(AUTH_TOKEN_REPOSITORY) private readonly authTokenRepository: IAuthTokenRepository,
    @Inject(EMAIL_PROVIDER) private readonly emailProvider: IEmailProvider,
    private readonly configService: ConfigService,
  ) {}

  async execute(input: RequestMagicLinkInput): Promise<void> {
    const email = input.email.trim().toLowerCase();

    // Cria o usuário caso não exista (sem senha) — nunca revela se o email já existia
    let user = await this.userRepository.findByEmail(email);
    if (!user) {
      user = await this.userRepository.create(email, null);
      this.logger.log(`Usuário criado via magic link | userId=${user.id}`);
    }

    const token = randomBytes(MAGIC_LINK_TOKEN_BYTES).toString('hex');
    const expiresInMinutes = this.configService.get<number>('MAGIC_LINK_EXPIRES_IN_MINUTES', 15);
    const expiresAt = new Date(Date.now() + expiresInMinutes * 60 * 1000);

    await this.authTokenRepository.createMagicLinkToken(user.id, sha256Hex(token), expiresAt);

    const frontendUrl = this.configService.getOrThrow<string>('FRONTEND_URL');
    const link = `${frontendUrl}/auth/callback?token=${token}`;

    await this.emailProvider.sendMagicLink(email, link, expiresInMinutes);
    this.logger.log(`Magic link enviado | userId=${user.id}`);
  }
}
