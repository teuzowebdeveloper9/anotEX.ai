import type { CSSProperties } from 'react'

interface GradientOrbProps {
  size?: number
  color?: string
  opacity?: number
  className?: string
  style?: CSSProperties
}

export function GradientOrb({
  size = 400,
  color = '#38ABE4',
  opacity = 0.18,
  className,
  style,
}: GradientOrbProps) {
  return (
    <div
      className={`pointer-events-none absolute rounded-full ${className ?? ''}`}
      style={{
        width: size,
        height: size,
        background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
        opacity,
        filter: 'blur(60px)',
        ...style,
      }}
    />
  )
}
