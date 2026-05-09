'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
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
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { PLATFORMS } from '@/lib/constants/platforms'
import type { PlatformId, SocialPlatformId } from '@/lib/constants/platforms'

interface SchedulableDraft {
  id: string
  content: string
  platforms: PlatformId[]
}

interface ScheduleDialogProps {
  draft: SchedulableDraft
  children: React.ReactNode
}

const BEST_SLOTS: Record<SocialPlatformId, { label: string; times: string[] }> = {
  twitter:   { label: 'X/Twitter', times: ['08:00', '12:00', '17:00', '20:00'] },
  instagram: { label: 'Instagram', times: ['09:00', '11:00', '14:00', '19:00'] },
  linkedin:  { label: 'LinkedIn',  times: ['07:30', '08:30', '12:00', '17:00'] },
  tiktok:    { label: 'TikTok',    times: ['09:00', '12:00', '17:00', '21:00'] },
  facebook:  { label: 'Facebook',  times: ['09:00', '13:00', '16:00', '20:00'] },
}

function fmtTime(t: string): string {
  const [h, m] = t.split(':').map(Number)
  const suffix = h >= 12 ? 'PM' : 'AM'
  const hour = h % 12 === 0 ? 12 : h % 12
  return `${hour}:${String(m).padStart(2, '0')} ${suffix}`
}

export function ScheduleDialog({ draft, children }: ScheduleDialogProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const tomorrowStr = tomorrow.toISOString().split('T')[0]
  const todayStr = new Date().toISOString().split('T')[0]

  const [selectedDate, setSelectedDate] = useState(tomorrowStr)
  const [selectedTime, setSelectedTime] = useState('09:00')
  const [selectedPlatform, setSelectedPlatform] = useState<PlatformId>(draft.platforms[0] ?? 'twitter')

  const slot = (BEST_SLOTS as Record<string, { label: string; times: string[] } | undefined>)[selectedPlatform]
  const slots: string[] = slot?.times ?? ['09:00', '12:00', '17:00']
  const slotLabel: string = slot?.label ?? PLATFORMS[selectedPlatform]?.name ?? 'this platform'

  const handleSchedule = useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/scheduled', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: draft.content,
          platform: selectedPlatform,
          date: selectedDate,
          time: selectedTime,
        }),
      })
      if (!res.ok) throw new Error('Failed to schedule')
      const d = new Date(selectedDate + 'T12:00:00')
      const dateLabel = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
      toast.success(`Scheduled for ${dateLabel} at ${fmtTime(selectedTime)}`, {
        description: `Shows up in your Calendar under ${PLATFORMS[selectedPlatform]?.shortName ?? selectedPlatform}`,
        action: { label: 'View Calendar', onClick: () => router.push('/dashboard/calendar') },
      })
      setOpen(false)
    } catch {
      toast.error('Failed to schedule post')
    } finally {
      setIsLoading(false)
    }
  }, [draft, selectedDate, selectedTime, selectedPlatform])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Schedule Post</DialogTitle>
          <DialogDescription>
            Pick a date, time, and platform — it will appear on your Calendar automatically.
          </DialogDescription>
        </DialogHeader>

        {/* Content preview */}
        <div className="rounded-xl border bg-muted/30 p-3">
          <p className="mb-1.5 text-xs font-medium text-muted-foreground">Post preview</p>
          <p className="line-clamp-3 text-sm leading-relaxed">{draft.content}</p>
        </div>

        <div className="space-y-4">
          {/* Platform selector (only when multiple platforms) */}
          {draft.platforms.length > 1 && (
            <div className="space-y-2">
              <Label>Platform</Label>
              <div className="flex flex-wrap gap-2">
                {draft.platforms.map((p) => (
                  <button
                    key={p}
                    onClick={() => setSelectedPlatform(p)}
                    className={cn(
                      'rounded-lg border px-3 py-1.5 text-xs font-semibold transition-all',
                      selectedPlatform === p
                        ? 'border-transparent text-white'
                        : 'border-border text-muted-foreground hover:border-foreground/30'
                    )}
                    style={
                      selectedPlatform === p
                        ? { background: 'linear-gradient(135deg, #EA580C 0%, #DB2777 100%)' }
                        : undefined
                    }
                  >
                    {PLATFORMS[p]?.shortName ?? p}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Date + Time */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="sched-date">Date</Label>
              <input
                id="sched-date"
                type="date"
                min={todayStr}
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="sched-time">Time</Label>
              <input
                id="sched-time"
                type="time"
                value={selectedTime}
                onChange={(e) => setSelectedTime(e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
          </div>

          {/* Suggested times */}
          <div className="space-y-1.5">
            <p className="text-xs font-medium text-muted-foreground">
              Best times for {slotLabel}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {slots.map((t) => (
                <button
                  key={t}
                  onClick={() => setSelectedTime(t)}
                  className={cn(
                    'rounded-full border px-2.5 py-0.5 text-xs font-medium transition-all',
                    selectedTime === t
                      ? 'border-transparent text-white'
                      : 'border-border text-muted-foreground hover:border-foreground/30'
                  )}
                  style={selectedTime === t ? { background: '#EA580C' } : undefined}
                >
                  {fmtTime(t)}
                </button>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleSchedule}
            disabled={isLoading || !selectedDate || !selectedTime}
            style={{ background: 'linear-gradient(135deg, #EA580C 0%, #DB2777 100%)' }}
          >
            {isLoading ? (
              <>
                <svg className="mr-2 h-3.5 w-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Scheduling…
              </>
            ) : (
              <>
                <svg className="mr-2 h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                </svg>
                Schedule Post
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
