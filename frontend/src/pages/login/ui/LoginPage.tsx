import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthForm } from '@/features/auth/login-with-password/ui/AuthForm'
import { supabase } from '@/shared/auth/supabase'
import logoAnotex from '@/shared/assets/logo-anotex.png'

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
    <div className="pen-page relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10">
      <div className="pointer-events-none pen-blob pen-blob-blue left-[12%] top-[14%] h-[28rem] w-[28rem]" />
      <div className="pointer-events-none pen-blob pen-blob-cyan right-[14%] top-[56%] h-[24rem] w-[24rem]" />

      <div className="relative z-10 w-full max-w-[400px] rounded-[28px] border border-white/50 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(232,245,255,0.93))] p-10 shadow-[0_24px_64px_rgba(56,171,228,0.18)] backdrop-blur-[18px]">
        <div className="mb-7 flex flex-col items-center gap-3 text-center">
          <img src={logoAnotex} alt="anotEX.ai" className="h-10 w-auto" />
          <p className="text-sm text-[var(--text-tertiary)]">Entre para continuar estudando</p>
        </div>

        <AuthForm />
      </div>
    </div>
  )
}
