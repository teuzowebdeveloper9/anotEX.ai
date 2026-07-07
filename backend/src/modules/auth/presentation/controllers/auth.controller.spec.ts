import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { AuthController } from './auth.controller.js';
import { RequestMagicLinkUseCase } from '../../domain/use-cases/request-magic-link.use-case.js';
import { VerifyMagicLinkUseCase } from '../../domain/use-cases/verify-magic-link.use-case.js';
import { RegisterUseCase } from '../../domain/use-cases/register.use-case.js';
import { LoginUseCase } from '../../domain/use-cases/login.use-case.js';
import { RefreshTokenUseCase } from '../../domain/use-cases/refresh-token.use-case.js';
import { LogoutUseCase } from '../../domain/use-cases/logout.use-case.js';
import { ok, fail } from '../../../../shared/domain/result.js';
import type { AuthSession } from '../../domain/entities/auth-session.entity.js';
import type { AuthenticatedRequest } from '../../../audio/presentation/guards/auth.guard.js';

const session: AuthSession = {
  accessToken: 'jwt',
  refreshToken: 'refresh',
  user: { id: 'user-1', email: 'user@example.com' },
};

describe('AuthController', () => {
  let controller: AuthController;
  let requestMagicLinkUseCase: jest.Mocked<RequestMagicLinkUseCase>;
  let verifyMagicLinkUseCase: jest.Mocked<VerifyMagicLinkUseCase>;
  let registerUseCase: jest.Mocked<RegisterUseCase>;
  let loginUseCase: jest.Mocked<LoginUseCase>;
  let refreshTokenUseCase: jest.Mocked<RefreshTokenUseCase>;
  let logoutUseCase: jest.Mocked<LogoutUseCase>;

  beforeEach(() => {
    requestMagicLinkUseCase = {
      execute: jest.fn().mockResolvedValue(undefined),
    } as unknown as jest.Mocked<RequestMagicLinkUseCase>;
    verifyMagicLinkUseCase = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<VerifyMagicLinkUseCase>;
    registerUseCase = { execute: jest.fn() } as unknown as jest.Mocked<RegisterUseCase>;
    loginUseCase = { execute: jest.fn() } as unknown as jest.Mocked<LoginUseCase>;
    refreshTokenUseCase = { execute: jest.fn() } as unknown as jest.Mocked<RefreshTokenUseCase>;
    logoutUseCase = {
      execute: jest.fn().mockResolvedValue(undefined),
    } as unknown as jest.Mocked<LogoutUseCase>;

    controller = new AuthController(
      requestMagicLinkUseCase,
      verifyMagicLinkUseCase,
      registerUseCase,
      loginUseCase,
      refreshTokenUseCase,
      logoutUseCase,
    );
  });

  describe('requestMagicLink', () => {
    it('deve delegar ao use-case e retornar mensagem genérica (nunca revela se o email existe)', async () => {
      const response = await controller.requestMagicLink({ email: 'user@example.com' });

      expect(requestMagicLinkUseCase.execute).toHaveBeenCalledWith({ email: 'user@example.com' });
      expect(response).toEqual({ message: 'Magic link sent' });
    });
  });

  describe('verify', () => {
    it('deve retornar a sessão para token válido', async () => {
      verifyMagicLinkUseCase.execute.mockResolvedValue(ok(session));

      const response = await controller.verify({ token: 'valid' });

      expect(verifyMagicLinkUseCase.execute).toHaveBeenCalledWith({ token: 'valid' });
      expect(response).toEqual(session);
    });

    it('deve lançar UnauthorizedException para token inválido', async () => {
      verifyMagicLinkUseCase.execute.mockResolvedValue(
        fail(new UnauthorizedException('Invalid or expired token')),
      );

      await expect(controller.verify({ token: 'invalid' })).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('register', () => {
    it('deve retornar a sessão criada', async () => {
      registerUseCase.execute.mockResolvedValue(ok(session));

      const response = await controller.register({
        email: 'user@example.com',
        password: 'senha-forte',
      });

      expect(registerUseCase.execute).toHaveBeenCalledWith({
        email: 'user@example.com',
        password: 'senha-forte',
      });
      expect(response).toEqual(session);
    });

    it('deve lançar ConflictException quando o email já possui senha', async () => {
      registerUseCase.execute.mockResolvedValue(
        fail(new ConflictException('Email already registered')),
      );

      await expect(
        controller.register({ email: 'user@example.com', password: 'senha-forte' }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('login', () => {
    it('deve retornar a sessão para credenciais válidas', async () => {
      loginUseCase.execute.mockResolvedValue(ok(session));

      const response = await controller.login({ email: 'user@example.com', password: 'senha' });

      expect(loginUseCase.execute).toHaveBeenCalledWith({
        email: 'user@example.com',
        password: 'senha',
      });
      expect(response).toEqual(session);
    });

    it('deve lançar UnauthorizedException para credenciais inválidas', async () => {
      loginUseCase.execute.mockResolvedValue(
        fail(new UnauthorizedException('Invalid credentials')),
      );

      await expect(
        controller.login({ email: 'user@example.com', password: 'errada' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('refresh', () => {
    it('deve retornar novo par de tokens para refresh token válido', async () => {
      refreshTokenUseCase.execute.mockResolvedValue(ok(session));

      const response = await controller.refresh({ refreshToken: 'valid' });

      expect(refreshTokenUseCase.execute).toHaveBeenCalledWith({ refreshToken: 'valid' });
      expect(response).toEqual(session);
    });

    it('deve lançar UnauthorizedException para refresh token inválido', async () => {
      refreshTokenUseCase.execute.mockResolvedValue(
        fail(new UnauthorizedException('Invalid or expired refresh token')),
      );

      await expect(controller.refresh({ refreshToken: 'invalid' })).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('logout', () => {
    it('deve delegar a revogação ao use-case', async () => {
      await controller.logout({ refreshToken: 'token' });

      expect(logoutUseCase.execute).toHaveBeenCalledWith({ refreshToken: 'token' });
    });
  });

  describe('me', () => {
    it('deve retornar id e email do usuário autenticado', () => {
      const req = {
        user: { id: 'user-1', email: 'user@example.com' },
      } as AuthenticatedRequest;

      expect(controller.me(req)).toEqual({ id: 'user-1', email: 'user@example.com' });
    });
  });
});
