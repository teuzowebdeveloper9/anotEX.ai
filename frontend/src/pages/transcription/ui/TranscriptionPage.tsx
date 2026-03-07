import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, AlertCircle } from 'lucide-react'
import { Navbar } from '@/widgets/navbar/ui/Navbar'
import { Sidebar } from '@/widgets/sidebar/ui/Sidebar'
import { Card } from '@/shared/ui/Card/Card'
import { Badge } from '@/shared/ui/Badge/Badge'
import { Skeleton } from '@/shared/ui/Skeleton/Skeleton'
import { CopyButton } from '@/features/transcription/copy-text/ui/CopyButton'
import { useTranscriptionStatus } from '@/features/transcription/poll-status/model/useTranscriptionStatus'

export function TranscriptionPage() {
  const { id } = useParams<{ id: string }>()
  const { data, isLoading } = useTranscriptionStatus(id!)

  const transcription = data?.transcription

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
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
        ) : (
          <div className="flex flex-col gap-6">
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

            {transcription?.status === 'PENDING' || transcription?.status === 'PROCESSING' ? (
              <Card className="p-8 flex flex-col items-center gap-4 text-center">
                <span className="h-8 w-8 rounded-full border-2 border-[var(--accent)] border-t-transparent animate-spin" />
                <div>
                  <p className="text-[var(--text-primary)] font-medium">Processando...</p>
                  <p className="text-sm text-[var(--text-secondary)] mt-1">
                    A transcrição será gerada em instantes. Esta página atualiza automaticamente.
                  </p>
                </div>
              </Card>
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
            ) : (
              <>
                {transcription?.summaryText && (
                  <Card className="p-6 border-[var(--accent)]/20">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-sm font-semibold text-[var(--accent)] uppercase tracking-wider">
                        Resumo
                      </h2>
                      <CopyButton text={transcription.summaryText} />
                    </div>
                    <div className="text-sm text-[var(--text-primary)] leading-relaxed whitespace-pre-wrap">
                      {transcription.summaryText}
                    </div>
                  </Card>
                )}

                {transcription?.transcriptionText && (
                  <Card className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                        Transcrição completa
                      </h2>
                      <CopyButton text={transcription.transcriptionText} />
                    </div>
                    <div className="text-sm text-[var(--text-secondary)] leading-relaxed font-mono whitespace-pre-wrap max-h-[500px] overflow-y-auto">
                      {transcription.transcriptionText}
                    </div>
                  </Card>
                )}
              </>
            )}
          </div>
        )}
      </div>
      </main>
    </div>
  )
}
