import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import crypto from 'node:crypto';
import { VerifyAbacatepayWebhookUseCase } from './verify-abacatepay-webhook.use-case.js';

describe('VerifyAbacatepayWebhookUseCase', () => {
  const publicKey = 'abacatepay-public-hmac-key';
  const webhookSecret = 'webhook-secret';
  const rawBodyV2 = JSON.stringify({
    id: 'log_123',
    event: 'checkout.completed',
    apiVersion: 2,
    devMode: true,
    data: {
      checkout: {
        id: 'bill_123',
      },
    },
  });

  const rawBodyV1 = JSON.stringify({
    event: 'billing.paid',
    devMode: true,
    data: {
      id: 'bill_123',
    },
  });

  const buildConfigService = (overrides: Record<string, string | undefined> = {}): ConfigService =>
    ({
      get: (key: string) => {
        const map: Record<string, string | undefined> = {
          ABACATEPAY_PUBLIC_HMAC_KEY: publicKey,
          ABACATEPAY_WEBHOOK_SECRET: webhookSecret,
          ...overrides,
        };

        return map[key];
      },
    }) as ConfigService;

  it('accepts a valid secret and signature', () => {
    const useCase = new VerifyAbacatepayWebhookUseCase(buildConfigService());
    const signature = crypto.createHmac('sha256', publicKey).update(rawBodyV2).digest('base64');

    const event = useCase.execute({
      webhookSecret,
      signature,
      rawBody: rawBodyV2,
    });

    expect(event.event).toBe('checkout.completed');
  });

  it('accepts a v1 webhook with only the configured secret', () => {
    const useCase = new VerifyAbacatepayWebhookUseCase(
      buildConfigService({
        ABACATEPAY_PUBLIC_HMAC_KEY: undefined,
      }),
    );

    const event = useCase.execute({
      webhookSecret,
      rawBody: rawBodyV1,
    });

    expect(event.event).toBe('billing.paid');
  });

  it('rejects an invalid signature', () => {
    const useCase = new VerifyAbacatepayWebhookUseCase(buildConfigService());

    expect(() =>
      useCase.execute({
        webhookSecret,
        signature: 'invalid-signature',
        rawBody: rawBodyV2,
      }),
    ).toThrow(UnauthorizedException);
  });

  it('rejects a signature when the HMAC key is missing', () => {
    const useCase = new VerifyAbacatepayWebhookUseCase(
      buildConfigService({
        ABACATEPAY_PUBLIC_HMAC_KEY: undefined,
      }),
    );

    expect(() =>
      useCase.execute({
        webhookSecret,
        signature: 'some-signature',
        rawBody: rawBodyV2,
      }),
    ).toThrow(UnauthorizedException);
  });
});
