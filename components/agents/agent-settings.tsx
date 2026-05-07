'use client'

import { useState, useEffect } from 'react'
import { Agent } from '@/lib/agents'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

export function AgentSettings({ agent, mode }: { agent: Agent, mode: 'memory' | 'settings' }) {
  const [memoryItems, setMemoryItems] = useState<{id: string, content: string, type: string}[]>([])
  const [creativity, setCreativity] = useState(50)
  const [tone, setTone] = useState(75)
  const [newItem, setNewItem] = useState('')

  useEffect(() => {
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
        setMemoryItems([
          { id: '1', content: 'Target audience: B2B Founders in SaaS', type: 'knowledge' },
          { id: '2', content: 'Avoid using corporate jargon or buzzwords', type: 'style' },
        ])
      }

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
      setMemoryItems([])
    }
  }, [agent.id])

  const saveMemory = (items: typeof memoryItems) => {
    setMemoryItems(items)
    localStorage.setItem(`agent_${agent.id}_memory`, JSON.stringify(items))
  }

  const handleAddMemory = () => {
    if (!newItem.trim()) return
    const updated = [...memoryItems, { id: crypto.randomUUID(), content: newItem, type: 'knowledge' }]
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

  const handleReset = () => {
    localStorage.removeItem(`agent_${agent.id}_memory`)
    localStorage.removeItem(`agent_${agent.id}_creativity`)
    localStorage.removeItem(`agent_${agent.id}_tone`)
    window.location.reload()
  }

  if (mode === 'memory') {
    return (
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold tracking-tight">Long-term Memory</h2>
          <p className="text-muted-foreground">
            Teach {agent.name} about your brand, audience, and preferences. These insights persist across all chats.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Add New Insight</CardTitle>
            <CardDescription className="text-xs">Provide context {agent.name} should always remember.</CardDescription>
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
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold tracking-tight">Agent Configuration</h2>
        <p className="text-muted-foreground">
          Fine-tune {agent.name}&apos;s personality and operational parameters.
        </p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Personality Sliders</CardTitle>
            <CardDescription>Adjust how {agent.name} communicates with you.</CardDescription>
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
            <CardTitle>Capabilities</CardTitle>
            <CardDescription>Enable or disable specific skill modules for this agent.</CardDescription>
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
            <CardDescription>Resetting will clear all memory and custom settings.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" onClick={handleReset} className="text-destructive hover:bg-destructive/10 border-destructive/20 w-full">
              Reset {agent.name} to Defaults
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
