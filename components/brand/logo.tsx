import { cn } from '@/lib/utils'

interface LogoProps {
  className?: string
  size?: number
  /** When true, the wordmark is rendered next to the icon */
  wordmark?: boolean
  wordmarkClassName?: string
}

export function Logo({ className, size = 28, wordmark = false, wordmarkClassName }: LogoProps) {
  return (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <span
        className="bg-brand-warm relative inline-flex items-center justify-center rounded-xl shadow-brand"
        style={{ width: size, height: size }}
      >
        {/* Soft top-left highlight — gives the icon dimension on light + dark */}
        <span
          aria-hidden
          className="absolute inset-px rounded-[10px]"
          style={{
            background:
              'radial-gradient(ellipse at 28% 18%, rgba(255,255,255,0.5) 0%, transparent 60%)',
          }}
        />
        {/* Faint trailing trail dot — the "post in flight" detail */}
        <span
          aria-hidden
          className="absolute rounded-full bg-white/55"
          style={{
            width: Math.max(2, size * 0.06),
            height: Math.max(2, size * 0.06),
            bottom: size * 0.18,
            left: size * 0.18,
          }}
        />
        {/* Paper plane glyph */}
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2.4}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="relative text-white"
          style={{ width: size * 0.58, height: size * 0.58 }}
          aria-hidden="true"
        >
          <path d="M22 2 11 13" />
          <path d="m22 2-7 20-4-9-9-4 20-7Z" />
        </svg>
      </span>
      {wordmark && (
        <span
          className={cn(
            'font-display text-[1.55em] leading-none tracking-tight text-foreground',
            wordmarkClassName,
          )}
        >
          Post<span className="italic font-normal">pilot</span>
        </span>
      )}
    </span>
  )
}
