import { useState } from 'react'
import { Mail, Lock, UserPlus, LogIn, Eye, EyeOff } from 'lucide-react'
import { Input } from '@/shared/ui/Input/Input'
import { Button } from '@/shared/ui/Button/Button'
import { useAuth } from '../model/useAuth'

export function AuthForm() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

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
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 rounded-full border border-[var(--border-soft)] bg-[var(--surface-panel)] p-1">
        <button
          type="button"
          onClick={() => setMode('login')}
          className={`flex-1 rounded-full py-2.5 text-sm font-medium transition-all ${
            mode === 'login'
              ? 'bg-white text-[var(--brand-primary-strong)] shadow-[0_8px_24px_rgba(25,28,31,0.06)]'
              : 'bg-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
          }`}
        >
          Entrar
        </button>
        <button
          type="button"
          onClick={() => setMode('register')}
          className={`flex-1 rounded-full py-2.5 text-sm font-medium transition-all ${
            mode === 'register'
              ? 'bg-white text-[var(--brand-primary-strong)] shadow-[0_8px_24px_rgba(25,28,31,0.06)]'
              : 'bg-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
          }`}
        >
          Criar conta
        </button>
      </div>

      <form
        onSubmit={(e) => { e.preventDefault(); void submit() }}
        className="flex flex-col gap-4"
      >
        <div>
          <label className="mb-2 block text-[13px] font-semibold text-[var(--text-primary)]">E-mail</label>
          <div className="relative">
            <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
            <Input
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-11"
              autoFocus
              required
            />
          </div>
        </div>

        <div>
          <label className="mb-2 block text-[13px] font-semibold text-[var(--text-primary)]">Senha</label>
          <div className="relative">
            <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
            <Input
              type={showPassword ? 'text' : 'password'}
              placeholder="Senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-11 pr-11"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-[var(--text-secondary)] transition-colors hover:bg-[rgba(37,99,235,0.06)] hover:text-[var(--text-primary)]"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        {mode === 'register' && (
          <div>
            <label className="mb-2 block text-[13px] font-semibold text-[var(--text-primary)]">Confirmar senha</label>
            <div className="relative">
              <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
              <Input
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Confirmar senha"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="pl-11 pr-11"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-[var(--text-secondary)] transition-colors hover:bg-[rgba(37,99,235,0.06)] hover:text-[var(--text-primary)]"
              >
                {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
        )}

        <Button type="submit" loading={loading} size="lg" className="mt-2 w-full">
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
        <div className="h-px flex-1 bg-[var(--border-soft)]" />
        <span className="text-[13px] text-[var(--text-tertiary)]">entre ou crie sua conta</span>
        <div className="h-px flex-1 bg-[var(--border-soft)]" />
      </div>
    </div>
  )
}
