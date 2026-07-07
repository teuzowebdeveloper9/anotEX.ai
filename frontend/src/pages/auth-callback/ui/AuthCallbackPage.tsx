import { useEffect, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import { verifyMagicLink } from '@/shared/auth/auth-client'

export function AuthCallbackPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const started = useRef(false)

  useEffect(() => {
    // Token de uso único: garante uma única troca mesmo com StrictMode
    if (started.current) return
    started.current = true

    const token = searchParams.get('token')
    if (!token) {
      toast.error('Link inválido ou expirado.')
      navigate('/login', { replace: true })
      return
    }

    verifyMagicLink(token)
      .then(() => {
        navigate('/dashboard', { replace: true })
      })
      .catch(() => {
        toast.error('Link inválido ou expirado. Solicite um novo.')
        navigate('/login', { replace: true })
      })
  }, [navigate, searchParams])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-[var(--bg-base)]">
      <span className="h-8 w-8 rounded-full border-2 border-[var(--accent)] border-t-transparent animate-spin" />
      <p className="text-sm text-[var(--text-secondary)]">Autenticando...</p>
    </div>
  )
}
