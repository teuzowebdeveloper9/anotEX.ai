export interface CreateAbacatepayCheckoutInput {
  items: Array<{
    id: string;
    quantity: number;
  }>;
  externalId: string;
  frequency?: 'ONE_TIME' | 'SUBSCRIPTION';
  returnUrl?: string;
  completionUrl?: string;
  methods?: string[];
  metadata?: Record<string, string>;
}

export interface AbacatepayCheckoutResponse {
  id: string;
  url: string;
  amount: number;
  status: string;
  frequency: string;
  devMode: boolean;
  externalId: string | null;
  customerId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface IAbacatepayProvider {
  createCheckout(input: CreateAbacatepayCheckoutInput): Promise<AbacatepayCheckoutResponse>;
}

export const ABACATEPAY_PROVIDER = Symbol('ABACATEPAY_PROVIDER');
