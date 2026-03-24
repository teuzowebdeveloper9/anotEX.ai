import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Request } from 'express';
import { IS_PUBLIC_KEY } from '../../../../shared/presentation/decorators/public.decorator.js';

export interface AuthenticatedRequest extends Request {
  user: { id: string; email: string };
}

const AUTH_TIMEOUT_MS = 5000;

@Injectable()
export class SupabaseAuthGuard implements CanActivate {
  private readonly logger = new Logger(SupabaseAuthGuard.name);
  private readonly supabase: SupabaseClient;

  constructor(
    private readonly reflector: Reflector,
    configService: ConfigService,
  ) {
    this.supabase = createClient(
      configService.getOrThrow<string>('SUPABASE_URL'),
      configService.getOrThrow<string>('SUPABASE_ANON_KEY'),
    );
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) return true;

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const token = this.extractToken(request);
    const ip = request.ip ?? request.socket.remoteAddress ?? 'unknown';

    if (!token) {
      this.logger.warn(`Auth rejected: missing token | ip=${ip} | path=${request.path}`);
      throw new UnauthorizedException('Missing authorization token');
    }

    const timeout = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Supabase auth timeout')), AUTH_TIMEOUT_MS),
    );

    let data: Awaited<ReturnType<typeof this.supabase.auth.getUser>>['data'];
    let error: Awaited<ReturnType<typeof this.supabase.auth.getUser>>['error'];

    try {
      ({ data, error } = await Promise.race([this.supabase.auth.getUser(token), timeout]));
    } catch (err) {
      this.logger.error(`Auth timeout or error | ip=${ip} | path=${request.path}`, err instanceof Error ? err.message : String(err));
      throw new UnauthorizedException('Authentication service unavailable');
    }

    if (error || !data.user) {
      this.logger.warn(`Auth rejected: invalid token | ip=${ip} | path=${request.path}`);
      throw new UnauthorizedException('Invalid or expired token');
    }

    request.user = { id: data.user.id, email: data.user.email ?? '' };
    return true;
  }

  private extractToken(request: Request): string | null {
    const authHeader = request.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) return null;
    return authHeader.slice(7);
  }
}
