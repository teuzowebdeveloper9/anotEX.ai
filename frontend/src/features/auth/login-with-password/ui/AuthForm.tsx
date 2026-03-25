import { Mail, Lock, UserPlus, LogIn } from 'lucide-react'
import { Input } from '@/shared/ui/Input/Input'
import { Button } from '@/shared/ui/Button/Button'
import { useAuth } from '../model/useAuth'

export function AuthForm() {
  const {
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
  } = useAuth()

  return (
    <div className="flex flex-col gap-5">
      <div className="flex overflow-hidden rounded-full border border-[var(--border)] bg-white/55 p-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.75)]">
        <button
          type="button"
          onClick={() => setMode('login')}
          className={`flex-1 rounded-full py-2.5 text-sm font-medium transition-all ${
            mode === 'login'
              ? 'text-white shadow-[0_6px_20px_rgba(56,171,228,0.32)]'
              : 'bg-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
          }`}
          style={mode === 'login' ? { background: 'var(--gradient-primary)' } : undefined}
        >
          Entrar
        </button>
        <button
          type="button"
          onClick={() => setMode('register')}
          className={`flex-1 rounded-full py-2.5 text-sm font-medium transition-all ${
            mode === 'register'
              ? 'text-white shadow-[0_6px_20px_rgba(56,171,228,0.32)]'
              : 'bg-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
          }`}
          style={mode === 'register' ? { background: 'var(--gradient-primary)' } : undefined}
        >
          Criar conta
        </button>
      </div>

      {/* Form */}
      <form
        onSubmit={(e) => { e.preventDefault(); void submit() }}
        className="flex flex-col gap-4"
      >
        <div>
          <label className="mb-1.5 block text-[13px] font-semibold text-[var(--text-primary)]">E-mail</label>
          <div className="relative">
            <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
            <Input
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-9"
              autoFocus
              required
            />
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-[13px] font-semibold text-[var(--text-primary)]">Senha</label>
          <div className="relative">
            <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
            <Input
              type="password"
              placeholder="Senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-9"
              required
            />
          </div>
        </div>

        {mode === 'register' && (
          <div>
            <label className="mb-1.5 block text-[13px] font-semibold text-[var(--text-primary)]">Confirmar senha</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
              <Input
                type="password"
                placeholder="Confirmar senha"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="pl-9"
                required
              />
            </div>
          </div>
        )}

        <Button type="submit" loading={loading} size="lg" className="mt-1 w-full">
          {mode === 'login' ? (
            <>
              <LogIn size={15} />
              Entrar
            </>
          ) : (
            <>
              <UserPlus size={15} />
              Criar conta
            </>
          )}
        </Button>
      </form>

      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-[rgba(56,171,228,0.14)]" />
        <span className="text-[13px] text-[var(--text-tertiary)]">entre ou crie sua conta</span>
        <div className="h-px flex-1 bg-[rgba(56,171,228,0.14)]" />
      </div>
    </div>
  )
}
