export interface IEmailProvider {
  sendMagicLink(to: string, link: string, expiresInMinutes: number): Promise<void>;
}

export const EMAIL_PROVIDER = Symbol('IEmailProvider');
