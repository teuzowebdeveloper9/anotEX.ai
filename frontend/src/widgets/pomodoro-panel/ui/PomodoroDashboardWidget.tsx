import { Link } from 'react-router-dom'
import { Timer } from 'lucide-react'
import { Button } from '@/shared/ui/Button/Button'
import { usePomodoroSession } from '@/features/pomodoro/session-control/model/usePomodoroSession'

function formatMinutes(ms: number): string {
  return `${Math.round(ms / 60000)} min`
}

export function PomodoroDashboardWidget() {
  const { activeSession, stats, isLoading } = usePomodoroSession()

  return (
    <div className="flex items-center justify-between px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] shadow-[var(--shadow-card)]">
      <div className="flex items-center gap-3">
        <div className="h-8 w-8 rounded-lg bg-[var(--accent-bg)] flex items-center justify-center shrink-0">
          <Timer size={15} className="text-[var(--accent)]" />
        </div>
        <div>
          <p className="text-lg font-semibold leading-none text-[var(--text-primary)]">
            {isLoading ? '--' : formatMinutes(stats?.focusTodayMs ?? 0)}
          </p>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">
            {activeSession ? 'Pomodoro ativo agora' : 'Foco acumulado hoje'}
          </p>
        </div>
      </div>
      <Link to="/pomodoro">
        <Button variant={activeSession ? 'primary' : 'outline'} size="sm">
          {activeSession ? 'Abrir timer' : 'Começar'}
        </Button>
      </Link>
    </div>
  )
}
