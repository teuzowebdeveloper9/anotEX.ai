import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EmailClient, KnownEmailSendStatus } from '@azure/communication-email';
import type { IEmailProvider } from '../../domain/repositories/email.provider.js';

function buildMagicLinkHtml(link: string, expiresInMinutes: number): string {
  return `<!DOCTYPE html>
<html lang="pt-BR">
  <body style="margin:0;padding:0;background-color:#080a0f;font-family:Arial,Helvetica,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#080a0f;padding:40px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background-color:#10131a;border:1px solid #1f2430;border-radius:12px;padding:40px 32px;">
            <tr>
              <td align="center" style="padding-bottom:24px;">
                <span style="color:#e5e7eb;font-size:22px;font-weight:bold;">anotEX.ai</span>
              </td>
            </tr>
            <tr>
              <td align="center" style="color:#e5e7eb;font-size:16px;line-height:24px;padding-bottom:8px;">
                Seu link de acesso chegou.
              </td>
            </tr>
            <tr>
              <td align="center" style="color:#9ca3af;font-size:14px;line-height:20px;padding-bottom:32px;">
                Clique no bot&atilde;o abaixo para entrar. Este link expira em ${expiresInMinutes} minutos e s&oacute; pode ser usado uma vez.
              </td>
            </tr>
            <tr>
              <td align="center" style="padding-bottom:32px;">
                <a href="${link}" style="display:inline-block;background-color:#6366f1;color:#ffffff;text-decoration:none;font-size:15px;font-weight:bold;padding:14px 32px;border-radius:8px;">
                  Entrar no anotEX.ai
                </a>
              </td>
            </tr>
            <tr>
              <td align="center" style="color:#6b7280;font-size:12px;line-height:18px;">
                Se voc&ecirc; n&atilde;o solicitou este email, pode ignor&aacute;-lo com seguran&ccedil;a.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

@Injectable()
export class AcsEmailProviderImpl implements IEmailProvider {
  private readonly logger = new Logger(AcsEmailProviderImpl.name);
  private readonly emailClient: EmailClient;
  private readonly senderAddress: string;

  constructor(configService: ConfigService) {
    this.emailClient = new EmailClient(
      configService.getOrThrow<string>('ACS_CONNECTION_STRING'),
    );
    this.senderAddress = configService.getOrThrow<string>('ACS_SENDER_ADDRESS');
  }

  async sendMagicLink(to: string, link: string, expiresInMinutes: number): Promise<void> {
    const poller = await this.emailClient.beginSend({
      senderAddress: this.senderAddress,
      recipients: { to: [{ address: to }] },
      content: {
        subject: 'Seu link de acesso — anotEX.ai',
        html: buildMagicLinkHtml(link, expiresInMinutes),
      },
    });

    const result = await poller.pollUntilDone();

    if (result.status !== KnownEmailSendStatus.Succeeded) {
      this.logger.error(`Falha no envio do magic link via ACS | status=${result.status}`);
      throw new Error(`Failed to send magic link email: status=${result.status}`);
    }
  }
}
