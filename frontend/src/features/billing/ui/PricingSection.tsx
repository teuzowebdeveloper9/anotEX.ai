import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Check, Zap, Shield, Crown } from 'lucide-react'
import { Button } from '@/shared/ui/Button/Button'
import { cn } from '@/shared/lib/cn'
import { useCreateCheckout, useSubscriptionStatus } from '../hooks/useCheckout'
import { useAuth } from '@/shared/auth/useAuth'
import { CustomerFormModal } from './CustomerFormModal'

const PLAN_ID = 'prod_ZzRqAYsduDYFKpfF1zwBbNzD'
const PLAN_PRICE_CENTS = 3990

const plans = [
  {
    id: 'free',
    name: 'Gratuito',
    priceLabel: 'R$ 0',
    description: 'Para quem quer experimentar',
    features: [
      '3 aulas por mês',
      'Transcrição básica',
      'Resumos simples',
      'Até 10 flashcards',
      'Acesso mobile',
    ],
    buttonText: 'Começar grátis',
    productId: '',
  },
  {
    id: 'pro',
    name: 'Pro',
    priceLabel: 'R$ 39,90',
    priceSuffix: '/mês',
    description: 'Para estudar com consistência',
    features: [
      'Aulas ilimitadas',
      'Transcrição completa com IA',
      'Resumos, flashcards e quiz',
      'Mapas mentais automáticos',
      'Revisão espaçada (SM-2)',
      'Pastas e organização',
      'Grupos de estudo',
      'Suporte prioritário',
    ],
    buttonText: 'Assinar Pro',
    productId: PLAN_ID,
  },
]

export function PricingSection() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const checkout = useCreateCheckout()
  const { data: subscriptionStatus, refetch: refetchStatus } = useSubscriptionStatus()
  const [showCustomerForm, setShowCustomerForm] = useState(false)
  const [pendingProductId, setPendingProductId] = useState<string | null>(null)

  const hasSubscription = subscriptionStatus?.hasSubscription ?? false

  const handleSubscribe = (productId: string) => {
    if (!user) {
      navigate(`/login?redirect=/#pricing`)
      return
    }

    if (!productId) {
      navigate('/record')
      return
    }

    if (hasSubscription) {
      checkout.mutate({
        productId,
        frequency: 'SUBSCRIPTION',
        priceInCents: PLAN_PRICE_CENTS,
      })
      return
    }

    setPendingProductId(productId)
    setShowCustomerForm(true)
  }

  const handleCustomerSubmit = async (customer: { name: string; email: string; cellphone: string; taxId: string }) => {
    if (!pendingProductId) return

    const { saveCustomerData } = await import('../api/createCheckout')
    await saveCustomerData(customer)

    await refetchStatus()

    checkout.mutate({
      productId: pendingProductId,
      frequency: 'SUBSCRIPTION',
      priceInCents: PLAN_PRICE_CENTS,
    })
    setShowCustomerForm(false)
    setPendingProductId(null)
  }

  return (
    <section id="pricing" className="mx-auto w-full max-w-[1440px] px-6 py-16 md:px-[100px]">
      <div className="mx-auto mb-12 max-w-[700px] text-center">
        <h2 className="text-[2.2rem] font-extrabold tracking-[-0.04em] text-[var(--text-primary)] md:text-[3rem]">
          Invista no seu estudo
        </h2>
        <p className="mt-4 text-[1.05rem] leading-8 text-[var(--text-secondary)]">
          Comece grátis e escale conforme sua rotina. Cancele quando quiser, sem burocracia.
        </p>
      </div>

      <div className="mx-auto grid max-w-3xl gap-6 lg:grid-cols-2 lg:items-stretch">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={cn(
              'relative flex flex-col rounded-[28px] p-8 transition-all duration-300',
              plan.id === 'pro'
                ? 'border-2 border-[var(--accent)] bg-gradient-to-b from-[var(--accent)]/8 to-white shadow-[0_20px_60px_rgba(56,171,228,0.18)]'
                : 'border border-[var(--border)] bg-white/55 backdrop-blur-sm'
            )}
          >
            {plan.id === 'pro' && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--accent)] px-4 py-1.5 text-xs font-semibold text-white shadow-lg">
                  <Zap size={12} />
                  Mais popular
                </span>
              </div>
            )}

            <div className="mb-6">
              <h3 className="text-lg font-bold text-[var(--text-primary)]">{plan.name}</h3>
              <div className="mt-3 flex items-baseline gap-1">
                <span className="text-[2.5rem] font-extrabold tracking-[-0.04em] text-[var(--text-primary)]">
                  {plan.priceLabel}
                </span>
                {plan.priceSuffix && (
                  <span className="text-sm text-[var(--text-secondary)]">{plan.priceSuffix}</span>
                )}
              </div>
              <p className="mt-2 text-sm text-[var(--text-secondary)]">{plan.description}</p>
            </div>

            <ul className="mb-8 flex-1 space-y-3">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-start gap-3 text-sm">
                  <Check
                    size={18}
                    className={cn(
                      'mt-0.5 shrink-0',
                      plan.id === 'pro' ? 'text-[var(--accent)]' : 'text-[var(--success)]'
                    )}
                  />
                  <span className="text-[var(--text-secondary)]">{feature}</span>
                </li>
              ))}
            </ul>

            <Button
              variant={plan.id === 'pro' ? 'primary' : 'outline'}
              size="lg"
              className="w-full"
              loading={checkout.isPending && checkout.variables?.productId === plan.productId}
              onClick={() => handleSubscribe(plan.productId)}
              disabled={checkout.isPending || (plan.id === 'pro' && hasSubscription)}
            >
              {plan.id === 'pro' && hasSubscription ? (
                <span className="flex items-center justify-center gap-2">
                  <Crown size={18} />
                  Assinante Pro
                </span>
              ) : plan.buttonText}
            </Button>

            {checkout.isError && checkout.variables?.productId === plan.productId && (
              <p className="mt-3 text-center text-xs text-[var(--danger)]">
                Erro ao processar. Tente novamente.
              </p>
            )}
          </div>
        ))}
      </div>

      <div className="mx-auto mt-8 flex max-w-2xl items-center justify-center gap-2 text-sm text-[var(--text-secondary)]">
        <Shield size={16} className="text-[var(--success)]" />
        <span>Pagamento seguro via PIX. Cancele a qualquer momento.</span>
      </div>

      <CustomerFormModal
        isOpen={showCustomerForm}
        onClose={() => {
          setShowCustomerForm(false)
          setPendingProductId(null)
        }}
        onSubmit={handleCustomerSubmit}
        isLoading={checkout.isPending}
      />
    </section>
  )
}
