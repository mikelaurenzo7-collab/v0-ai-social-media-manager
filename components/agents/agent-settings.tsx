'use client'

import { useState, useEffect } from 'react'
import { Agent } from '@/lib/agents'
import { loadUserProfile, saveUserProfile, type PerAgentDefaults } from '@/lib/user-profile'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

interface PersonaConfig {
  role: string
  responsibilities: string
  voice: string
  rules: string
}

const EMPTY_PERSONA: PersonaConfig = {
  role: '',
  responsibilities: '',
  voice: '',
  rules: '',
}

export function AgentSettings({ agent, mode }: { agent: Agent, mode: 'memory' | 'settings' }) {
  const [memoryItems, setMemoryItems] = useState<{id: string, content: string, type: string}[]>([])
  const [creativity, setCreativity] = useState(50)
  const [tone, setTone] = useState(75)
  const [newItem, setNewItem] = useState('')
  const [persona, setPersona] = useState<PersonaConfig>(EMPTY_PERSONA)
  const [personaDirty, setPersonaDirty] = useState(false)
  const [platformDefaults, setPlatformDefaults] = useState<PerAgentDefaults>({})
  const [platformDirty, setPlatformDirty] = useState(false)

  useEffect(() => {
    // Memory read is isolated — a parse failure here won't affect creativity/tone
    try {
      const savedMemory = localStorage.getItem(`agent_${agent.id}_memory`)
      if (savedMemory) {
        const parsed = JSON.parse(savedMemory)
        const isValid =
          Array.isArray(parsed) &&
          parsed.every(
            (item) =>
              item &&
              typeof item.id === 'string' &&
              typeof item.content === 'string' &&
              typeof item.type === 'string'
          )
        setMemoryItems(isValid ? parsed : [])
      } else {
        setMemoryItems([])
      }
    } catch {
      setMemoryItems([])
    }

    // Creativity/tone reads are isolated — failures here don't clobber memory
    try {
      const savedCreativity = localStorage.getItem(`agent_${agent.id}_creativity`)
      if (savedCreativity) {
        const n = Number(savedCreativity)
        if (isFinite(n)) setCreativity(n)
      }

      const savedTone = localStorage.getItem(`agent_${agent.id}_tone`)
      if (savedTone) {
        const n = Number(savedTone)
        if (isFinite(n)) setTone(n)
      }
    } catch {
      // creativity/tone remain at useState defaults
    }

    // Platform-defaults read (lives inside the global user profile)
    try {
      const profile = loadUserProfile()
      setPlatformDefaults(profile.perAgent?.[agent.id] ?? {})
    } catch {
      setPlatformDefaults({})
    }

    // Persona read
    try {
      const savedPersona = localStorage.getItem(`agent_${agent.id}_persona`)
      if (savedPersona) {
        const parsed = JSON.parse(savedPersona) as Partial<PersonaConfig>
        setPersona({
          role: typeof parsed.role === 'string' ? parsed.role : '',
          responsibilities: typeof parsed.responsibilities === 'string' ? parsed.responsibilities : '',
          voice: typeof parsed.voice === 'string' ? parsed.voice : '',
          rules: typeof parsed.rules === 'string' ? parsed.rules : '',
        })
      }
    } catch {
      // ignore — keep defaults
    }
  }, [agent.id])

  const saveMemory = (items: typeof memoryItems) => {
    setMemoryItems(items)
    localStorage.setItem(`agent_${agent.id}_memory`, JSON.stringify(items))
  }

  const handleAddMemory = () => {
    if (!newItem.trim()) return
    const id =
      typeof crypto?.randomUUID === 'function'
        ? crypto.randomUUID()
        : Array.from(crypto.getRandomValues(new Uint8Array(16)))
            .map((b) => b.toString(16).padStart(2, '0'))
            .join('')
    const updated = [...memoryItems, { id, content: newItem, type: 'knowledge' }]
    saveMemory(updated)
    setNewItem('')
    toast.success("Memory updated")
  }

  const handleDeleteMemory = (id: string) => {
    const updated = memoryItems.filter(item => item.id !== id)
    saveMemory(updated)
    toast.info("Memory removed")
  }

  const handleCreativityChange = (val: number[]) => {
    setCreativity(val[0])
    localStorage.setItem(`agent_${agent.id}_creativity`, val[0].toString())
  }

  const handleToneChange = (val: number[]) => {
    setTone(val[0])
    localStorage.setItem(`agent_${agent.id}_tone`, val[0].toString())
  }

  const updatePersona = <K extends keyof PersonaConfig>(key: K, value: PersonaConfig[K]) => {
    setPersona((prev) => ({ ...prev, [key]: value }))
    setPersonaDirty(true)
  }

  const handleSavePersona = () => {
    localStorage.setItem(`agent_${agent.id}_persona`, JSON.stringify(persona))
    setPersonaDirty(false)
    toast.success(`${agent.name} Agent persona saved`)
  }

  const updatePlatformDefault = <K extends keyof PerAgentDefaults>(key: K, value: PerAgentDefaults[K]) => {
    setPlatformDefaults((prev) => ({ ...prev, [key]: value }))
    setPlatformDirty(true)
  }

  const handleSavePlatformDefaults = () => {
    const profile = loadUserProfile()
    const next = {
      ...profile,
      perAgent: { ...profile.perAgent, [agent.id]: platformDefaults },
    }
    saveUserProfile(next)
    setPlatformDirty(false)
    toast.success(`${agent.name} platform defaults saved`)
  }

  const handleResetPersona = () => {
    setPersona(EMPTY_PERSONA)
    localStorage.removeItem(`agent_${agent.id}_persona`)
    setPersonaDirty(false)
    toast.info('Persona reset to defaults')
  }

  const handleReset = () => {
    localStorage.removeItem(`agent_${agent.id}_memory`)
    localStorage.removeItem(`agent_${agent.id}_creativity`)
    localStorage.removeItem(`agent_${agent.id}_tone`)
    localStorage.removeItem(`agent_${agent.id}_persona`)
    window.location.reload()
  }

  if (mode === 'memory') {
    return (
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold tracking-tight">Long-term Memory</h2>
          <p className="text-muted-foreground">
            Teach the {agent.name} Agent about your brand, audience, and preferences. These insights persist across all chats.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Add New Insight</CardTitle>
            <CardDescription className="text-xs">Provide context the {agent.name} Agent should always remember.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Textarea
                placeholder="e.g. My target audience is marketing managers at mid-sized e-commerce companies..."
                value={newItem}
                onChange={(e) => setNewItem(e.target.value)}
                className="min-h-[100px]"
              />
            </div>
            <Button onClick={handleAddMemory} disabled={!newItem.trim()} className="w-full">
              Save to Memory
            </Button>
          </CardContent>
        </Card>

        {memoryItems.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border/60 p-8 text-center">
            <p className="text-sm font-medium text-foreground">No memories yet</p>
            <p className="text-xs text-muted-foreground mt-1">
              Anything you save here becomes part of every conversation with this agent.
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {memoryItems.map((item) => (
              <div key={item.id} className="flex items-start gap-4 rounded-lg border bg-background p-4 shadow-sm group">
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[10px] uppercase">{item.type}</Badge>
                    <span className="text-xs text-muted-foreground">Persisted</span>
                  </div>
                  <p className="text-sm leading-relaxed">{item.content}</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="opacity-0 group-hover:opacity-100 h-8 w-8 text-destructive hover:bg-destructive/10"
                  onClick={() => handleDeleteMemory(item.id)}
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold tracking-tight">Customize Persona</h2>
        <p className="text-muted-foreground">
          The {agent.name} Agent is named after the integration it connects to. Define its role, responsibilities, voice, and rules — they apply to every chat, draft, and scheduled run.
        </p>
      </div>

      {/* Persona block */}
      <Card>
        <CardHeader>
          <CardTitle>Role &amp; Responsibilities</CardTitle>
          <CardDescription>Tell the agent who it is for your account and what it owns.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="persona-role">Role title</Label>
            <Input
              id="persona-role"
              placeholder={`e.g. Senior ${agent.name} ghostwriter, B2B founder voice`}
              value={persona.role}
              onChange={(e) => updatePersona('role', e.target.value)}
            />
            <p className="text-[11px] text-muted-foreground">
              Default: <span className="font-medium text-foreground/80">{agent.role}</span>
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="persona-resp">Responsibilities</Label>
            <Textarea
              id="persona-resp"
              placeholder="What this agent owns. e.g. Draft 3 posts per week. Reply to DMs in my voice. Always check the brand guide before publishing."
              className="min-h-[110px]"
              value={persona.responsibilities}
              onChange={(e) => updatePersona('responsibilities', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="persona-voice">Brand voice</Label>
            <Textarea
              id="persona-voice"
              placeholder="Adjectives, phrases to use, phrases to avoid. e.g. Direct, dry-witty, no exclamation marks. Never use 'leverage' or 'unlock'."
              className="min-h-[110px]"
              value={persona.voice}
              onChange={(e) => updatePersona('voice', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="persona-rules">Operating rules</Label>
            <Textarea
              id="persona-rules"
              placeholder="Hard rules. e.g. Never publish without confirmation. Always include UTM parameters. Never reference competitors by name."
              className="min-h-[110px]"
              value={persona.rules}
              onChange={(e) => updatePersona('rules', e.target.value)}
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={handleResetPersona} className="text-xs">
              Reset persona
            </Button>
            <Button onClick={handleSavePersona} disabled={!personaDirty}>
              Save persona
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Personality Sliders</CardTitle>
          <CardDescription>Quick tuning that layers on top of your written persona.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Creativity vs. Precision</Label>
              <span className="text-xs text-muted-foreground">{creativity > 70 ? 'Wild' : creativity < 30 ? 'Strict' : 'Balanced'}</span>
            </div>
            <Slider value={[creativity]} onValueChange={handleCreativityChange} max={100} step={1} />
            <div className="flex justify-between text-[10px] text-muted-foreground uppercase tracking-widest font-medium">
              <span>Facts only</span>
              <span>Wildly Creative</span>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Tone Intensity</Label>
              <span className="text-xs text-muted-foreground">{tone > 70 ? 'Casual' : tone < 30 ? 'Formal' : 'Modern'}</span>
            </div>
            <Slider value={[tone]} onValueChange={handleToneChange} max={100} step={1} />
            <div className="flex justify-between text-[10px] text-muted-foreground uppercase tracking-widest font-medium">
              <span>Formal</span>
              <span>Highly Casual</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Platform Defaults</CardTitle>
          <CardDescription>
            Things this agent should always assume on {agent.name}. Saved into your user profile and applied to every draft, post, and tool call.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {agent.id === 'slack' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="slack-channel">Default channel</Label>
                <Input
                  id="slack-channel"
                  placeholder="#marketing"
                  value={platformDefaults.slackDefaultChannel ?? ''}
                  onChange={(e) => updatePlatformDefault('slackDefaultChannel', e.target.value)}
                />
                <p className="text-[11px] text-muted-foreground">Where notifications and digests post by default.</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="slack-escalation">Escalation channel</Label>
                <Input
                  id="slack-escalation"
                  placeholder="#incidents"
                  value={platformDefaults.slackEscalationChannel ?? ''}
                  onChange={(e) => updatePlatformDefault('slackEscalationChannel', e.target.value)}
                />
                <p className="text-[11px] text-muted-foreground">Used for urgent / on-call alerts.</p>
              </div>
            </>
          )}

          {agent.id === 'pinterest' && (
            <div className="space-y-2">
              <Label htmlFor="pinterest-board">Default board</Label>
              <Input
                id="pinterest-board"
                placeholder="e.g. Brand Inspiration / Product Pins"
                value={platformDefaults.pinterestDefaultBoard ?? ''}
                onChange={(e) => updatePlatformDefault('pinterestDefaultBoard', e.target.value)}
              />
              <p className="text-[11px] text-muted-foreground">New pins go here unless you specify otherwise.</p>
            </div>
          )}

          {(agent.id === 'gmail' || agent.id === 'outlook') && (
            <>
              <div className="space-y-2">
                <Label htmlFor="email-sender">Sender display name</Label>
                <Input
                  id="email-sender"
                  placeholder="Alex from Acme"
                  value={platformDefaults.emailSenderName ?? ''}
                  onChange={(e) => updatePlatformDefault('emailSenderName', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email-cadence">Follow-up cadence</Label>
                <Input
                  id="email-cadence"
                  placeholder="e.g. Day +3, +7, +14"
                  value={platformDefaults.emailFollowUpCadence ?? ''}
                  onChange={(e) => updatePlatformDefault('emailFollowUpCadence', e.target.value)}
                />
                <p className="text-[11px] text-muted-foreground">Default schedule for cold-email follow-ups.</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email-signature">Email signature</Label>
                <Textarea
                  id="email-signature"
                  rows={4}
                  placeholder="Alex Kim&#10;Founder, Acme&#10;acme.com"
                  value={platformDefaults.emailSignature ?? ''}
                  onChange={(e) => updatePlatformDefault('emailSignature', e.target.value)}
                />
              </div>
            </>
          )}

          {agent.id === 'linkedin' && (
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label className="text-sm">Always put links in the first comment</Label>
                <p className="text-[11px] text-muted-foreground">LinkedIn algorithm penalizes external links in the post body.</p>
              </div>
              <Switch
                checked={!!platformDefaults.linkedinPutLinksInComments}
                onCheckedChange={(v) => updatePlatformDefault('linkedinPutLinksInComments', v)}
              />
            </div>
          )}

          {agent.id === 'twitter' && (
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label className="text-sm">Avoid hashtags on X</Label>
                <p className="text-[11px] text-muted-foreground">Hashtags suppress reach in the X algorithm. Recommended: ON.</p>
              </div>
              <Switch
                checked={!!platformDefaults.twitterAvoidHashtags}
                onCheckedChange={(v) => updatePlatformDefault('twitterAvoidHashtags', v)}
              />
            </div>
          )}

          {agent.id === 'instagram' && (
            <div className="space-y-2">
              <Label htmlFor="ig-hashtag-count">Hashtag count per post</Label>
              <Input
                id="ig-hashtag-count"
                type="number"
                min={0}
                max={30}
                placeholder="10"
                value={platformDefaults.instagramHashtagCount ?? ''}
                onChange={(e) =>
                  updatePlatformDefault(
                    'instagramHashtagCount',
                    e.target.value === '' ? undefined : Number(e.target.value),
                  )
                }
              />
              <p className="text-[11px] text-muted-foreground">Instagram allows up to 30. Most pros use 8–15.</p>
            </div>
          )}

          {agent.id === 'tiktok' && (
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label className="text-sm">Always suggest a trending sound</Label>
                <p className="text-[11px] text-muted-foreground">Trending sounds dramatically boost FYP reach.</p>
              </div>
              <Switch
                checked={!!platformDefaults.tiktokDefaultTrendingSound}
                onCheckedChange={(v) => updatePlatformDefault('tiktokDefaultTrendingSound', v)}
              />
            </div>
          )}

          {/* Universal: UTM tagging */}
          {(agent.id === 'twitter' ||
            agent.id === 'instagram' ||
            agent.id === 'linkedin' ||
            agent.id === 'facebook' ||
            agent.id === 'tiktok' ||
            agent.id === 'pinterest' ||
            agent.id === 'snapchat' ||
            agent.id === 'gmail' ||
            agent.id === 'outlook') && (
            <div className="grid gap-4 sm:grid-cols-2 pt-2 border-t">
              <div className="space-y-2">
                <Label htmlFor="utm-source">Default UTM source</Label>
                <Input
                  id="utm-source"
                  placeholder={`e.g. ${agent.id}`}
                  value={platformDefaults.defaultUtmSource ?? ''}
                  onChange={(e) => updatePlatformDefault('defaultUtmSource', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="utm-medium">Default UTM medium</Label>
                <Input
                  id="utm-medium"
                  placeholder="e.g. social, email, organic"
                  value={platformDefaults.defaultUtmMedium ?? ''}
                  onChange={(e) => updatePlatformDefault('defaultUtmMedium', e.target.value)}
                />
              </div>
            </div>
          )}

          <div className="flex items-center justify-end pt-2">
            <Button onClick={handleSavePlatformDefaults} disabled={!platformDirty}>
              Save platform defaults
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Default Capabilities</CardTitle>
          <CardDescription>Toggle the default capability modules this agent starts with.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {agent.capabilities.map((cap) => (
            <div key={cap} className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label className="text-base">{cap}</Label>
                <p className="text-xs text-muted-foreground">Allow agent to use {cap.toLowerCase()} tools.</p>
              </div>
              <Switch defaultChecked />
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-destructive">Danger Zone</CardTitle>
          <CardDescription>Resetting will clear all persona, memory, and tuning for this agent.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" onClick={handleReset} className="text-destructive hover:bg-destructive/10 border-destructive/20 w-full">
            Reset {agent.name} Agent to defaults
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
