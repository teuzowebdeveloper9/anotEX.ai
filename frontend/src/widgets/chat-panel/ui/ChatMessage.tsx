import { MarkdownRenderer } from '@/shared/ui/MarkdownRenderer/MarkdownRenderer'

interface ChatMessageProps {
  role: 'user' | 'assistant'
  content: string
  isStreaming?: boolean
}

export function ChatMessage({ role, content, isStreaming }: ChatMessageProps) {
  const isUser = role === 'user'

  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      <div
        className={`
          max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed
          ${isUser
            ? 'bg-[var(--accent)] text-white rounded-tr-sm'
            : 'bg-[var(--bg-elevated)] text-[var(--text-primary)] rounded-tl-sm border border-[var(--border)]'
          }
        `}
      >
        {isUser ? (
          <p className="whitespace-pre-wrap">{content}</p>
        ) : (
          <MarkdownRenderer content={content} />
        )}
        {isStreaming && (
          <span className="inline-block w-0.5 h-3.5 bg-current align-middle ml-0.5 animate-pulse" />
        )}
      </div>
    </div>
  )
}
