'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Header } from '@/components/dashboard/header'
import { PlatformIcon } from '@/components/create/platform-selector'
import { PLATFORMS, TONES, type PlatformId, type ToneId } from '@/lib/constants/platforms'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { toast } from 'sonner'
import { ScheduleDialog } from '@/components/create/schedule-dialog'

interface Draft {
  id: string
  content: string
  hashtags: string[]
  platforms: PlatformId[]
  tone: ToneId
  contentType: string
  createdAt: string
}

interface ThreadDraft {
  id: string
  title: string
  tweets: { number: number; content: string; type: string }[]
  engagementTip: string
  createdAt: string
}

const TABS = ['posts', 'threads'] as const
type TabId = (typeof TABS)[number]

export default function DraftsPage() {
  const [drafts, setDrafts] = useState<Draft[]>([])
  const [threads, setThreads] = useState<ThreadDraft[]>([])
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<TabId>('posts')

  useEffect(() => {
    const storedDrafts = localStorage.getItem('postpilot_drafts')
    if (storedDrafts) {
      try {
        const parsed = JSON.parse(storedDrafts)
        if (Array.isArray(parsed)) setDrafts(parsed)
      } catch { /* ignore */ }
    }
    const storedThreads = localStorage.getItem('postpilot_threads')
    if (storedThreads) {
      try {
        const parsed = JSON.parse(storedThreads)
        if (Array.isArray(parsed)) setThreads(parsed)
      } catch { /* ignore */ }
    }
  }, [])

  const handleDeleteDraft = useCallback((id: string) => {
    const updated = drafts.filter((d) => d.id !== id)
    setDrafts(updated)
    localStorage.setItem('postpilot_drafts', JSON.stringify(updated))
    toast.success('Draft deleted')
  }, [drafts])

  const handleDeleteThread = useCallback((id: string) => {
    const updated = threads.filter((t) => t.id !== id)
    setThreads(updated)
    localStorage.setItem('postpilot_threads', JSON.stringify(updated))
    toast.success('Thread deleted')
  }, [threads])

  const handleCopyDraft = useCallback(async (draft: Draft) => {
    const fullContent = draft.hashtags.length > 0
      ? `${draft.content}\n\n${draft.hashtags.map(t => `#${t}`).join(' ')}`
      : draft.content
    try {
      await navigator.clipboard.writeText(fullContent)
      setCopiedId(draft.id)
      toast.success('Copied to clipboard!')
      setTimeout(() => setCopiedId(null), 2000)
    } catch {
      toast.error('Failed to copy to clipboard')
    }
  }, [])

  const handleCopyThread = useCallback(async (thread: ThreadDraft) => {
    const text = thread.tweets.map((t, i) => `${i + 1}/ ${t.content}`).join('\n\n')
    try {
      await navigator.clipboard.writeText(text)
      setCopiedId(thread.id)
      toast.success('Thread copied to clipboard!')
      setTimeout(() => setCopiedId(null), 2000)
    } catch {
      toast.error('Failed to copy to clipboard')
    }
  }, [])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getToneName = (toneId: ToneId) => TONES.find((t) => t.id === toneId)?.name ?? toneId

  return (
    <div className="flex flex-col">
      <Header
        title="Drafts"
        description="Your saved content ready to post"
        action={
          <Button
            asChild
            style={{ background: 'linear-gradient(135deg, #EA580C 0%, #DB2777 100%)', border: 'none' }}
          >
            <Link href="/dashboard/create">
              <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Create New
            </Link>
          </Button>
        }
      />

      <div className="p-6 space-y-6">
        {/* Custom tab bar */}
        <div
          className="inline-flex items-center gap-0.5 rounded-lg p-1"
          style={{ background: 'oklch(0.93 0.008 68)' }}
        >
          {TABS.map((tab) => {
            const label = tab === 'posts' ? `Posts (${drafts.length})` : `Threads (${threads.length})`
            return (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={cn(
                  'h-8 rounded-md px-5 text-sm font-medium transition-all duration-200',
                  activeTab === tab ? 'text-white shadow-sm' : 'text-muted-foreground hover:text-foreground'
                )}
                style={
                  activeTab === tab
                    ? { background: 'linear-gradient(135deg, #EA580C 0%, #DB2777 100%)' }
                    : undefined
                }
              >
                {label}
              </button>
            )
          })}
        </div>

        {/* Posts tab */}
        {activeTab === 'posts' && (
          drafts.length === 0 ? (
            <EmptyState title="No posts yet" description="Create your first post and save it as a draft to see it here." />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {drafts.map((draft) => (
                <Card key={draft.id} className="flex flex-col border-border/60 hover:border-orange-200 hover:shadow-md transition-all duration-200">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex flex-wrap gap-1.5">
                        {draft.platforms.map((p) => (
                          <div
                            key={p}
                            className="flex h-7 w-7 items-center justify-center rounded-full"
                            style={{ background: 'oklch(0.93 0.008 68)' }}
                            title={PLATFORMS[p]?.shortName ?? p}
                          >
                            <PlatformIcon platform={p} className="h-3.5 w-3.5 text-muted-foreground" />
                          </div>
                        ))}
                      </div>
                      <span className="rounded-full border border-border/60 bg-muted/30 px-2.5 py-0.5 text-xs text-muted-foreground">
                        {getToneName(draft.tone)}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="flex flex-1 flex-col">
                    <p className="flex-1 text-sm leading-relaxed line-clamp-4">{draft.content}</p>

                    {draft.hashtags.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1">
                        {draft.hashtags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="rounded-full bg-orange-50 px-2 py-0.5 text-xs font-medium text-orange-600 border border-orange-200/60"
                          >
                            #{tag}
                          </span>
                        ))}
                        {draft.hashtags.length > 3 && (
                          <span className="text-xs text-muted-foreground">+{draft.hashtags.length - 3}</span>
                        )}
                      </div>
                    )}

                    <p className="mt-3 text-xs text-muted-foreground">{formatDate(draft.createdAt)}</p>

                    <div className="mt-4 flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1" onClick={() => handleCopyDraft(draft)}>
                        {copiedId === draft.id ? '✓ Copied' : 'Copy'}
                      </Button>
                      <ScheduleDialog draft={{ id: draft.id, content: draft.content, platforms: draft.platforms }}>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-orange-600 border-orange-200 hover:bg-orange-50 hover:border-orange-300"
                        >
                          <svg className="mr-1.5 h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                          </svg>
                          Schedule
                        </Button>
                      </ScheduleDialog>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:bg-destructive/10"
                        onClick={() => handleDeleteDraft(draft.id)}
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                        </svg>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )
        )}

        {/* Threads tab */}
        {activeTab === 'threads' && (
          threads.length === 0 ? (
            <EmptyState title="No threads yet" description="Create your first thread and save it to see it here." />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {threads.map((thread) => (
                <Card key={thread.id} className="flex flex-col border-border/60 hover:border-orange-200 hover:shadow-md transition-all duration-200">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold text-base line-clamp-1">{thread.title}</h3>
                      <span className="shrink-0 rounded-full bg-orange-50 px-2.5 py-0.5 text-xs font-medium text-orange-600 border border-orange-200/60">
                        {thread.tweets.length} tweets
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="flex flex-1 flex-col">
                    <div
                      className="flex-1 rounded-xl border border-border/40 p-3"
                      style={{ background: 'oklch(0.96 0.006 68)' }}
                    >
                      <p className="text-xs font-semibold text-muted-foreground mb-1">1/ {thread.tweets[0]?.type}</p>
                      <p className="text-sm leading-relaxed line-clamp-3 italic">
                        &ldquo;{thread.tweets[0]?.content}&rdquo;
                      </p>
                    </div>

                    <p className="mt-3 text-xs text-muted-foreground">{formatDate(thread.createdAt)}</p>

                    <div className="mt-4 flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1" onClick={() => handleCopyThread(thread)}>
                        {copiedId === thread.id ? '✓ Copied' : 'Copy Thread'}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:bg-destructive/10"
                        onClick={() => handleDeleteThread(thread.id)}
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                        </svg>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  )
}

function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center justify-center py-16 text-center">
        <div
          className="mb-4 flex h-16 w-16 items-center justify-center rounded-full"
          style={{ background: 'linear-gradient(135deg, #EA580C22 0%, #DB277722 100%)' }}
        >
          <svg
            className="h-8 w-8"
            style={{ color: '#EA580C' }}
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="mt-2 max-w-sm text-muted-foreground">{description}</p>
        <Button
          asChild
          className="mt-6"
          style={{ background: 'linear-gradient(135deg, #EA580C 0%, #DB2777 100%)', border: 'none' }}
        >
          <Link href="/dashboard/create">Create New Content</Link>
        </Button>
      </CardContent>
    </Card>
  )
}
