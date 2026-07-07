import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthForm } from '@/features/auth/login-with-password/ui/AuthForm'
import { isAuthenticated } from '@/shared/auth/auth-client'
import { brandLogo } from '@/shared/assets/brand-logo'

export function LoginPage() {
  const navigate = useNavigate()

  useEffect(() => {
    if (isAuthenticated()) {
      const returnTo = sessionStorage.getItem('returnTo')
      sessionStorage.removeItem('returnTo')
      navigate(returnTo ?? '/dashboard', { replace: true })
    }
  }, [navigate])

  return (
    <div className="relative min-h-screen overflow-hidden bg-[linear-gradient(180deg,#fbfcff_0%,#f7f9fd_100%)] px-4 py-10">
      <div className="pointer-events-none absolute left-[-8rem] top-[-5rem] h-[24rem] w-[24rem] rounded-full bg-[radial-gradient(circle,rgba(37,99,235,0.12)_0%,rgba(37,99,235,0)_70%)] blur-3xl" />
      <div className="pointer-events-none absolute right-[-7rem] top-[22%] h-[24rem] w-[24rem] rounded-full bg-[radial-gradient(circle,rgba(86,245,248,0.1)_0%,rgba(86,245,248,0)_70%)] blur-3xl" />
      <div className="pointer-events-none absolute bottom-[-5rem] left-[28%] h-[18rem] w-[18rem] rounded-full bg-[radial-gradient(circle,rgba(122,220,125,0.08)_0%,rgba(122,220,125,0)_70%)] blur-3xl" />

      <div className="relative z-10 mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-6xl items-center justify-center lg:grid lg:grid-cols-[1.08fr_0.92fr] lg:gap-16">
        <section className="hidden lg:block">
          <div className="max-w-xl space-y-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border-soft)] bg-white px-4 py-2 text-[13px] font-medium text-[var(--brand-primary-strong)] shadow-[0_8px_24px_rgba(25,28,31,0.05)]">
              <span className="h-2 w-2 rounded-full bg-[var(--brand-primary)]" />
              Acesso ao seu espaço de estudo
            </div>

            <div className="space-y-5">
              <img src={brandLogo} alt="anotEX.ai" className="h-10 w-auto" />
              <h1 className="max-w-lg text-[3.4rem] font-extrabold leading-[0.96] tracking-[-0.07em] text-[var(--text-primary)]">
                Entre e continue exatamente de onde parou.
              </h1>
              <p className="max-w-lg text-[1.05rem] leading-8 text-[var(--text-secondary)]">
                Acesse suas transcrições, materiais, revisões, pomodoros e pastas num ambiente único, claro e organizado.
              </p>
            </div>

            <div className="grid gap-4">
              {[
                'Retome seus estudos sem reorganizar nada.',
                'Acompanhe materiais, revisões e foco no mesmo espaço.',
                'Use um fluxo desenhado para leitura, clareza e ritmo.',
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-3 rounded-[24px] border border-[var(--border-soft)] bg-[rgba(255,255,255,0.82)] px-5 py-4 shadow-[0_10px_30px_rgba(25,28,31,0.04)]"
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--brand-accent-soft)] text-[var(--brand-primary-strong)] text-lg">
                    ·
                  </span>
                  <p className="text-sm font-medium text-[var(--text-secondary)]">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="relative mx-auto w-full max-w-[470px] rounded-[36px] border border-[var(--border-soft)] bg-[rgba(255,255,255,0.86)] p-8 shadow-[0_28px_80px_rgba(25,28,31,0.12)] backdrop-blur-[22px] sm:p-10">
          <div className="mb-9 flex flex-col items-center gap-4 text-center">
            <div className="flex h-[4.75rem] w-[4.75rem] items-center justify-center rounded-[28px] bg-[var(--surface-panel)] shadow-[inset_0_1px_0_rgba(255,255,255,0.82)]">
              <img src={brandLogo} alt="anotEX.ai" className="h-10 w-auto" />
            </div>
            <div className="space-y-1.5">
              <h2 className="text-[2.2rem] font-extrabold tracking-[-0.06em] text-[var(--text-primary)]">
                Entrar no anotEX.ai
              </h2>
              <p className="text-sm leading-6 text-[var(--text-tertiary)]">
                Continue estudando no mesmo fluxo, com seus materiais e progresso já organizados.
              </p>
            </div>
          </div>

          <AuthForm />
        </div>
      </div>
    </div>
  )
}
