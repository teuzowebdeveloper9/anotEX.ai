import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import jwt from 'jsonwebtoken';
import { Request } from 'express';
import { IS_PUBLIC_KEY } from '../../../../shared/presentation/decorators/public.decorator.js';

export interface AuthenticatedRequest extends Request {
  user: { id: string; email: string };
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  private readonly logger = new Logger(JwtAuthGuard.name);
  private readonly jwtSecret: string;

  constructor(
    private readonly reflector: Reflector,
    configService: ConfigService,
  ) {
    this.jwtSecret = configService.getOrThrow<string>('JWT_SECRET');
  }

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) return true;

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const token = this.extractToken(request);
    const ip = request.ip ?? request.socket?.remoteAddress ?? 'unknown';

    if (!token) {
      this.logger.warn(`Auth rejected: missing token | ip=${ip} | path=${request.path}`);
      throw new UnauthorizedException('Missing authorization token');
    }

    let payload: string | jwt.JwtPayload;
    try {
      // Validação local (HS256) — sem chamada de rede, sem timeout
      payload = jwt.verify(token, this.jwtSecret, { algorithms: ['HS256'] });
    } catch {
      this.logger.warn(`Auth rejected: invalid token | ip=${ip} | path=${request.path}`);
      throw new UnauthorizedException('Invalid or expired token');
    }

    if (typeof payload === 'string' || typeof payload.sub !== 'string') {
      this.logger.warn(`Auth rejected: invalid token | ip=${ip} | path=${request.path}`);
      throw new UnauthorizedException('Invalid or expired token');
    }

    request.user = {
      id: payload.sub,
      email: typeof payload.email === 'string' ? payload.email : '',
    };
    return true;
  }

  private extractToken(request: Request): string | null {
    const authHeader = request.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) return null;
    return authHeader.slice(7);
  }
}
