import { useMousePosition } from '@/shared/hooks/useMousePosition'

export function MouseLight() {
  useMousePosition()
  return (
    <div
      className="pointer-events-none fixed inset-0 z-0"
      style={{
        background:
          'radial-gradient(600px circle at var(--mouse-x) var(--mouse-y), rgba(99,102,241,0.08), transparent 70%)',
      }}
    />
  )
}
