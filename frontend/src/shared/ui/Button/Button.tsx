import { forwardRef } from 'react'
import { cn } from '@/shared/lib/cn'
import type { ButtonProps } from './Button.types'

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading, className, children, disabled, ...props }, ref) => {
    const base =
      'relative inline-flex items-center justify-center gap-2 overflow-hidden font-semibold transition-all duration-200 select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--surface-base)] disabled:cursor-not-allowed disabled:opacity-50'

    const variants = {
      primary:
        'rounded-full text-white active:scale-[0.98] hover:-translate-y-0.5 hover:brightness-[1.04] hover:shadow-[var(--shadow-hover)]',
      ghost:
        'rounded-2xl bg-transparent text-[var(--text-secondary)] hover:bg-[var(--surface-panel)] hover:text-[var(--text-primary)]',
      outline:
        'rounded-full border border-[var(--border-soft)] bg-[rgba(255,255,255,0.78)] text-[var(--brand-primary-strong)] backdrop-blur-sm hover:-translate-y-px hover:border-[var(--border-strong)] hover:bg-white',
      soft:
        'rounded-full bg-[var(--surface-panel)] text-[var(--brand-primary-strong)] hover:-translate-y-px hover:bg-[var(--surface-raised)] hover:shadow-[var(--shadow-card)]',
      danger:
        'rounded-full border border-[var(--danger)] bg-transparent text-[var(--danger)] hover:bg-[var(--danger)] hover:text-white',
    }

    const sizes = {
      sm: 'h-9 px-4 text-xs',
      md: 'h-11 px-5 text-sm',
      lg: 'h-12 px-6 text-sm',
    }

    const primaryStyle =
      variant === 'primary'
        ? {
            background: 'var(--gradient-brand)',
            boxShadow: 'var(--shadow-card)',
            transition: 'filter 0.2s, box-shadow 0.2s, transform 0.1s',
          }
        : undefined

    return (
      <button
        ref={ref}
        className={cn(base, variants[variant], sizes[size], className)}
        style={primaryStyle}
        disabled={disabled ?? loading}
        {...props}
      >
        {/* Gloss highlight for primary */}
        {variant === 'primary' && (
          <span
            className="pointer-events-none absolute inset-x-0 top-0 h-1/2 rounded-full"
            style={{
              background: 'linear-gradient(180deg, rgba(255,255,255,0.34) 0%, rgba(255,255,255,0.02) 100%)',
            }}
          />
        )}
        {loading ? (
          <span className="h-3.5 w-3.5 rounded-full border-2 border-current border-t-transparent animate-spin" />
        ) : null}
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'
