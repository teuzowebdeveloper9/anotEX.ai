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
    <div className="flex items-center justify-between rounded-[20px] border border-[var(--border-soft)] bg-[rgba(255,255,255,0.8)] px-4 py-3 shadow-[0_1px_2px_rgba(25,28,31,0.03)]">
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[rgba(37,99,235,0.08)] shrink-0">
          <Timer size={15} className="text-[var(--brand-primary)]" />
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
