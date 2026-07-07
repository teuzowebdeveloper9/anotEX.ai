import { ConflictException } from '@nestjs/common';
import bcrypt from 'bcryptjs';
import { RegisterUseCase } from './register.use-case.js';
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

describe('RegisterUseCase', () => {
  let useCase: RegisterUseCase;
  let userRepository: jest.Mocked<IUserRepository>;
  let createSessionUseCase: jest.Mocked<CreateSessionUseCase>;

  beforeEach(() => {
    userRepository = {
      findByEmail: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      setPassword: jest.fn().mockResolvedValue(undefined),
    } as jest.Mocked<IUserRepository>;

    createSessionUseCase = {
      execute: jest.fn().mockResolvedValue(session),
    } as unknown as jest.Mocked<CreateSessionUseCase>;

    useCase = new RegisterUseCase(userRepository, createSessionUseCase);
  });

  describe('execute', () => {
    it('deve retornar ConflictException se o email já possui senha cadastrada', async () => {
      userRepository.findByEmail.mockResolvedValue(makeUser({ passwordHash: '$2b$10$hash' }));

      const result = await useCase.execute({ email: 'user@example.com', password: 'senha-forte' });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeInstanceOf(ConflictException);
      }
      expect(createSessionUseCase.execute).not.toHaveBeenCalled();
    });

    it('deve definir a senha quando o usuário existe sem senha (criado via magic link)', async () => {
      userRepository.findByEmail.mockResolvedValue(makeUser({ passwordHash: null }));

      const result = await useCase.execute({ email: 'user@example.com', password: 'senha-forte' });

      expect(result.success).toBe(true);
      expect(userRepository.setPassword).toHaveBeenCalledTimes(1);
      expect(userRepository.create).not.toHaveBeenCalled();

      const [userId, passwordHash] = userRepository.setPassword.mock.calls[0];
      expect(userId).toBe('user-1');
      expect(await bcrypt.compare('senha-forte', passwordHash)).toBe(true);
    });

    it('deve criar o usuário com hash bcrypt quando o email não existe', async () => {
      userRepository.findByEmail.mockResolvedValue(null);
      userRepository.create.mockResolvedValue(makeUser({ passwordHash: '$2b$10$hash' }));

      const result = await useCase.execute({
        email: '  New@Example.COM ',
        password: 'senha-forte',
      });

      expect(result.success).toBe(true);
      expect(userRepository.setPassword).not.toHaveBeenCalled();
      expect(userRepository.create).toHaveBeenCalledTimes(1);

      const [email, passwordHash] = userRepository.create.mock.calls[0];
      expect(email).toBe('new@example.com');
      expect(passwordHash).not.toBeNull();
      expect(await bcrypt.compare('senha-forte', passwordHash as string)).toBe(true);
      // Nunca armazenar a senha em claro
      expect(passwordHash).not.toContain('senha-forte');
    });

    it('deve retornar a sessão criada para o usuário registrado', async () => {
      userRepository.findByEmail.mockResolvedValue(null);
      userRepository.create.mockResolvedValue(makeUser());

      const result = await useCase.execute({ email: 'user@example.com', password: 'senha-forte' });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(session);
      }
      expect(createSessionUseCase.execute).toHaveBeenCalledWith({
        id: 'user-1',
        email: 'user@example.com',
      });
    });
  });
});
