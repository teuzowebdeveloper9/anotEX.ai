import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import jwt from 'jsonwebtoken';
import type {
  AccessTokenPayload,
  ITokenProvider,
} from '../../domain/repositories/token.provider.js';

@Injectable()
export class JwtTokenProviderImpl implements ITokenProvider {
  private readonly secret: string;
  private readonly expiresIn: string;

  constructor(configService: ConfigService) {
    this.secret = configService.getOrThrow<string>('JWT_SECRET');
    this.expiresIn = configService.get<string>('JWT_EXPIRES_IN', '1h');
  }

  signAccessToken(payload: AccessTokenPayload): string {
    return jwt.sign({ sub: payload.sub, email: payload.email }, this.secret, {
      algorithm: 'HS256',
      expiresIn: this.expiresIn as jwt.SignOptions['expiresIn'],
    });
  }
}
