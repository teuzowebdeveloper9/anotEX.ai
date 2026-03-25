import { Link } from 'react-router-dom'
import { Mic, Inbox, CheckCircle, Clock, Layers } from 'lucide-react'
import { Sidebar } from '@/widgets/sidebar/ui/Sidebar'
import { AudioCard } from '@/entities/audio/ui/AudioCard'
import { Button } from '@/shared/ui/Button/Button'
import { Skeleton } from '@/shared/ui/Skeleton/Skeleton'
import { GradientOrb } from '@/shared/ui/decorative/GradientOrb'
import { DueCardsWidget } from '@/widgets/due-cards-widget/ui/DueCardsWidget'
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
    <div className="rounded-[20px] border p-5 shadow-[0_6px_18px_rgba(56,171,228,0.12)] transition-all duration-200 hover:-translate-y-0.5">
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

  const visible = audios?.filter((a) => a.status !== 'FAILED') ?? []
  const completed  = visible.filter((a) => a.status === 'COMPLETED').length
  const processing = visible.filter((a) => a.status === 'PENDING' || a.status === 'PROCESSING').length
  const readyToStudy = Math.max(completed - processing, 0)

  return (
    <div className="pen-page relative min-h-screen overflow-hidden">
      <Sidebar withTopBar={false} />
      <main className="relative z-10 md:pl-56">
        <div className="mx-auto max-w-6xl px-6 pb-16 pt-9 md:px-10">
          <div className="mb-8 flex items-center justify-between gap-4">
            <div>
              <h1 className="text-[1.75rem] font-bold tracking-[-0.03em] text-[var(--text-primary)]">
                Bom dia!
              </h1>
              <p className="mt-1 text-sm text-[var(--text-tertiary)]">
                Você tem conteúdo novo e revisões para acompanhar hoje.
              </p>
            </div>
            <Link to="/record">
              <Button>
                <Mic size={14} />
                Nova gravação
              </Button>
            </Link>
          </div>

          <div className="mb-6">
            <DueCardsWidget />
          </div>

          {!isLoading && visible.length > 0 && (
            <div className="mb-8 grid gap-4 md:grid-cols-4">
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
                <Skeleton key={i} className="h-[72px] w-full rounded-xl" />
              ))
            ) : visible.length === 0 ? (
              <div className="relative flex flex-col items-center gap-5 overflow-hidden py-24 text-center">
                <GradientOrb
                  size={300}
                  color="#38ABE4"
                  opacity={0.07}
                  className="top-1/2 left-1/2 z-0"
                  style={{ transform: 'translate(-50%, -50%)' }}
                />
                <div className="relative z-10 h-16 w-16 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border)] flex items-center justify-center">
                  <Inbox size={28} className="text-[var(--text-tertiary)]" />
                </div>
                <div className="relative z-10">
                  <p className="text-base font-medium text-[var(--text-primary)]">
                    Nenhuma gravação ainda
                  </p>
                  <p className="text-sm text-[var(--text-secondary)] mt-1 max-w-xs">
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
