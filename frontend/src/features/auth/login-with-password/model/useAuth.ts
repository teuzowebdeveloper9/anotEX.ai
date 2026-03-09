import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/shared/auth/supabase'
import { toast } from 'sonner'

type AuthMode = 'login' | 'register'

interface UseAuthReturn {
  mode: AuthMode
  setMode: (mode: AuthMode) => void
  email: string
  setEmail: (v: string) => void
  password: string
  setPassword: (v: string) => void
  confirmPassword: string
  setConfirmPassword: (v: string) => void
  loading: boolean
  submit: () => Promise<void>
}

export function useAuth(): UseAuthReturn {
  const navigate = useNavigate()
  const [mode, setMode] = useState<AuthMode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (): Promise<void> => {
    if (!email.trim() || !password.trim()) return

    if (mode === 'register') {
      if (password !== confirmPassword) {
        toast.error('As senhas não coincidem.')
        return
      }
      if (password.length < 6) {
        toast.error('A senha deve ter pelo menos 6 caracteres.')
        return
      }
    }

    setLoading(true)

    if (mode === 'login') {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      })
      setLoading(false)
      if (error) {
        if (error.message.toLowerCase().includes('invalid login credentials')) {
          toast.error('E-mail ou senha incorretos.')
        } else {
          toast.error('Erro ao entrar. Tente novamente.')
        }
        return
      }
      navigate('/dashboard', { replace: true })
    } else {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
      })
      setLoading(false)
      if (error) {
        if (error.message.toLowerCase().includes('already registered')) {
          toast.error('Este e-mail já está cadastrado.')
        } else {
          toast.error('Erro ao criar conta. Tente novamente.')
        }
        return
      }
      if (data.session) {
        navigate('/dashboard', { replace: true })
      } else {
        toast.success('Conta criada! Verifique seu e-mail para confirmar.')
      }
    }
  }

  return {
    mode,
    setMode,
    email,
    setEmail,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    loading,
    submit,
  }
}
