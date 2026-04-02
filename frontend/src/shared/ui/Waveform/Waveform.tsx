import { useEffect, useRef } from 'react'
import { cn } from '@/shared/lib/cn'

interface WaveformProps {
  levels: number[]
  className?: string
  active?: boolean
}

export function Waveform({ levels, className, active = false }: WaveformProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const { width, height } = canvas
    ctx.clearRect(0, 0, width, height)

    const barWidth = width / levels.length
    const gap = 2

    levels.forEach((level, i) => {
      const barHeight = Math.max(4, level * height * 0.85)
      const x = i * barWidth + gap / 2
      const y = (height - barHeight) / 2

      const alpha = active ? 0.35 + level * 0.55 : 0.16
      ctx.fillStyle = active
        ? `rgba(37, 99, 235, ${alpha})`
        : `rgba(115, 118, 134, ${alpha})`
      ctx.beginPath()
      ctx.roundRect(x, y, barWidth - gap, barHeight, 2)
      ctx.fill()
    })
  }, [levels, active])

  return (
    <canvas
      ref={canvasRef}
      width={300}
      height={64}
      className={cn('w-full h-16', className)}
    />
  )
}
