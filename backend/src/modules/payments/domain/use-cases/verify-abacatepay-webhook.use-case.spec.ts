import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { VerifyAbacatepayWebhookUseCase } from './verify-abacatepay-webhook.use-case.js';

describe('VerifyAbacatepayWebhookUseCase', () => {
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
      billing: {
        id: 'bill_123',
      },
    },
  });

  const buildConfigService = (overrides: Record<string, string | undefined> = {}): ConfigService =>
    ({
      get: (key: string) => {
        const map: Record<string, string | undefined> = {
          ABACATEPAY_WEBHOOK_SECRET: webhookSecret,
          ...overrides,
        };

        return map[key];
      },
    }) as ConfigService;

  it('accepts a valid webhook secret', () => {
    const useCase = new VerifyAbacatepayWebhookUseCase(buildConfigService());

    const event = useCase.execute({
      webhookSecret,
      rawBody: rawBodyV2,
    });

    expect(event.event).toBe('checkout.completed');
  });

  it('accepts a billing.paid webhook', () => {
    const useCase = new VerifyAbacatepayWebhookUseCase(buildConfigService());

    const event = useCase.execute({
      webhookSecret,
      rawBody: rawBodyV1,
    });

    expect(event.event).toBe('billing.paid');
  });

  it('rejects an invalid webhook secret', () => {
    const useCase = new VerifyAbacatepayWebhookUseCase(buildConfigService());

    expect(() =>
      useCase.execute({
        webhookSecret: 'wrong-secret',
        rawBody: rawBodyV2,
      }),
    ).toThrow(UnauthorizedException);
  });

  it('throws when webhook secret is not configured', () => {
    const useCase = new VerifyAbacatepayWebhookUseCase(
      buildConfigService({
        ABACATEPAY_WEBHOOK_SECRET: undefined,
      }),
    );

    expect(() =>
      useCase.execute({
        webhookSecret,
        rawBody: rawBodyV2,
      }),
    ).toThrow(UnauthorizedException);
  });
});
