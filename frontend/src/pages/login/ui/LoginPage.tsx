import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { MouseLight } from '@/widgets/mouse-light/ui/MouseLight'
import { MagicLinkForm } from '@/features/auth/login-with-magic-link/ui/MagicLinkForm'
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
    <div className="relative min-h-screen flex items-center justify-center bg-[var(--bg-base)] px-4 overflow-hidden">
      <MouseLight />

      {/* Subtle dot grid */}
      <div
        className="pointer-events-none fixed inset-0 z-0 opacity-[0.06]"
        style={{
          backgroundImage: 'radial-gradient(circle, var(--accent) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
      />

      <div className="relative z-10 w-full max-w-sm flex flex-col items-center gap-6">
        {/* Logo */}
        <div className="flex flex-col items-center gap-2">
          <div className="h-12 w-12 rounded-2xl bg-[var(--accent-bg)] border border-[var(--accent)]/20 flex items-center justify-center">
            <img
              src={logoFavicon}
              alt="anotEX.ai"
              className="h-7 w-auto"
              style={{ filter: 'brightness(0) invert(1) sepia(1) saturate(3) hue-rotate(230deg) brightness(1.2)' }}
            />
          </div>
          <div className="text-center">
            <h1 className="text-lg font-semibold text-[var(--text-primary)]">
              anotEX<span className="text-[var(--accent)]">.ai</span>
            </h1>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">
              Seu assistente de estudo com IA
            </p>
          </div>
        </div>

        {/* Card */}
        <div className="w-full rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] shadow-[var(--shadow-elevated)] p-8">
          <div className="mb-6 text-center">
            <h2 className="text-base font-semibold text-[var(--text-primary)]">Acessar conta</h2>
            <p className="text-sm text-[var(--text-secondary)] mt-1">
              Insira seu e-mail para receber o link de acesso
            </p>
          </div>
          <MagicLinkForm />
        </div>

        <p className="text-xs text-[var(--text-tertiary)] text-center">
          Ao entrar, você concorda com os termos de uso.
        </p>
      </div>
    </div>
  )
}
