import { useMousePosition } from '@/shared/hooks/useMousePosition'

export function MouseLight() {
  useMousePosition()
  return (
    <div
      className="pointer-events-none fixed inset-0 z-0 transition-opacity duration-500"
      style={{
        background:
          'radial-gradient(650px circle at var(--mouse-x) var(--mouse-y), var(--accent-glow), transparent 70%)',
      }}
    />
  )
}
