'use client'

import useSWR from 'swr'

export type ScheduledStatus = 'scheduled' | 'publishing' | 'published' | 'failed' | 'cancelled'

export interface ScheduledPost {
  id: string
  userId: string
  draftId: string | null
  content: string
  platforms: string[]
  scheduledFor: string
  status: ScheduledStatus
  attempts: number
  lastError: string | null
  publishedAt: string | null
  metadata: Record<string, unknown> | null
  createdAt: string
  updatedAt: string
}

const fetcher = async (url: string) => {
  const res = await fetch(url)
  if (!res.ok) throw new Error('Failed to load scheduled posts')
  return res.json() as Promise<{ posts: ScheduledPost[] }>
}

export function useScheduledPosts(params?: { status?: ScheduledStatus; from?: Date; to?: Date }) {
  const search = new URLSearchParams()
  if (params?.status) search.set('status', params.status)
  if (params?.from) search.set('from', params.from.toISOString())
  if (params?.to) search.set('to', params.to.toISOString())
  const key = `/api/scheduled-posts${search.toString() ? `?${search.toString()}` : ''}`

  const { data, error, isLoading, mutate } = useSWR(key, fetcher, {
    revalidateOnFocus: true,
  })

  async function schedulePost(input: {
    content: string
    platforms: string[]
    scheduledFor: Date | string
    draftId?: string | null
    metadata?: Record<string, unknown> | null
  }) {
    const res = await fetch('/api/scheduled-posts', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        ...input,
        scheduledFor:
          typeof input.scheduledFor === 'string'
            ? input.scheduledFor
            : input.scheduledFor.toISOString(),
      }),
    })
    if (!res.ok) {
      const j = await res.json().catch(() => ({}))
      throw new Error(j?.error ?? 'Failed to schedule post')
    }
    const j = (await res.json()) as { post: ScheduledPost }
    await mutate()
    return j.post
  }

  async function updatePost(id: string, patch: Partial<Pick<ScheduledPost, 'content' | 'platforms' | 'status'>> & { scheduledFor?: Date | string }) {
    const body: Record<string, unknown> = { ...patch }
    if (patch.scheduledFor) {
      body.scheduledFor =
        typeof patch.scheduledFor === 'string'
          ? patch.scheduledFor
          : patch.scheduledFor.toISOString()
    }
    const res = await fetch(`/api/scheduled-posts/${id}`, {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    })
    if (!res.ok) {
      const j = await res.json().catch(() => ({}))
      throw new Error(j?.error ?? 'Failed to update scheduled post')
    }
    await mutate()
  }

  async function cancelPost(id: string) {
    await mutate(
      async (current) => {
        const res = await fetch(`/api/scheduled-posts/${id}`, { method: 'DELETE' })
        if (!res.ok) {
          const j = await res.json().catch(() => ({}))
          throw new Error(j?.error ?? 'Failed to cancel post')
        }
        return { posts: (current?.posts ?? []).filter((p) => p.id !== id) }
      },
      {
        optimisticData: (current) => ({
          posts: (current?.posts ?? []).filter((p) => p.id !== id),
        }),
        rollbackOnError: true,
        populateCache: true,
        revalidate: false,
      },
    )
  }

  return {
    posts: data?.posts ?? [],
    isLoading,
    error,
    mutate,
    schedulePost,
    updatePost,
    cancelPost,
  }
}
