import { BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CreateAbacatepayCheckoutUseCase } from './create-abacatepay-checkout.use-case.js';
import type { IAbacatepayProvider } from '../providers/abacatepay.provider.js';

describe('CreateAbacatepayCheckoutUseCase', () => {
  const provider: jest.Mocked<IAbacatepayProvider> = {
    createCheckout: jest.fn(),
  };

  const createConfigService = (products: string): ConfigService =>
    ({
      get: (key: string, defaultValue?: string) => {
        const map: Record<string, string> = {
          ABACATEPAY_PRODUCTS: products,
          ABACATEPAY_RETURN_URL: 'https://frontend.example.com/voltar',
          ABACATEPAY_COMPLETION_URL: 'https://frontend.example.com/sucesso',
        };

        return map[key] ?? defaultValue;
      },
    }) as ConfigService;

  const CATALOG = 'prod_basic:990:AnotEx Basic,prod_pro:3990:AnotEx Pro';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('cria o checkout com preço e nome do catálogo do servidor (ignora valor do cliente)', async () => {
    provider.createCheckout.mockResolvedValue({
      id: 'bill_123',
      url: 'https://app.abacatepay.com/pay/bill_123',
      amount: 3990,
      status: 'PENDING',
      frequency: 'ONE_TIME',
      devMode: true,
      externalId: 'custom-ext',
      customerId: null,
      createdAt: '2026-03-28T00:00:00.000Z',
      updatedAt: '2026-03-28T00:00:00.000Z',
    });

    const useCase = new CreateAbacatepayCheckoutUseCase(provider, createConfigService(CATALOG));

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
      items: [{ id: 'prod_pro', name: 'AnotEx Pro', quantity: 1, priceInCents: 3990 }],
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

  it('recusa checkout quando o produto não está no catálogo', async () => {
    const useCase = new CreateAbacatepayCheckoutUseCase(provider, createConfigService(CATALOG));

    await expect(
      useCase.execute({
        userId: 'user-1',
        dto: { productId: 'prod_enterprise', quantity: 1 },
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(provider.createCheckout).not.toHaveBeenCalled();
  });

  it('recusa checkout quando o catálogo está vazio (fail-closed)', async () => {
    const useCase = new CreateAbacatepayCheckoutUseCase(provider, createConfigService(''));

    await expect(
      useCase.execute({
        userId: 'user-1',
        dto: { productId: 'prod_pro', quantity: 1 },
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(provider.createCheckout).not.toHaveBeenCalled();
  });
});
