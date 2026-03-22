import { useEffect, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, MessageSquare, Trash2 } from 'lucide-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Navbar } from '@/widgets/navbar/ui/Navbar'
import { Sidebar } from '@/widgets/sidebar/ui/Sidebar'
import { GradientOrb } from '@/shared/ui/decorative/GradientOrb'
import { ChatMessage } from '@/widgets/chat-panel/ui/ChatMessage'
import { ChatInput } from '@/widgets/chat-panel/ui/ChatInput'
import { TypingIndicator } from '@/widgets/chat-panel/ui/TypingIndicator'
import { useChatStream } from '@/widgets/chat-panel/model/useChatStream'
import { useChatHistory } from '@/widgets/chat-panel/model/useChatHistory'
import { useTranscriptionStatus } from '@/features/transcription/poll-status/model/useTranscriptionStatus'
import { api } from '@/shared/api/axios'
import { ENDPOINTS } from '@/shared/api/endpoints'

export function ChatPage() {
  const { id } = useParams<{ id: string }>()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const queryClient = useQueryClient()

  const { data: statusData } = useTranscriptionStatus(id!)
  const transcriptionId = statusData?.transcription?.id ?? ''
  const { data: history } = useChatHistory(transcriptionId)
  const { messages, isStreaming, streamingContent, error, sendMessage } = useChatStream(transcriptionId)

  const clearMutation = useMutation({
    mutationFn: () => api.delete(ENDPOINTS.chat.clearHistory(transcriptionId)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat-history', transcriptionId] })
      toast.success('Histórico limpo')
    },
    onError: () => toast.error('Erro ao limpar histórico'),
  })

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, streamingContent, history])

  const title = statusData?.transcription?.title ?? statusData?.audio.fileName ?? 'Aula'
  const allMessages = [...(history ?? []), ...messages]

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

      <main className="relative z-10 pt-14 md:pl-52 flex flex-col h-screen">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-[var(--border)] bg-[var(--bg-surface)] shrink-0">
          <div className="flex items-center gap-3">
            <Link
              to={`/transcription/${id}`}
              className="flex items-center justify-center w-7 h-7 rounded-lg hover:bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
            >
              <ArrowLeft size={15} />
            </Link>
            <div className="flex items-center gap-2">
              <MessageSquare size={14} className="text-[var(--accent)]" />
              <div>
                <h1 className="text-sm font-semibold text-[var(--text-primary)] leading-tight">
                  Chat com a Aula
                </h1>
                <p className="text-[11px] text-[var(--text-secondary)] truncate max-w-[240px]">
                  {title}
                </p>
              </div>
            </div>
          </div>

          {allMessages.length > 0 && (
            <button
              onClick={() => clearMutation.mutate()}
              disabled={clearMutation.isPending}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs text-[var(--text-secondary)] hover:text-[var(--danger)] hover:bg-[var(--danger-bg)] border border-[var(--border)] transition-colors disabled:opacity-50"
            >
              <Trash2 size={11} />
              Limpar
            </button>
          )}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
          {allMessages.length === 0 && !isStreaming && (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
              <div className="w-12 h-12 rounded-2xl bg-[var(--accent-bg)] border border-[var(--accent)]/20 flex items-center justify-center">
                <MessageSquare size={20} className="text-[var(--accent)]" />
              </div>
              <div>
                <p className="text-sm font-medium text-[var(--text-primary)]">
                  Pergunte sobre a aula
                </p>
                <p className="text-xs text-[var(--text-secondary)] mt-1 max-w-xs">
                  A IA responde com base exclusivamente no conteúdo transcrito
                </p>
              </div>
            </div>
          )}

          {allMessages.map(msg => (
            <ChatMessage key={msg.id} role={msg.role} content={msg.content} />
          ))}

          {isStreaming && streamingContent && (
            <ChatMessage role="assistant" content={streamingContent} isStreaming />
          )}
          {isStreaming && !streamingContent && <TypingIndicator />}

          {error && (
            <p className="text-xs text-[var(--danger)] text-center py-2">{error}</p>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <ChatInput onSend={sendMessage} disabled={isStreaming} />
      </main>
    </div>
  )
}
