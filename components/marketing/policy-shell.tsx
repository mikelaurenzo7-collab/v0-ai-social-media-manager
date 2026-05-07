import { Navbar } from '@/components/marketing/navbar'
import { Footer } from '@/components/marketing/footer'

interface PolicyShellProps {
  eyebrow: string
  title: string
  updated?: string
  description?: string
  children: React.ReactNode
}

export function PolicyShell({ eyebrow, title, updated, description, children }: PolicyShellProps) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <main className="flex-1">
        {/* Header */}
        <section className="relative overflow-hidden border-b border-border/60">
          <div
            className="pointer-events-none absolute inset-0 opacity-50"
            style={{
              background:
                'radial-gradient(circle at top right, oklch(0.652 0.214 36 / 0.08), transparent 60%)',
            }}
          />
          <div className="relative mx-auto max-w-3xl px-6 py-16 sm:py-20">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-orange-600">
              {eyebrow}
            </p>
            <h1 className="mt-3 text-4xl sm:text-5xl font-black tracking-tight">{title}</h1>
            {description && (
              <p className="mt-4 text-base text-muted-foreground leading-relaxed max-w-2xl">
                {description}
              </p>
            )}
            {updated && (
              <p className="mt-5 text-xs text-muted-foreground">
                Last updated {updated}
              </p>
            )}
          </div>
        </section>

        <article className="policy-content mx-auto max-w-3xl px-6 py-12 sm:py-16">
          {children}
        </article>
      </main>
      <Footer />
    </div>
  )
}
