import { UnauthorizedException } from '@nestjs/common';
import bcrypt from 'bcryptjs';
import { LoginUseCase } from './login.use-case.js';
import { CreateSessionUseCase } from './create-session.use-case.js';
import type { IUserRepository } from '../repositories/user.repository.js';
import type { UserEntity } from '../entities/user.entity.js';
import type { AuthSession } from '../entities/auth-session.entity.js';

const makeUser = (overrides: Partial<UserEntity> = {}): UserEntity => ({
  id: 'user-1',
  email: 'user@example.com',
  passwordHash: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

const session: AuthSession = {
  accessToken: 'jwt',
  refreshToken: 'refresh',
  user: { id: 'user-1', email: 'user@example.com' },
};

describe('LoginUseCase', () => {
  let useCase: LoginUseCase;
  let userRepository: jest.Mocked<IUserRepository>;
  let createSessionUseCase: jest.Mocked<CreateSessionUseCase>;

  beforeEach(() => {
    userRepository = {
      findByEmail: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      setPassword: jest.fn(),
    } as jest.Mocked<IUserRepository>;

    createSessionUseCase = {
      execute: jest.fn().mockResolvedValue(session),
    } as unknown as jest.Mocked<CreateSessionUseCase>;

    useCase = new LoginUseCase(userRepository, createSessionUseCase);
  });

  describe('execute', () => {
    it('deve retornar UnauthorizedException genérico se o usuário não existir', async () => {
      userRepository.findByEmail.mockResolvedValue(null);

      const result = await useCase.execute({ email: 'user@example.com', password: 'senha' });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeInstanceOf(UnauthorizedException);
        expect((result.error as UnauthorizedException).message).toBe('Invalid credentials');
      }
    });

    it('deve retornar UnauthorizedException genérico se o usuário não tem senha cadastrada', async () => {
      userRepository.findByEmail.mockResolvedValue(makeUser({ passwordHash: null }));

      const result = await useCase.execute({ email: 'user@example.com', password: 'senha' });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeInstanceOf(UnauthorizedException);
        expect((result.error as UnauthorizedException).message).toBe('Invalid credentials');
      }
    });

    it('deve retornar UnauthorizedException genérico se a senha estiver errada', async () => {
      const passwordHash = await bcrypt.hash('senha-correta', 10);
      userRepository.findByEmail.mockResolvedValue(makeUser({ passwordHash }));

      const result = await useCase.execute({ email: 'user@example.com', password: 'senha-errada' });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeInstanceOf(UnauthorizedException);
        expect((result.error as UnauthorizedException).message).toBe('Invalid credentials');
      }
      expect(createSessionUseCase.execute).not.toHaveBeenCalled();
    });

    it('deve criar a sessão com senha correta', async () => {
      const passwordHash = await bcrypt.hash('senha-correta', 10);
      userRepository.findByEmail.mockResolvedValue(makeUser({ passwordHash }));

      const result = await useCase.execute({
        email: 'user@example.com',
        password: 'senha-correta',
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(session);
      }
      expect(createSessionUseCase.execute).toHaveBeenCalledWith({
        id: 'user-1',
        email: 'user@example.com',
      });
    });

    it('deve aceitar hash com prefixo $2a$ (importado do Supabase)', async () => {
      const passwordHash = (await bcrypt.hash('senha-correta', 10)).replace(/^\$2b\$/, '$2a$');
      userRepository.findByEmail.mockResolvedValue(makeUser({ passwordHash }));

      const result = await useCase.execute({
        email: 'user@example.com',
        password: 'senha-correta',
      });

      expect(result.success).toBe(true);
    });

    it('deve normalizar o email (trim e lowercase) antes de buscar', async () => {
      userRepository.findByEmail.mockResolvedValue(null);

      await useCase.execute({ email: '  User@Example.COM ', password: 'senha' });

      expect(userRepository.findByEmail).toHaveBeenCalledWith('user@example.com');
    });
  });
});
