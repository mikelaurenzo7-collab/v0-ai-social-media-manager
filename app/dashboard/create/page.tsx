import { CreateContent } from '@/components/create/create-content'
import { Suspense } from 'react'

export default function CreatePage() {
  return (
    <Suspense fallback={<CreateSkeleton />}>
      <CreateContent />
    </Suspense>
  )
}

function CreateSkeleton() {
  return (
    <div className="flex h-screen items-center justify-center">
      <div className="flex flex-col items-center gap-4 text-center">
        <div
          className="flex h-14 w-14 items-center justify-center rounded-2xl shadow-lg animate-pulse"
          style={{ background: 'var(--brand-gradient)' }}
        >
          <svg className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
          </svg>
        </div>
        <div className="space-y-1">
          <p className="text-sm font-semibold text-foreground">Loading your studio…</p>
          <p className="text-xs text-muted-foreground">Setting up the AI workspace</p>
        </div>
        <div className="flex gap-1.5">
          {[0, 150, 300].map((delay) => (
            <span
              key={delay}
              className="h-1.5 w-1.5 rounded-full animate-bounce"
              style={{ background: '#EA580C', animationDelay: `${delay}ms` }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
