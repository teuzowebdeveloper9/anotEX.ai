import type { HTMLAttributes } from 'react'
import { cn } from '@/shared/lib/cn'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hover?: boolean
  glass?: boolean
}

export function Card({ className, children, hover, glass = true, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-[var(--border)] transition-all duration-200',
        glass
          ? 'bg-white/80 backdrop-blur-sm shadow-[var(--shadow-card)]'
          : 'bg-[var(--bg-surface)] shadow-[var(--shadow-card)]',
        hover && [
          'cursor-pointer',
          'hover:-translate-y-0.5',
          'hover:border-[var(--border-hover)]',
          'hover:shadow-[var(--shadow-elevated)]',
          'hover:bg-white/92',
        ],
        className
      )}
      style={{
        boxShadow: 'var(--shadow-card)',
      }}
      {...props}
    >
      {children}
    </div>
  )
}
