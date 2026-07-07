import type { AuthenticatedUser } from './user.entity.js';

export interface AuthSession {
  readonly accessToken: string;
  readonly refreshToken: string;
  readonly user: AuthenticatedUser;
}
