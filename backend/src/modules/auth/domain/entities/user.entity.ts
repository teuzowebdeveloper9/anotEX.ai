export interface UserEntity {
  readonly id: string;
  readonly email: string;
  readonly passwordHash: string | null;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export interface AuthenticatedUser {
  readonly id: string;
  readonly email: string;
}
