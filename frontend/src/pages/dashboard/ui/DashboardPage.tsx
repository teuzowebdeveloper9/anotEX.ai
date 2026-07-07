import { Link } from 'react-router-dom'
import { Mic, Inbox, CheckCircle, Clock, Layers, LogOut } from 'lucide-react'
import { Sidebar } from '@/widgets/sidebar/ui/Sidebar'
import { logout } from '@/shared/auth/auth-client'
import { AudioCard } from '@/entities/audio/ui/AudioCard'
import { Button } from '@/shared/ui/Button/Button'
import { Skeleton } from '@/shared/ui/Skeleton/Skeleton'
import { DueCardsWidget } from '@/widgets/due-cards-widget/ui/DueCardsWidget'
import { PomodoroDashboardWidget } from '@/widgets/pomodoro-panel/ui/PomodoroDashboardWidget'
import { useAudioList } from '@/entities/audio/model/useAudioList'

function StatCard({ icon: Icon, label, value, color, gradientFrom, gradientTo }: {
  icon: React.ElementType
  label: string
  value: number
  color: string
  gradientFrom?: string
  gradientTo?: string
}) {
  return (
    <div className="rounded-[20px] border border-[var(--border-soft)] bg-[rgba(255,255,255,0.8)] p-5 transition-all duration-200">
      <div
        className={`mb-5 flex h-10 w-10 items-center justify-center rounded-2xl text-white ${color}`}
        style={
          gradientFrom && gradientTo
            ? {
                background: `linear-gradient(175deg, ${gradientFrom}33, ${gradientTo}18)`,
                border: `1px solid ${gradientFrom}55`,
                color: 'var(--text-primary)',
              }
            : undefined
        }
      >
        <Icon size={15} />
      </div>
      <p className="text-[2.1rem] font-extrabold leading-none tracking-[-0.04em] text-[var(--text-primary)]">{value}</p>
      <p className="mt-1.5 text-[13px] text-[var(--text-secondary)]">{label}</p>
    </div>
  )
}

export function DashboardPage() {
  const { data: audios, isLoading } = useAudioList()

  const handleLogout = async (): Promise<void> => {
    await logout()
    window.location.href = '/login'
  }

  const visible = audios?.filter((a) => a.status !== 'FAILED') ?? []
  const completed  = visible.filter((a) => a.status === 'COMPLETED').length
  const processing = visible.filter((a) => a.status === 'PENDING' || a.status === 'PROCESSING').length
  const readyToStudy = Math.max(completed - processing, 0)

  return (
    <div className="relative min-h-screen overflow-hidden bg-[linear-gradient(180deg,#fbfcff_0%,#f7f9fd_100%)]">
      <Sidebar withTopBar={false} />
      <main className="relative z-10 md:pl-[11rem]">
        <div className="mx-auto max-w-6xl px-4 pb-16 pt-24 sm:px-8 md:px-8 md:pt-9">
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-[2.25rem] font-extrabold tracking-[-0.05em] text-[var(--text-primary)]">
                Bom dia!
              </h1>
              <p className="mt-1 text-sm text-[var(--text-tertiary)]">
                Você tem conteúdo novo e revisões para acompanhar hoje.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Link to="/record">
                <Button className="w-full sm:w-auto">
                  <Mic size={14} />
                  Nova gravação
                </Button>
              </Link>
              <button
                onClick={handleLogout}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-[var(--text-tertiary)] hover:bg-[var(--danger-bg)] hover:text-[var(--danger)]"
                title="Sair"
              >
                <LogOut size={16} />
              </button>
            </div>
          </div>

          <div className="mb-6 grid gap-3 lg:grid-cols-2">
            <DueCardsWidget />
            <PomodoroDashboardWidget />
          </div>

          {!isLoading && visible.length > 0 && (
            <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard
                icon={Layers}
                label="Aulas gravadas"
                value={visible.length}
                color="text-white"
                gradientFrom="#38ABE4"
                gradientTo="#22D3EE"
              />
              <StatCard
                icon={CheckCircle}
                label="Concluídas"
                value={completed}
                color="text-white"
                gradientFrom="#00C4CC"
                gradientTo="#38ABE4"
              />
              <StatCard
                icon={Clock}
                label="Prontas para estudar"
                value={readyToStudy}
                color="text-white"
                gradientFrom="#71AB23"
                gradientTo="#9FE11D"
              />
              <StatCard
                icon={Mic}
                label="Em processamento"
                value={processing}
                color="text-white"
                gradientFrom="#F4801A"
                gradientTo="#F59E0B"
              />
            </div>
          )}

          <div className="flex flex-col gap-2">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-[72px] w-full rounded-[22px]" />
              ))
            ) : visible.length === 0 ? (
              <div className="relative flex flex-col items-center gap-5 overflow-hidden py-24 text-center">
                <div className="relative z-10 flex h-16 w-16 items-center justify-center rounded-2xl border border-[var(--border-soft)] bg-[rgba(255,255,255,0.84)]">
                  <Inbox size={28} className="text-[var(--text-tertiary)]" />
                </div>
                <div className="relative z-10">
                  <p className="text-[1.05rem] font-semibold text-[var(--text-primary)]">
                    Nenhuma gravação ainda
                  </p>
                  <p className="mt-1 max-w-xs text-sm text-[var(--text-secondary)]">
                    Grave sua primeira aula e a IA vai gerar transcrição, resumo, mapas mentais e flashcards automaticamente.
                  </p>
                </div>
                <div className="relative z-10">
                  <Link to="/record">
                    <Button>
                      <Mic size={14} />
                      Gravar agora
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <>
                <div className="mb-2 flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-[var(--text-primary)]">Aulas recentes</h2>
                    <p className="text-sm text-[var(--text-tertiary)]">Sua lista de aulas gravadas e processadas.</p>
                  </div>
                </div>
                {visible.map((audio) => <AudioCard key={audio.id} audio={audio} />)}
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
