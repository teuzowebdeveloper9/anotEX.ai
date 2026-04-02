import { forwardRef } from 'react'
import { cn } from '@/shared/lib/cn'
import type { InputHTMLAttributes } from 'react'

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        'h-12 w-full rounded-2xl px-4 py-3',
        'border border-[var(--border-soft)] bg-[var(--surface-panel)] shadow-[inset_0_1px_0_rgba(255,255,255,0.72)]',
        'text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] text-sm',
        'transition-all duration-200',
        'focus:outline-none focus:border-[var(--brand-primary)] focus:bg-white focus:shadow-[0_0_0_4px_var(--ring-soft)]',
        'hover:border-[var(--border-strong)]',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        className
      )}
      {...props}
    />
  )
)

Input.displayName = 'Input'
