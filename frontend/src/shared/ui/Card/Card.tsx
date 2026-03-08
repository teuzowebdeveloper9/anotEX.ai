import type { HTMLAttributes } from 'react'
import { cn } from '@/shared/lib/cn'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hover?: boolean
}

export function Card({ className, children, hover, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-xl border border-[var(--border)] bg-[var(--bg-surface)]',
        'shadow-[var(--shadow-card)]',
        'transition-all duration-200',
        hover && 'hover:-translate-y-0.5 hover:border-[var(--border-hover)] hover:shadow-[var(--shadow-elevated)] cursor-pointer',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
