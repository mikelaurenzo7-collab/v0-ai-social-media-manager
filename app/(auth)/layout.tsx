import Link from 'next/link'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="flex h-16 items-center justify-between border-b px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              className="h-5 w-5 text-primary-foreground"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </div>
          <span className="text-xl font-semibold tracking-tight">PostPilot</span>
        </Link>
      </header>

      {/* Content */}
      <main className="flex flex-1 items-center justify-center p-4">
        {children}
      </main>

      {/* Footer */}
      <footer className="flex h-16 items-center justify-center text-sm text-muted-foreground">
        &copy; {new Date().getFullYear()} PostPilot. All rights reserved.
      </footer>
    </div>
  )
}
