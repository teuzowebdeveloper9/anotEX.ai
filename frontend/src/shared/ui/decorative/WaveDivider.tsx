interface WaveDividerProps {
  className?: string
  flipped?: boolean
}

export function WaveDivider({ className, flipped = false }: WaveDividerProps) {
  return (
    <div
      className={`pointer-events-none overflow-hidden ${className ?? ''}`}
      style={{ transform: flipped ? 'scaleY(-1)' : undefined }}
    >
      <svg
        viewBox="0 0 1440 80"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
        className="w-full h-12 md:h-16"
      >
        <path
          d="M0,40 C240,80 480,0 720,40 C960,80 1200,0 1440,40 L1440,80 L0,80 Z"
          fill="var(--bg-surface)"
          opacity="0.5"
        />
        <path
          d="M0,50 C300,20 600,70 900,40 C1100,20 1300,60 1440,50 L1440,80 L0,80 Z"
          fill="var(--bg-surface)"
          opacity="0.3"
        />
      </svg>
    </div>
  )
}
