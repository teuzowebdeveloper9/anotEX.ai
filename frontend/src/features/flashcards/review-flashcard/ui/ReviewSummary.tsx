import { Link } from 'react-router-dom'
import { CheckCircle } from 'lucide-react'
import { Button } from '@/shared/ui/Button/Button'

interface ReviewSummaryProps {
  total: number
  results: Array<'hard' | 'medium' | 'easy'>
}

export function ReviewSummary({ total, results }: ReviewSummaryProps) {
  const easy = results.filter((r) => r === 'easy').length
  const medium = results.filter((r) => r === 'medium').length
  const hard = results.filter((r) => r === 'hard').length

  return (
    <div className="flex flex-col items-center gap-8 py-16 text-center">
      <div className="h-16 w-16 rounded-2xl bg-[var(--accent-bg)] border border-[var(--accent)]/30 flex items-center justify-center">
        <CheckCircle className="w-8 h-8 text-[var(--accent)]" />
      </div>

      <div>
        <h2 className="text-2xl font-bold text-[var(--text-primary)]">Revisão concluída!</h2>
        <p className="text-[var(--text-secondary)] mt-1">{total} cards revisados</p>
      </div>

      <div className="flex gap-8">
        <div className="flex flex-col items-center gap-1">
          <span className="text-2xl font-bold text-[var(--danger)]">{hard}</span>
          <span className="text-xs text-[var(--text-secondary)]">Difícil</span>
        </div>
        <div className="w-px bg-[var(--border)]" />
        <div className="flex flex-col items-center gap-1">
          <span className="text-2xl font-bold text-[var(--text-primary)]">{medium}</span>
          <span className="text-xs text-[var(--text-secondary)]">Médio</span>
        </div>
        <div className="w-px bg-[var(--border)]" />
        <div className="flex flex-col items-center gap-1">
          <span className="text-2xl font-bold text-[var(--accent)]">{easy}</span>
          <span className="text-xs text-[var(--text-secondary)]">Fácil</span>
        </div>
      </div>

      <Link to="/dashboard">
        <Button variant="primary">Voltar ao Dashboard</Button>
      </Link>
    </div>
  )
}
