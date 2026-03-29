import { Injectable } from '@nestjs/common';
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

    const response = await fetch(`${this.apiBaseUrl}/checkouts/create`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(input),
    });

    const payload = (await response.json()) as AbacatepayApiResponse<AbacatepayCheckoutResponse>;

    if (!response.ok || !payload.success || !payload.data) {
      throw new Error(payload.error ?? 'AbacatePay checkout creation failed');
    }

    return payload.data;
  }
}
