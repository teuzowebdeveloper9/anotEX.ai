export interface IAuthTokenRepository {
  createMagicLinkToken(userId: string, tokenHash: string, expiresAt: Date): Promise<void>;
  /**
   * Marca o token como usado de forma atômica (single-use).
   * Retorna o userId se o token era válido (existente, não expirado, não usado); null caso contrário.
   */
  consumeMagicLinkToken(tokenHash: string): Promise<{ userId: string } | null>;

  createRefreshToken(userId: string, tokenHash: string, expiresAt: Date): Promise<void>;
  /**
   * Revoga o refresh token de forma atômica (rotação).
   * Retorna o userId se o token era válido (existente, não expirado, não revogado); null caso contrário.
   */
  consumeRefreshToken(tokenHash: string): Promise<{ userId: string } | null>;
  /** Revoga o refresh token. Idempotente — não falha se já revogado ou inexistente. */
  revokeRefreshToken(tokenHash: string): Promise<void>;
}

export const AUTH_TOKEN_REPOSITORY = Symbol('IAuthTokenRepository');
