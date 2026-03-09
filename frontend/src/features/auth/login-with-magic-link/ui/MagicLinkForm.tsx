import { Mail, Send, CheckCircle } from 'lucide-react'
import { Input } from '@/shared/ui/Input/Input'
import { Button } from '@/shared/ui/Button/Button'
import { useMagicLink } from '../model/useMagicLink'

export function MagicLinkForm() {
  const { email, setEmail, loading, sent, cooldownSeconds, submit } = useMagicLink()

  if (sent) {
    return (
      <div className="flex flex-col items-center gap-4 text-center">
        <CheckCircle size={40} className="text-[var(--accent)]" />
        <div>
          <p className="text-[var(--text-primary)] font-medium">Link enviado!</p>
          <p className="text-[var(--text-secondary)] text-sm mt-1">
            Verifique <span className="text-[var(--text-primary)]">{email}</span> e clique no link.
          </p>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="text-sm text-[var(--text-secondary)] underline hover:text-[var(--text-primary)] transition-colors"
        >
          Usar outro e-mail
        </button>
      </div>
    )
  }

  return (
    <form
      onSubmit={(e) => { e.preventDefault(); void submit() }}
      className="flex flex-col gap-4"
    >
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
      <Button
        type="submit"
        loading={loading}
        disabled={cooldownSeconds > 0}
        size="lg"
        className="w-full"
      >
        <Send size={15} />
        {cooldownSeconds > 0
          ? `Aguarde ${cooldownSeconds}s...`
          : 'Entrar com Magic Link'}
      </Button>
    </form>
  )
}
