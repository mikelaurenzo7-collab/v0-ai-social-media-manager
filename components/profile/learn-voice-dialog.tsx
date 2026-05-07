'use client'

import { useState } from 'react'
import { Loader2, Sparkles, Check, X } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import type { UserProfile } from '@/lib/user-profile'

export interface LearnedVoice {
  brandVoice: string
  defaultTone: string
  doWords: string[]
  dontWords: string[]
  contentPillars: string[]
  brandKeywords: string[]
  hashtagStyle: 'minimal' | 'moderate' | 'heavy'
  emojiUsage: 'none' | 'sparing' | 'liberal'
  notes: string
}

interface LearnVoiceDialogProps {
  /** Apply diff to the parent's profile state. Each field is optional — only chosen fields are returned. */
  onApply: (changes: Partial<UserProfile>) => void
}

export function LearnVoiceDialog({ onApply }: LearnVoiceDialogProps) {
  const [open, setOpen] = useState(false)
  const [samples, setSamples] = useState('')
  const [context, setContext] = useState('')
  const [loading, setLoading] = useState(false)
  const [voice, setVoice] = useState<LearnedVoice | null>(null)
  const [accept, setAccept] = useState({
    brandVoice: true,
    defaultTone: true,
    doWords: true,
    dontWords: true,
    contentPillars: true,
    brandKeywords: true,
    hashtagStyle: true,
  })

  const reset = () => {
    setVoice(null)
    setSamples('')
    setContext('')
    setLoading(false)
  }

  const handleAnalyze = async () => {
    if (samples.trim().length < 200) {
      toast.error('Paste at least ~200 characters of writing samples')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/profile/learn-voice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ samples, context: context.trim() || undefined }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed')
      setVoice(data.voice as LearnedVoice)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Voice extraction failed')
    } finally {
      setLoading(false)
    }
  }

  const handleApply = () => {
    if (!voice) return
    const changes: Partial<UserProfile> = {}
    if (accept.brandVoice) changes.brandVoice = voice.brandVoice
    if (accept.defaultTone) changes.defaultTone = voice.defaultTone
    if (accept.doWords) changes.doWords = voice.doWords
    if (accept.dontWords) changes.dontWords = voice.dontWords
    if (accept.contentPillars) changes.contentPillars = voice.contentPillars
    if (accept.brandKeywords) changes.brandKeywords = voice.brandKeywords
    if (accept.hashtagStyle) changes.hashtagStyle = voice.hashtagStyle
    onApply(changes)
    toast.success('Voice profile applied. Save Brand Voice to persist.')
    setOpen(false)
    reset()
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o)
        if (!o) reset()
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Sparkles className="size-4" />
          Learn my voice
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Learn my voice</DialogTitle>
          <DialogDescription>
            Paste 2–5 samples of how you actually write — posts, captions, emails, anything. The AI extracts your voice, do/don&apos;t words, and content pillars. You pick what to apply.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          {!voice && (
            <>
              <div className="space-y-2">
                <Label htmlFor="context">Context (optional)</Label>
                <Input
                  id="context"
                  placeholder="e.g. my LinkedIn posts about hiring, or my product update emails"
                  value={context}
                  onChange={(e) => setContext(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="samples">Samples</Label>
                <Textarea
                  id="samples"
                  placeholder={
                    "Paste 2-5 of your real posts, captions, or short emails. Separate with blank lines. The more variety, the sharper the result."
                  }
                  rows={12}
                  value={samples}
                  onChange={(e) => setSamples(e.target.value)}
                  className="font-mono text-sm leading-relaxed"
                />
                <p className="text-[11px] text-muted-foreground">
                  {samples.trim().length} characters · 200 minimum, 20,000 maximum
                </p>
              </div>
            </>
          )}

          {voice && (
            <div className="space-y-4">
              <p className="rounded-lg bg-muted/50 p-3 text-xs italic text-muted-foreground">
                {voice.notes}
              </p>

              <DiffRow
                label="Voice description"
                checked={accept.brandVoice}
                onChange={(v) => setAccept((s) => ({ ...s, brandVoice: v }))}
              >
                <p className="text-sm leading-relaxed">{voice.brandVoice}</p>
              </DiffRow>

              <DiffRow
                label="Default tone"
                checked={accept.defaultTone}
                onChange={(v) => setAccept((s) => ({ ...s, defaultTone: v }))}
              >
                <span className="inline-block rounded-full border bg-background px-2.5 py-0.5 text-xs font-medium">
                  {voice.defaultTone}
                </span>
              </DiffRow>

              <DiffRow
                label="Do words"
                checked={accept.doWords}
                onChange={(v) => setAccept((s) => ({ ...s, doWords: v }))}
              >
                <ChipList items={voice.doWords} colorClass="bg-emerald-50 text-emerald-800 ring-emerald-200" />
              </DiffRow>

              <DiffRow
                label="Don't words"
                checked={accept.dontWords}
                onChange={(v) => setAccept((s) => ({ ...s, dontWords: v }))}
              >
                <ChipList items={voice.dontWords} colorClass="bg-rose-50 text-rose-800 ring-rose-200" />
              </DiffRow>

              <DiffRow
                label="Content pillars"
                checked={accept.contentPillars}
                onChange={(v) => setAccept((s) => ({ ...s, contentPillars: v }))}
              >
                <ChipList items={voice.contentPillars} colorClass="bg-muted text-foreground ring-border" />
              </DiffRow>

              <DiffRow
                label="Brand keywords"
                checked={accept.brandKeywords}
                onChange={(v) => setAccept((s) => ({ ...s, brandKeywords: v }))}
              >
                <ChipList items={voice.brandKeywords} colorClass="bg-muted text-foreground ring-border" />
              </DiffRow>

              <DiffRow
                label="Hashtag style"
                checked={accept.hashtagStyle}
                onChange={(v) => setAccept((s) => ({ ...s, hashtagStyle: v }))}
              >
                <span className="inline-block rounded-full border bg-background px-2.5 py-0.5 text-xs font-medium capitalize">
                  {voice.hashtagStyle}
                </span>
              </DiffRow>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-2 pt-3 border-t">
          {!voice ? (
            <>
              <Button variant="ghost" onClick={() => setOpen(false)} disabled={loading}>
                Cancel
              </Button>
              <Button onClick={handleAnalyze} disabled={loading || samples.trim().length < 200}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    Analyzing
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 size-4" />
                    Analyze samples
                  </>
                )}
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" onClick={reset}>
                Try different samples
              </Button>
              <Button onClick={handleApply}>
                <Check className="mr-2 size-4" />
                Apply to profile
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function DiffRow({
  label,
  checked,
  onChange,
  children,
}: {
  label: string
  checked: boolean
  onChange: (v: boolean) => void
  children: React.ReactNode
}) {
  return (
    <div className="flex gap-3 rounded-lg border p-3">
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`mt-0.5 flex size-5 shrink-0 items-center justify-center rounded border transition ${
          checked ? 'border-foreground bg-foreground text-background' : 'border-muted-foreground/40'
        }`}
        aria-label={`${checked ? 'Skip' : 'Apply'} ${label}`}
      >
        {checked ? <Check className="size-3.5" /> : <X className="size-3.5 opacity-30" />}
      </button>
      <div className="flex-1 min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
          {label}
        </p>
        {children}
      </div>
    </div>
  )
}

function ChipList({ items, colorClass }: { items: string[]; colorClass: string }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((it) => (
        <span
          key={it}
          className={`inline-block rounded-full px-2.5 py-0.5 text-xs ring-1 ${colorClass}`}
        >
          {it}
        </span>
      ))}
    </div>
  )
}
