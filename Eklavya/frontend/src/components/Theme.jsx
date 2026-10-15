export const PALETTE = ['#FF6B6B', '#F7B32B', '#2EC4B6', '#7B61FF', '#F075AA', '#4EA8DE']

export function BrushStroke({ className = '' }) {
  return (
    <svg viewBox="0 0 200 18" className={className} fill="none" aria-hidden="true">
      <path
        d="M3 12.5C35 6 70 3.5 100 4.5s62 3.5 97 6.5c-2 3-8 4.5-16 4.5-28-.5-52-2.5-81-3S25 12 12 14.5C8 15.3 4.8 14.6 3 12.5Z"
        fill="currentColor"
      />
    </svg>
  )
}

export function WaveDivider({ from, to, flip = false }) {
  return (
    <div className={`relative leading-none ${flip ? 'rotate-180' : ''}`} aria-hidden="true">
      <svg viewBox="0 0 1440 90" className="w-full h-14 md:h-20 block" preserveAspectRatio="none">
        <path d="M0,60 C240,10 480,90 720,55 C960,20 1200,70 1440,35 L1440,90 L0,90 Z" fill={to} />
        <path
          d="M0,60 C240,10 480,90 720,55 C960,20 1200,70 1440,35"
          stroke={from}
          strokeWidth="6"
          fill="none"
          strokeLinecap="round"
        />
      </svg>
    </div>
  )
}

export function Blob({ color, className }) {
  return (
    <div
      className={`absolute rounded-full blur-3xl opacity-30 pointer-events-none ${className}`}
      style={{ backgroundColor: color }}
      aria-hidden="true"
    />
  )
}

export function TapeStrip({ className = '' }) {
  return (
    <div className={`h-2 flex ${className}`} aria-hidden="true">
      {PALETTE.map((c) => (
        <span key={c} className="flex-1" style={{ backgroundColor: c }} />
      ))}
    </div>
  )
}

/** Warm-paper page header with handwritten eyebrow + display title + brush underline */
export function PageHeader({ eyebrow, eyebrowColor = 'text-paint-coral', title, subtitle, children }) {
  return (
    <section className="relative overflow-hidden bg-paper pt-12 pb-10 md:pt-16 md:pb-12">
      <Blob color="#FF6B6B" className="top-[-7rem] right-[-5rem] w-[22rem] h-[22rem]" />
      <Blob color="#7B61FF" className="bottom-[-9rem] left-[-6rem] w-[24rem] h-[24rem]" />
      <div className="container mx-auto px-4 relative z-10 text-center max-w-3xl mx-auto">
        {eyebrow && (
          <p className={`font-hand text-2xl md:text-3xl ${eyebrowColor} mb-1 -rotate-1`}>{eyebrow}</p>
        )}
        <h1 className="font-display text-4xl md:text-6xl font-black text-ink">{title}</h1>
        <BrushStroke className="w-28 h-4 text-paint-teal mx-auto mt-3" />
        {subtitle && <p className="mt-5 text-ink/70 text-lg max-w-2xl mx-auto">{subtitle}</p>}
        {children}
      </div>
      <TapeStrip className="absolute bottom-0 left-0 right-0" />
    </section>
  )
}

/** Centered section heading with eyebrow + brush underline */
export function SectionHeading({ eyebrow, eyebrowColor = 'text-paint-violet', title, className = '' }) {
  return (
    <div className={`text-center max-w-2xl mx-auto mb-12 ${className}`}>
      {eyebrow && <p className={`font-hand text-2xl ${eyebrowColor}`}>{eyebrow}</p>}
      <h2 className="font-display text-3xl md:text-4xl font-bold text-ink mt-1">{title}</h2>
      <BrushStroke className="w-28 h-4 text-paint-marigold mx-auto mt-4" />
    </div>
  )
}

/** Primary action button — dark pill that turns coral on hover */
export function PrimaryButton({ as = 'a', className = '', children, ...props }) {
  const Tag = as
  return (
    <Tag
      className={`px-7 py-3.5 bg-ink text-paper rounded-full font-bold tracking-wide hover:bg-paint-coral transition-all duration-300 shadow-lg hover:shadow-paint-coral/40 hover:-translate-y-0.5 ${className}`}
      {...props}
    >
      {children}
    </Tag>
  )
}

/** Secondary action button — white pill with soft border */
export function GhostButton({ as = 'a', className = '', children, ...props }) {
  const Tag = as
  return (
    <Tag
      className={`px-7 py-3.5 bg-white text-ink rounded-full font-bold tracking-wide border-2 border-ink/10 hover:border-ink transition-all duration-300 hover:-translate-y-0.5 shadow-sm ${className}`}
      {...props}
    >
      {children}
    </Tag>
  )
}

export const inputClass =
  'w-full border border-ink/10 rounded-xl px-4 py-2.5 bg-white focus:ring-2 focus:ring-paint-teal focus:border-transparent outline-none transition'
export const labelClass = 'block text-sm font-bold text-ink/80 mb-1.5'
export const cardClass = 'bg-white rounded-[2rem] shadow-sm border border-ink/5'