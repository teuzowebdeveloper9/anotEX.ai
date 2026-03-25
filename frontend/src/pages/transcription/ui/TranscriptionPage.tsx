import { useState } from 'react'
import { useParams, Link, useSearchParams } from 'react-router-dom'
import { ArrowLeft, AlertCircle, Loader2, FileText, Sparkles, Map, BookOpen, Share2, CircleHelp, MessageSquare } from 'lucide-react'
import { Navbar } from '@/widgets/navbar/ui/Navbar'
import { Sidebar } from '@/widgets/sidebar/ui/Sidebar'
import { Badge } from '@/shared/ui/Badge/Badge'
import { Skeleton } from '@/shared/ui/Skeleton/Skeleton'
import { CopyButton } from '@/features/transcription/copy-text/ui/CopyButton'
import { SaveToFolderButton } from '@/features/study-folders/save-to-folder/ui/SaveToFolderButton'
import { MarkdownRenderer } from '@/shared/ui/MarkdownRenderer/MarkdownRenderer'
import { MindMapViewer } from '@/widgets/mindmap/ui/MindMapViewer'
import { FlashcardDeck } from '@/widgets/flashcard-deck/ui/FlashcardDeck'
import { QuizPlayer } from '@/widgets/quiz-player/ui/QuizPlayer'
import { TranscriptionViewer } from '@/widgets/transcription-viewer/ui/TranscriptionViewer'
import { GradientOrb } from '@/shared/ui/decorative/GradientOrb'
import { useTranscriptionStatus } from '@/features/transcription/poll-status/model/useTranscriptionStatus'
import { useStudyMaterial } from '@/entities/study-material/model/useStudyMaterial'
import { ShareModal } from '@/shared/ui/ShareModal'
import { ExportButton } from '@/features/transcription/export/ui/ExportButton'
import { cn } from '@/shared/lib/cn'
import type { FlashcardItem, MindmapContent, QuizItem } from '@/shared/types/api.types'

type Tab = 'resumo' | 'transcricao' | 'mindmap' | 'flashcards' | 'quiz'

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: 'resumo',      label: 'Resumo',       icon: Sparkles     },
  { id: 'transcricao', label: 'Transcrição',  icon: FileText     },
  { id: 'mindmap',     label: 'Mapa Mental',  icon: Map          },
  { id: 'flashcards',  label: 'Flashcards',   icon: BookOpen     },
  { id: 'quiz',        label: 'Quiz',         icon: CircleHelp   },
]

function ProcessingState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center gap-4 py-16 text-center">
      <div className="h-14 w-14 rounded-2xl bg-[var(--accent-bg)] border border-[var(--accent)]/20 flex items-center justify-center">
        <Loader2 size={22} className="text-[var(--accent)] animate-spin" />
      </div>
      <div>
        <p className="text-sm font-medium text-[var(--text-primary)]">{message}</p>
        <p className="text-xs text-[var(--text-secondary)] mt-1">
          Esta página atualiza automaticamente
        </p>
      </div>
    </div>
  )
}

export function TranscriptionPage() {
  const { id } = useParams<{ id: string }>()
  const [searchParams] = useSearchParams()
  const initialTab = (searchParams.get('tab') as Tab | null) ?? 'resumo'
  const [activeTab, setActiveTab] = useState<Tab>(initialTab)

  const [showShareModal, setShowShareModal] = useState(false)
  const { data, isLoading } = useTranscriptionStatus(id!)
  const transcription = data?.transcription
  const transcriptionId = transcription?.id ?? ''
  const isCompleted = transcription?.status === 'COMPLETED'

  const { data: mindmapData }    = useStudyMaterial(transcriptionId, 'mindmap')
  const { data: flashcardsData } = useStudyMaterial(transcriptionId, 'flashcards')
  const { data: quizData }       = useStudyMaterial(transcriptionId, 'quiz')

  return (
    <div className="relative min-h-screen bg-[var(--bg-base)] overflow-hidden">
      {/* Background orbs */}
      <GradientOrb
        size={600}
        color="#38ABE4"
        opacity={0.06}
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
      <main className="relative z-10 pt-14 md:pl-52">
        <div className="max-w-3xl mx-auto px-8 pt-10 pb-16">

          <Link
            to="/dashboard"
            className="inline-flex items-center gap-1.5 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors mb-7 group"
          >
            <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
            Voltar ao dashboard
          </Link>

          {isLoading ? (
            <div className="flex flex-col gap-4">
              <Skeleton className="h-7 w-52" />
              <Skeleton className="h-5 w-36" />
              <Skeleton className="h-12 w-full rounded-xl" />
              <Skeleton className="h-64 w-full rounded-xl" />
            </div>
          ) : (
            <div className="flex flex-col gap-6">

              {/* Header */}
              <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <h1
                    className="text-xl font-semibold leading-snug gradient-text"
                  >
                    {transcription?.title ?? data?.audio.fileName ?? 'Gravação'}
                  </h1>
                  {transcription?.title && (
                    <p className="text-sm text-[var(--text-secondary)] truncate mt-1">
                      {data?.audio.fileName}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {isCompleted && (
                    <>
                      <Link
                        to={`/transcription/${id}/chat`}
                        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--accent)] hover:bg-[var(--accent-bg)] border border-[var(--border)] hover:border-[var(--accent)]/30 transition-colors"
                      >
                        <MessageSquare size={12} />
                        Chat
                      </Link>
                      <ExportButton
                        title={transcription?.title ?? data?.audio.fileName ?? 'Gravação'}
                        transcriptionText={transcription?.transcriptionText ?? null}
                        summaryText={transcription?.summaryText ?? null}
                        flashcards={
                          flashcardsData?.status === 'COMPLETED' && flashcardsData.content
                            ? (flashcardsData.content as FlashcardItem[])
                            : null
                        }
                        createdAt={new Date().toISOString()}
                      />
                      <button
                        onClick={() => setShowShareModal(true)}
                        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--accent)] hover:bg-[var(--accent-bg)] border border-[var(--border)] hover:border-[var(--accent)]/30 transition-colors"
                      >
                        <Share2 size={12} />
                        Compartilhar
                      </button>
                    </>
                  )}
                  {data?.audio.status && <Badge status={data.audio.status} />}
                </div>
              </div>

              {/* Processing / Error */}
              {transcription?.status === 'PENDING' || transcription?.status === 'PROCESSING' ? (
                <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] shadow-[var(--shadow-card)]">
                  <ProcessingState message="Processando transcrição..." />
                </div>
              ) : transcription?.status === 'FAILED' ? (
                <div className="flex items-center gap-4 p-5 rounded-xl border border-[var(--danger)]/25 bg-[var(--danger-bg)]">
                  <AlertCircle size={18} className="text-[var(--danger)] shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-[var(--danger)]">Falha no processamento</p>
                    <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                      {transcription.errorMessage ?? 'Erro desconhecido.'}
                    </p>
                  </div>
                </div>
              ) : isCompleted ? (
                <>
                  {/* Pill tabs */}
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
                                ? {
                                    background: 'var(--gradient-primary)',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                    backgroundClip: 'text',
                                  }
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

                  {/* Tab content */}
                  <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] shadow-[var(--shadow-card)] overflow-hidden">
                    {activeTab === 'resumo' && (
                      <div className="p-6">
                        {/* Gradient left border accent */}
                        <div className="flex gap-4">
                          <div
                            className="w-0.5 rounded-full shrink-0 self-stretch"
                            style={{ background: 'var(--gradient-primary)' }}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-5">
                              <div className="flex items-center gap-2">
                                <Sparkles size={15} className="text-[var(--accent)]" />
                                <h2 className="text-sm font-semibold text-[var(--text-primary)]">
                                  Resumo
                                </h2>
                              </div>
                              <div className="flex items-center gap-2">
                                {transcription?.summaryText && (
                                  <CopyButton text={transcription.summaryText} />
                                )}
                                <SaveToFolderButton transcriptionId={transcriptionId} itemType="SUMMARY" />
                              </div>
                            </div>
                            {transcription?.summaryText
                              ? <MarkdownRenderer content={transcription.summaryText} />
                              : <p className="text-sm text-[var(--text-tertiary)]">Nenhum resumo disponível.</p>
                            }
                          </div>
                        </div>
                      </div>
                    )}

                    {activeTab === 'transcricao' && (
                      <div className="p-6">
                        <div className="flex items-center justify-between mb-5">
                          <div className="flex items-center gap-2">
                            <FileText size={15} className="text-[var(--text-secondary)]" />
                            <h2 className="text-sm font-semibold text-[var(--text-primary)]">
                              Transcrição completa
                            </h2>
                          </div>
                          <div className="flex items-center gap-2">
                            {transcription?.transcriptionText && (
                              <CopyButton text={transcription.transcriptionText} />
                            )}
                            <SaveToFolderButton transcriptionId={transcriptionId} itemType="TRANSCRIPTION" />
                          </div>
                        </div>
                        <TranscriptionViewer
                          audioId={id!}
                          segments={transcription?.segments ?? null}
                          plainText={transcription?.transcriptionText ?? null}
                        />
                      </div>
                    )}

                    {activeTab === 'mindmap' && (
                      <div className="p-6">
                        <div className="flex items-center justify-between mb-5">
                          <div className="flex items-center gap-2">
                            <Map size={15} className="text-[var(--text-secondary)]" />
                            <h2 className="text-sm font-semibold text-[var(--text-primary)]">
                              Mapa Mental
                            </h2>
                          </div>
                          <SaveToFolderButton transcriptionId={transcriptionId} itemType="MINDMAP" />
                        </div>
                        {/* Glow around mind map container */}
                        <div
                          className="rounded-xl overflow-hidden"
                          style={
                            mindmapData?.status === 'COMPLETED'
                              ? {
                                  boxShadow: '0 0 24px rgba(34,211,238,0.08), 0 0 1px rgba(34,211,238,0.2)',
                                  border: '1px solid rgba(34,211,238,0.12)',
                                }
                              : undefined
                          }
                        >
                          {!mindmapData || mindmapData.status === 'PENDING' || mindmapData.status === 'PROCESSING' || mindmapData.status === 'FAILED' ? (
                            <ProcessingState message="Gerando mapa mental..." />
                          ) : mindmapData.content ? (
                            <MindMapViewer markdown={(mindmapData.content as MindmapContent).markdown} />
                          ) : null}
                        </div>
                      </div>
                    )}

                    {activeTab === 'flashcards' && (
                      <div className="p-6">
                        <div className="flex items-center justify-between mb-6">
                          <div className="flex items-center gap-2">
                            <BookOpen size={15} className="text-[var(--text-secondary)]" />
                            <h2 className="text-sm font-semibold text-[var(--text-primary)]">
                              Flashcards
                            </h2>
                          </div>
                          <SaveToFolderButton transcriptionId={transcriptionId} itemType="FLASHCARDS" />
                        </div>
                        {!flashcardsData || flashcardsData.status === 'PENDING' || flashcardsData.status === 'PROCESSING' || flashcardsData.status === 'FAILED' ? (
                          <ProcessingState message="Gerando flashcards..." />
                        ) : flashcardsData.content ? (
                          <FlashcardDeck cards={flashcardsData.content as FlashcardItem[]} />
                        ) : null}
                      </div>
                    )}

                    {activeTab === 'quiz' && (
                      <div className="p-6">
                        <div className="flex items-center justify-between mb-6">
                          <div className="flex items-center gap-2">
                            <CircleHelp size={15} className="text-[var(--text-secondary)]" />
                            <h2 className="text-sm font-semibold text-[var(--text-primary)]">
                              Quiz
                            </h2>
                          </div>
                          <SaveToFolderButton transcriptionId={transcriptionId} itemType="QUIZ" />
                        </div>
                        {!quizData || quizData.status === 'PENDING' || quizData.status === 'PROCESSING' ? (
                          <ProcessingState message="Gerando quiz..." />
                        ) : quizData.status === 'FAILED' ? (
                          <ProcessingState message="Falha ao gerar quiz." />
                        ) : quizData.content ? (
                          <QuizPlayer questions={quizData.content as QuizItem[]} />
                        ) : null}
                      </div>
                    )}
                  </div>
                </>
              ) : null}
            </div>
          )}
        </div>
      </main>

      {showShareModal && id && (
        <ShareModal
          resourceType="transcription"
          resourceId={id}
          title={transcription?.title ?? data?.audio.fileName ?? 'Gravação'}
          onClose={() => setShowShareModal(false)}
        />
      )}
    </div>
  )
}
