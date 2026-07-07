import { ConfigService } from '@nestjs/config';
import { RequestMagicLinkUseCase } from './request-magic-link.use-case.js';
import { sha256Hex } from './create-session.use-case.js';
import type { IUserRepository } from '../repositories/user.repository.js';
import type { IAuthTokenRepository } from '../repositories/auth-token.repository.js';
import type { IEmailProvider } from '../repositories/email.provider.js';
import type { UserEntity } from '../entities/user.entity.js';

const makeUser = (overrides: Partial<UserEntity> = {}): UserEntity => ({
  id: 'user-1',
  email: 'user@example.com',
  passwordHash: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

describe('RequestMagicLinkUseCase', () => {
  let useCase: RequestMagicLinkUseCase;
  let userRepository: jest.Mocked<IUserRepository>;
  let authTokenRepository: jest.Mocked<IAuthTokenRepository>;
  let emailProvider: jest.Mocked<IEmailProvider>;
  let configService: jest.Mocked<ConfigService>;

  beforeEach(() => {
    userRepository = {
      findByEmail: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      setPassword: jest.fn(),
    } as jest.Mocked<IUserRepository>;

    authTokenRepository = {
      createMagicLinkToken: jest.fn().mockResolvedValue(undefined),
      consumeMagicLinkToken: jest.fn(),
      createRefreshToken: jest.fn(),
      consumeRefreshToken: jest.fn(),
      revokeRefreshToken: jest.fn(),
    } as jest.Mocked<IAuthTokenRepository>;

    emailProvider = {
      sendMagicLink: jest.fn().mockResolvedValue(undefined),
    } as jest.Mocked<IEmailProvider>;

    configService = {
      get: jest.fn().mockImplementation((_key: string, defaultValue: unknown) => defaultValue),
      getOrThrow: jest.fn().mockReturnValue('https://app.anotex.ai'),
    } as unknown as jest.Mocked<ConfigService>;

    useCase = new RequestMagicLinkUseCase(
      userRepository,
      authTokenRepository,
      emailProvider,
      configService,
    );
  });

  describe('execute', () => {
    it('deve criar o usuário sem senha caso o email não exista', async () => {
      userRepository.findByEmail.mockResolvedValue(null);
      userRepository.create.mockResolvedValue(makeUser());

      await useCase.execute({ email: 'user@example.com' });

      expect(userRepository.create).toHaveBeenCalledWith('user@example.com', null);
    });

    it('não deve criar usuário caso o email já exista', async () => {
      userRepository.findByEmail.mockResolvedValue(makeUser());

      await useCase.execute({ email: 'user@example.com' });

      expect(userRepository.create).not.toHaveBeenCalled();
    });

    it('deve normalizar o email (trim e lowercase) antes de buscar', async () => {
      userRepository.findByEmail.mockResolvedValue(makeUser());

      await useCase.execute({ email: '  User@Example.COM  ' });

      expect(userRepository.findByEmail).toHaveBeenCalledWith('user@example.com');
    });

    it('deve salvar o sha256 do token com validade padrão de 15 minutos', async () => {
      userRepository.findByEmail.mockResolvedValue(makeUser());

      const before = Date.now();
      await useCase.execute({ email: 'user@example.com' });
      const after = Date.now();

      expect(authTokenRepository.createMagicLinkToken).toHaveBeenCalledTimes(1);
      const [userId, tokenHash, expiresAt] =
        authTokenRepository.createMagicLinkToken.mock.calls[0];

      expect(userId).toBe('user-1');
      expect(tokenHash).toMatch(/^[0-9a-f]{64}$/);

      const ttlMs = 15 * 60 * 1000;
      expect(expiresAt.getTime()).toBeGreaterThanOrEqual(before + ttlMs);
      expect(expiresAt.getTime()).toBeLessThanOrEqual(after + ttlMs);
    });

    it('deve enviar email com link contendo o token em claro (96 caracteres hex)', async () => {
      userRepository.findByEmail.mockResolvedValue(makeUser());

      await useCase.execute({ email: 'user@example.com' });

      expect(emailProvider.sendMagicLink).toHaveBeenCalledTimes(1);
      const [to, link, expiresInMinutes] = emailProvider.sendMagicLink.mock.calls[0];

      expect(to).toBe('user@example.com');
      expect(expiresInMinutes).toBe(15);

      const match = /^https:\/\/app\.anotex\.ai\/auth\/callback\?token=([0-9a-f]{96})$/.exec(link);
      expect(match).not.toBeNull();

      // O hash salvo deve corresponder ao sha256 do token enviado no link
      const token = (match as RegExpExecArray)[1];
      const [, storedHash] = authTokenRepository.createMagicLinkToken.mock.calls[0];
      expect(storedHash).toBe(sha256Hex(token));
    });

    it('deve respeitar MAGIC_LINK_EXPIRES_IN_MINUTES configurado', async () => {
      userRepository.findByEmail.mockResolvedValue(makeUser());
      configService.get.mockReturnValue(30);

      await useCase.execute({ email: 'user@example.com' });

      const [, , expiresInMinutes] = emailProvider.sendMagicLink.mock.calls[0];
      expect(expiresInMinutes).toBe(30);
    });

    it('deve propagar o erro caso o envio do email falhe', async () => {
      userRepository.findByEmail.mockResolvedValue(makeUser());
      emailProvider.sendMagicLink.mockRejectedValue(new Error('ACS unavailable'));

      await expect(useCase.execute({ email: 'user@example.com' })).rejects.toThrow(
        'ACS unavailable',
      );
    });
  });
});
