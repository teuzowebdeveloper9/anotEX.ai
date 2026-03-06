import { useState } from 'react'
import { supabase } from '@/shared/auth/supabase'
import { toast } from 'sonner'

interface UseMagicLinkReturn {
  email: string
  setEmail: (v: string) => void
  loading: boolean
  sent: boolean
  submit: () => Promise<void>
}

export function useMagicLink(): UseMagicLinkReturn {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const submit = async (): Promise<void> => {
    if (!email.trim()) return
    setLoading(true)
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    })
    setLoading(false)
    if (error) {
      toast.error('Erro ao enviar link. Tente novamente.')
      return
    }
    setSent(true)
    toast.success('Link enviado! Verifique seu e-mail.')
  }

  return { email, setEmail, loading, sent, submit }
}
