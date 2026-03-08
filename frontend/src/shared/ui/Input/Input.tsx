import { forwardRef } from 'react'
import { cn } from '@/shared/lib/cn'
import type { InputHTMLAttributes } from 'react'

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        'w-full px-4 py-2.5 rounded-lg h-10',
        'bg-[var(--bg-elevated)] border border-[var(--border)]',
        'text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] text-sm',
        'transition-all duration-200',
        'focus:outline-none focus:border-[var(--accent)] focus:shadow-[0_0_0_3px_var(--accent-glow)]',
        'hover:border-[var(--border-hover)]',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        className
      )}
      {...props}
    />
  )
)

Input.displayName = 'Input'
