import { useState } from 'react'
import { ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react'
import type { FlashcardItem } from '@/shared/types/api.types'

interface FlashcardDeckProps {
  cards: FlashcardItem[]
}

const difficultyColor: Record<FlashcardItem['difficulty'], string> = {
  easy: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10',
  medium: 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10',
  hard: 'text-red-400 border-red-500/30 bg-red-500/10',
}

const difficultyLabel: Record<FlashcardItem['difficulty'], string> = {
  easy: 'Fácil',
  medium: 'Médio',
  hard: 'Difícil',
}

export function FlashcardDeck({ cards }: FlashcardDeckProps) {
  const [index, setIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)

  const current = cards[index]

  const prev = () => {
    setFlipped(false)
    setIndex((i) => Math.max(i - 1, 0))
  }

  const next = () => {
    setFlipped(false)
    setIndex((i) => Math.min(i + 1, cards.length - 1))
  }

  const reset = () => {
    setFlipped(false)
    setIndex(0)
  }

  if (!current) return null

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Progresso */}
      <div className="w-full flex items-center gap-3">
        <div className="flex-1 h-1 bg-[var(--bg-elevated)] rounded-full overflow-hidden">
          <div
            className="h-full bg-[var(--accent)] rounded-full transition-all duration-300"
            style={{ width: `${((index + 1) / cards.length) * 100}%` }}
          />
        </div>
        <span className="text-xs text-[var(--text-secondary)] tabular-nums shrink-0">
          {index + 1} / {cards.length}
        </span>
      </div>

      {/* Card com efeito flip */}
      <div
        className="w-full cursor-pointer"
        style={{ perspective: '1000px' }}
        onClick={() => setFlipped((f) => !f)}
      >
        <div
          className="relative w-full transition-transform duration-500"
          style={{
            transformStyle: 'preserve-3d',
            transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
            minHeight: '220px',
          }}
        >
          {/* Frente */}
          <div
            className="absolute inset-0 flex flex-col justify-between p-6 rounded-xl border border-[var(--border)] bg-[var(--bg-surface)]"
            style={{ backfaceVisibility: 'hidden' }}
          >
            <div className="flex items-start justify-between gap-3">
              <span className="text-xs text-[var(--text-secondary)]">{current.topic}</span>
              <span
                className={`text-[10px] font-semibold uppercase tracking-wider border rounded px-2 py-0.5 shrink-0 ${difficultyColor[current.difficulty]}`}
              >
                {difficultyLabel[current.difficulty]}
              </span>
            </div>
            <p className="text-base font-medium text-[var(--text-primary)] leading-relaxed text-center px-2">
              {current.front}
            </p>
            <p className="text-xs text-[var(--text-secondary)] text-center">
              Clique para revelar
            </p>
          </div>

          {/* Verso */}
          <div
            className="absolute inset-0 flex flex-col justify-between p-6 rounded-xl border border-[var(--accent)]/30 bg-[var(--bg-elevated)]"
            style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
          >
            <span className="text-xs text-[var(--accent)] font-semibold uppercase tracking-wider">
              Resposta
            </span>
            <p className="text-sm text-[var(--text-primary)] leading-relaxed text-center px-2">
              {current.back}
            </p>
            <p className="text-xs text-[var(--text-secondary)] text-center">
              Clique para virar
            </p>
          </div>
        </div>
      </div>

      {/* Navegação */}
      <div className="flex items-center gap-3">
        <button
          onClick={prev}
          disabled={index === 0}
          className="h-9 w-9 rounded-lg border border-[var(--border)] flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--accent)]/40 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ChevronLeft size={16} />
        </button>

        <button
          onClick={reset}
          className="h-9 px-4 rounded-lg border border-[var(--border)] flex items-center gap-1.5 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--accent)]/40 transition-colors"
        >
          <RotateCcw size={12} />
          Reiniciar
        </button>

        <button
          onClick={next}
          disabled={index === cards.length - 1}
          className="h-9 w-9 rounded-lg border border-[var(--border)] flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--accent)]/40 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  )
}
