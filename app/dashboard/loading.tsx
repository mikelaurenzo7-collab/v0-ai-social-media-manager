export default function DashboardLoading() {
  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="space-y-3">
          <div className="h-7 w-44 animate-pulse rounded-md bg-muted/60" />
          <div className="h-4 w-72 animate-pulse rounded-md bg-muted/40" />
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="rounded-3xl border border-border/70 bg-card/60 p-5 backdrop-blur"
            >
              <div className="h-3 w-20 animate-pulse rounded-md bg-muted/50" />
              <div className="mt-4 h-7 w-24 animate-pulse rounded-md bg-muted/60" />
              <div className="mt-3 h-3 w-32 animate-pulse rounded-md bg-muted/40" />
            </div>
          ))}
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <div className="rounded-3xl border border-border/70 bg-card/60 p-6 backdrop-blur lg:col-span-2">
            <div className="h-4 w-40 animate-pulse rounded-md bg-muted/50" />
            <div className="mt-6 space-y-3">
              {[0, 1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="h-9 w-9 animate-pulse rounded-full bg-muted/60" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 w-3/5 animate-pulse rounded-md bg-muted/50" />
                    <div className="h-3 w-2/5 animate-pulse rounded-md bg-muted/30" />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-3xl border border-border/70 bg-card/60 p-6 backdrop-blur">
            <div className="h-4 w-32 animate-pulse rounded-md bg-muted/50" />
            <div className="mt-6 space-y-3">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="rounded-2xl border border-border/50 bg-muted/20 p-4"
                >
                  <div className="h-3 w-2/3 animate-pulse rounded-md bg-muted/50" />
                  <div className="mt-2 h-3 w-1/2 animate-pulse rounded-md bg-muted/30" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <span className="sr-only">Loading…</span>
    </div>
  )
}
