import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthApiError, login, register } from '@/shared/auth/auth-client'
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
      try {
        await login(email.trim(), password)
        const returnTo = sessionStorage.getItem('returnTo') ?? '/dashboard'
        sessionStorage.removeItem('returnTo')
        navigate(returnTo, { replace: true })
      } catch (error) {
        const isInvalidCredentials =
          error instanceof AuthApiError && (error.status === 401 || error.status === 400)
        if (isInvalidCredentials) {
          toast.error('E-mail ou senha incorretos.')
        } else {
          toast.error('Erro ao entrar. Tente novamente.')
        }
      } finally {
        setLoading(false)
      }
    } else {
      try {
        await register(email.trim(), password)
        navigate('/dashboard', { replace: true })
      } catch (error) {
        const isAlreadyRegistered = error instanceof AuthApiError && error.status === 409
        if (isAlreadyRegistered) {
          toast.error('Este e-mail já está cadastrado.')
        } else {
          toast.error('Erro ao criar conta. Tente novamente.')
        }
      } finally {
        setLoading(false)
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
