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
        'rounded-[28px] border border-[var(--border-soft)] transition-all duration-200',
        glass
          ? 'bg-[var(--surface-card)] backdrop-blur-[18px] shadow-[var(--shadow-card)]'
          : 'bg-[var(--surface-panel)] shadow-[var(--shadow-card)]',
        hover && [
          'cursor-pointer',
          'hover:-translate-y-0.5',
          'hover:border-[var(--border-strong)]',
          'hover:shadow-[var(--shadow-elevated)]',
          'hover:bg-white',
        ],
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
