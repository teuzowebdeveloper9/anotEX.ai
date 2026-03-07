import { useState } from 'react'
import { useParams, Link, useSearchParams } from 'react-router-dom'
import { ArrowLeft, AlertCircle, Loader2 } from 'lucide-react'
import { Navbar } from '@/widgets/navbar/ui/Navbar'
import { Sidebar } from '@/widgets/sidebar/ui/Sidebar'
import { Card } from '@/shared/ui/Card/Card'
import { Badge } from '@/shared/ui/Badge/Badge'
import { Skeleton } from '@/shared/ui/Skeleton/Skeleton'
import { CopyButton } from '@/features/transcription/copy-text/ui/CopyButton'
import { MarkdownRenderer } from '@/shared/ui/MarkdownRenderer/MarkdownRenderer'
import { MindMapViewer } from '@/widgets/mindmap/ui/MindMapViewer'
import { FlashcardDeck } from '@/widgets/flashcard-deck/ui/FlashcardDeck'
import { useTranscriptionStatus } from '@/features/transcription/poll-status/model/useTranscriptionStatus'
import { useStudyMaterial } from '@/entities/study-material/model/useStudyMaterial'
import type { FlashcardItem, MindmapContent } from '@/shared/types/api.types'

type Tab = 'resumo' | 'transcricao' | 'mindmap' | 'flashcards'

const TABS: { id: Tab; label: string }[] = [
  { id: 'resumo', label: 'Resumo' },
  { id: 'transcricao', label: 'Transcrição' },
  { id: 'mindmap', label: 'Mapa Mental' },
  { id: 'flashcards', label: 'Flashcards' },
]

function ProcessingCard({ message }: { message: string }) {
  return (
    <Card className="p-8 flex flex-col items-center gap-4 text-center">
      <Loader2 size={28} className="text-[var(--accent)] animate-spin" />
      <div>
        <p className="text-[var(--text-primary)] font-medium">{message}</p>
        <p className="text-sm text-[var(--text-secondary)] mt-1">
          Esta página atualiza automaticamente.
        </p>
      </div>
    </Card>
  )
}

export function TranscriptionPage() {
  const { id } = useParams<{ id: string }>()
  const [searchParams] = useSearchParams()
  const initialTab = (searchParams.get('tab') as Tab | null) ?? 'resumo'
  const [activeTab, setActiveTab] = useState<Tab>(initialTab)

  const { data, isLoading } = useTranscriptionStatus(id!)
  const transcription = data?.transcription
  const transcriptionId = transcription?.id ?? ''

  const isCompleted = transcription?.status === 'COMPLETED'

  const { data: mindmapData } = useStudyMaterial(transcriptionId, 'mindmap')
  const { data: flashcardsData } = useStudyMaterial(transcriptionId, 'flashcards')

  return (
    <div className="min-h-screen bg-[var(--bg-base)]">
      <Navbar />
      <Sidebar />
      <main className="pl-56 pt-14">
        <div className="max-w-3xl mx-auto px-8 pt-10 pb-12">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors mb-6"
          >
            <ArrowLeft size={15} />
            Voltar ao dashboard
          </Link>

          {isLoading ? (
            <div className="flex flex-col gap-4">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-64 w-full" />
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              {/* Cabeçalho */}
              <div className="flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <h1 className="text-xl font-semibold text-[var(--text-primary)] truncate">
                    {transcription?.title ?? data?.audio.fileName ?? 'Gravação'}
                  </h1>
                  {transcription?.title && (
                    <p className="text-sm text-[var(--text-secondary)] truncate mt-0.5">
                      {data?.audio.fileName}
                    </p>
                  )}
                </div>
                {data?.audio.status && <Badge status={data.audio.status} />}
              </div>

              {/* Estado de processamento ou erro */}
              {transcription?.status === 'PENDING' || transcription?.status === 'PROCESSING' ? (
                <ProcessingCard message="Processando transcrição..." />
              ) : transcription?.status === 'FAILED' ? (
                <Card className="p-6 flex items-center gap-4 border-red-500/20">
                  <AlertCircle size={20} className="text-red-400 shrink-0" />
                  <div>
                    <p className="text-red-400 font-medium">Falha no processamento</p>
                    <p className="text-sm text-[var(--text-secondary)] mt-1">
                      {transcription.errorMessage ?? 'Erro desconhecido.'}
                    </p>
                  </div>
                </Card>
              ) : isCompleted ? (
                <>
                  {/* Tabs */}
                  <div className="flex border-b border-[var(--border)]">
                    {TABS.map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
                          activeTab === tab.id
                            ? 'border-[var(--accent)] text-[var(--accent)]'
                            : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  {/* Conteúdo das tabs */}
                  {activeTab === 'resumo' && (
                    <Card className="p-6 border-[var(--accent)]/20">
                      <div className="flex items-center justify-between mb-4">
                        <h2 className="text-sm font-semibold text-[var(--accent)] uppercase tracking-wider">
                          Resumo
                        </h2>
                        {transcription?.summaryText && (
                          <CopyButton text={transcription.summaryText} />
                        )}
                      </div>
                      {transcription?.summaryText
                        ? <MarkdownRenderer content={transcription.summaryText} />
                        : <span className="text-sm text-[var(--text-secondary)]">—</span>
                      }
                    </Card>
                  )}

                  {activeTab === 'transcricao' && (
                    <Card className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h2 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                          Transcrição completa
                        </h2>
                        {transcription?.transcriptionText && (
                          <CopyButton text={transcription.transcriptionText} />
                        )}
                      </div>
                      <div className="text-sm text-[var(--text-secondary)] leading-relaxed font-mono whitespace-pre-wrap max-h-[500px] overflow-y-auto">
                        {transcription?.transcriptionText ?? '—'}
                      </div>
                    </Card>
                  )}

                  {activeTab === 'mindmap' && (
                    <Card className="p-6">
                      <h2 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-4">
                        Mapa Mental
                      </h2>
                      {!mindmapData || mindmapData.status === 'PENDING' || mindmapData.status === 'PROCESSING' || mindmapData.status === 'FAILED' ? (
                        <ProcessingCard message="Gerando mapa mental..." />
                      ) : mindmapData.content ? (
                        <MindMapViewer markdown={(mindmapData.content as MindmapContent).markdown} />
                      ) : null}
                    </Card>
                  )}

                  {activeTab === 'flashcards' && (
                    <Card className="p-6">
                      <h2 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-6">
                        Flashcards
                      </h2>
                      {!flashcardsData || flashcardsData.status === 'PENDING' || flashcardsData.status === 'PROCESSING' || flashcardsData.status === 'FAILED' ? (
                        <ProcessingCard message="Gerando flashcards..." />
                      ) : flashcardsData.content ? (
                        <FlashcardDeck cards={flashcardsData.content as FlashcardItem[]} />
                      ) : null}
                    </Card>
                  )}
                </>
              ) : null}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
