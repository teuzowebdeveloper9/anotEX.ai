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
      {/* Tabs */}
      <div className="flex rounded-xl border border-[var(--border)] overflow-hidden">
        <button
          type="button"
          onClick={() => setMode('login')}
          className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
            mode === 'login'
              ? 'bg-[var(--accent)] text-white'
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-transparent'
          }`}
        >
          Entrar
        </button>
        <button
          type="button"
          onClick={() => setMode('register')}
          className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
            mode === 'register'
              ? 'bg-[var(--accent)] text-white'
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-transparent'
          }`}
        >
          Criar conta
        </button>
      </div>

      {/* Form */}
      <form
        onSubmit={(e) => { e.preventDefault(); void submit() }}
        className="flex flex-col gap-4"
      >
        {/* Email */}
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

        {/* Password */}
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

        {/* Confirm password (register only) */}
        {mode === 'register' && (
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
        )}

        <Button
          type="submit"
          loading={loading}
          size="lg"
          className="w-full mt-1"
        >
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
    </div>
  )
}
