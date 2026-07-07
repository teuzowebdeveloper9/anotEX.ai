import { UnauthorizedException } from '@nestjs/common';
import { VerifyMagicLinkUseCase } from './verify-magic-link.use-case.js';
import { CreateSessionUseCase, sha256Hex } from './create-session.use-case.js';
import type { IAuthTokenRepository } from '../repositories/auth-token.repository.js';
import type { IUserRepository } from '../repositories/user.repository.js';
import type { UserEntity } from '../entities/user.entity.js';
import type { AuthSession } from '../entities/auth-session.entity.js';

const user: UserEntity = {
  id: 'user-1',
  email: 'user@example.com',
  passwordHash: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const session: AuthSession = {
  accessToken: 'jwt',
  refreshToken: 'refresh',
  user: { id: 'user-1', email: 'user@example.com' },
};

describe('VerifyMagicLinkUseCase', () => {
  let useCase: VerifyMagicLinkUseCase;
  let authTokenRepository: jest.Mocked<IAuthTokenRepository>;
  let userRepository: jest.Mocked<IUserRepository>;
  let createSessionUseCase: jest.Mocked<CreateSessionUseCase>;

  beforeEach(() => {
    authTokenRepository = {
      createMagicLinkToken: jest.fn(),
      consumeMagicLinkToken: jest.fn(),
      createRefreshToken: jest.fn(),
      consumeRefreshToken: jest.fn(),
      revokeRefreshToken: jest.fn(),
    } as jest.Mocked<IAuthTokenRepository>;

    userRepository = {
      findByEmail: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      setPassword: jest.fn(),
    } as jest.Mocked<IUserRepository>;

    createSessionUseCase = {
      execute: jest.fn().mockResolvedValue(session),
    } as unknown as jest.Mocked<CreateSessionUseCase>;

    useCase = new VerifyMagicLinkUseCase(authTokenRepository, userRepository, createSessionUseCase);
  });

  describe('execute', () => {
    it('deve retornar UnauthorizedException se o token for inválido, expirado ou já usado', async () => {
      authTokenRepository.consumeMagicLinkToken.mockResolvedValue(null);

      const result = await useCase.execute({ token: 'invalid-token' });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeInstanceOf(UnauthorizedException);
      }
      expect(createSessionUseCase.execute).not.toHaveBeenCalled();
    });

    it('deve retornar UnauthorizedException se o usuário do token não existir mais', async () => {
      authTokenRepository.consumeMagicLinkToken.mockResolvedValue({ userId: 'user-1' });
      userRepository.findById.mockResolvedValue(null);

      const result = await useCase.execute({ token: 'valid-token' });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeInstanceOf(UnauthorizedException);
      }
    });

    it('deve consumir o token pelo sha256 (nunca pelo valor em claro)', async () => {
      authTokenRepository.consumeMagicLinkToken.mockResolvedValue(null);

      await useCase.execute({ token: 'raw-token' });

      expect(authTokenRepository.consumeMagicLinkToken).toHaveBeenCalledWith(
        sha256Hex('raw-token'),
      );
    });

    it('deve criar a sessão com sucesso para token válido', async () => {
      authTokenRepository.consumeMagicLinkToken.mockResolvedValue({ userId: 'user-1' });
      userRepository.findById.mockResolvedValue(user);

      const result = await useCase.execute({ token: 'valid-token' });

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
