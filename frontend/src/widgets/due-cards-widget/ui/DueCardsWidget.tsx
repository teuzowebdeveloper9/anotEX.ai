import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Brain } from 'lucide-react'
import { Button } from '@/shared/ui/Button/Button'
import { api } from '@/shared/api/axios'
import { ENDPOINTS } from '@/shared/api/endpoints'
import type { DueCardItem } from '@/shared/types/api.types'

export function DueCardsWidget() {
  const { data: dueCards = [], isLoading } = useQuery<DueCardItem[]>({
    queryKey: ['review', 'due'],
    queryFn: () => api.get(ENDPOINTS.review.due).then((r) => r.data),
    staleTime: 5 * 60 * 1000,
  })

  const count = dueCards.length

  return (
    <div className="flex items-center justify-between px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] shadow-[var(--shadow-card)]">
      <div className="flex items-center gap-3">
        <div className="h-8 w-8 rounded-lg bg-[var(--accent-bg)] flex items-center justify-center shrink-0">
          <Brain size={15} className="text-[var(--accent)]" />
        </div>
        <div>
          {isLoading ? (
            <div className="h-5 w-16 bg-[var(--bg-elevated)] rounded animate-pulse" />
          ) : (
            <p className="text-lg font-semibold leading-none text-[var(--text-primary)]">{count}</p>
          )}
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">Para revisar hoje</p>
        </div>
      </div>
      {!isLoading && count > 0 && (
        <Link to="/review">
          <Button variant="primary" size="sm">
            Revisar
          </Button>
        </Link>
      )}
    </div>
  )
}
