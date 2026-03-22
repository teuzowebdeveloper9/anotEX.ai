import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { MessageSquare, ChevronRight, Clock } from 'lucide-react'
import { Navbar } from '@/widgets/navbar/ui/Navbar'
import { Sidebar } from '@/widgets/sidebar/ui/Sidebar'
import { GradientOrb } from '@/shared/ui/decorative/GradientOrb'
import { Skeleton } from '@/shared/ui/Skeleton/Skeleton'
import { api } from '@/shared/api/axios'
import { ENDPOINTS } from '@/shared/api/endpoints'

interface ConversationSummary {
  transcriptionId: string
  audioId: string
  transcriptionTitle: string | null
  lastMessage: string
  lastMessageRole: 'user' | 'assistant'
  lastMessageAt: string
  messageCount: number
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const min = Math.floor(diff / 60_000)
  if (min < 1) return 'agora'
  if (min < 60) return `${min}min atrás`
  const h = Math.floor(min / 60)
  if (h < 24) return `${h}h atrás`
  const d = Math.floor(h / 24)
  if (d < 30) return `${d}d atrás`
  return new Date(dateStr).toLocaleDateString('pt-BR')
}

export function ConversationsPage() {
  const { data, isLoading } = useQuery<ConversationSummary[]>({
    queryKey: ['conversations'],
    queryFn: async () => {
      const { data } = await api.get<ConversationSummary[]>(ENDPOINTS.chat.conversations)
      return data
    },
  })

  return (
    <div className="relative min-h-screen bg-[var(--bg-base)] overflow-hidden">
      <GradientOrb
        size={500}
        color="#6366f1"
        opacity={0.05}
        className="top-0 right-0 z-0"
        style={{ transform: 'translate(30%, -30%)' }}
      />

      <Navbar />
      <Sidebar />

      <main className="relative z-10 pt-14 md:pl-52">
        <div className="max-w-2xl mx-auto px-6 pt-10 pb-16">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-9 h-9 rounded-xl bg-[var(--accent-bg)] border border-[var(--accent)]/20 flex items-center justify-center">
              <MessageSquare size={16} className="text-[var(--accent)]" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-[var(--text-primary)]">Conversas</h1>
              <p className="text-xs text-[var(--text-secondary)]">
                Chats com suas aulas transcritas
              </p>
            </div>
          </div>

          {isLoading ? (
            <div className="flex flex-col gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-20 w-full rounded-xl" />
              ))}
            </div>
          ) : !data?.length ? (
            <div className="flex flex-col items-center gap-4 py-20 text-center">
              <div className="w-14 h-14 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border)] flex items-center justify-center">
                <MessageSquare size={22} className="text-[var(--text-secondary)]" />
              </div>
              <div>
                <p className="text-sm font-medium text-[var(--text-primary)]">
                  Nenhuma conversa ainda
                </p>
                <p className="text-xs text-[var(--text-secondary)] mt-1">
                  Abra uma transcrição concluída e clique em{' '}
                  <span className="text-[var(--accent)]">Chat</span> para começar
                </p>
              </div>
              <Link
                to="/dashboard"
                className="mt-2 text-xs text-[var(--accent)] hover:underline"
              >
                Ver gravações
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {data.map(conv => (
                <Link
                  key={conv.transcriptionId}
                  to={`/transcription/${conv.audioId}/chat`}
                  className="group flex items-center gap-4 p-4 rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] hover:border-[var(--accent)]/30 hover:bg-[var(--bg-elevated)] transition-all"
                >
                  <div className="w-9 h-9 rounded-lg bg-[var(--accent-bg)] border border-[var(--accent)]/20 flex items-center justify-center shrink-0">
                    <MessageSquare size={15} className="text-[var(--accent)]" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[var(--text-primary)] truncate">
                      {conv.transcriptionTitle ?? 'Aula sem título'}
                    </p>
                    <p className="text-xs text-[var(--text-secondary)] truncate mt-0.5">
                      {conv.lastMessageRole === 'user' ? 'Você: ' : 'IA: '}
                      {conv.lastMessage}
                    </p>
                  </div>

                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <div className="flex items-center gap-1 text-[10px] text-[var(--text-secondary)]">
                      <Clock size={10} />
                      {timeAgo(conv.lastMessageAt)}
                    </div>
                    <span className="text-[10px] bg-[var(--bg-elevated)] border border-[var(--border)] rounded-full px-2 py-0.5 text-[var(--text-secondary)]">
                      {conv.messageCount} msgs
                    </span>
                  </div>

                  <ChevronRight
                    size={14}
                    className="text-[var(--text-secondary)] group-hover:text-[var(--accent)] transition-colors shrink-0"
                  />
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
