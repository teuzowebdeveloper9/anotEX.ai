import { useState } from 'react'
import { Link } from 'react-router-dom'
import { FileText, Inbox, ChevronRight, Search } from 'lucide-react'
import { Navbar } from '@/widgets/navbar/ui/Navbar'
import { Sidebar } from '@/widgets/sidebar/ui/Sidebar'
import { Card } from '@/shared/ui/Card/Card'
import { Badge } from '@/shared/ui/Badge/Badge'
import { Skeleton } from '@/shared/ui/Skeleton/Skeleton'
import { GradientOrb } from '@/shared/ui/decorative/GradientOrb'
import { useTranscriptionList } from '@/entities/transcription/model/useTranscriptionList'

export function TranscriptionsPage() {
  const [search, setSearch] = useState('')
  const { data: transcriptions, isLoading } = useTranscriptionList(search)

  return (
    <div className="relative min-h-screen bg-[var(--bg-base)] overflow-hidden">
      {/* Background orbs */}
      <GradientOrb
        size={500}
        color="#38ABE4"
        opacity={0.08}
        className="top-0 right-0 z-0"
        style={{ transform: 'translate(30%, -30%)' }}
      />
      <GradientOrb
        size={350}
        color="#22D3EE"
        opacity={0.04}
        className="bottom-0 left-52 z-0"
        style={{ transform: 'translate(-20%, 30%)' }}
      />

      <Navbar />
      <Sidebar />
      <main className="relative z-10 pt-14 md:pl-56">
        <div className="max-w-3xl mx-auto px-8 pt-10 pb-12">
          <div className="mb-8">
            <h1 className="text-2xl font-semibold gradient-text">Transcrições</h1>
            <p className="text-sm text-[var(--text-secondary)] mt-1">
              {transcriptions?.length ?? 0} transcrição{transcriptions?.length !== 1 ? 'ões' : ''}
            </p>
          </div>

          <div className="relative mb-6">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
            <input
              type="text"
              placeholder="Buscar por título ou conteúdo..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-[var(--bg-surface)] border border-[var(--border)] text-sm text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:outline-none focus:border-[var(--accent)]/60 transition-colors"
            />
          </div>

          <div className="flex flex-col gap-3">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-[88px] w-full" />
              ))
            ) : transcriptions?.length === 0 ? (
              <div className="relative flex flex-col items-center gap-4 py-20 text-center overflow-hidden">
                <GradientOrb
                  size={280}
                  color="#38ABE4"
                  opacity={0.07}
                  className="top-1/2 left-1/2 z-0"
                  style={{ transform: 'translate(-50%, -50%)' }}
                />
                <div className="relative z-10">
                  <Inbox size={40} className="text-[var(--text-secondary)] mx-auto mb-4" />
                  <p className="text-[var(--text-primary)] font-medium">Nenhuma transcrição ainda</p>
                  <p className="text-sm text-[var(--text-secondary)] mt-1">
                    Grave uma aula para gerar sua primeira transcrição
                  </p>
                </div>
              </div>
            ) : (
              transcriptions?.filter((t) => t.status !== 'FAILED').map((t) => {
                const date = new Date(t.createdAt).toLocaleDateString('pt-BR', {
                  day: '2-digit', month: 'short', year: 'numeric',
                })
                return (
                  <Link key={t.id} to={`/transcription/${t.audioId}`}>
                    <Card className="p-4 flex items-center gap-4 hover:border-[var(--accent)]/40 hover:bg-[var(--bg-elevated)] hover:-translate-y-px transition-all duration-200 cursor-pointer group shadow-[var(--shadow-card)]">
                      <div className="h-10 w-10 rounded-lg bg-[var(--accent)]/10 flex items-center justify-center shrink-0">
                        <FileText size={18} className="text-[var(--accent)]" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[var(--text-primary)] truncate">
                          {t.title ?? 'Processando...'}
                        </p>
                        {t.summaryText && (
                          <p className="text-xs text-[var(--text-secondary)] mt-0.5 truncate">
                            {t.summaryText.slice(0, 100)}
                          </p>
                        )}
                        <p className="text-xs text-[var(--text-secondary)]/60 mt-0.5">{date}</p>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <Badge status={t.status} />
                        <ChevronRight size={16} className="text-[var(--text-secondary)] group-hover:text-[var(--accent)] transition-colors" />
                      </div>
                    </Card>
                  </Link>
                )
              })
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
