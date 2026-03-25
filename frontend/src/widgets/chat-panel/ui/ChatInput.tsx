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
    <div className="rounded-full border border-[#dceaf8] bg-white px-4 py-2.5 shadow-[0_8px_22px_rgba(56,171,228,0.18)]">
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
            flex-1 resize-none bg-transparent
            text-[12px] text-[#33506b] placeholder:text-[#9cb3c8]
            px-2 py-1.5 outline-none transition-colors
            disabled:opacity-50 max-h-40
          "
        />
        <button
          onClick={handleSend}
          disabled={disabled || !value.trim()}
          className="
            flex items-center justify-center w-7 h-7 rounded-full shrink-0
            text-white
            hover:opacity-90 active:scale-95 transition-all
            disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100
          "
          style={{ background: 'linear-gradient(180deg, #7AD5F5 0%, #1E6CDC 100%)' }}
        >
          <Send size={12} />
        </button>
      </div>
    </div>
  )
}
