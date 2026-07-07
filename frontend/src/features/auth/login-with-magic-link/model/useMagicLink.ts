import { useState, useEffect } from 'react'
import { AuthApiError, requestMagicLink } from '@/shared/auth/auth-client'
import { toast } from 'sonner'

const COOLDOWN_KEY = 'magic_link_cooldown_until'
const COOLDOWN_SECONDS = 60

interface UseMagicLinkReturn {
  email: string
  setEmail: (v: string) => void
  loading: boolean
  sent: boolean
  cooldownSeconds: number
  submit: () => Promise<void>
}

export function useMagicLink(): UseMagicLinkReturn {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [cooldownSeconds, setCooldownSeconds] = useState(() => {
    const until = localStorage.getItem(COOLDOWN_KEY)
    if (!until) return 0
    const remaining = Math.ceil((Number(until) - Date.now()) / 1000)
    return remaining > 0 ? remaining : 0
  })

  useEffect(() => {
    if (cooldownSeconds <= 0) return
    const interval = setInterval(() => {
      setCooldownSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval)
          localStorage.removeItem(COOLDOWN_KEY)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [cooldownSeconds])

  const submit = async (): Promise<void> => {
    if (!email.trim() || cooldownSeconds > 0) return
    setLoading(true)
    try {
      await requestMagicLink(email.trim())
      setSent(true)
      toast.success('Link enviado! Verifique seu e-mail.')
    } catch (error) {
      const isRateLimit =
        error instanceof AuthApiError &&
        (error.status === 429 || error.message.toLowerCase().includes('rate limit'))
      if (isRateLimit) {
        const until = Date.now() + COOLDOWN_SECONDS * 1000
        localStorage.setItem(COOLDOWN_KEY, String(until))
        setCooldownSeconds(COOLDOWN_SECONDS)
        toast.error('Muitas tentativas. Aguarde 1 minuto antes de tentar novamente.')
      } else {
        toast.error('Erro ao enviar link. Tente novamente.')
      }
    } finally {
      setLoading(false)
    }
  }

  return { email, setEmail, loading, sent, cooldownSeconds, submit }
}
