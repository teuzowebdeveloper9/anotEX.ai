import { useEffect, useState } from 'react'
import { useParams, Link, useSearchParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, AlertCircle, Loader2, FileText, Sparkles, Map, BookOpen, Share2, CircleHelp, MessageSquare, AudioLines, Brain } from 'lucide-react'
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
import { usePendingUpload } from '@/features/recording/upload-audio/model/pending-upload.store'
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
  const steps = [
    { title: 'Lendo o audio enviado', description: 'Validando o arquivo e preparando a base da transcricao.', icon: AudioLines },
    { title: 'Entendendo contexto e ritmo', description: 'Organizando pausas, trechos e o encadeamento da aula.', icon: Brain },
    { title: 'Estruturando o texto final', description: 'Montando uma leitura clara para abrir o conteudo completo.', icon: Sparkles },
  ] as const
  const [activeStep, setActiveStep] = useState(0)

  useEffect(() => {
    const interval = window.setInterval(() => {
      setActiveStep((current) => (current + 1) % steps.length)
    }, 1400)
    return () => window.clearInterval(interval)
  }, [steps.length])

  return (
    <div className="relative overflow-hidden rounded-[28px] border border-[rgba(56,171,228,0.16)] bg-[linear-gradient(180deg,rgba(255,255,255,0.92)_0%,rgba(244,249,255,0.94)_100%)] px-6 py-8 sm:px-8 sm:py-10">
      <div className="pointer-events-none absolute -right-16 top-0 h-44 w-44 rounded-full bg-[rgba(56,171,228,0.16)] blur-3xl" />
      <div className="pointer-events-none absolute -left-12 bottom-0 h-36 w-36 rounded-full bg-[rgba(34,211,238,0.14)] blur-3xl" />

      <div className="relative flex flex-col gap-6">
        <div className="flex flex-col gap-4 text-center sm:flex-row sm:items-start sm:text-left">
          <div className="mx-auto flex h-16 w-16 shrink-0 items-center justify-center rounded-[22px] border border-[rgba(56,171,228,0.2)] bg-[rgba(56,171,228,0.12)] sm:mx-0">
            <Loader2 size={24} className="text-[var(--accent)] animate-spin" />
          </div>
          <div className="flex-1">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[var(--accent)]">
              Processando
            </p>
            <h2 className="mt-2 text-[26px] font-bold tracking-[-0.04em] text-[var(--text-primary)]">
              Estamos transformando seu audio em material de estudo
            </h2>
            <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
              {message}
            </p>
            <p className="mt-1 text-xs text-[var(--text-tertiary)]">
              Esta pagina atualiza automaticamente e vai abrir o conteudo assim que tudo estiver pronto.
            </p>
          </div>
        </div>

        <div className="grid gap-3">
          {steps.map((step, index) => {
            const Icon = step.icon
            const isActive = index === activeStep
            const isDone = index < activeStep

            return (
              <div
                key={step.title}
                className={cn(
                  'flex items-start gap-3 rounded-2xl border px-4 py-3 transition-all duration-300',
                  isActive
                    ? 'border-[rgba(56,171,228,0.28)] bg-[rgba(56,171,228,0.12)] shadow-[0_14px_30px_rgba(56,171,228,0.12)]'
                    : isDone
                      ? 'border-[rgba(16,185,129,0.18)] bg-[rgba(16,185,129,0.08)]'
                      : 'border-[rgba(148,163,184,0.18)] bg-white/55'
                )}
              >
                <div
                  className={cn(
                    'mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl',
                    isActive
                      ? 'bg-white text-[var(--accent)]'
                      : isDone
                        ? 'bg-emerald-500 text-white'
                        : 'bg-[rgba(148,163,184,0.18)] text-[var(--text-tertiary)]'
                  )}
                >
                  <Icon size={15} className={isActive ? 'animate-pulse' : ''} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[var(--text-primary)]">{step.title}</p>
                  <p className="mt-1 text-xs leading-5 text-[var(--text-secondary)]">{step.description}</p>
                </div>
              </div>
            )
          })}
        </div>

        <div className="overflow-hidden rounded-full bg-[rgba(148,163,184,0.18)]">
          <div
            className="h-2 rounded-full transition-all duration-700"
            style={{
              width: `${((activeStep + 1) / steps.length) * 100}%`,
              background: 'var(--gradient-primary)',
            }}
          />
        </div>
      </div>
    </div>
  )
}

export function TranscriptionPage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const [searchParams] = useSearchParams()
  const pendingUploadId = searchParams.get('uploadId')
  const pendingUpload = usePendingUpload(pendingUploadId)
  const isPendingUploadRoute = id === 'pending' && !!pendingUploadId
  const initialTab = (searchParams.get('tab') as Tab | null) ?? 'resumo'
  const [activeTab, setActiveTab] = useState<Tab>(initialTab)

  const [showShareModal, setShowShareModal] = useState(false)
  const { data, isLoading } = useTranscriptionStatus(isPendingUploadRoute ? '' : (id ?? ''))
  const transcription = data?.transcription
  const transcriptionId = transcription?.id ?? ''
  const isCompleted = transcription?.status === 'COMPLETED'

  const { data: mindmapData }    = useStudyMaterial(transcriptionId, 'mindmap')
  const { data: flashcardsData } = useStudyMaterial(transcriptionId, 'flashcards')
  const { data: quizData }       = useStudyMaterial(transcriptionId, 'quiz')

  useEffect(() => {
    if (pendingUpload?.status === 'completed' && pendingUpload.audioId) {
      navigate(`/transcription/${pendingUpload.audioId}`, { replace: true })
    }
  }, [navigate, pendingUpload])

  const processingMessage = isPendingUploadRoute
    ? pendingUpload?.status === 'error'
      ? pendingUpload.errorMessage ?? 'Erro ao enviar áudio. Tente novamente.'
      : `Enviando ${pendingUpload?.fileName ?? 'seu áudio'} para analise.`
    : 'Estamos convertendo seu audio, organizando a fala e preparando a pagina final.'

  return (
    <div className="pen-shell">
      <GradientOrb
        size={600}
        color="#38ABE4"
        opacity={0.06}
        className="top-0 right-0 z-0"
        style={{ transform: 'translate(30%, -30%)' }}
      />
      <Sidebar withTopBar={false} />
      <main className="relative z-10 md:pl-56">
        <div className="pen-content max-w-5xl pt-24 md:pt-8">

          <Link
            to="/dashboard"
            className="inline-flex items-center gap-1.5 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors mb-7 group"
          >
            <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
            Voltar ao dashboard
          </Link>

          {isLoading && !isPendingUploadRoute ? (
            <div className="flex flex-col gap-4">
              <Skeleton className="h-7 w-52" />
              <Skeleton className="h-5 w-36" />
              <Skeleton className="h-12 w-full rounded-xl" />
              <Skeleton className="h-64 w-full rounded-xl" />
            </div>
          ) : (
            <div className="flex flex-col gap-6">

              {/* Header */}
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                <div className="flex-1 min-w-0">
                  <h1
                    className="text-xl font-semibold leading-snug gradient-text"
                  >
                    {transcription?.title ?? data?.audio.fileName ?? pendingUpload?.fileName ?? 'Gravação'}
                  </h1>
                  {transcription?.title && (
                    <p className="text-sm text-[var(--text-secondary)] truncate mt-1">
                      {data?.audio.fileName}
                    </p>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {isCompleted && (
                    <>
                      <Link
                        to={`/transcription/${id}/chat`}
                        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--accent)] hover:bg-[var(--accent-bg)] border border-[var(--border)] hover:border-[var(--accent)]/30 transition-colors"
                      >
                        <MessageSquare size={12} />
                        Chat
                      </Link>
                      <Link
                        to={`/pomodoro?contextType=transcription&contextId=${transcriptionId}&contextLabel=${encodeURIComponent(transcription?.title ?? data?.audio.fileName ?? 'Transcrição')}`}
                        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--accent)] hover:bg-[var(--accent-bg)] border border-[var(--border)] hover:border-[var(--accent)]/30 transition-colors"
                      >
                        <Brain size={12} />
                        Pomodoro
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
              {isPendingUploadRoute && pendingUpload?.status !== 'error' ? (
                <div className="pen-surface rounded-[24px]">
                  <ProcessingState message={processingMessage} />
                </div>
              ) : isPendingUploadRoute && pendingUpload?.status === 'error' ? (
                <div className="flex items-center gap-4 p-5 rounded-xl border border-[var(--danger)]/25 bg-[var(--danger-bg)]">
                  <AlertCircle size={18} className="text-[var(--danger)] shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-[var(--danger)]">Falha no envio</p>
                    <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                      {processingMessage}
                    </p>
                  </div>
                </div>
              ) : transcription?.status === 'PENDING' || transcription?.status === 'PROCESSING' ? (
                <div className="pen-surface rounded-[24px]">
                  <ProcessingState message={processingMessage} />
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
                  <div className="pen-surface flex flex-wrap gap-1 rounded-[20px] p-1.5">
                    {TABS.map((tab) => {
                      const Icon = tab.icon
                      const isActive = activeTab === tab.id
                      return (
                        <button
                          key={tab.id}
                          onClick={() => setActiveTab(tab.id)}
                          className={cn(
                            'flex min-w-[calc(50%-0.125rem)] items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-all duration-200 sm:flex-1 sm:min-w-0',
                            isActive
                              ? 'bg-white/85 text-[var(--text-primary)] shadow-[0_8px_18px_rgba(56,171,228,0.14)]'
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
                  <div className="pen-surface rounded-[24px] overflow-hidden">
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
