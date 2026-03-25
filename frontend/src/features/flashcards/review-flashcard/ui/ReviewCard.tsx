import { motion } from 'framer-motion'
import { Button } from '@/shared/ui/Button/Button'
import { cn } from '@/shared/lib/cn'

interface ReviewCardProps {
  front: string
  back: string
  topic: string
  isFlipped: boolean
  onFlip: () => void
  onReview: (quality: 'hard' | 'medium' | 'easy') => void
  isPending: boolean
}

export function ReviewCard({
  front,
  back,
  topic,
  isFlipped,
  onFlip,
  onReview,
  isPending,
}: ReviewCardProps) {
  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-2xl mx-auto">
      <div
        className={cn(
          'w-full rounded-[28px] border p-9 min-h-[320px] flex flex-col justify-between pen-surface',
          'transition-colors duration-300',
          isFlipped
            ? 'border-[var(--accent)]/40 bg-[rgba(56,171,228,0.12)]'
            : 'cursor-pointer hover:border-[var(--border-hover)]',
        )}
        onClick={!isFlipped ? onFlip : undefined}
      >
        {!isFlipped ? (
          <>
            <span className="pen-pill w-fit">{topic}</span>
            <p className="text-xl font-semibold text-[var(--text-primary)] leading-relaxed text-center px-6 py-8">
              {front}
            </p>
            <p className="text-sm text-[var(--text-tertiary)] text-center">
              Clique para revelar a resposta
            </p>
          </>
        ) : (
          <>
            <div className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
              <span className="text-xs font-semibold text-[var(--accent)] uppercase tracking-wider">
                Resposta
              </span>
            </div>
            <p className="text-lg text-[var(--text-primary)] leading-relaxed text-center px-6 py-8">
              {back}
            </p>
            <p className="text-xs text-[var(--text-tertiary)] text-center opacity-0">—</p>
          </>
        )}
      </div>

      {/* Botões — aparecem após flip */}
      {isFlipped && (
        <motion.div
          className="flex gap-3 w-full"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          <Button
            variant="danger"
            className="flex-1"
            onClick={() => onReview('hard')}
            disabled={isPending}
          >
            Difícil
          </Button>
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => onReview('medium')}
            disabled={isPending}
          >
            Médio
          </Button>
          <Button
            variant="primary"
            className="flex-1"
            onClick={() => onReview('easy')}
            disabled={isPending}
          >
            Fácil
          </Button>
        </motion.div>
      )}
    </div>
  )
}
