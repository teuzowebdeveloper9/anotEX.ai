import { Flame, Target, Timer } from 'lucide-react'
import { Card } from '@/shared/ui/Card/Card'
import type { PomodoroStats } from '@/entities/pomodoro/model/pomodoro.types'

function formatMinutes(ms: number): string {
  return `${Math.round(ms / 60000)} min`
}

interface PomodoroStatsWidgetProps {
  stats: PomodoroStats | null
  title?: string
}

export function PomodoroStatsWidget({ stats, title = 'Foco recente' }: PomodoroStatsWidgetProps) {
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-[var(--text-primary)]">{title}</p>
          <p className="mt-1 text-xs text-[var(--text-secondary)]">
            Últimos {stats?.range ?? '7d'} de sessões finalizadas.
          </p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--accent-bg)] text-[var(--accent)]">
          <Timer size={16} />
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-[var(--border)] bg-white/60 p-4">
          <div className="flex items-center gap-2 text-[var(--text-secondary)]">
            <Timer size={14} />
            <span className="text-xs">Hoje</span>
          </div>
          <p className="mt-2 text-xl font-bold tracking-[-0.04em] text-[var(--text-primary)]">
            {stats ? formatMinutes(stats.focusTodayMs) : '--'}
          </p>
        </div>
        <div className="rounded-2xl border border-[var(--border)] bg-white/60 p-4">
          <div className="flex items-center gap-2 text-[var(--text-secondary)]">
            <Flame size={14} />
            <span className="text-xs">Streak</span>
          </div>
          <p className="mt-2 text-xl font-bold tracking-[-0.04em] text-[var(--text-primary)]">
            {stats ? `${stats.activeDaysStreak} dias` : '--'}
          </p>
        </div>
        <div className="rounded-2xl border border-[var(--border)] bg-white/60 p-4">
          <div className="flex items-center gap-2 text-[var(--text-secondary)]">
            <Target size={14} />
            <span className="text-xs">Ciclos</span>
          </div>
          <p className="mt-2 text-xl font-bold tracking-[-0.04em] text-[var(--text-primary)]">
            {stats?.completedFocusCycles ?? '--'}
          </p>
        </div>
      </div>
    </Card>
  )
}
