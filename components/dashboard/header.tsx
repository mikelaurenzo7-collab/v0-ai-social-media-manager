'use client'

interface HeaderProps {
  eyebrow?: string
  title: string
  description?: string
  action?: React.ReactNode
}

export function Header({ eyebrow, title, description, action }: HeaderProps) {
  return (
    <header className="relative isolate flex flex-col gap-4 overflow-hidden border-b border-border/60 px-6 pt-7 pb-6 md:px-10 sm:flex-row sm:items-end sm:justify-between">
      {/* Warm ambient glow behind title */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-40 opacity-70"
        style={{
          background:
            'radial-gradient(ellipse 60% 100% at 0% 0%, oklch(0.652 0.214 36 / 0.08), transparent 60%), radial-gradient(ellipse 40% 100% at 100% 0%, oklch(0.588 0.238 352 / 0.06), transparent 60%)',
        }}
      />

      <div className="relative max-w-3xl">
        {eyebrow && (
          <p className="mb-2 inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.22em] text-muted-foreground">
            <span className="inline-block h-px w-6 bg-gradient-to-r from-primary to-accent" />
            {eyebrow}
          </p>
        )}
        <h1 className="font-display text-[clamp(1.75rem,2.4vw,2.25rem)] font-normal leading-[1.05] tracking-tight text-foreground text-balance">
          {title}
        </h1>
        {description && (
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground text-pretty">
            {description}
          </p>
        )}
      </div>

      {action && <div className="relative shrink-0">{action}</div>}
    </header>
  )
}
