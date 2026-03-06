import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { SupabaseAuthGuard } from './auth.guard.js';
import { IS_PUBLIC_KEY } from '../../../../shared/presentation/decorators/public.decorator.js';

const makeContext = (token?: string, isPublic = false): ExecutionContext => {
  const reflector = { getAllAndOverride: jest.fn().mockReturnValue(isPublic) } as unknown as Reflector;
  return {
    getHandler: jest.fn(),
    getClass: jest.fn(),
    switchToHttp: () => ({
      getRequest: () => ({
        headers: { authorization: token ? `Bearer ${token}` : undefined },
        user: undefined,
      }),
    }),
    _reflector: reflector,
  } as unknown as ExecutionContext;
};

describe('SupabaseAuthGuard', () => {
  let guard: SupabaseAuthGuard;
  let reflector: jest.Mocked<Reflector>;
  let configService: jest.Mocked<ConfigService>;

  beforeEach(() => {
    reflector = {
      getAllAndOverride: jest.fn(),
    } as unknown as jest.Mocked<Reflector>;

    configService = {
      getOrThrow: jest.fn().mockReturnValue('https://fake.supabase.co'),
    } as unknown as jest.Mocked<ConfigService>;

    guard = new SupabaseAuthGuard(reflector, configService);
  });

  it('deve permitir acesso a rotas públicas sem token', async () => {
    reflector.getAllAndOverride.mockReturnValue(true);

    const ctx = {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: () => ({ getRequest: () => ({ headers: {} }) }),
    } as unknown as ExecutionContext;

    const result = await guard.canActivate(ctx);
    expect(result).toBe(true);
  });

  it('deve lançar UnauthorizedException se o token estiver ausente', async () => {
    reflector.getAllAndOverride.mockReturnValue(false);

    const ctx = {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: () => ({ getRequest: () => ({ headers: {} }) }),
    } as unknown as ExecutionContext;

    await expect(guard.canActivate(ctx)).rejects.toThrow(UnauthorizedException);
  });

  it('deve lançar UnauthorizedException se o header não começar com Bearer', async () => {
    reflector.getAllAndOverride.mockReturnValue(false);

    const ctx = {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: () => ({
        getRequest: () => ({ headers: { authorization: 'Token abc123' } }),
      }),
    } as unknown as ExecutionContext;

    await expect(guard.canActivate(ctx)).rejects.toThrow(UnauthorizedException);
  });
});
