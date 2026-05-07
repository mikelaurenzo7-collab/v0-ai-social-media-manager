'use client'

import useSWR from 'swr'

export interface Draft {
  id: string
  userId: string
  content: string
  platforms: string[]
  hashtags: string[]
  tone: string | null
  metadata: Record<string, unknown> | null
  createdAt: string
  updatedAt: string
}

const fetcher = async (url: string) => {
  const res = await fetch(url)
  if (!res.ok) throw new Error('Failed to load drafts')
  return res.json() as Promise<{ drafts: Draft[] }>
}

export function useDrafts() {
  const { data, error, isLoading, mutate } = useSWR('/api/drafts', fetcher, {
    revalidateOnFocus: true,
  })

  async function createDraft(input: {
    content: string
    platforms?: string[]
    hashtags?: string[]
    tone?: string | null
    metadata?: Record<string, unknown> | null
  }) {
    const res = await fetch('/api/drafts', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(input),
    })
    if (!res.ok) {
      const j = await res.json().catch(() => ({}))
      throw new Error(j?.error ?? 'Failed to create draft')
    }
    const j = (await res.json()) as { draft: Draft }
    await mutate()
    return j.draft
  }

  async function updateDraft(id: string, patch: Partial<Omit<Draft, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>) {
    const res = await fetch(`/api/drafts/${id}`, {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(patch),
    })
    if (!res.ok) {
      const j = await res.json().catch(() => ({}))
      throw new Error(j?.error ?? 'Failed to update draft')
    }
    await mutate()
  }

  async function deleteDraft(id: string) {
    // Optimistic: drop locally first, then sync
    await mutate(
      async (current) => {
        const res = await fetch(`/api/drafts/${id}`, { method: 'DELETE' })
        if (!res.ok) {
          const j = await res.json().catch(() => ({}))
          throw new Error(j?.error ?? 'Failed to delete draft')
        }
        return { drafts: (current?.drafts ?? []).filter((d) => d.id !== id) }
      },
      {
        optimisticData: (current) => ({
          drafts: (current?.drafts ?? []).filter((d) => d.id !== id),
        }),
        rollbackOnError: true,
        populateCache: true,
        revalidate: false,
      },
    )
  }

  return {
    drafts: data?.drafts ?? [],
    isLoading,
    error,
    mutate,
    createDraft,
    updateDraft,
    deleteDraft,
  }
}
