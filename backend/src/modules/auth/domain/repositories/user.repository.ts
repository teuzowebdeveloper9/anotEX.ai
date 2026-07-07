import type { UserEntity } from '../entities/user.entity.js';

export interface IUserRepository {
  findByEmail(email: string): Promise<UserEntity | null>;
  findById(id: string): Promise<UserEntity | null>;
  create(email: string, passwordHash: string | null): Promise<UserEntity>;
  setPassword(id: string, passwordHash: string): Promise<void>;
}

export const USER_REPOSITORY = Symbol('IUserRepository');
