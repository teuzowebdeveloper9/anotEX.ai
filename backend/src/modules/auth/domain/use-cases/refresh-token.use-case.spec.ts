import { UnauthorizedException } from '@nestjs/common';
import { RefreshTokenUseCase } from './refresh-token.use-case.js';
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
  accessToken: 'new-jwt',
  refreshToken: 'new-refresh',
  user: { id: 'user-1', email: 'user@example.com' },
};

describe('RefreshTokenUseCase', () => {
  let useCase: RefreshTokenUseCase;
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

    useCase = new RefreshTokenUseCase(authTokenRepository, userRepository, createSessionUseCase);
  });

  describe('execute', () => {
    it('deve retornar UnauthorizedException se o refresh token for inválido, expirado ou revogado', async () => {
      authTokenRepository.consumeRefreshToken.mockResolvedValue(null);

      const result = await useCase.execute({ refreshToken: 'invalid' });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeInstanceOf(UnauthorizedException);
      }
      expect(createSessionUseCase.execute).not.toHaveBeenCalled();
    });

    it('deve retornar UnauthorizedException se o usuário do token não existir mais', async () => {
      authTokenRepository.consumeRefreshToken.mockResolvedValue({ userId: 'user-1' });
      userRepository.findById.mockResolvedValue(null);

      const result = await useCase.execute({ refreshToken: 'valid' });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeInstanceOf(UnauthorizedException);
      }
    });

    it('deve rotacionar: revogar o token antigo pelo sha256 antes de emitir o novo par', async () => {
      authTokenRepository.consumeRefreshToken.mockResolvedValue({ userId: 'user-1' });
      userRepository.findById.mockResolvedValue(user);

      await useCase.execute({ refreshToken: 'old-refresh-token' });

      expect(authTokenRepository.consumeRefreshToken).toHaveBeenCalledWith(
        sha256Hex('old-refresh-token'),
      );
    });

    it('deve emitir nova sessão para refresh token válido', async () => {
      authTokenRepository.consumeRefreshToken.mockResolvedValue({ userId: 'user-1' });
      userRepository.findById.mockResolvedValue(user);

      const result = await useCase.execute({ refreshToken: 'valid' });

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
