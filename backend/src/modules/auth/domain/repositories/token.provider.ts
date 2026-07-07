export interface AccessTokenPayload {
  readonly sub: string;
  readonly email: string;
}

export interface ITokenProvider {
  signAccessToken(payload: AccessTokenPayload): string;
}

export const TOKEN_PROVIDER = Symbol('ITokenProvider');
