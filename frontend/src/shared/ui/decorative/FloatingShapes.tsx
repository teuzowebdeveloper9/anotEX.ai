export function FloatingShapes({ className }: { className?: string }) {
  return (
    <div
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className ?? ''}`}
      aria-hidden="true"
    >
      <div
        className="absolute top-10 left-20 w-32 h-32 rounded-full border border-[#7C3AED]/20 opacity-40"
        style={{
          background: 'conic-gradient(from 180deg, #7C3AED22, transparent, #22D3EE22)',
        }}
      />
      <div
        className="absolute top-1/3 right-16 w-20 h-20 rounded-full border border-[#22D3EE]/25 opacity-50"
        style={{ background: 'radial-gradient(circle, #22D3EE18, transparent)' }}
      />
      <div className="absolute bottom-20 left-1/4 w-16 h-16 rotate-45 border border-[#EC4899]/20 opacity-30" />
      <div
        className="absolute top-1/2 left-1/2 w-40 h-40 rounded-full opacity-10"
        style={{
          background: 'radial-gradient(circle, #3B82F6, transparent)',
          transform: 'translate(-50%, -50%)',
        }}
      />
      <div className="absolute bottom-1/4 right-1/3 w-12 h-12 rounded-full border-2 border-[#10B981]/25 opacity-40" />
    </div>
  )
}
