'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Header } from '@/components/dashboard/header'
import { PlatformIcon } from '@/components/create/platform-selector'
import { PLATFORMS, TONES, type PlatformId, type ToneId } from '@/lib/constants/platforms'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import Link from 'next/link'
import { toast } from 'sonner'

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

export default function DraftsPage() {
  const [drafts, setDrafts] = useState<Draft[]>([])
  const [threads, setThreads] = useState<ThreadDraft[]>([])
  const [copiedId, setCopiedId] = useState<string | null>(null)

  // Load drafts and threads from localStorage
  useEffect(() => {
    const storedDrafts = localStorage.getItem('postpilot_drafts')
    if (storedDrafts) {
      setDrafts(JSON.parse(storedDrafts))
    }
    const storedThreads = localStorage.getItem('postpilot_threads')
    if (storedThreads) {
      setThreads(JSON.parse(storedThreads))
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

    await navigator.clipboard.writeText(fullContent)
    setCopiedId(draft.id)
    toast.success('Copied to clipboard!')
    setTimeout(() => setCopiedId(null), 2000)
  }, [])

  const handleCopyThread = useCallback(async (thread: ThreadDraft) => {
    const text = thread.tweets.map((t, i) => `${i + 1}/ ${t.content}`).join('\n\n')
    await navigator.clipboard.writeText(text)
    setCopiedId(thread.id)
    toast.success('Thread copied to clipboard!')
    setTimeout(() => setCopiedId(null), 2000)
  }, [])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getToneName = (toneId: ToneId) => {
    return TONES.find((t) => t.id === toneId)?.name || toneId
  }

  return (
    <div className="flex flex-col">
      <Header 
        title="Drafts" 
        description="Your saved content ready to post"
        action={
          <Button asChild>
            <Link href="/dashboard/create">
              <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Create New
            </Link>
          </Button>
        }
      />
      
      <div className="p-6">
        <Tabs defaultValue="posts" className="space-y-6">
          <TabsList>
            <TabsTrigger value="posts">Posts ({drafts.length})</TabsTrigger>
            <TabsTrigger value="threads">Threads ({threads.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="posts">
            {drafts.length === 0 ? (
              <EmptyState title="No posts yet" description="Create your first post and save it as a draft to see it here." />
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {drafts.map((draft) => (
                  <Card key={draft.id} className="flex flex-col">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex flex-wrap gap-1">
                          {draft.platforms.map((p) => (
                            <div key={p} className="flex h-6 w-6 items-center justify-center rounded-full bg-muted">
                              <PlatformIcon platform={p} className="h-3.5 w-3.5" />
                            </div>
                          ))}
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {getToneName(draft.tone)}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="flex flex-1 flex-col">
                      <p className="flex-1 text-sm leading-relaxed line-clamp-4">
                        {draft.content}
                      </p>

                      {draft.hashtags.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1">
                          {draft.hashtags.slice(0, 3).map((tag) => (
                            <span key={tag} className="rounded-md bg-primary/10 px-2 py-0.5 text-xs text-primary">
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
                          {copiedId === draft.id ? 'Copied' : 'Copy'}
                        </Button>
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/dashboard/create?edit=${draft.id}`}>Edit</Link>
                        </Button>
                        <Button variant="ghost" size="sm" className="text-destructive" onClick={() => handleDeleteDraft(draft.id)}>
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                          </svg>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="threads">
            {threads.length === 0 ? (
              <EmptyState title="No threads yet" description="Create your first thread and save it to see it here." />
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {threads.map((thread) => (
                  <Card key={thread.id} className="flex flex-col">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-2">
                        <CardTitle className="text-base line-clamp-1">{thread.title}</CardTitle>
                        <Badge variant="secondary" className="text-xs shrink-0">
                          {thread.tweets.length} tweets
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="flex flex-1 flex-col">
                      <div className="flex-1 rounded-lg border bg-muted/30 p-3">
                        <p className="text-xs font-semibold text-muted-foreground mb-1">1/ {thread.tweets[0]?.type}</p>
                        <p className="text-sm leading-relaxed line-clamp-3 italic">
                          "{thread.tweets[0]?.content}"
                        </p>
                      </div>

                      <p className="mt-3 text-xs text-muted-foreground">{formatDate(thread.createdAt)}</p>

                      <div className="mt-4 flex gap-2">
                        <Button variant="outline" size="sm" className="flex-1" onClick={() => handleCopyThread(thread)}>
                          {copiedId === thread.id ? 'Copied' : 'Copy Thread'}
                        </Button>
                        <Button variant="ghost" size="sm" className="text-destructive" onClick={() => handleDeleteThread(thread.id)}>
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                          </svg>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center justify-center py-16 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
          <svg className="h-8 w-8 text-muted-foreground" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="mt-2 max-w-sm text-muted-foreground">{description}</p>
        <Button asChild className="mt-6">
          <Link href="/dashboard/create">Create New Content</Link>
        </Button>
      </CardContent>
    </Card>
  )
}
