import { forwardRef } from 'react'
import { cn } from '@/shared/lib/cn'
import type { ButtonProps } from './Button.types'

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading, className, children, disabled, ...props }, ref) => {
    const base =
      'relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-full font-semibold transition-all duration-200 select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:cursor-not-allowed disabled:opacity-50'

    const variants = {
      primary:
        'text-white active:scale-[0.985] hover:-translate-y-px hover:brightness-105 hover:shadow-[0_10px_28px_rgba(56,171,228,0.34)]',
      ghost:
        'rounded-xl bg-transparent text-[var(--text-secondary)] hover:bg-[var(--accent-bg)] hover:text-[var(--accent-5)]',
      outline:
        'rounded-full border border-[rgba(56,171,228,0.4)] bg-[rgba(255,255,255,0.6)] text-[var(--accent-5)] backdrop-blur-sm hover:-translate-y-px hover:bg-white/85',
      danger:
        'bg-transparent border border-[var(--danger)] text-[var(--danger)] hover:bg-[var(--danger)] hover:text-white rounded-full',
    }

    const sizes = {
      sm: 'px-4 py-1.5 text-xs h-8',
      md: 'px-5 py-2 text-sm h-9',
      lg: 'px-6 py-2.5 text-sm h-10',
    }

    const primaryStyle =
      variant === 'primary'
        ? {
            background: 'var(--gradient-primary)',
            boxShadow: '0 8px 24px rgba(56,171,228,0.38), 0 1px 2px rgba(255,255,255,0.5) inset',
            transition: 'brightness 0.2s, box-shadow 0.2s, transform 0.1s',
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
            className="absolute inset-x-0 top-0 h-1/2 rounded-full pointer-events-none"
            style={{
              background: 'linear-gradient(180deg, rgba(255,255,255,0.45) 0%, rgba(255,255,255,0.08) 100%)',
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
