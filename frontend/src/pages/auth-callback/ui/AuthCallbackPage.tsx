import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/shared/auth/supabase'

export function AuthCallbackPage() {
  const navigate = useNavigate()

  useEffect(() => {
    // Supabase v2: exchangeCodeForSession processa o token da URL automaticamente
    // quando getSession() é chamado. O listener pega o evento resultante.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        navigate('/dashboard', { replace: true })
      }
      if (event === 'SIGNED_OUT') {
        navigate('/login', { replace: true })
      }
    })

    // Força a troca do código/token que vem na URL do magic link
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        navigate('/dashboard', { replace: true })
      }
    })

    return () => subscription.unsubscribe()
  }, [navigate])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-[var(--bg-base)]">
      <span className="h-8 w-8 rounded-full border-2 border-[var(--accent)] border-t-transparent animate-spin" />
      <p className="text-sm text-[var(--text-secondary)]">Autenticando...</p>
    </div>
  )
}
