import { brandLogo } from '@/shared/assets/brand-logo'
import { cn } from '@/shared/lib/cn'

interface BrandedLoaderProps {
  className?: string
  label?: string
  tone?: 'default' | 'subtle'
}

export function BrandedLoader({
  className,
  label = 'Carregando seu espaço de estudo...',
  tone = 'default',
}: BrandedLoaderProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-4 rounded-[28px] px-6 py-8 text-center',
        tone === 'default'
          ? 'border border-[var(--border-soft)] bg-[var(--surface-card)] shadow-[var(--shadow-card)]'
          : 'bg-transparent',
        className
      )}
    >
      <div className="relative flex h-20 w-20 items-center justify-center">
        <span className="absolute inset-0 rounded-full bg-[radial-gradient(circle,rgba(37,99,235,0.18)_0%,rgba(37,99,235,0)_70%)] blur-md" />
        <span className="absolute inset-[6px] rounded-full border border-[rgba(37,99,235,0.18)]" />
        <span className="absolute inset-0 animate-[pulse_2.2s_ease-in-out_infinite] rounded-full border border-[rgba(37,99,235,0.22)]" />
        <img src={brandLogo} alt="anotEX.ai" className="relative h-10 w-auto animate-[float_3.2s_ease-in-out_infinite]" />
      </div>

      <div className="space-y-1">
        <p className="text-sm font-semibold text-[var(--text-primary)]">{label}</p>
        <div className="flex items-center justify-center gap-1.5">
          <span className="h-2 w-2 animate-[pulse-dot_1.2s_ease-in-out_infinite] rounded-full bg-[var(--brand-primary)]" />
          <span className="h-2 w-2 animate-[pulse-dot_1.2s_ease-in-out_0.2s_infinite] rounded-full bg-[var(--brand-secondary)]" />
          <span className="h-2 w-2 animate-[pulse-dot_1.2s_ease-in-out_0.4s_infinite] rounded-full bg-[var(--brand-tertiary)]" />
        </div>
      </div>
    </div>
  )
}
