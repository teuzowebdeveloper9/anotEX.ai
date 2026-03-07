import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { MouseLight } from '@/widgets/mouse-light/ui/MouseLight'
import { MagicLinkForm } from '@/features/auth/login-with-magic-link/ui/MagicLinkForm'
import { Card } from '@/shared/ui/Card/Card'
import { supabase } from '@/shared/auth/supabase'
import logoFavicon from '@/shared/assets/logo-favicon.png'

export function LoginPage() {
  const navigate = useNavigate()

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate('/dashboard', { replace: true })
    })
  }, [navigate])

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-[var(--bg-base)] px-4">
      <MouseLight />

      <div className="relative z-10 w-full max-w-sm flex flex-col items-center gap-8">
        <img
          src={logoFavicon}
          alt="anotEX.ai"
          className="h-12 w-auto"
          style={{ filter: 'brightness(0) invert(1)' }}
        />

        <Card className="w-full p-8">
          <div className="mb-6 text-center">
            <h1 className="text-xl font-semibold text-[var(--text-primary)]">Bem-vindo de volta</h1>
            <p className="text-sm text-[var(--text-secondary)] mt-1">
              Entre com seu e-mail para acessar
            </p>
          </div>
          <MagicLinkForm />
        </Card>
      </div>
    </div>
  )
}
