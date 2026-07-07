import { ConfigService } from '@nestjs/config';
import { EmailClient } from '@azure/communication-email';
import { AcsEmailProviderImpl } from './acs-email.provider.impl.js';

jest.mock('@azure/communication-email', () => {
  const actual: Record<string, unknown> = jest.requireActual('@azure/communication-email');
  return { ...actual, EmailClient: jest.fn() };
});

const EmailClientMock = EmailClient as jest.MockedClass<typeof EmailClient>;

const makeConfigService = (): jest.Mocked<ConfigService> =>
  ({
    getOrThrow: jest.fn().mockImplementation((key: string) => {
      if (key === 'ACS_CONNECTION_STRING') return 'endpoint=https://acs.example.com/;accesskey=fake';
      if (key === 'ACS_SENDER_ADDRESS') return 'noreply@anotex.ai';
      throw new Error(`Unexpected config key: ${key}`);
    }),
  }) as unknown as jest.Mocked<ConfigService>;

describe('AcsEmailProviderImpl', () => {
  let beginSend: jest.Mock;
  let pollUntilDone: jest.Mock;

  beforeEach(() => {
    pollUntilDone = jest.fn().mockResolvedValue({ status: 'Succeeded' });
    beginSend = jest.fn().mockResolvedValue({ pollUntilDone });
    EmailClientMock.mockImplementation(
      () => ({ beginSend }) as unknown as EmailClient,
    );
  });

  describe('sendMagicLink', () => {
    it('deve enviar o email via ACS com sender, destinatário e link no corpo', async () => {
      const provider = new AcsEmailProviderImpl(makeConfigService());

      await provider.sendMagicLink('user@example.com', 'https://app/auth/callback?token=abc', 15);

      expect(EmailClientMock).toHaveBeenCalledWith(
        'endpoint=https://acs.example.com/;accesskey=fake',
      );
      expect(beginSend).toHaveBeenCalledTimes(1);

      const message = beginSend.mock.calls[0][0] as {
        senderAddress: string;
        recipients: { to: Array<{ address: string }> };
        content: { subject: string; html: string };
      };
      expect(message.senderAddress).toBe('noreply@anotex.ai');
      expect(message.recipients.to).toEqual([{ address: 'user@example.com' }]);
      expect(message.content.html).toContain('https://app/auth/callback?token=abc');
      expect(message.content.html).toContain('15 minutos');
    });

    it('deve aguardar o poller até a conclusão do envio', async () => {
      const provider = new AcsEmailProviderImpl(makeConfigService());

      await provider.sendMagicLink('user@example.com', 'https://app/auth/callback?token=abc', 15);

      expect(pollUntilDone).toHaveBeenCalledTimes(1);
    });

    it('deve lançar erro quando o status final não é Succeeded', async () => {
      pollUntilDone.mockResolvedValue({ status: 'Failed' });
      const provider = new AcsEmailProviderImpl(makeConfigService());

      await expect(
        provider.sendMagicLink('user@example.com', 'https://app/auth/callback?token=abc', 15),
      ).rejects.toThrow('Failed to send magic link email');
    });
  });
});
