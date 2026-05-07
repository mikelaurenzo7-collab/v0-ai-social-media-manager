import Link from 'next/link'
import { AuthAside } from '@/components/auth/auth-aside'
import { Logo } from '@/components/brand/logo'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="grid min-h-screen lg:grid-cols-[minmax(0,460px)_1fr]">
      <AuthAside />

      <div className="relative flex min-h-screen flex-col">
        {/* Mobile header */}
        <header className="flex h-14 items-center justify-between border-b border-border/60 px-4 sm:px-6 lg:hidden">
          <Link href="/" className="inline-flex" aria-label="PostPilot home">
            <Logo size={26} wordmark wordmarkClassName="text-lg" />
          </Link>
          <Link href="/" className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors">
            ← Back home
          </Link>
        </header>

        {/* Content */}
        <main className="relative flex flex-1 items-center justify-center p-4 py-10 sm:p-8">
          {/* Subtle warm rays for the form column */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 -z-10"
            style={{
              background:
                'radial-gradient(ellipse 70% 40% at 50% -10%, oklch(0.652 0.214 36 / 0.08) 0%, transparent 60%)',
            }}
          />
          {children}
        </main>

        <footer className="flex flex-wrap items-center justify-between gap-3 px-6 pb-6 pt-2 text-xs text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} PostPilot</p>
          <div className="flex items-center gap-4">
            <Link href="#" className="hover:text-foreground transition-colors">Privacy</Link>
            <Link href="#" className="hover:text-foreground transition-colors">Terms</Link>
            <Link href="#" className="hover:text-foreground transition-colors">Security</Link>
          </div>
        </footer>
      </div>
    </div>
  )
}
