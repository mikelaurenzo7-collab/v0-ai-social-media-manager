'use client'

import { useState, useCallback } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import type { ContentVariation } from '@/lib/schemas/content'
import type { PlatformId, ToneId } from '@/lib/constants/platforms'

interface ImproveDialogProps {
  variation: ContentVariation
  tone: ToneId
  platforms: PlatformId[]
  onImproved: (content: string, hashtags: string[]) => void
  children: React.ReactNode
}

export function ImproveDialog({
  variation,
  tone,
  platforms,
  onImproved,
  children,
}: ImproveDialogProps) {
  const [open, setOpen] = useState(false)
  const [feedback, setFeedback] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleImprove = useCallback(async () => {
    if (!feedback.trim()) return
    setIsLoading(true)

    try {
      const response = await fetch('/api/improve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: variation.content,
          hashtags: variation.hashtags,
          feedback,
          tone,
          platforms,
        }),
      })

      if (!response.ok) throw new Error('Improve request failed')

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let full = ''

      if (reader) {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          // toTextStreamResponse returns plain UTF-8 text chunks
          full += decoder.decode(value, { stream: true })
        }
      }

      if (full.trim()) {
        // Parse content and hashtags from the response
        const lines = full.trim().split('\n\n')
        const content = lines[0]?.trim() || full.trim()
        const hashtagLine = lines[1]?.trim() || ''
        const hashtags = hashtagLine
          ? hashtagLine.split(' ').map((h) => h.replace(/^#/, '')).filter(Boolean)
          : variation.hashtags

        onImproved(content, hashtags)
        setOpen(false)
        setFeedback('')
        toast.success('Content improved!')
      }
    } catch {
      toast.error('Failed to improve content. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }, [feedback, variation, tone, platforms, onImproved])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Improve with AI</DialogTitle>
          <DialogDescription>
            Tell Claude what you want to change and it will rewrite the post for you.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Current content preview */}
          <div className="rounded-lg border bg-muted/40 p-3">
            <p className="text-xs font-medium text-muted-foreground mb-1.5">Current post</p>
            <p className="text-sm leading-relaxed line-clamp-3">{variation.content}</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="feedback">Your feedback</Label>
            <Textarea
              id="feedback"
              placeholder="e.g., Make it shorter, add a stronger hook, make it funnier, focus more on the benefit..."
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              className="min-h-[100px] resize-none"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                  handleImprove()
                }
              }}
            />
            <p className="text-xs text-muted-foreground">
              Press ⌘+Enter to submit
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleImprove} disabled={!feedback.trim() || isLoading}>
            {isLoading ? (
              <>
                <svg className="mr-2 h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                Improving...
              </>
            ) : (
              <>
                <svg
                  className="mr-2 h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"
                  />
                </svg>
                Improve Post
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
