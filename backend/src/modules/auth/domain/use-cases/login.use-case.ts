import { Inject, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import bcrypt from 'bcryptjs';
import type { AuthSession } from '../entities/auth-session.entity.js';
import type { IUserRepository } from '../repositories/user.repository.js';
import { USER_REPOSITORY } from '../repositories/user.repository.js';
import { CreateSessionUseCase } from './create-session.use-case.js';
import { ok, fail, Result } from '../../../../shared/domain/result.js';

export interface LoginInput {
  email: string;
  password: string;
}

@Injectable()
export class LoginUseCase {
  private readonly logger = new Logger(LoginUseCase.name);

  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: IUserRepository,
    private readonly createSessionUseCase: CreateSessionUseCase,
  ) {}

  async execute(input: LoginInput): Promise<Result<AuthSession>> {
    const email = input.email.trim().toLowerCase();
    const user = await this.userRepository.findByEmail(email);

    // 401 genérico — nunca revela se o email existe ou se a senha está errada
    if (!user?.passwordHash) {
      this.logger.warn('Login rejeitado: usuário inexistente ou sem senha');
      return fail(new UnauthorizedException('Invalid credentials'));
    }

    // bcrypt.compare é compatível com hashes $2a$/$2b$ importados do Supabase
    const passwordMatches = await bcrypt.compare(input.password, user.passwordHash);
    if (!passwordMatches) {
      this.logger.warn(`Login rejeitado: senha inválida | userId=${user.id}`);
      return fail(new UnauthorizedException('Invalid credentials'));
    }

    const session = await this.createSessionUseCase.execute({ id: user.id, email: user.email });
    this.logger.log(`Login com senha | userId=${user.id}`);
    return ok(session);
  }
}
