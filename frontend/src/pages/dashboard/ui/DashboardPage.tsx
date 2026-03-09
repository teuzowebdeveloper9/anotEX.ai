import { Link } from 'react-router-dom'
import { Mic, Inbox, CheckCircle, Clock, Layers } from 'lucide-react'
import { Navbar } from '@/widgets/navbar/ui/Navbar'
import { Sidebar } from '@/widgets/sidebar/ui/Sidebar'
import { AudioCard } from '@/entities/audio/ui/AudioCard'
import { Button } from '@/shared/ui/Button/Button'
import { Skeleton } from '@/shared/ui/Skeleton/Skeleton'
import { GradientOrb } from '@/shared/ui/decorative/GradientOrb'
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
    <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] shadow-[var(--shadow-card)] hover:-translate-y-0.5 transition-all duration-200">
      <div
        className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${color}`}
        style={
          gradientFrom && gradientTo
            ? { background: `linear-gradient(135deg, ${gradientFrom}, ${gradientTo})` }
            : undefined
        }
      >
        <Icon size={15} />
      </div>
      <div>
        <p
          className="text-lg font-semibold leading-none"
          style={
            gradientFrom && gradientTo
              ? {
                  background: `linear-gradient(135deg, ${gradientFrom}, ${gradientTo})`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }
              : { color: 'var(--text-primary)' }
          }
        >
          {value}
        </p>
        <p className="text-xs text-[var(--text-secondary)] mt-0.5">{label}</p>
      </div>
    </div>
  )
}

export function DashboardPage() {
  const { data: audios, isLoading } = useAudioList()

  const visible = audios?.filter((a) => a.status !== 'FAILED') ?? []
  const completed  = visible.filter((a) => a.status === 'COMPLETED').length
  const processing = visible.filter((a) => a.status === 'PENDING' || a.status === 'PROCESSING').length

  return (
    <div className="relative min-h-screen bg-[var(--bg-base)] overflow-hidden">
      {/* Subtle background orb */}
      <GradientOrb
        size={600}
        color="#7C3AED"
        opacity={0.05}
        className="top-0 right-0 z-0"
        style={{ transform: 'translate(30%, -30%)' }}
      />
      <Navbar />
      <Sidebar />
      <main className="relative z-10 pl-52 pt-14">
        <div className="max-w-3xl mx-auto px-8 pt-10 pb-16">

          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-xl font-semibold text-[var(--text-primary)]">Gravações</h1>
              <p className="text-sm text-[var(--text-secondary)] mt-0.5">
                Suas aulas gravadas e processadas pela IA
              </p>
            </div>
            <Link to="/record">
              <Button>
                <Mic size={14} />
                Nova gravação
              </Button>
            </Link>
          </div>

          {/* Stats */}
          {!isLoading && visible.length > 0 && (
            <div className="grid grid-cols-3 gap-3 mb-8">
              <StatCard
                icon={Layers}
                label="Total"
                value={visible.length}
                color="text-white"
                gradientFrom="#7C3AED"
                gradientTo="#22D3EE"
              />
              <StatCard
                icon={CheckCircle}
                label="Concluídas"
                value={completed}
                color="text-white"
                gradientFrom="#10B981"
                gradientTo="#22D3EE"
              />
              <StatCard
                icon={Clock}
                label="Processando"
                value={processing}
                color="text-white"
                gradientFrom="#F59E0B"
                gradientTo="#EC4899"
              />
            </div>
          )}

          {/* List */}
          <div className="flex flex-col gap-2">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-[72px] w-full rounded-xl" />
              ))
            ) : visible.length === 0 ? (
              <div className="flex flex-col items-center gap-5 py-24 text-center">
                <div className="h-16 w-16 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border)] flex items-center justify-center">
                  <Inbox size={28} className="text-[var(--text-tertiary)]" />
                </div>
                <div>
                  <p className="text-base font-medium text-[var(--text-primary)]">
                    Nenhuma gravação ainda
                  </p>
                  <p className="text-sm text-[var(--text-secondary)] mt-1 max-w-xs">
                    Grave sua primeira aula e a IA vai gerar transcrição, resumo, mapas mentais e flashcards automaticamente.
                  </p>
                </div>
                <Link to="/record">
                  <Button>
                    <Mic size={14} />
                    Gravar agora
                  </Button>
                </Link>
              </div>
            ) : (
              visible.map((audio) => <AudioCard key={audio.id} audio={audio} />)
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
