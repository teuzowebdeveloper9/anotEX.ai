import { ConfigService } from '@nestjs/config';
import jwt from 'jsonwebtoken';
import { JwtTokenProviderImpl } from './jwt-token.provider.impl.js';

const TEST_SECRET = 'test-secret-with-at-least-32-characters!!';

const makeConfigService = (expiresIn?: string): jest.Mocked<ConfigService> =>
  ({
    getOrThrow: jest.fn().mockReturnValue(TEST_SECRET),
    get: jest.fn().mockImplementation((_key: string, defaultValue: string) => expiresIn ?? defaultValue),
  }) as unknown as jest.Mocked<ConfigService>;

describe('JwtTokenProviderImpl', () => {
  it('deve assinar JWT HS256 verificável com o secret configurado', () => {
    const provider = new JwtTokenProviderImpl(makeConfigService());

    const token = provider.signAccessToken({ sub: 'user-1', email: 'user@example.com' });
    const payload = jwt.verify(token, TEST_SECRET, { algorithms: ['HS256'] });

    expect(typeof payload).not.toBe('string');
    expect((payload as jwt.JwtPayload).sub).toBe('user-1');
    expect((payload as jwt.JwtPayload).email).toBe('user@example.com');

    const decoded = jwt.decode(token, { complete: true });
    expect(decoded?.header.alg).toBe('HS256');
  });

  it('deve usar expiração padrão de 1h quando JWT_EXPIRES_IN não está definido', () => {
    const provider = new JwtTokenProviderImpl(makeConfigService());

    const token = provider.signAccessToken({ sub: 'user-1', email: 'user@example.com' });
    const payload = jwt.verify(token, TEST_SECRET) as jwt.JwtPayload;

    expect((payload.exp as number) - (payload.iat as number)).toBe(3600);
  });

  it('deve respeitar JWT_EXPIRES_IN configurado', () => {
    const provider = new JwtTokenProviderImpl(makeConfigService('2h'));

    const token = provider.signAccessToken({ sub: 'user-1', email: 'user@example.com' });
    const payload = jwt.verify(token, TEST_SECRET) as jwt.JwtPayload;

    expect((payload.exp as number) - (payload.iat as number)).toBe(7200);
  });
});
