import { cn } from '@/shared/lib/cn'
import type { AudioStatus, TranscriptionStatus } from '@/shared/types/api.types'

type Status = AudioStatus | TranscriptionStatus

const statusStyles: Record<Status, string> = {
  PENDING: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  PROCESSING: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  COMPLETED: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  FAILED: 'bg-red-500/10 text-red-400 border-red-500/20',
}

const statusLabels: Record<Status, string> = {
  PENDING: 'Pendente',
  PROCESSING: 'Processando',
  COMPLETED: 'Concluído',
  FAILED: 'Falhou',
}

interface BadgeProps {
  status: Status
  className?: string
}

export function Badge({ status, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border',
        statusStyles[status],
        className
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current animate-pulse" />
      {statusLabels[status]}
    </span>
  )
}
