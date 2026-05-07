'use client'

import { useEffect, useState } from 'react'
import { Header } from '@/components/dashboard/header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { BRAND_KIT_KEY, DEFAULT_VOICE_DIMENSIONS, type VoiceDimension } from '@/lib/brand-kit'

const SAMPLE_HASHTAG_GROUPS = [
  { name: 'Launch day', tags: '#buildinpublic #shipit #productlaunch #saas #founders', count: 5 },
  { name: 'Growth playbook', tags: '#growth #marketing #SaaS #B2B #strategy', count: 5 },
  { name: 'Engineering', tags: '#typescript #nextjs #postgres #ai #dx', count: 5 },
] as const

const SAMPLE_SNIPPETS = [
  { name: 'Sign-off', body: '— Built with care from a tiny team\nReply with thoughts, we read everything 🙏' },
  { name: 'Demo CTA', body: 'Want to see it on your own data? 30-min demo → postpilot.app/demo' },
  { name: 'Beta invite', body: 'Joining the beta means: weekly feedback calls, direct Slack with founders, lifetime 50% off.' },
]

export default function BrandKitPage() {
  const [voiceDimensions, setVoiceDimensions] = useState<VoiceDimension[]>(DEFAULT_VOICE_DIMENSIONS)
  const [voiceSamples, setVoiceSamples] = useState(
    'We don\'t do hype. We ship things that work, write about why we built them, and listen hard when people push back. We\'re for the makers who care about craft.',
  )
  const [audience, setAudience] = useState('Founders, indie hackers, and small marketing teams (1–20 people) who care about doing more with fewer tools.')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(BRAND_KIT_KEY)
      if (!raw) return
      const parsed = JSON.parse(raw) as {
        voiceDimensions?: VoiceDimension[]
        voiceSamples?: string
        audience?: string
      }
      if (Array.isArray(parsed.voiceDimensions)) setVoiceDimensions(parsed.voiceDimensions)
      if (typeof parsed.voiceSamples === 'string') setVoiceSamples(parsed.voiceSamples)
      if (typeof parsed.audience === 'string') setAudience(parsed.audience)
    } catch {
      // ignore corrupted storage
    }
  }, [])

  function saveBrandKit() {
    setSaving(true)
    try {
      localStorage.setItem(
        BRAND_KIT_KEY,
        JSON.stringify({ voiceDimensions, voiceSamples, audience }),
      )
      toast.success('Brand kit saved', { description: 'Agents will use it on the next chat or generation in this browser.' })
    } catch {
      toast.error('Could not save — local storage blocked')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex flex-col min-h-full">
      <Header
        title="Brand Kit"
        description="Train your AI agents on your voice, audience, palette, and signature snippets — once."
        action={
          <Button
            size="sm"
            onClick={saveBrandKit}
            disabled={saving}
            style={{ background: 'linear-gradient(135deg, #EA580C, #DB2777)' }}
          >
            {saving ? 'Saving…' : 'Save brand kit'}
          </Button>
        }
      />

      <div className="p-6 grid gap-6 lg:grid-cols-3">
        {/* LEFT — voice + audience (2 cols) */}
        <div className="space-y-6 lg:col-span-2">
          {/* Voice training */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-base">Voice training</CardTitle>
                  <CardDescription>Paste 3–5 examples of content you&apos;re proud of. Agents learn from this.</CardDescription>
                </div>
                <Badge className="bg-emerald-500/10 text-emerald-700 border-emerald-200">Trained · 4 samples</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-xs">Sample content</Label>
                <Textarea
                  value={voiceSamples}
                  onChange={(e) => setVoiceSamples(e.target.value)}
                  rows={6}
                  className="mt-1.5"
                  placeholder="Paste a post, an email, a section of a blog… anything that sounds like you."
                />
                <p className="mt-1.5 text-[11px] text-muted-foreground">
                  Tip: include both polished and casual examples. Variation helps the agents flex.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <Button variant="outline" size="sm" className="justify-start text-xs">
                  <svg className="h-3.5 w-3.5 mr-2" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                  </svg>
                  Import from URL
                </Button>
                <Button variant="outline" size="sm" className="justify-start text-xs">
                  <svg className="h-3.5 w-3.5 mr-2" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25" />
                  </svg>
                  Pull last 50 posts
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Voice dimensions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Voice fingerprint</CardTitle>
              <CardDescription>Auto-detected from your samples. Nudge any slider to override.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {voiceDimensions.map((d) => (
                <div key={d.id} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-muted-foreground">{d.left}</span>
                    <span className="font-medium text-muted-foreground">{d.right}</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={d.value}
                    onChange={(e) => {
                      const next = Number(e.target.value)
                      setVoiceDimensions((prev) =>
                        prev.map((x) => (x.id === d.id ? { ...x, value: next } : x)),
                      )
                    }}
                    aria-label={`${d.left} to ${d.right}`}
                    className="w-full accent-orange-500"
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Audience */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Audience persona</CardTitle>
              <CardDescription>Who are you talking to? Agents shape every draft for them.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea value={audience} onChange={(e) => setAudience(e.target.value)} rows={3} />
              <div className="grid gap-3 sm:grid-cols-3">
                {[
                  { label: 'Avg age', val: '28–42' },
                  { label: 'Top platforms', val: 'X · LinkedIn · Email' },
                  { label: 'Tone they expect', val: 'Direct, smart, no hype' },
                ].map((a) => (
                  <div key={a.label} className="rounded-xl border border-border/60 bg-muted/30 p-3">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{a.label}</p>
                    <p className="mt-1 text-sm font-semibold">{a.val}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Snippets */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base">Snippets</CardTitle>
                  <CardDescription>Reusable blocks. Type / in the editor to drop one in.</CardDescription>
                </div>
                <Button size="sm" variant="outline" className="text-xs">+ New snippet</Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {SAMPLE_SNIPPETS.map((s) => (
                <div key={s.name} className="rounded-xl border border-border/60 bg-muted/30 p-3 hover:bg-muted/60 transition-colors">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-bold">/{s.name.toLowerCase().replace(/\s/g, '-')}</p>
                    <Badge variant="outline" className="text-[10px]">{s.body.length} chars</Badge>
                  </div>
                  <p className="text-xs whitespace-pre-wrap text-muted-foreground line-clamp-2">{s.body}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* RIGHT — palette, hashtags, do/don't */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Palette</CardTitle>
              <CardDescription>Used for AI-generated images and templates.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-5 gap-2">
                {['#1A120E', '#EA580C', '#DB2777', '#FCD7A1', '#FFF8F2'].map((c) => (
                  <div key={c} className="space-y-1.5">
                    <div className="aspect-square rounded-xl ring-1 ring-border/50" style={{ background: c }} />
                    <p className="text-[9px] font-mono text-center text-muted-foreground">{c}</p>
                  </div>
                ))}
              </div>
              <Button variant="ghost" size="sm" className="mt-3 w-full text-xs">+ Add color</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Hashtag groups</CardTitle>
                <Button variant="ghost" size="sm" className="text-xs h-7">+ New</Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {SAMPLE_HASHTAG_GROUPS.map((g) => (
                <div key={g.name} className="rounded-xl border border-border/60 bg-muted/30 p-3">
                  <div className="flex items-center justify-between mb-1.5">
                    <p className="text-sm font-bold">{g.name}</p>
                    <Badge variant="outline" className="text-[10px]">{g.count}</Badge>
                  </div>
                  <p className="text-[11px] text-muted-foreground font-mono leading-relaxed">{g.tags}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Do / Don&apos;t</CardTitle>
              <CardDescription>Hard rules. Agents refuse to break these.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 mb-2">Always</p>
                <ul className="space-y-1.5 text-xs">
                  <li className="flex gap-2">
                    <span className="text-emerald-500 mt-0.5">✓</span>
                    <span>Use sentence case for headlines</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-emerald-500 mt-0.5">✓</span>
                    <span>Sign off with a question that invites reply</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-emerald-500 mt-0.5">✓</span>
                    <span>Mention specific numbers when we have them</span>
                  </li>
                </ul>
              </div>
              <div className="pt-1">
                <p className="text-[10px] font-bold uppercase tracking-widest text-rose-600 dark:text-rose-400 mb-2">Never</p>
                <ul className="space-y-1.5 text-xs">
                  <li className="flex gap-2">
                    <span className="text-rose-500 mt-0.5">✗</span>
                    <span>Use the words &quot;synergy&quot;, &quot;leverage&quot;, &quot;unlock&quot;</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-rose-500 mt-0.5">✗</span>
                    <span>Make claims about competitors</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-rose-500 mt-0.5">✗</span>
                    <span>Promise dates we haven&apos;t committed to</span>
                  </li>
                </ul>
              </div>
              <Button variant="outline" size="sm" className="w-full mt-2 text-xs">+ Add rule</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
