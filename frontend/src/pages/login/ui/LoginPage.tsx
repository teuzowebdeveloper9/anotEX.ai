import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { MouseLight } from '@/widgets/mouse-light/ui/MouseLight'
import { AuthForm } from '@/features/auth/login-with-password/ui/AuthForm'
import { supabase } from '@/shared/auth/supabase'
import { GradientOrb } from '@/shared/ui/decorative/GradientOrb'
import { EnergyLines } from '@/shared/ui/decorative/EnergyLines'
import { FloatingShapes } from '@/shared/ui/decorative/FloatingShapes'
import logoFavicon from '@/shared/assets/logo-favicon.png'

export function LoginPage() {
  const navigate = useNavigate()

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        const returnTo = sessionStorage.getItem('returnTo')
        sessionStorage.removeItem('returnTo')
        navigate(returnTo ?? '/dashboard', { replace: true })
      }
    })
  }, [navigate])

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-[var(--bg-base)] px-4 overflow-hidden">
      <MouseLight />

      {/* Background decorations */}
      <EnergyLines className="z-0 opacity-30" />
      <FloatingShapes />
      <GradientOrb
        size={500}
        color="#38ABE4"
        opacity={0.12}
        className="-top-32 -left-32 z-0"
      />
      <GradientOrb
        size={400}
        color="#22D3EE"
        opacity={0.08}
        className="-bottom-20 -right-20 z-0"
      />

      {/* Subtle dot grid */}
      <div
        className="pointer-events-none fixed inset-0 z-0 opacity-[0.04]"
        style={{
          backgroundImage: 'radial-gradient(circle, var(--accent) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
      />

      <div className="relative z-10 w-full max-w-sm flex flex-col items-center gap-6">
        {/* Logo */}
        <div className="flex flex-col items-center gap-2">
          <div className="h-12 w-12 rounded-2xl border border-[var(--accent)]/20 flex items-center justify-center" style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.15), rgba(34,211,238,0.08))' }}>
            <img
              src={logoFavicon}
              alt="anotEX.ai"
              className="h-7 w-auto"
              style={{ filter: 'brightness(0) invert(1) sepia(1) saturate(3) hue-rotate(230deg) brightness(1.2)' }}
            />
          </div>
          <div className="text-center">
            <h1 className="text-lg font-semibold">
              <span className="text-[var(--text-primary)]">anotEX</span>
              <span
                className="font-bold"
                style={{
                  background: 'linear-gradient(135deg, var(--accent), var(--accent-2))',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >.ai</span>
            </h1>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">
              Seu assistente de estudo com IA
            </p>
          </div>
        </div>

        {/* Card with glass effect */}
        <div
          className="w-full rounded-2xl border border-[rgba(255,255,255,0.08)] shadow-[var(--shadow-elevated)] p-8"
          style={{
            background: 'rgba(15,22,36,0.85)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
          }}
        >
          <div className="mb-6 text-center">
            <h2 className="text-base font-semibold text-[var(--text-primary)]">Bem-vindo</h2>
            <p className="text-sm text-[var(--text-secondary)] mt-1">
              Entre ou crie sua conta para continuar
            </p>
          </div>
          <AuthForm />
        </div>

        <p className="text-xs text-[var(--text-tertiary)] text-center">
          Ao entrar, você concorda com os termos de uso.
        </p>
      </div>
    </div>
  )
}
