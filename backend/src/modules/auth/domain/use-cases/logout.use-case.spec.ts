import { LogoutUseCase } from './logout.use-case.js';
import { sha256Hex } from './create-session.use-case.js';
import type { IAuthTokenRepository } from '../repositories/auth-token.repository.js';

describe('LogoutUseCase', () => {
  let useCase: LogoutUseCase;
  let authTokenRepository: jest.Mocked<IAuthTokenRepository>;

  beforeEach(() => {
    authTokenRepository = {
      createMagicLinkToken: jest.fn(),
      consumeMagicLinkToken: jest.fn(),
      createRefreshToken: jest.fn(),
      consumeRefreshToken: jest.fn(),
      revokeRefreshToken: jest.fn().mockResolvedValue(undefined),
    } as jest.Mocked<IAuthTokenRepository>;

    useCase = new LogoutUseCase(authTokenRepository);
  });

  describe('execute', () => {
    it('deve revogar o refresh token pelo sha256', async () => {
      await useCase.execute({ refreshToken: 'my-refresh-token' });

      expect(authTokenRepository.revokeRefreshToken).toHaveBeenCalledWith(
        sha256Hex('my-refresh-token'),
      );
    });

    it('deve ser idempotente — não lança erro para token já revogado ou inexistente', async () => {
      await expect(useCase.execute({ refreshToken: 'unknown-token' })).resolves.toBeUndefined();
    });
  });
});
