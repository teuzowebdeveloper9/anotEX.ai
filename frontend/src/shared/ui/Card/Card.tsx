import type { HTMLAttributes } from 'react'
import { cn } from '@/shared/lib/cn'

export function Card({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] backdrop-blur-sm',
        'shadow-[0_0_0_1px_rgba(255,255,255,0.03)]',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
