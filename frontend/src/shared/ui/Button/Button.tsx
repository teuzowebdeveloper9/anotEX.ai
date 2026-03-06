import { forwardRef } from 'react'
import { cn } from '@/shared/lib/cn'
import type { ButtonProps } from './Button.types'

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading, className, children, disabled, ...props }, ref) => {
    const base =
      'inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-base)] disabled:opacity-50 disabled:cursor-not-allowed'

    const variants = {
      primary:
        'bg-[var(--accent)] text-white hover:brightness-110 shadow-[0_0_20px_var(--accent-glow)]',
      ghost:
        'bg-transparent border border-[var(--border)] text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] hover:border-[var(--accent)]',
      danger:
        'bg-transparent border border-[var(--danger)] text-[var(--danger)] hover:bg-[var(--danger)] hover:text-white',
    }

    const sizes = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-sm',
      lg: 'px-6 py-3 text-base',
    }

    return (
      <button
        ref={ref}
        className={cn(base, variants[variant], sizes[size], className)}
        disabled={disabled ?? loading}
        {...props}
      >
        {loading ? (
          <span className="h-4 w-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
        ) : null}
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'
