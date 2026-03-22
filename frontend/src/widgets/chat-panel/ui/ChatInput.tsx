import { useState, useRef, type KeyboardEvent } from 'react'
import { Send } from 'lucide-react'

interface ChatInputProps {
  onSend: (message: string) => void
  disabled?: boolean
}

export function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [value, setValue] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleSend = () => {
    const trimmed = value.trim()
    if (!trimmed || disabled) return
    onSend(trimmed)
    setValue('')
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleInput = () => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`
  }

  return (
    <div className="px-4 py-3 border-t border-[var(--border)] bg-[var(--bg-surface)]">
      <div className="flex gap-2 items-end">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={e => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onInput={handleInput}
          placeholder="Pergunte sobre a aula..."
          rows={1}
          disabled={disabled}
          className="
            flex-1 resize-none rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)]
            text-sm text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]
            px-4 py-2.5 outline-none focus:border-[var(--accent)]/50 transition-colors
            disabled:opacity-50 max-h-40
          "
        />
        <button
          onClick={handleSend}
          disabled={disabled || !value.trim()}
          className="
            flex items-center justify-center w-9 h-9 rounded-xl shrink-0
            bg-[var(--accent)] text-white
            hover:opacity-90 active:scale-95 transition-all
            disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100
          "
        >
          <Send size={15} />
        </button>
      </div>
      <p className="text-[10px] text-[var(--text-secondary)] mt-2 pl-1">
        Enter para enviar · Shift+Enter para nova linha
      </p>
    </div>
  )
}
