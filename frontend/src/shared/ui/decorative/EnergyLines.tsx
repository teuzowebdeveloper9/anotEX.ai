interface EnergyLinesProps {
  className?: string
  color1?: string
  color2?: string
}

export function EnergyLines({
  className,
  color1 = '#7C3AED',
  color2 = '#22D3EE',
}: EnergyLinesProps) {
  return (
    <svg
      className={`pointer-events-none absolute inset-0 w-full h-full ${className ?? ''}`}
      viewBox="0 0 1200 600"
      preserveAspectRatio="xMidYMid slice"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="line1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={color1} stopOpacity="0" />
          <stop offset="50%" stopColor={color1} stopOpacity="0.6" />
          <stop offset="100%" stopColor={color2} stopOpacity="0" />
        </linearGradient>
        <linearGradient id="line2" x1="100%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={color2} stopOpacity="0" />
          <stop offset="50%" stopColor={color2} stopOpacity="0.5" />
          <stop offset="100%" stopColor={color1} stopOpacity="0" />
        </linearGradient>
        <linearGradient id="line3" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={color1} stopOpacity="0" />
          <stop offset="40%" stopColor="#EC4899" stopOpacity="0.4" />
          <stop offset="100%" stopColor={color2} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path
        d="M-100,300 C200,100 400,500 700,200 C900,0 1100,400 1400,250"
        stroke="url(#line1)"
        strokeWidth="1.5"
      />
      <path
        d="M-100,400 C150,200 350,600 650,300 C850,100 1050,500 1400,350"
        stroke="url(#line2)"
        strokeWidth="1"
      />
      <path
        d="M0,500 C300,300 500,600 800,250 C1000,50 1200,400 1400,150"
        stroke="url(#line3)"
        strokeWidth="0.8"
      />
      <path
        d="M-50,150 C250,50 450,400 750,150 C950,-50 1150,350 1400,100"
        stroke="url(#line1)"
        strokeWidth="0.6"
        opacity="0.5"
      />
      <circle cx="200" cy="180" r="2" fill={color1} opacity="0.4" />
      <circle cx="450" cy="320" r="1.5" fill={color2} opacity="0.5" />
      <circle cx="750" cy="150" r="2.5" fill="#EC4899" opacity="0.3" />
      <circle cx="1000" cy="400" r="2" fill={color2} opacity="0.4" />
      <circle cx="1150" cy="200" r="1.5" fill={color1} opacity="0.5" />
    </svg>
  )
}
