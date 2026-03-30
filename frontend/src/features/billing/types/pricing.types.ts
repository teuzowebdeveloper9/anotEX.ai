export interface Plan {
  id: string
  name: string
  price: number
  priceLabel: string
  description: string
  features: string[]
  highlighted?: boolean
  buttonText: string
  productId: string
}

export interface CheckoutResponse {
  id: string
  url: string
  amount: number
  status: string
  frequency: string
  devMode: boolean
  externalId: string | null
  customerId: string | null
  createdAt: string
  updatedAt: string
}

export interface CreateCheckoutParams {
  productId: string
  quantity?: number
  frequency?: 'ONE_TIME' | 'SUBSCRIPTION'
  returnUrl?: string
  completionUrl?: string
  priceInCents?: number
  customer?: {
    name: string
    email: string
    cellphone: string
    taxId: string
  }
}
