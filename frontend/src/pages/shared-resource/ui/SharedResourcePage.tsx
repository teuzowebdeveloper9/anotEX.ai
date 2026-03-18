import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { AlertCircle, Loader2, FileText, Sparkles, Map, BookOpen, Lock } from 'lucide-react'
import { useState } from 'react'
import { axiosPublic } from '@/shared/api/axios'
import { ENDPOINTS } from '@/shared/api/endpoints'
import { Badge } from '@/shared/ui/Badge/Badge'
import type { AudioStatus } from '@/shared/types/api.types'
import { MarkdownRenderer } from '@/shared/ui/MarkdownRenderer/MarkdownRenderer'
import { MindMapViewer } from '@/widgets/mindmap/ui/MindMapViewer'
import { FlashcardDeck } from '@/widgets/flashcard-deck/ui/FlashcardDeck'
import { GradientOrb } from '@/shared/ui/decorative/GradientOrb'
import { cn } from '@/shared/lib/cn'
import type { FlashcardItem, MindmapContent } from '@/shared/types/api.types'

type Tab = 'resumo' | 'transcricao' | 'mindmap' | 'flashcards'

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: 'resumo',      label: 'Resumo',       icon: Sparkles  },
  { id: 'transcricao', label: 'Transcrição',  icon: FileText  },
  { id: 'mindmap',     label: 'Mapa Mental',  icon: Map       },
  { id: 'flashcards',  label: 'Flashcards',   icon: BookOpen  },
]

interface SharedResource {
  shareLink: { token: string; resourceType: string; resourceId: string }
  audio: { id: string; status: string; fileName: string } | null
  transcription: {
    id: string
    title: string | null
    transcriptionText: string | null
    summaryText: string | null
    status: string
    errorMessage: string | null
  } | null
  studyMaterials: {
    mindmap: { status: string; content: unknown } | null
    flashcards: { status: string; content: unknown } | null
  }
}

export function SharedResourcePage() {
  const { token } = useParams<{ token: string }>()
  const [activeTab, setActiveTab] = useState<Tab>('resumo')

  const { data, isLoading, error } = useQuery<SharedResource>({
    queryKey: ['shared-resource', token],
    queryFn: async () => {
      const { data } = await axiosPublic.get<SharedResource>(ENDPOINTS.sharing.public(token!))
      return data
    },
    enabled: !!token,
    retry: false,
  })

  const transcription = data?.transcription

  return (
    <div className="relative min-h-screen bg-[var(--bg-base)] overflow-hidden">
      <GradientOrb size={600} color="#7C3AED" opacity={0.06} className="top-0 right-0 z-0" style={{ transform: 'translate(30%, -30%)' }} />
      <GradientOrb size={350} color="#22D3EE" opacity={0.04} className="bottom-0 left-0 z-0" style={{ transform: 'translate(-20%, 30%)' }} />

      {/* Minimal navbar for public page */}
      <header className="fixed top-0 left-0 right-0 z-30 h-14 border-b border-[var(--border)] bg-[var(--bg-base)]/80 backdrop-blur-sm flex items-center justify-between px-6">
        <Link to="/" className="flex items-center gap-2">
          <span
            className="text-sm font-bold tracking-tight"
            style={{ background: 'var(--gradient-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}
          >
            anotEX.ai
          </span>
        </Link>
        <Link
          to="/login"
          className="text-xs px-3 py-1.5 rounded-lg border border-[var(--accent)]/30 text-[var(--accent)] hover:bg-[var(--accent-bg)] transition-colors"
        >
          Entrar
        </Link>
      </header>

      <main className="relative z-10 pt-14">
        <div className="max-w-3xl mx-auto px-6 pt-10 pb-16">

          {isLoading && (
            <div className="flex items-center justify-center py-24">
              <Loader2 size={24} className="text-[var(--accent)] animate-spin" />
            </div>
          )}

          {error && (
            <div className="flex flex-col items-center gap-4 py-24 text-center">
              <div className="h-14 w-14 rounded-2xl bg-[var(--danger-bg)] border border-[var(--danger)]/25 flex items-center justify-center">
                <Lock size={22} className="text-[var(--danger)]" />
              </div>
              <div>
                <p className="text-sm font-medium text-[var(--text-primary)]">Conteúdo não disponível</p>
                <p className="text-xs text-[var(--text-secondary)] mt-1">
                  Este link pode ser privado, expirado ou inválido.
                </p>
              </div>
              <Link
                to="/login"
                className="mt-2 text-xs px-4 py-2 rounded-lg bg-[var(--accent)] text-white font-medium hover:opacity-90 transition-opacity"
              >
                Entrar para ver seu conteúdo
              </Link>
            </div>
          )}

          {data && (
            <div className="flex flex-col gap-6">
              {/* Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <h1 className="text-xl font-semibold leading-snug gradient-text">
                    {transcription?.title ?? data.audio?.fileName ?? 'Gravação'}
                  </h1>
                  {transcription?.title && (
                    <p className="text-sm text-[var(--text-secondary)] truncate mt-1">
                      {data.audio?.fileName}
                    </p>
                  )}
                </div>
                {data.audio?.status && <Badge status={data.audio.status as AudioStatus} />}
              </div>

              {/* Shared banner */}
              <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[var(--accent)]/20 bg-[var(--accent-bg)] text-xs text-[var(--accent)]">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Conteúdo compartilhado via anotEX.ai
                <span className="ml-auto">
                  <Link to="/login" className="underline hover:no-underline">
                    Criar minha conta
                  </Link>
                </span>
              </div>

              {transcription?.status === 'FAILED' && (
                <div className="flex items-center gap-4 p-5 rounded-xl border border-[var(--danger)]/25 bg-[var(--danger-bg)]">
                  <AlertCircle size={18} className="text-[var(--danger)] shrink-0" />
                  <p className="text-sm text-[var(--danger)]">Falha no processamento desta gravação.</p>
                </div>
              )}

              {transcription?.status === 'COMPLETED' && (
                <>
                  {/* Tabs */}
                  <div className="flex gap-1 p-1 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border)]">
                    {TABS.map((tab) => {
                      const Icon = tab.icon
                      const isActive = activeTab === tab.id
                      return (
                        <button
                          key={tab.id}
                          onClick={() => setActiveTab(tab.id)}
                          className={cn(
                            'flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg transition-all duration-200',
                            isActive
                              ? 'bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-[var(--shadow-card)]'
                              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                          )}
                        >
                          <span
                            style={
                              isActive
                                ? { background: 'var(--gradient-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }
                                : undefined
                            }
                          >
                            <Icon size={12} />
                          </span>
                          <span className="hidden sm:inline">{tab.label}</span>
                        </button>
                      )
                    })}
                  </div>

                  <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] shadow-[var(--shadow-card)] overflow-hidden">
                    {activeTab === 'resumo' && (
                      <div className="p-6">
                        <div className="flex gap-4">
                          <div className="w-0.5 rounded-full shrink-0 self-stretch" style={{ background: 'var(--gradient-primary)' }} />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-5">
                              <Sparkles size={15} className="text-[var(--accent)]" />
                              <h2 className="text-sm font-semibold text-[var(--text-primary)]">Resumo</h2>
                            </div>
                            {transcription.summaryText
                              ? <MarkdownRenderer content={transcription.summaryText} />
                              : <p className="text-sm text-[var(--text-tertiary)]">Nenhum resumo disponível.</p>
                            }
                          </div>
                        </div>
                      </div>
                    )}

                    {activeTab === 'transcricao' && (
                      <div className="p-6">
                        <div className="flex items-center gap-2 mb-5">
                          <FileText size={15} className="text-[var(--text-secondary)]" />
                          <h2 className="text-sm font-semibold text-[var(--text-primary)]">Transcrição completa</h2>
                        </div>
                        <div className="text-sm text-[var(--text-secondary)] leading-relaxed font-mono whitespace-pre-wrap max-h-[520px] overflow-y-auto pr-2">
                          {transcription.transcriptionText ?? '—'}
                        </div>
                      </div>
                    )}

                    {activeTab === 'mindmap' && (
                      <div className="p-6">
                        <div className="flex items-center gap-2 mb-5">
                          <Map size={15} className="text-[var(--text-secondary)]" />
                          <h2 className="text-sm font-semibold text-[var(--text-primary)]">Mapa Mental</h2>
                        </div>
                        {data.studyMaterials.mindmap?.status === 'COMPLETED' && data.studyMaterials.mindmap.content ? (
                          <MindMapViewer markdown={(data.studyMaterials.mindmap.content as MindmapContent).markdown} />
                        ) : (
                          <p className="text-sm text-[var(--text-tertiary)] text-center py-8">Mapa mental não disponível.</p>
                        )}
                      </div>
                    )}

                    {activeTab === 'flashcards' && (
                      <div className="p-6">
                        <div className="flex items-center gap-2 mb-6">
                          <BookOpen size={15} className="text-[var(--text-secondary)]" />
                          <h2 className="text-sm font-semibold text-[var(--text-primary)]">Flashcards</h2>
                        </div>
                        {data.studyMaterials.flashcards?.status === 'COMPLETED' && data.studyMaterials.flashcards.content ? (
                          <FlashcardDeck cards={data.studyMaterials.flashcards.content as FlashcardItem[]} />
                        ) : (
                          <p className="text-sm text-[var(--text-tertiary)] text-center py-8">Flashcards não disponíveis.</p>
                        )}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
