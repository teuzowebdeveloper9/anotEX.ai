import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { CheckCircle2, Pause, Play, Target, Timer, X } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/shared/ui/Button/Button'
import { usePomodoroSession } from '@/features/pomodoro/session-control/model/usePomodoroSession'
import { usePomodoroSettings } from '@/features/pomodoro/settings/model/usePomodoroSettings'

function formatClock(ms: number): string {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000))
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

function getPhaseLabel(phase: 'focus' | 'short_break' | 'long_break'): string {
  if (phase === 'focus') return 'Foco'
  if (phase === 'short_break') return 'Pausa curta'
  return 'Pausa longa'
}

export function FloatingPomodoroWidget() {
  const location = useLocation()
  const { settings } = usePomodoroSettings()
  const {
    activeSession,
    remainingMs,
    elapsedMs,
    stats,
    isMutating,
    pauseSession,
    resumeSession,
  } = usePomodoroSession()

  const [dismissedSessionId, setDismissedSessionId] = useState<string | null>(null)
  const [goalToastShown, setGoalToastShown] = useState(false)
  const previousSessionIdRef = useRef<string | null>(null)
  const previousStatusRef = useRef<string | null>(null)

  const sessionId = activeSession?.session.id ?? null
  const sessionStatus = activeSession?.session.status ?? null
  const isPomodoroPage = location.pathname === '/pomodoro'
  const isVisibleSession =
    activeSession &&
    (activeSession.session.status === 'running' || activeSession.session.status === 'paused')

  useEffect(() => {
    if (sessionId && previousSessionIdRef.current !== sessionId) {
      setDismissedSessionId(null)
      previousSessionIdRef.current = sessionId
      previousStatusRef.current = sessionStatus
      return
    }

    if (sessionId && sessionStatus && previousStatusRef.current !== sessionStatus) {
      setDismissedSessionId(null)
      previousStatusRef.current = sessionStatus
    }

    if (!sessionId) {
      previousSessionIdRef.current = null
      previousStatusRef.current = null
      setDismissedSessionId(null)
    }
  }, [sessionId, sessionStatus])

  useEffect(() => {
    const goalMs = (settings?.dailyFocusGoalMinutes ?? 0) * 60 * 1000
    if (!goalMs || !stats) return

    if (stats.focusTodayMs >= goalMs && !goalToastShown) {
      toast.success('Meta diária do pomodoro batida.')
      setGoalToastShown(true)
      return
    }

    if (stats.focusTodayMs < goalMs && goalToastShown) {
      setGoalToastShown(false)
    }
  }, [goalToastShown, settings?.dailyFocusGoalMinutes, stats])

  const progress = useMemo(() => {
    if (!activeSession || activeSession.phaseDurationMs <= 0) return 0
    return Math.min(100, (elapsedMs / activeSession.phaseDurationMs) * 100)
  }, [activeSession, elapsedMs])

  if (!isVisibleSession || isPomodoroPage || dismissedSessionId === sessionId) {
    return null
  }

  const isRunning = activeSession.session.status === 'running'

  return (
    <div className="fixed bottom-5 right-5 z-[70] w-[min(22rem,calc(100vw-1.5rem))] rounded-[28px] border border-[var(--border-soft)] bg-[rgba(255,255,255,0.92)] p-4 shadow-[0_28px_80px_rgba(25,28,31,0.16)] backdrop-blur-[22px]">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--brand-accent-soft)] text-[var(--brand-primary)]">
            <Timer size={18} />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--brand-primary)]">
              Pomodoro ativo
            </p>
            <p className="mt-1 text-sm font-semibold text-[var(--text-primary)]">
              {getPhaseLabel(activeSession.session.currentPhaseType)}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setDismissedSessionId(sessionId)}
          className="rounded-full p-1.5 text-[var(--text-tertiary)] transition-colors hover:bg-[rgba(25,28,31,0.04)] hover:text-[var(--text-primary)]"
          aria-label="Fechar mini cronômetro"
        >
          <X size={16} />
        </button>
      </div>

      <div className="mt-4">
        <div className="text-[2.3rem] font-extrabold leading-none tracking-[-0.07em] text-[var(--text-primary)]">
          {formatClock(remainingMs)}
        </div>
        <p className="mt-1 text-xs text-[var(--text-tertiary)]">
          {activeSession.session.contextLabel ?? 'Sessão de foco em andamento'}
        </p>
      </div>

      <div className="mt-4 h-2 overflow-hidden rounded-full bg-[rgba(25,28,31,0.08)]">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${progress}%`,
            background: 'var(--gradient-brand)',
          }}
        />
      </div>

      <div className="mt-4 flex items-center gap-2">
        {isRunning ? (
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            loading={isMutating}
            onClick={() => pauseSession(activeSession.session.id)}
          >
            <Pause size={14} />
            Pausar
          </Button>
        ) : (
          <Button
            size="sm"
            className="flex-1"
            loading={isMutating}
            onClick={() => resumeSession(activeSession.session.id)}
          >
            <Play size={14} />
            Retomar
          </Button>
        )}

        <Link to="/pomodoro" className="flex-1">
          <Button variant="soft" size="sm" className="w-full">
            <Target size={14} />
            Abrir
          </Button>
        </Link>
      </div>

      {goalToastShown && (
        <div className="mt-4 flex items-center gap-2 rounded-2xl border border-[rgba(22,126,44,0.14)] bg-[var(--success-bg)] px-3 py-2 text-xs font-medium text-[var(--success)]">
          <CheckCircle2 size={14} />
          Meta diária batida.
        </div>
      )}
    </div>
  )
}
