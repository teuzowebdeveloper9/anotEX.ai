import {
  CreateSessionUseCase,
  REFRESH_TOKEN_TTL_DAYS,
  sha256Hex,
} from './create-session.use-case.js';
import type { IAuthTokenRepository } from '../repositories/auth-token.repository.js';
import type { ITokenProvider } from '../repositories/token.provider.js';

describe('CreateSessionUseCase', () => {
  let useCase: CreateSessionUseCase;
  let tokenProvider: jest.Mocked<ITokenProvider>;
  let authTokenRepository: jest.Mocked<IAuthTokenRepository>;

  const user = { id: 'user-1', email: 'user@example.com' };

  beforeEach(() => {
    tokenProvider = {
      signAccessToken: jest.fn().mockReturnValue('signed-jwt'),
    } as jest.Mocked<ITokenProvider>;

    authTokenRepository = {
      createMagicLinkToken: jest.fn(),
      consumeMagicLinkToken: jest.fn(),
      createRefreshToken: jest.fn().mockResolvedValue(undefined),
      consumeRefreshToken: jest.fn(),
      revokeRefreshToken: jest.fn(),
    } as jest.Mocked<IAuthTokenRepository>;

    useCase = new CreateSessionUseCase(tokenProvider, authTokenRepository);
  });

  describe('execute', () => {
    it('deve emitir um accessToken JWT com payload sub e email', async () => {
      const session = await useCase.execute(user);

      expect(tokenProvider.signAccessToken).toHaveBeenCalledWith({
        sub: 'user-1',
        email: 'user@example.com',
      });
      expect(session.accessToken).toBe('signed-jwt');
      expect(session.user).toEqual({ id: 'user-1', email: 'user@example.com' });
    });

    it('deve gerar refreshToken opaco de 48 bytes em hex (96 caracteres)', async () => {
      const session = await useCase.execute(user);

      expect(session.refreshToken).toMatch(/^[0-9a-f]{96}$/);
    });

    it('deve armazenar apenas o sha256 do refreshToken com validade de 30 dias', async () => {
      const before = Date.now();
      const session = await useCase.execute(user);
      const after = Date.now();

      expect(authTokenRepository.createRefreshToken).toHaveBeenCalledTimes(1);
      const [userId, tokenHash, expiresAt] = authTokenRepository.createRefreshToken.mock.calls[0];

      expect(userId).toBe('user-1');
      expect(tokenHash).toBe(sha256Hex(session.refreshToken));
      expect(tokenHash).not.toContain(session.refreshToken);

      const ttlMs = REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000;
      expect(expiresAt.getTime()).toBeGreaterThanOrEqual(before + ttlMs);
      expect(expiresAt.getTime()).toBeLessThanOrEqual(after + ttlMs);
    });

    it('deve gerar refreshTokens diferentes a cada chamada', async () => {
      const first = await useCase.execute(user);
      const second = await useCase.execute(user);

      expect(first.refreshToken).not.toBe(second.refreshToken);
    });
  });
});
