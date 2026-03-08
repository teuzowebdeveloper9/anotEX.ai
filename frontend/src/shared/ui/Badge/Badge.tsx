import { cn } from '@/shared/lib/cn'
import type { AudioStatus, TranscriptionStatus } from '@/shared/types/api.types'

type Status = AudioStatus | TranscriptionStatus

const statusConfig: Record<Status, { dot: string; text: string; bg: string; border: string }> = {
  PENDING: {
    dot:    'bg-[var(--warning)]',
    text:   'text-[var(--warning)]',
    bg:     'bg-[var(--warning-bg)]',
    border: 'border-[var(--warning)]/25',
  },
  PROCESSING: {
    dot:    'bg-[var(--accent-2)]',
    text:   'text-[var(--accent-2)]',
    bg:     'bg-[var(--accent-2)]/10',
    border: 'border-[var(--accent-2)]/25',
  },
  COMPLETED: {
    dot:    'bg-[var(--success)]',
    text:   'text-[var(--success)]',
    bg:     'bg-[var(--success-bg)]',
    border: 'border-[var(--success)]/25',
  },
  FAILED: {
    dot:    'bg-[var(--danger)]',
    text:   'text-[var(--danger)]',
    bg:     'bg-[var(--danger-bg)]',
    border: 'border-[var(--danger)]/25',
  },
}

const statusLabels: Record<Status, string> = {
  PENDING:    'Pendente',
  PROCESSING: 'Processando',
  COMPLETED:  'Concluído',
  FAILED:     'Falhou',
}

interface BadgeProps {
  status: Status
  className?: string
}

export function Badge({ status, className }: BadgeProps) {
  const cfg = statusConfig[status]
  const isPulsing = status === 'PENDING' || status === 'PROCESSING'

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border',
        cfg.bg, cfg.text, cfg.border,
        className
      )}
    >
      <span
        className={cn(
          'h-1.5 w-1.5 rounded-full shrink-0',
          cfg.dot,
          isPulsing && 'animate-pulse'
        )}
      />
      {statusLabels[status]}
    </span>
  )
}
