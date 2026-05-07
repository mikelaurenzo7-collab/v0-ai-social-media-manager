'use client'

interface HeaderProps {
  title: string
  description?: string
  action?: React.ReactNode
}

export function Header({ title, description, action }: HeaderProps) {
  return (
    <header className="relative flex flex-col gap-3 border-b border-border/60 px-6 py-5 sm:flex-row sm:items-center sm:justify-between overflow-hidden">
      {/* Left gradient accent bar */}
      <div
        className="absolute left-0 top-0 bottom-0 w-[3px]"
        style={{ background: 'linear-gradient(180deg, #EA580C 0%, #DB2777 100%)' }}
      />

      {/* Warm ambient glow behind title */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: 'linear-gradient(90deg, oklch(0.652 0.214 36 / 0.05) 0%, transparent 55%)' }}
      />

      <div className="relative">
        <h1 className="text-2xl font-black tracking-tight text-foreground leading-none">
          {title}
        </h1>
        {description && (
          <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">{description}</p>
        )}
      </div>

      {action && <div className="relative shrink-0">{action}</div>}
    </header>
  )
}
