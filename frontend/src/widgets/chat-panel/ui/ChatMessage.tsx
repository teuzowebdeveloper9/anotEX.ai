import { MarkdownRenderer } from '@/shared/ui/MarkdownRenderer/MarkdownRenderer'

interface ChatMessageProps {
  role: 'user' | 'assistant'
  content: string
  isStreaming?: boolean
}

export function ChatMessage({ role, content, isStreaming }: ChatMessageProps) {
  const isUser = role === 'user'

  return (
    <div className={`flex gap-2 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <div className="mt-3 h-3 w-3 shrink-0 rounded-full bg-[linear-gradient(180deg,#7AD5F5_0%,#1E6CDC_100%)] shadow-[0_0_10px_rgba(56,171,228,0.4)]" />
      )}
      <div
        className={`
          px-4 py-3 text-[12px] leading-relaxed
          ${isUser
            ? 'max-w-[28rem] rounded-[12px] rounded-tr-[4px] text-white shadow-[0_6px_14px_rgba(56,171,228,0.28)]'
            : 'max-w-[36rem] rounded-[12px] rounded-bl-[4px] border border-[#d7e7f5] bg-white text-[#24384a] shadow-[0_4px_10px_rgba(56,171,228,0.08)]'
          }
        `}
        style={isUser ? { background: 'var(--gradient-primary)' } : undefined}
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
