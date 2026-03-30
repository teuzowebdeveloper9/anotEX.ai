import { useMutation, useQuery } from '@tanstack/react-query'
import { createCheckout, getSubscriptionStatus } from '../api/createCheckout'
import type { CreateCheckoutParams } from '../types/pricing.types'

export function useCreateCheckout() {
  return useMutation({
    mutationFn: (params: CreateCheckoutParams) => createCheckout(params),
    onSuccess: (data) => {
      if (data.url) {
        window.location.href = data.url
      }
    },
  })
}

export function useSubscriptionStatus() {
  return useQuery({
    queryKey: ['subscriptionStatus'],
    queryFn: getSubscriptionStatus,
  })
}
