export interface CreateAbacatepayCheckoutInput {
  items: Array<{
    id: string;
    name: string;
    quantity: number;
    // Preço resolvido no servidor a partir do catálogo — nunca vem do cliente
    priceInCents: number;
  }>;
  externalId: string;
  frequency?: 'ONE_TIME' | 'SUBSCRIPTION';
  returnUrl?: string;
  completionUrl?: string;
  methods?: string[];
  metadata?: Record<string, string>;
  customer?: {
    name: string;
    email: string;
    cellphone: string;
    taxId: string;
  };
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
