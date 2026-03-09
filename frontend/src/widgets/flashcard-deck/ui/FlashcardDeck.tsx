import { useState, useEffect, useCallback, useRef } from 'react'
import { ChevronLeft, ChevronRight, RotateCcw, Keyboard } from 'lucide-react'
import type { FlashcardItem } from '@/shared/types/api.types'
import { cn } from '@/shared/lib/cn'

interface FlashcardDeckProps {
  cards: FlashcardItem[]
}

const difficultyConfig: Record<FlashcardItem['difficulty'], { label: string; className: string }> = {
  easy:   { label: 'Fácil',  className: 'text-[var(--success)] border-[var(--success)]/25 bg-[var(--success-bg)]' },
  medium: { label: 'Médio',  className: 'text-[var(--warning)] border-[var(--warning)]/25 bg-[var(--warning-bg)]' },
  hard:   { label: 'Difícil', className: 'text-[var(--danger)]  border-[var(--danger)]/25  bg-[var(--danger-bg)]'  },
}

export function FlashcardDeck({ cards }: FlashcardDeckProps) {
  const [index, setIndex] = useState(0)
  const [showBack, setShowBack] = useState(false)
  const [animClass, setAnimClass] = useState('')
  const animating = useRef(false)

  const current = cards[index]

  // Flip: contrai → troca lado → expande (sem backface-visibility)
  const doFlip = useCallback(() => {
    if (animating.current) return
    animating.current = true
    setAnimClass('card-shrink')
    setTimeout(() => {
      setShowBack((prev) => !prev)
      setAnimClass('card-expand')
      setTimeout(() => {
        setAnimClass('')
        animating.current = false
      }, 180)
    }, 180)
  }, [])

  const navigate = useCallback((newIndex: number) => {
    if (animating.current) return
    animating.current = true
    setAnimClass('card-shrink')
    setTimeout(() => {
      setShowBack(false)
      setIndex(newIndex)
      setAnimClass('card-expand')
      setTimeout(() => {
        setAnimClass('')
        animating.current = false
      }, 180)
    }, 180)
  }, [])

  const prev  = useCallback(() => { if (index > 0) navigate(index - 1) }, [index, navigate])
  const next  = useCallback(() => { if (index < cards.length - 1) navigate(index + 1) }, [index, cards.length, navigate])
  const reset = useCallback(() => navigate(0), [navigate])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft')  { e.preventDefault(); prev() }
      if (e.key === 'ArrowRight') { e.preventDefault(); next() }
      if (e.key === ' ')          { e.preventDefault(); doFlip() }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [prev, next, doFlip])

  if (!current) return null

  const diff = difficultyConfig[current.difficulty]
  const progress = ((index + 1) / cards.length) * 100

  return (
    <div className="flex flex-col items-center gap-5">

      {/* Progress bar + counter */}
      <div className="w-full flex items-center gap-3">
        <div className="flex-1 h-1.5 bg-[var(--bg-elevated)] rounded-full overflow-hidden">
          <div
            className="h-full bg-[var(--accent)] rounded-full transition-all duration-400 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="text-xs font-medium text-[var(--text-secondary)] tabular-nums shrink-0">
          {index + 1} / {cards.length}
        </span>
      </div>

      {/* Dot indicators */}
      {cards.length <= 12 && (
        <div className="flex gap-1.5">
          {cards.map((_, i) => (
            <button
              key={i}
              onClick={() => navigate(i)}
              className={cn(
                'h-1.5 rounded-full transition-all duration-200',
                i === index
                  ? 'w-5 bg-[var(--accent)]'
                  : 'w-1.5 bg-[var(--bg-elevated)] hover:bg-[var(--border-hover)]'
              )}
            />
          ))}
        </div>
      )}

      {/* Card — único elemento, conteúdo troca durante animação */}
      <div
        className={cn(
          'w-full cursor-pointer rounded-xl border flex flex-col justify-between p-7',
          animClass,
          showBack
            ? 'border-[var(--accent)]/25 bg-[var(--accent-bg)]'
            : 'border-[var(--border)] bg-[var(--bg-elevated)]'
        )}
        style={{ minHeight: '240px' }}
        onClick={doFlip}
      >
        {showBack ? (
          <>
            <div className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
              <span className="text-xs font-semibold text-[var(--accent)] uppercase tracking-wider">
                Resposta
              </span>
            </div>
            <p className="text-sm text-[var(--text-primary)] leading-relaxed text-center px-4">
              {current.back}
            </p>
            <p className="text-xs text-[var(--text-tertiary)] text-center">
              Clique para virar
            </p>
          </>
        ) : (
          <>
            <div className="flex items-start justify-between gap-3">
              <span className="text-xs text-[var(--text-tertiary)] font-medium">{current.topic}</span>
              <span className={cn(
                'text-[10px] font-semibold uppercase tracking-wider border rounded-md px-2 py-0.5 shrink-0',
                diff.className
              )}>
                {diff.label}
              </span>
            </div>
            <p className="text-base font-medium text-[var(--text-primary)] leading-relaxed text-center px-4">
              {current.front}
            </p>
            <p className="text-xs text-[var(--text-tertiary)] text-center flex items-center justify-center gap-1">
              <span>Clique ou pressione</span>
              <kbd className="px-1.5 py-0.5 rounded border border-[var(--border)] bg-[var(--bg-surface)] text-[10px] font-mono">espaço</kbd>
              <span>para revelar</span>
            </p>
          </>
        )}
      </div>

      {/* Navigation */}
      <div className="flex items-center gap-2">
        <button
          onClick={prev}
          disabled={index === 0}
          aria-label="Card anterior"
          className="h-9 w-9 rounded-lg border border-[var(--border)] flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--accent)]/40 hover:bg-[var(--accent-bg)] transition-all duration-150 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ChevronLeft size={16} />
        </button>

        <button
          onClick={reset}
          className="h-9 px-3.5 rounded-lg border border-[var(--border)] flex items-center gap-1.5 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-hover)] hover:bg-[var(--bg-elevated)] transition-all duration-150"
        >
          <RotateCcw size={12} />
          Reiniciar
        </button>

        <button
          onClick={next}
          disabled={index === cards.length - 1}
          aria-label="Próximo card"
          className="h-9 w-9 rounded-lg border border-[var(--border)] flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--accent)]/40 hover:bg-[var(--accent-bg)] transition-all duration-150 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Keyboard hint */}
      <p className="flex items-center gap-1.5 text-xs text-[var(--text-tertiary)]">
        <Keyboard size={11} />
        ← → navegar · espaço virar
      </p>
    </div>
  )
}
