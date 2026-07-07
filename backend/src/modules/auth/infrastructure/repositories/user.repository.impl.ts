import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { PostgresService } from '../../../../shared/infrastructure/config/postgres.config.js';
import type { IUserRepository } from '../../domain/repositories/user.repository.js';
import type { UserEntity } from '../../domain/entities/user.entity.js';

interface UserRow {
  id: string;
  email: string;
  password_hash: string | null;
  created_at: Date;
  updated_at: Date;
}

const USER_COLUMNS = 'id, email, password_hash, created_at, updated_at';

@Injectable()
export class UserRepositoryImpl implements IUserRepository {
  constructor(private readonly postgresService: PostgresService) {}

  async findByEmail(email: string): Promise<UserEntity | null> {
    const result = await this.postgresService.query<UserRow>(
      `SELECT ${USER_COLUMNS} FROM users WHERE lower(email) = lower($1) LIMIT 1`,
      [email],
    );
    return result.rows[0] ? this.toEntity(result.rows[0]) : null;
  }

  async findById(id: string): Promise<UserEntity | null> {
    const result = await this.postgresService.query<UserRow>(
      `SELECT ${USER_COLUMNS} FROM users WHERE id = $1 LIMIT 1`,
      [id],
    );
    return result.rows[0] ? this.toEntity(result.rows[0]) : null;
  }

  async create(email: string, passwordHash: string | null): Promise<UserEntity> {
    const result = await this.postgresService.query<UserRow>(
      `INSERT INTO users (id, email, password_hash, created_at, updated_at)
       VALUES ($1, $2, $3, now(), now())
       RETURNING ${USER_COLUMNS}`,
      [randomUUID(), email, passwordHash],
    );
    return this.toEntity(result.rows[0]);
  }

  async setPassword(id: string, passwordHash: string): Promise<void> {
    await this.postgresService.query(
      `UPDATE users SET password_hash = $2, updated_at = now() WHERE id = $1`,
      [id, passwordHash],
    );
  }

  private toEntity(row: UserRow): UserEntity {
    return {
      id: row.id,
      email: row.email,
      passwordHash: row.password_hash,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }
}
