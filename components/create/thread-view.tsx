'use client'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { Thread, ThreadTweet } from '@/lib/schemas/thread'

interface ThreadViewProps {
  thread: Partial<Thread>
  isGenerating: boolean
  onCopy: (tweets: ThreadTweet[]) => void
  onSave: (thread: Partial<Thread>) => void
  onSchedule: (thread: Partial<Thread>) => void
}

const TYPE_STYLES: Record<ThreadTweet['type'], { label: string; className: string }> = {
  hook: { label: 'Hook', className: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400' },
  content: { label: 'Content', className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
  bridge: { label: 'Bridge', className: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
  cta: { label: 'CTA', className: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
}

function TweetCard({ tweet, total }: { tweet: ThreadTweet; total: number }) {
  const typeStyle = TYPE_STYLES[tweet.type]
  const isOver = tweet.content.length > 280

  return (
    <div className="flex gap-3">
      {/* Thread line */}
      <div className="flex flex-col items-center">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-black text-xs font-bold text-white dark:bg-white dark:text-black">
          {tweet.number}
        </div>
        {tweet.number < total && (
          <div className="mt-1 w-0.5 flex-1 bg-border" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 pb-4">
        <div className="mb-1.5 flex items-center gap-2">
          <span className={cn('rounded-md px-2 py-0.5 text-[11px] font-medium', typeStyle.className)}>
            {typeStyle.label}
          </span>
          <span className={cn('ml-auto text-xs tabular-nums', isOver ? 'font-medium text-destructive' : 'text-muted-foreground')}>
            {tweet.content.length}/280
          </span>
        </div>
        <p className="whitespace-pre-wrap text-sm leading-relaxed">{tweet.content}</p>
        {tweet.tip && (
          <p className="mt-1.5 text-xs italic text-muted-foreground">💡 {tweet.tip}</p>
        )}
      </div>
    </div>
  )
}

export function ThreadView({ thread, isGenerating, onCopy, onSave, onSchedule }: ThreadViewProps) {
  const tweets = thread.tweets ?? []
  const total = tweets.length

  const handleCopyAll = () => {
    if (tweets.length > 0) onCopy(tweets as ThreadTweet[])
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      {thread.title && (
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Thread</p>
            <h3 className="font-semibold">{thread.title}</h3>
          </div>
          <Badge variant="secondary">{total} tweets</Badge>
        </div>
      )}

      {isGenerating && tweets.length === 0 && (
        <div className="flex items-center gap-3 rounded-lg border bg-muted/30 px-4 py-6">
          <svg className="h-5 w-5 animate-spin text-primary" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span className="text-sm text-muted-foreground">Claude is crafting your thread…</span>
        </div>
      )}

      {/* Tweets */}
      {tweets.length > 0 && (
        <div className="rounded-xl border bg-card p-4">
          <div className="space-y-0">
            {tweets.map((tweet) => (
              <TweetCard key={tweet.number} tweet={tweet as ThreadTweet} total={total} />
            ))}
          </div>
        </div>
      )}

      {/* Engagement tip */}
      {thread.engagementTip && !isGenerating && (
        <div className="rounded-lg border border-primary/20 bg-primary/5 px-4 py-3">
          <p className="text-xs font-medium text-primary mb-1">Pro Tip</p>
          <p className="text-sm text-muted-foreground">{thread.engagementTip}</p>
        </div>
      )}

      {/* Actions */}
      {tweets.length > 0 && !isGenerating && (
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleCopyAll}>
            <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
            </svg>
            Copy All Tweets
          </Button>
          <Button variant="outline" size="sm" onClick={() => onSave(thread)}>
            <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
            </svg>
            Save
          </Button>
          <Button variant="outline" size="sm" onClick={() => onSchedule(thread)}>
            Schedule
          </Button>
        </div>
      )}
    </div>
  )
}
