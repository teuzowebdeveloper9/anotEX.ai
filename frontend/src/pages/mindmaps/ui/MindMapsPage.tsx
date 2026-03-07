import { Link } from 'react-router-dom'
import { Map, Inbox, ChevronRight, Loader2, AlertCircle } from 'lucide-react'
import { useQueries } from '@tanstack/react-query'
import { Navbar } from '@/widgets/navbar/ui/Navbar'
import { Sidebar } from '@/widgets/sidebar/ui/Sidebar'
import { Card } from '@/shared/ui/Card/Card'
import { Skeleton } from '@/shared/ui/Skeleton/Skeleton'
import { useTranscriptionList } from '@/entities/transcription/model/useTranscriptionList'
import { api } from '@/shared/api/axios'
import { ENDPOINTS } from '@/shared/api/endpoints'
import type { StudyMaterialEntity } from '@/shared/types/api.types'

export function MindMapsPage() {
  const { data: transcriptions, isLoading } = useTranscriptionList()

  const completed = transcriptions?.filter((t) => t.status === 'COMPLETED') ?? []

  const materialQueries = useQueries({
    queries: completed.map((t) => ({
      queryKey: ['study-material', t.id, 'mindmap'],
      queryFn: async () => {
        const { data } = await api.get<StudyMaterialEntity>(
          ENDPOINTS.studyMaterials.getByType(t.id, 'mindmap'),
        )
        return data
      },
      retry: false,
    })),
  })

  return (
    <div className="min-h-screen bg-[var(--bg-base)]">
      <Navbar />
      <Sidebar />
      <main className="pl-56 pt-14">
        <div className="max-w-3xl mx-auto px-8 pt-10 pb-12">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-1">
              <div className="h-8 w-8 rounded-lg bg-[var(--accent)]/10 flex items-center justify-center">
                <Map size={16} className="text-[var(--accent)]" />
              </div>
              <h1 className="text-2xl font-semibold text-[var(--text-primary)]">Mapas Mentais</h1>
            </div>
            <p className="text-sm text-[var(--text-secondary)] mt-1">
              Mapas gerados automaticamente das suas aulas
            </p>
          </div>

          <div className="flex flex-col gap-3">
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-[72px] w-full" />
              ))
            ) : completed.length === 0 ? (
              <div className="flex flex-col items-center gap-4 py-20 text-center">
                <Inbox size={40} className="text-[var(--text-secondary)]" />
                <div>
                  <p className="text-[var(--text-primary)] font-medium">Nenhum mapa mental ainda</p>
                  <p className="text-sm text-[var(--text-secondary)] mt-1">
                    Grave uma aula e a IA gerará o mapa mental automaticamente
                  </p>
                </div>
              </div>
            ) : (
              completed.map((t, i) => {
                const material = materialQueries[i]?.data
                const isQuerying = materialQueries[i]?.isLoading
                const date = new Date(t.createdAt).toLocaleDateString('pt-BR', {
                  day: '2-digit', month: 'short', year: 'numeric',
                })

                return (
                  <Link key={t.id} to={`/transcription/${t.audioId}?tab=mindmap`}>
                    <Card className="p-4 flex items-center gap-4 hover:border-[var(--accent)]/40 hover:bg-[var(--bg-elevated)] transition-all duration-200 cursor-pointer group">
                      <div className="h-10 w-10 rounded-lg bg-[var(--accent)]/10 flex items-center justify-center shrink-0">
                        <Map size={18} className="text-[var(--accent)]" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[var(--text-primary)] truncate">
                          {t.title ?? 'Transcrição'}
                        </p>
                        <p className="text-xs text-[var(--text-secondary)]/60 mt-0.5">{date}</p>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        {isQuerying ? (
                          <Loader2 size={14} className="text-[var(--text-secondary)] animate-spin" />
                        ) : material?.status === 'COMPLETED' ? (
                          <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-400/80 border border-emerald-500/20 rounded px-2 py-0.5">
                            Pronto
                          </span>
                        ) : material?.status === 'FAILED' ? (
                          <AlertCircle size={14} className="text-red-400" />
                        ) : material ? (
                          <Loader2 size={14} className="text-[var(--accent)] animate-spin" />
                        ) : null}
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
