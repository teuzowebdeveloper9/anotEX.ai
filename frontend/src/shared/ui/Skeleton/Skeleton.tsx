import { cn } from '@/shared/lib/cn'
import type { HTMLAttributes } from 'react'

export function Skeleton({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'rounded-md bg-[var(--bg-elevated)] animate-pulse',
        className
      )}
      {...props}
    />
  )
}
