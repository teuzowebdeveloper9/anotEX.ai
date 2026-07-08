import { ConflictException, Inject, Injectable, Logger } from '@nestjs/common';
import bcrypt from 'bcryptjs';
import type { AuthSession } from '../entities/auth-session.entity.js';
import type { IUserRepository } from '../repositories/user.repository.js';
import { USER_REPOSITORY } from '../repositories/user.repository.js';
import { CreateSessionUseCase } from './create-session.use-case.js';
import { ok, fail, Result } from '../../../../shared/domain/result.js';

export const BCRYPT_SALT_ROUNDS = 10;

export interface RegisterInput {
  email: string;
  password: string;
}

@Injectable()
export class RegisterUseCase {
  private readonly logger = new Logger(RegisterUseCase.name);

  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: IUserRepository,
    private readonly createSessionUseCase: CreateSessionUseCase,
  ) {}

  async execute(input: RegisterInput): Promise<Result<AuthSession>> {
    const email = input.email.trim().toLowerCase();
    const existing = await this.userRepository.findByEmail(email);

    // SEGURANÇA: nunca definir senha nem emitir sessão para uma conta PRÉ-EXISTENTE
    // sem prova de posse do email. Contas criadas via magic link (sem senha) devem
    // continuar entrando por magic link — permitir "reivindicá-las" aqui era account
    // takeover (atacante define a senha da conta alheia e recebe tokens válidos).
    if (existing) {
      this.logger.warn('Registro rejeitado: email já cadastrado');
      return fail(new ConflictException('Email already registered'));
    }

    const passwordHash = await bcrypt.hash(input.password, BCRYPT_SALT_ROUNDS);
    const user = await this.userRepository.create(email, passwordHash);
    this.logger.log(`Usuário registrado | userId=${user.id}`);

    const session = await this.createSessionUseCase.execute({ id: user.id, email: user.email });
    return ok(session);
  }
}
