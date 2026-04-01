import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ArrowLeft, Check, PlayCircle } from 'lucide-react'
import { Sidebar } from '@/widgets/sidebar/ui/Sidebar'
import { GradientOrb } from '@/shared/ui/decorative/GradientOrb'
import { Button } from '@/shared/ui/Button/Button'
import { Card } from '@/shared/ui/Card/Card'
import { PomodoroTimerCard } from '@/widgets/pomodoro-panel/ui/PomodoroTimerCard'
import { PomodoroStatsWidget } from '@/widgets/pomodoro-panel/ui/PomodoroStatsWidget'
import { usePomodoroSettings } from '@/features/pomodoro/settings/model/usePomodoroSettings'
import { usePomodoroSession } from '@/features/pomodoro/session-control/model/usePomodoroSession'
import type {
  PomodoroContextType,
  StartPomodoroPayload,
} from '@/entities/pomodoro/model/pomodoro.types'

export function PomodoroPage() {
  const [searchParams] = useSearchParams()
  const contextType = searchParams.get('contextType') as PomodoroContextType | null
  const contextId = searchParams.get('contextId')
  const contextLabel = searchParams.get('contextLabel')

  const { settings, saveSettings, isSaving } = usePomodoroSettings()
  const {
    activeSession,
    stats,
    remainingMs,
    elapsedMs,
    isLoading,
    isMutating,
    startSession,
    pauseSession,
    resumeSession,
    advanceSession,
    stopSession,
  } = usePomodoroSession()

  const [form, setForm] = useState({
    focusDurationMinutes: 25,
    shortBreakMinutes: 5,
    longBreakMinutes: 15,
    longBreakInterval: 4,
    autoStartBreaks: true,
    autoStartFocus: false,
    dailyFocusGoalMinutes: 100,
  })

  useEffect(() => {
    if (!settings) return
    setForm({
      focusDurationMinutes: settings.focusDurationMinutes,
      shortBreakMinutes: settings.shortBreakMinutes,
      longBreakMinutes: settings.longBreakMinutes,
      longBreakInterval: settings.longBreakInterval,
      autoStartBreaks: settings.autoStartBreaks,
      autoStartFocus: settings.autoStartFocus,
      dailyFocusGoalMinutes: settings.dailyFocusGoalMinutes,
    })
  }, [settings])

  const handleStart = async () => {
    const payload: StartPomodoroPayload = {
      focusDurationMinutes: form.focusDurationMinutes,
      shortBreakMinutes: form.shortBreakMinutes,
      longBreakMinutes: form.longBreakMinutes,
      longBreakInterval: form.longBreakInterval,
      autoStartBreaks: form.autoStartBreaks,
      autoStartFocus: form.autoStartFocus,
      contextType: contextType ?? undefined,
      contextId: contextId ?? undefined,
      contextLabel: contextLabel ?? undefined,
    }
    await startSession(payload)
  }

  const activeId = activeSession?.session.id ?? null

  return (
    <div className="pen-page relative min-h-screen overflow-hidden">
      <GradientOrb size={560} color="#38ABE4" opacity={0.08} className="top-0 right-0 z-0" style={{ transform: 'translate(30%, -30%)' }} />
      <Sidebar withTopBar={false} />
      <main className="relative z-10 md:pl-56">
        <div className="mx-auto max-w-6xl px-4 pb-16 pt-24 sm:px-6 md:px-10 md:pt-9">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-1.5 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors mb-7 group"
          >
            <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
            Voltar ao dashboard
          </Link>

          <div className="grid gap-6 xl:grid-cols-[1.35fr_0.95fr]">
            <div className="flex flex-col gap-6">
              <PomodoroTimerCard
                activeSession={activeSession}
                remainingMs={remainingMs}
                elapsedMs={elapsedMs}
                isMutating={isMutating || isLoading}
                onStart={handleStart}
                onPause={() => (activeId ? pauseSession(activeId) : Promise.resolve())}
                onResume={() => (activeId ? resumeSession(activeId) : Promise.resolve())}
                onAdvance={() => (activeId ? advanceSession(activeId) : Promise.resolve())}
                onStop={() => (activeId ? stopSession(activeId) : Promise.resolve())}
              />

              <PomodoroStatsWidget stats={stats} title="Resumo do Pomodoro" />
            </div>

            <div className="flex flex-col gap-6">
              <Card className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-[var(--text-primary)]">Configurações</p>
                    <p className="mt-1 text-sm text-[var(--text-secondary)]">
                      Ajuste foco, pausas e meta diária.
                    </p>
                  </div>
                  <Button
                    size="sm"
                    loading={isSaving}
                    onClick={() =>
                      saveSettings({
                        focusDurationMinutes: form.focusDurationMinutes,
                        shortBreakMinutes: form.shortBreakMinutes,
                        longBreakMinutes: form.longBreakMinutes,
                        longBreakInterval: form.longBreakInterval,
                        autoStartBreaks: form.autoStartBreaks,
                        autoStartFocus: form.autoStartFocus,
                        dailyFocusGoalMinutes: form.dailyFocusGoalMinutes,
                      })
                    }
                  >
                    <Check size={14} />
                    Salvar
                  </Button>
                </div>

                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  {[
                    ['Foco', 'focusDurationMinutes', 1, 180],
                    ['Pausa curta', 'shortBreakMinutes', 1, 60],
                    ['Pausa longa', 'longBreakMinutes', 5, 120],
                    ['Pausa longa a cada', 'longBreakInterval', 2, 12],
                    ['Meta diária', 'dailyFocusGoalMinutes', 5, 600],
                  ].map(([label, field, min, max]) => (
                    <label key={field} className="flex flex-col gap-2 text-sm">
                      <span className="font-medium text-[var(--text-primary)]">{label}</span>
                      <input
                        type="number"
                        min={Number(min)}
                        max={Number(max)}
                        value={form[field as keyof typeof form] as number}
                        onChange={(e) =>
                          setForm((current) => ({
                            ...current,
                            [field]: Number(e.target.value),
                          }))
                        }
                        className="h-11 rounded-2xl border border-[var(--border)] bg-white/70 px-4 text-[var(--text-primary)] outline-none focus:border-[var(--accent)]"
                      />
                    </label>
                  ))}
                </div>

                <div className="mt-5 grid gap-3">
                  <label className="flex items-center justify-between rounded-2xl border border-[var(--border)] bg-white/60 px-4 py-3">
                    <span className="text-sm text-[var(--text-primary)]">Auto-iniciar pausas</span>
                    <input
                      type="checkbox"
                      checked={form.autoStartBreaks}
                      onChange={(e) => setForm((current) => ({ ...current, autoStartBreaks: e.target.checked }))}
                    />
                  </label>
                  <label className="flex items-center justify-between rounded-2xl border border-[var(--border)] bg-white/60 px-4 py-3">
                    <span className="text-sm text-[var(--text-primary)]">Auto-iniciar foco após pausas</span>
                    <input
                      type="checkbox"
                      checked={form.autoStartFocus}
                      onChange={(e) => setForm((current) => ({ ...current, autoStartFocus: e.target.checked }))}
                    />
                  </label>
                </div>
              </Card>

              {(contextType || contextLabel) && !activeSession && (
                <Card className="p-6">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--accent-bg)] text-[var(--accent)]">
                      <PlayCircle size={16} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[var(--text-primary)]">Contexto de início</p>
                      <p className="mt-1 text-sm text-[var(--text-secondary)]">
                        {contextLabel ?? 'Sessão preparada a partir de outra área do produto.'}
                      </p>
                      <p className="mt-2 text-xs uppercase tracking-[0.2em] text-[var(--accent)]">
                        {contextType ?? 'general'}
                      </p>
                    </div>
                  </div>
                </Card>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
