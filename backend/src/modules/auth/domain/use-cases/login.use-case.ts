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

  // Hash bcrypt descartável usado quando o usuário não existe/não tem senha,
  // para que o tempo de resposta seja o mesmo — evita enumeração por timing.
  private static readonly DUMMY_HASH = '$2b$10$CwTycUXWue0Thq9StjUM0uJ8Dq4Q6bV3yqCZ7f4nQ0hVqJ8oQ0y1a';

  async execute(input: LoginInput): Promise<Result<AuthSession>> {
    const email = input.email.trim().toLowerCase();
    const user = await this.userRepository.findByEmail(email);

    // 401 genérico — nunca revela se o email existe ou se a senha está errada.
    // Sempre roda um bcrypt.compare (real ou dummy) para não vazar existência por timing.
    const hashToCompare = user?.passwordHash ?? LoginUseCase.DUMMY_HASH;
    const passwordMatches = await bcrypt.compare(input.password, hashToCompare);

    if (!user?.passwordHash || !passwordMatches) {
      this.logger.warn('Login rejeitado: credenciais inválidas');
      return fail(new UnauthorizedException('Invalid credentials'));
    }

    const session = await this.createSessionUseCase.execute({ id: user.id, email: user.email });
    this.logger.log(`Login com senha | userId=${user.id}`);
    return ok(session);
  }
}
