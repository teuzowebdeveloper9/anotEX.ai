import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Map, Inbox, ChevronRight, Loader2, AlertCircle, Search } from 'lucide-react'
import { useQueries } from '@tanstack/react-query'
import { Navbar } from '@/widgets/navbar/ui/Navbar'
import { Sidebar } from '@/widgets/sidebar/ui/Sidebar'
import { Skeleton } from '@/shared/ui/Skeleton/Skeleton'
import { GradientOrb } from '@/shared/ui/decorative/GradientOrb'
import { useTranscriptionList } from '@/entities/transcription/model/useTranscriptionList'
import { api } from '@/shared/api/axios'
import { ENDPOINTS } from '@/shared/api/endpoints'
import type { StudyMaterialEntity } from '@/shared/types/api.types'

export function MindMapsPage() {
  const [search, setSearch] = useState('')
  const { data: transcriptions, isLoading } = useTranscriptionList(search)

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
    <div className="relative min-h-screen bg-[var(--bg-base)] overflow-hidden">
      {/* Background orbs — cyan-tinted for mind maps */}
      <GradientOrb
        size={500}
        color="#22D3EE"
        opacity={0.08}
        className="top-0 right-0 z-0"
        style={{ transform: 'translate(30%, -30%)' }}
      />
      <GradientOrb
        size={350}
        color="#7C3AED"
        opacity={0.05}
        className="bottom-0 left-52 z-0"
        style={{ transform: 'translate(-20%, 30%)' }}
      />

      <Navbar />
      <Sidebar />
      <main className="relative z-10 pl-56 pt-14">
        <div className="max-w-3xl mx-auto px-8 pt-10 pb-12">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-1">
              <div className="h-8 w-8 rounded-lg bg-[var(--accent-2)]/10 flex items-center justify-center">
                <Map size={16} className="text-[var(--accent-2)]" />
              </div>
              <h1 className="text-2xl font-semibold gradient-text">Mapas Mentais</h1>
            </div>
            <p className="text-sm text-[var(--text-secondary)] mt-1">
              Mapas gerados automaticamente das suas aulas
            </p>
          </div>

          <div className="relative mb-6">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
            <input
              type="text"
              placeholder="Buscar por título ou conteúdo..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-[var(--bg-surface)] border border-[var(--border)] text-sm text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:outline-none focus:border-[var(--accent-2)]/60 transition-colors"
            />
          </div>

          <div className="flex flex-col gap-3">
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-[72px] w-full" />
              ))
            ) : completed.length === 0 ? (
              <div className="relative flex flex-col items-center gap-4 py-20 text-center overflow-hidden">
                <GradientOrb
                  size={280}
                  color="#22D3EE"
                  opacity={0.07}
                  className="top-1/2 left-1/2 z-0"
                  style={{ transform: 'translate(-50%, -50%)' }}
                />
                <div className="relative z-10">
                  <Inbox size={40} className="text-[var(--text-secondary)] mx-auto mb-4" />
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
                    <div className="group flex items-center gap-0 rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] hover:border-[var(--accent-2)]/40 hover:bg-[var(--bg-elevated)] hover:-translate-y-px transition-all duration-200 cursor-pointer shadow-[var(--shadow-card)] overflow-hidden">
                      {/* Gradient left border */}
                      <div
                        className="w-0.5 self-stretch shrink-0"
                        style={{ background: 'linear-gradient(180deg, #22D3EE, #3B82F6)' }}
                      />
                      <div className="flex items-center gap-4 p-4 flex-1 min-w-0">
                        <div className="h-10 w-10 rounded-lg bg-[var(--accent-2)]/10 flex items-center justify-center shrink-0">
                          <Map size={18} className="text-[var(--accent-2)]" />
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
                            <Loader2 size={14} className="text-[var(--accent-2)] animate-spin" />
                          ) : null}
                          <ChevronRight size={16} className="text-[var(--text-secondary)] group-hover:text-[var(--accent-2)] transition-colors" />
                        </div>
                      </div>
                    </div>
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
