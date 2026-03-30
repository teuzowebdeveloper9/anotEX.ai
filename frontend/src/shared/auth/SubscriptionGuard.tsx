import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from './useAuth'
import { getSubscriptionStatus, saveCustomerData } from '@/features/billing/api/createCheckout'
import { CustomerFormModal } from '@/features/billing/ui/CustomerFormModal'
import { toast } from 'sonner'

const PLAN_ID = 'prod_uFHtgP3NQARHx35LtuFqRTT5'
const PLAN_PRICE_CENTS = 3990

export function SubscriptionGuard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [showCustomerForm, setShowCustomerForm] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [hasChecked, setHasChecked] = useState(false)

  useEffect(() => {
    if (!user || hasChecked) return

    const checkSubscription = async () => {
      try {
        const { hasSubscription } = await getSubscriptionStatus()
        
        if (!hasSubscription) {
          setShowCustomerForm(true)
        }
      } catch (error) {
        console.error('Error checking subscription:', error)
      } finally {
        setHasChecked(true)
      }
    }

    checkSubscription()
  }, [user, hasChecked])

  const handleCustomerSubmit = async (customer: { name: string; email: string; cellphone: string; taxId: string }) => {
    setIsLoading(true)
    try {
      await saveCustomerData(customer)
      
      const { createCheckout } = await import('@/features/billing/api/createCheckout')
      const checkout = await createCheckout({
        productId: PLAN_ID,
        frequency: 'SUBSCRIPTION',
        priceInCents: PLAN_PRICE_CENTS,
      })

      if (checkout.url) {
        window.location.href = checkout.url
      } else {
        setShowCustomerForm(false)
        toast.success('Dados salvos! Complete o pagamento na página de planos.')
        navigate('/dashboard')
      }
    } catch (error) {
      console.error('Error:', error)
      toast.error('Erro ao processar. Tente novamente.')
    } finally {
      setIsLoading(false)
    }
  }

  if (!user || !showCustomerForm) return null

  return (
    <CustomerFormModal
      isOpen={showCustomerForm}
      onClose={() => {}}
      onSubmit={handleCustomerSubmit}
      isLoading={isLoading}
    />
  )
}
