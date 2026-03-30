import { api } from '@/shared/api/axios'
import type { CheckoutResponse, CreateCheckoutParams } from '../types/pricing.types'

export async function createCheckout(params: CreateCheckoutParams): Promise<CheckoutResponse> {
  const { data } = await api.post<CheckoutResponse>('/payments/abacatepay/checkout', params)
  return data
}

export interface SaveCustomerDataParams {
  name: string
  email: string
  cellphone: string
  taxId: string
}

export interface SaveCustomerDataResponse {
  hasSubscription: boolean
  status: string | null
}

export async function saveCustomerData(params: SaveCustomerDataParams): Promise<SaveCustomerDataResponse> {
  const { data } = await api.post<SaveCustomerDataResponse>('/payments/save-customer-data', params)
  return data
}

export interface SubscriptionStatusResponse {
  hasSubscription: boolean
  status: string | null
}

export async function getSubscriptionStatus(): Promise<SubscriptionStatusResponse> {
  const { data } = await api.get<SubscriptionStatusResponse>('/payments/subscription-status')
  return data
}
