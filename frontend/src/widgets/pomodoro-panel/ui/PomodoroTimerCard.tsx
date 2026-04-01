import { Pause, Play, RotateCcw, Timer } from 'lucide-react'
import { Button } from '@/shared/ui/Button/Button'
import { Card } from '@/shared/ui/Card/Card'
import type { PomodoroPhaseType, PomodoroSessionSnapshot } from '@/entities/pomodoro/model/pomodoro.types'

function formatClock(ms: number): string {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000))
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

function getPhaseLabel(phase: PomodoroPhaseType): string {
  if (phase === 'focus') return 'Foco'
  if (phase === 'short_break') return 'Pausa curta'
  return 'Pausa longa'
}

interface PomodoroTimerCardProps {
  activeSession: PomodoroSessionSnapshot | null
  remainingMs: number
  elapsedMs: number
  isMutating: boolean
  onStart: () => void
  onPause: () => void
  onResume: () => void
  onAdvance: () => void
  onStop: () => void
}

export function PomodoroTimerCard({
  activeSession,
  remainingMs,
  elapsedMs,
  isMutating,
  onStart,
  onPause,
  onResume,
  onAdvance,
  onStop,
}: PomodoroTimerCardProps) {
  const progress =
    activeSession && activeSession.phaseDurationMs > 0
      ? Math.min(100, (elapsedMs / activeSession.phaseDurationMs) * 100)
      : 0

  return (
    <Card className="p-6 sm:p-7">
      <div className="flex flex-col gap-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--accent)]">
              Pomodoro
            </p>
            <h2 className="mt-2 text-2xl font-bold tracking-[-0.04em] text-[var(--text-primary)]">
              {activeSession ? getPhaseLabel(activeSession.nextPhaseType) : 'Pronto para começar'}
            </h2>
            <p className="mt-2 text-sm text-[var(--text-secondary)]">
              {activeSession?.session.contextLabel ??
                'Use ciclos de foco e pausa para estudar sem perder ritmo.'}
            </p>
          </div>
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[var(--accent-bg)] text-[var(--accent)]">
            <Timer size={18} />
          </div>
        </div>

        <div className="text-center">
          <div className="text-[3.4rem] font-black leading-none tracking-[-0.08em] text-[var(--text-primary)] sm:text-[4.4rem]">
            {formatClock(activeSession ? remainingMs : 25 * 60 * 1000)}
          </div>
          {activeSession && (
            <p className="mt-3 text-sm text-[var(--text-secondary)]">
              Ciclo {activeSession.session.currentCycleSequence} · {activeSession.session.completedFocusCycles} focos completos
            </p>
          )}
        </div>

        <div className="h-2 overflow-hidden rounded-full bg-[rgba(148,163,184,0.18)]">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${progress}%`,
              background: 'var(--gradient-primary)',
            }}
          />
        </div>

        {!activeSession ? (
          <Button onClick={onStart} loading={isMutating} className="w-full sm:w-auto">
            <Play size={14} />
            Iniciar Pomodoro
          </Button>
        ) : activeSession.session.status === 'awaiting_next_phase' ? (
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button onClick={onAdvance} loading={isMutating} className="flex-1">
              <Play size={14} />
              Iniciar próximo foco
            </Button>
            <Button variant="danger" onClick={onStop} loading={isMutating} className="flex-1">
              <RotateCcw size={14} />
              Encerrar e resetar
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-3 sm:flex-row">
            {activeSession.session.status === 'running' ? (
              <Button variant="outline" onClick={onPause} loading={isMutating} className="flex-1">
                <Pause size={14} />
                Pausar
              </Button>
            ) : (
              <Button onClick={onResume} loading={isMutating} className="flex-1">
                <Play size={14} />
                Retomar
              </Button>
            )}
            <Button variant="danger" onClick={onStop} loading={isMutating} className="flex-1">
              <RotateCcw size={14} />
              Encerrar e resetar
            </Button>
          </div>
        )}

        <div className="rounded-2xl border border-[var(--border)] bg-white/60 px-4 py-3 text-sm text-[var(--text-secondary)]">
          <p className="font-medium text-[var(--text-primary)]">Pausar x Encerrar</p>
          <p className="mt-1">
            Pausar preserva o ciclo atual. Encerrar reseta o estado ativo inteiro para começar do zero depois.
          </p>
        </div>
      </div>
    </Card>
  )
}
