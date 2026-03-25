import { forwardRef } from 'react'
import { cn } from '@/shared/lib/cn'
import type { InputHTMLAttributes } from 'react'

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        'h-11 w-full rounded-xl px-4 py-2.5',
        'border border-[rgba(56,171,228,0.22)] bg-[rgba(255,255,255,0.72)] shadow-[0_2px_8px_rgba(56,171,228,0.08)]',
        'text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] text-sm',
        'transition-all duration-200',
        'focus:outline-none focus:border-[var(--accent)] focus:bg-white/90 focus:shadow-[0_0_0_3px_var(--accent-glow)]',
        'hover:border-[var(--border-hover)]',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        className
      )}
      {...props}
    />
  )
)

Input.displayName = 'Input'
