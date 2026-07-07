import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { PostgresService } from '../../../../shared/infrastructure/config/postgres.config.js';
import type { IAuthTokenRepository } from '../../domain/repositories/auth-token.repository.js';

interface UserIdRow {
  user_id: string;
}

@Injectable()
export class AuthTokenRepositoryImpl implements IAuthTokenRepository {
  constructor(private readonly postgresService: PostgresService) {}

  async createMagicLinkToken(userId: string, tokenHash: string, expiresAt: Date): Promise<void> {
    await this.postgresService.query(
      `INSERT INTO magic_link_tokens (id, user_id, token_hash, expires_at, created_at)
       VALUES ($1, $2, $3, $4, now())`,
      [randomUUID(), userId, tokenHash, expiresAt],
    );
  }

  async consumeMagicLinkToken(tokenHash: string): Promise<{ userId: string } | null> {
    // UPDATE atômico garante single-use mesmo com requisições concorrentes
    const result = await this.postgresService.query<UserIdRow>(
      `UPDATE magic_link_tokens
       SET used_at = now()
       WHERE token_hash = $1 AND used_at IS NULL AND expires_at > now()
       RETURNING user_id`,
      [tokenHash],
    );
    return result.rows[0] ? { userId: result.rows[0].user_id } : null;
  }

  async createRefreshToken(userId: string, tokenHash: string, expiresAt: Date): Promise<void> {
    await this.postgresService.query(
      `INSERT INTO refresh_tokens (id, user_id, token_hash, expires_at, created_at)
       VALUES ($1, $2, $3, $4, now())`,
      [randomUUID(), userId, tokenHash, expiresAt],
    );
  }

  async consumeRefreshToken(tokenHash: string): Promise<{ userId: string } | null> {
    // Rotação atômica: valida e revoga em uma única operação
    const result = await this.postgresService.query<UserIdRow>(
      `UPDATE refresh_tokens
       SET revoked_at = now()
       WHERE token_hash = $1 AND revoked_at IS NULL AND expires_at > now()
       RETURNING user_id`,
      [tokenHash],
    );
    return result.rows[0] ? { userId: result.rows[0].user_id } : null;
  }

  async revokeRefreshToken(tokenHash: string): Promise<void> {
    await this.postgresService.query(
      `UPDATE refresh_tokens SET revoked_at = now() WHERE token_hash = $1 AND revoked_at IS NULL`,
      [tokenHash],
    );
  }
}
