import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import jwt from 'jsonwebtoken';
import { JwtAuthGuard } from './auth.guard.js';

const TEST_SECRET = 'test-secret-with-at-least-32-characters!!';

interface MockRequestOptions {
  authorization?: string;
  ip?: string;
  remoteAddress?: string;
}

const makeContext = (options: MockRequestOptions = {}): { ctx: ExecutionContext; request: Record<string, unknown> } => {
  const request: Record<string, unknown> = {
    headers: options.authorization ? { authorization: options.authorization } : {},
    ip: options.ip,
    socket: options.remoteAddress ? { remoteAddress: options.remoteAddress } : undefined,
    path: '/api/v1/protected',
    user: undefined,
  };

  const ctx = {
    getHandler: jest.fn(),
    getClass: jest.fn(),
    switchToHttp: () => ({ getRequest: () => request }),
  } as unknown as ExecutionContext;

  return { ctx, request };
};

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;
  let reflector: jest.Mocked<Reflector>;
  let configService: jest.Mocked<ConfigService>;

  beforeEach(() => {
    reflector = {
      getAllAndOverride: jest.fn().mockReturnValue(false),
    } as unknown as jest.Mocked<Reflector>;

    configService = {
      getOrThrow: jest.fn().mockReturnValue(TEST_SECRET),
    } as unknown as jest.Mocked<ConfigService>;

    guard = new JwtAuthGuard(reflector, configService);
  });

  it('deve permitir acesso a rotas públicas sem token', () => {
    reflector.getAllAndOverride.mockReturnValue(true);
    const { ctx } = makeContext();

    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('deve lançar UnauthorizedException se o token estiver ausente', () => {
    const { ctx } = makeContext();

    expect(() => guard.canActivate(ctx)).toThrow(UnauthorizedException);
    expect(() => guard.canActivate(ctx)).toThrow('Missing authorization token');
  });

  it('deve lançar UnauthorizedException se o header não começar com Bearer', () => {
    const { ctx } = makeContext({ authorization: 'Token abc123', ip: '10.0.0.1' });

    expect(() => guard.canActivate(ctx)).toThrow('Missing authorization token');
  });

  it('deve lançar UnauthorizedException para token malformado', () => {
    const { ctx } = makeContext({
      authorization: 'Bearer not-a-jwt',
      remoteAddress: '10.0.0.2',
    });

    expect(() => guard.canActivate(ctx)).toThrow('Invalid or expired token');
  });

  it('deve lançar UnauthorizedException para token expirado', () => {
    const expired = jwt.sign({ sub: 'user-1', email: 'a@b.com' }, TEST_SECRET, {
      algorithm: 'HS256',
      expiresIn: -1,
    });
    const { ctx } = makeContext({ authorization: `Bearer ${expired}` });

    expect(() => guard.canActivate(ctx)).toThrow('Invalid or expired token');
  });

  it('deve lançar UnauthorizedException para token assinado com outro secret', () => {
    const forged = jwt.sign({ sub: 'user-1', email: 'a@b.com' }, 'another-secret', {
      algorithm: 'HS256',
      expiresIn: '1h',
    });
    const { ctx } = makeContext({ authorization: `Bearer ${forged}` });

    expect(() => guard.canActivate(ctx)).toThrow('Invalid or expired token');
  });

  it('deve lançar UnauthorizedException para payload sem sub', () => {
    const noSub = jwt.sign({ email: 'a@b.com' }, TEST_SECRET, {
      algorithm: 'HS256',
      expiresIn: '1h',
    });
    const { ctx } = makeContext({ authorization: `Bearer ${noSub}` });

    expect(() => guard.canActivate(ctx)).toThrow('Invalid or expired token');
  });

  it('deve lançar UnauthorizedException para payload em formato string', () => {
    const stringPayload = jwt.sign('raw-string-payload', TEST_SECRET, { algorithm: 'HS256' });
    const { ctx } = makeContext({ authorization: `Bearer ${stringPayload}` });

    expect(() => guard.canActivate(ctx)).toThrow('Invalid or expired token');
  });

  it('deve permitir acesso e popular request.user com token válido', () => {
    const valid = jwt.sign({ sub: 'user-1', email: 'user@example.com' }, TEST_SECRET, {
      algorithm: 'HS256',
      expiresIn: '1h',
    });
    const { ctx, request } = makeContext({ authorization: `Bearer ${valid}` });

    expect(guard.canActivate(ctx)).toBe(true);
    expect(request.user).toEqual({ id: 'user-1', email: 'user@example.com' });
  });

  it('deve popular email vazio quando o payload não contém email', () => {
    const noEmail = jwt.sign({ sub: 'user-1' }, TEST_SECRET, {
      algorithm: 'HS256',
      expiresIn: '1h',
    });
    const { ctx, request } = makeContext({ authorization: `Bearer ${noEmail}` });

    expect(guard.canActivate(ctx)).toBe(true);
    expect(request.user).toEqual({ id: 'user-1', email: '' });
  });
});
