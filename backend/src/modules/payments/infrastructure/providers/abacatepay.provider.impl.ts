import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type {
  AbacatepayCheckoutResponse,
  CreateAbacatepayCheckoutInput,
  IAbacatepayProvider,
} from '../../domain/providers/abacatepay.provider.js';

interface AbacatepayApiResponse<T> {
  data: T;
  error: string | null;
  success: boolean;
}

@Injectable()
export class AbacatepayProviderImpl implements IAbacatepayProvider {
  private readonly logger = new Logger(AbacatepayProviderImpl.name);
  private readonly apiBaseUrl: string;
  private readonly apiKey?: string;

  constructor(private readonly configService: ConfigService) {
    this.apiBaseUrl =
      this.configService.get<string>('ABACATEPAY_API_BASE_URL') ?? 'https://api.abacatepay.com/v2';
    this.apiKey = this.configService.get<string>('ABACATEPAY_API_KEY');
  }

  async createCheckout(input: CreateAbacatepayCheckoutInput): Promise<AbacatepayCheckoutResponse> {
    if (!this.apiKey) {
      throw new Error('ABACATEPAY_API_KEY is not configured');
    }

    const v1Frequency = 'ONE_TIME';

    const v1Payload: Record<string, unknown> = {
      frequency: v1Frequency,
      methods: input.methods ?? ['PIX', 'CARD'],
      products: input.items.map((item) => ({
        externalId: item.id,
        name: item.name,
        quantity: item.quantity,
        price: item.priceInCents,
      })),
      returnUrl: input.returnUrl ?? '',
      completionUrl: input.completionUrl ?? '',
      externalId: input.externalId,
      metadata: input.metadata,
    };

    if (input.customer) {
      v1Payload.customer = {
        name: input.customer.name,
        email: input.customer.email,
        cellphone: input.customer.cellphone,
        taxId: input.customer.taxId,
      };
    }

    const response = await fetch(`${this.apiBaseUrl}/billing/create`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(v1Payload),
    });

    const payload = (await response.json()) as AbacatepayApiResponse<AbacatepayCheckoutResponse>;

    if (!response.ok || !payload.success || !payload.data) {
      const errorMsg = payload.error ?? `HTTP ${response.status}: ${response.statusText}`;
      this.logger.error(`Checkout AbacatePay falhou: ${errorMsg}`);
      throw new Error(errorMsg);
    }

    const billing = payload.data;
    return {
      id: billing.id,
      url: billing.url,
      amount: billing.amount ?? 0,
      status: billing.status,
      frequency: billing.frequency,
      devMode: billing.devMode,
      externalId: billing.externalId ?? null,
      customerId: billing.customerId ?? null,
      createdAt: billing.createdAt,
      updatedAt: billing.updatedAt,
    };
  }
}
