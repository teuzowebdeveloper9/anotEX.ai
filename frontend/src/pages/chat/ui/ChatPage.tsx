import { useEffect, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, MessageSquare, Trash2 } from 'lucide-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
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
    <div className="pen-shell">
      <GradientOrb size={500} color="#38ABE4" opacity={0.04} className="top-0 right-0 z-0" style={{ transform: 'translate(30%, -30%)' }} />
      <Sidebar withTopBar={false} />

      <main className="relative z-10 h-screen overflow-hidden md:pl-56">
        <div className="flex h-full min-h-0 flex-col bg-[linear-gradient(180deg,#eef8ff_0%,#e8f4ff_100%)]">
          <div className="flex h-12 items-center justify-between border-b border-[rgba(56,171,228,0.14)] bg-[rgba(255,255,255,0.74)] px-5 shrink-0 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <Link
                to={`/transcription/${id}`}
                className="flex h-7 w-7 items-center justify-center rounded-lg text-[#7b9aba] transition-colors hover:bg-[rgba(56,171,228,0.08)] hover:text-[var(--text-primary)]"
              >
                <ArrowLeft size={15} />
              </Link>
              <div className="flex items-center gap-2">
                <MessageSquare size={13} className="text-[#4c94ea]" />
                <h1 className="text-[13px] font-semibold leading-tight text-[var(--text-primary)]">
                  Chat — {title}
                </h1>
              </div>
            </div>

            {allMessages.length > 0 && (
              <button
                onClick={() => clearMutation.mutate()}
                disabled={clearMutation.isPending}
                className="flex items-center gap-1.5 rounded-full border border-[rgba(113,171,35,0.24)] bg-[rgba(113,171,35,0.10)] px-3 py-1 text-[11px] text-[#5f8c2d] transition-colors disabled:opacity-50"
              >
                <Trash2 size={11} />
                Contexto em vigor
              </button>
            )}
          </div>

          <div className="mx-auto flex w-full max-w-[920px] min-h-0 flex-1 flex-col px-10 pb-6 pt-4">
            <div className="min-h-0 flex-1 overflow-y-auto px-2 py-2">
              {allMessages.length === 0 && !isStreaming && (
                <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[rgba(56,171,228,0.16)] bg-white/55">
                    <MessageSquare size={20} className="text-[#4c94ea]" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[var(--text-primary)]">Pergunte sobre a aula</p>
                    <p className="mt-1 max-w-xs text-xs text-[var(--text-tertiary)]">
                      A IA responde com base exclusivamente no conteúdo transcrito
                    </p>
                  </div>
                </div>
              )}

              <div className="space-y-5">
                {allMessages.map(msg => (
                  <ChatMessage key={msg.id} role={msg.role} content={msg.content} />
                ))}

                {isStreaming && streamingContent && (
                  <ChatMessage role="assistant" content={streamingContent} isStreaming />
                )}
                {isStreaming && !streamingContent && <TypingIndicator />}

                {error && (
                  <p className="py-2 text-center text-xs text-[var(--danger)]">{error}</p>
                )}

                <div ref={messagesEndRef} />
              </div>
            </div>

            <div className="mt-5 px-8">
              <ChatInput onSend={sendMessage} disabled={isStreaming} />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
