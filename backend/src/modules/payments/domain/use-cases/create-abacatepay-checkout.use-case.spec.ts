import { BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CreateAbacatepayCheckoutUseCase } from './create-abacatepay-checkout.use-case.js';
import type { IAbacatepayProvider } from '../providers/abacatepay.provider.js';

describe('CreateAbacatepayCheckoutUseCase', () => {
  const provider: jest.Mocked<IAbacatepayProvider> = {
    createCheckout: jest.fn(),
  };

  const createConfigService = (allowedIds: string): ConfigService =>
    ({
      get: (key: string, defaultValue?: string) => {
        const map: Record<string, string> = {
          ABACATEPAY_ALLOWED_PRODUCT_IDS: allowedIds,
          ABACATEPAY_RETURN_URL: 'https://frontend.example.com/voltar',
          ABACATEPAY_COMPLETION_URL: 'https://frontend.example.com/sucesso',
        };

        return map[key] ?? defaultValue;
      },
    }) as ConfigService;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('creates checkout when product is allowed', async () => {
    provider.createCheckout.mockResolvedValue({
      id: 'bill_123',
      url: 'https://app.abacatepay.com/pay/bill_123',
      amount: 1990,
      status: 'PENDING',
      frequency: 'ONE_TIME',
      devMode: true,
      externalId: 'custom-ext',
      customerId: null,
      createdAt: '2026-03-28T00:00:00.000Z',
      updatedAt: '2026-03-28T00:00:00.000Z',
    });

    const useCase = new CreateAbacatepayCheckoutUseCase(
      provider,
      createConfigService('prod_basic,prod_pro'),
    );

    const result = await useCase.execute({
      userId: 'user-1',
      dto: {
        productId: 'prod_pro',
        quantity: 1,
        externalId: 'custom-ext',
        metadata: { source: 'web' },
      },
    });

    expect(result.url).toBe('https://app.abacatepay.com/pay/bill_123');
    expect(provider.createCheckout).toHaveBeenCalledWith({
      items: [{ id: 'prod_pro', quantity: 1 }],
      externalId: 'custom-ext',
      frequency: undefined,
      returnUrl: 'https://frontend.example.com/voltar',
      completionUrl: 'https://frontend.example.com/sucesso',
      methods: undefined,
      metadata: {
        userId: 'user-1',
        source: 'web',
      },
    });
  });

  it('rejects checkout when product is not allowed', async () => {
    const useCase = new CreateAbacatepayCheckoutUseCase(
      provider,
      createConfigService('prod_basic,prod_pro'),
    );

    await expect(
      useCase.execute({
        userId: 'user-1',
        dto: {
          productId: 'prod_enterprise',
          quantity: 1,
        },
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
