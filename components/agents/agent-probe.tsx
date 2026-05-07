'use client'

import { useEffect, useMemo, useState } from 'react'
import type { Agent } from '@/lib/agents'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

/**
 * First-run agent probe.
 *
 * The first time a workspace opens an agent, it knows nothing specific to
 * the user. Rather than guessing, the agent asks five high-leverage
 * questions — each answer becomes a high-confidence explicit memory,
 * keyed to the agent. Skip any question. Skip the whole thing.
 *
 * The probe stores its answers under the same memory v2 key as the
 * adaptive memory surface, so the agent picks them up immediately on the
 * next chat or generation.
 */

interface Probe {
  id: string
  question: string
  hint: string
  placeholder: string
  required?: boolean
}

function probesFor(agent: Agent): Probe[] {
  const shared: Probe[] = [
    {
      id: 'audience',
      question: `Who's listening on ${platformName(agent)}?`,
      hint: 'Who do you want this agent to talk to? Concrete > vague.',
      placeholder: 'Founders and indie operators (1–20 people) who care about doing more with fewer tools.',
      required: true,
    },
    {
      id: 'success',
      question: 'What does a "win" look like in 90 days?',
      hint: 'Authority, leads, audience growth, partnerships, sales — pick the real one.',
      placeholder: '300 inbound replies from qualified founders + 5 demo requests/wk.',
      required: true,
    },
    {
      id: 'sample',
      question: 'Paste 1–3 things you\'ve written that sound like you',
      hint: `${agent.name} mirrors rhythm, vocabulary, and hooks from this.`,
      placeholder: 'A recent post, an email you sent, a Slack message — anything that sounds like you on a good day.',
    },
    {
      id: 'never',
      question: 'What are 2–3 hard nos?',
      hint: 'Words, claims, formats, or topics this agent should never touch.',
      placeholder: 'Never use "synergy" or "leverage". Never make claims about competitors.',
    },
  ]

  if (agent.id === 'tiktok') {
    shared.push({
      id: 'format',
      question: 'Talking head, voice-over, or faceless?',
      hint: 'Pick your default. The agent will deviate when a topic warrants it.',
      placeholder: 'Voice-over with on-screen text. Talking head once a week max.',
    })
    return shared
  }
  if (agent.id === 'gmail' || agent.id === 'outlook') {
    shared.push({
      id: 'send-from',
      question: 'How do you sign your emails?',
      hint: 'Sign-off the agent should default to.',
      placeholder: '— Demi · Founder, Your Brand',
    })
    return shared
  }
  return shared
}

function platformName(agent: Agent): string {
  switch (agent.id) {
    case 'x':
      return 'X'
    case 'meta':
      return 'Instagram & Facebook'
    case 'linkedin':
      return 'LinkedIn'
    case 'tiktok':
      return 'TikTok'
    case 'gmail':
      return 'Gmail'
    case 'outlook':
      return 'Outlook'
    default:
      return agent.role
  }
}

const SKIPPED_KEY = (agentId: string) => `postpilot_agent_${agentId}_probe_skipped_v1`

export function AgentProbe({ agent }: { agent: Agent }) {
  const probes = useMemo(() => probesFor(agent), [agent])
  const [stepIdx, setStepIdx] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [show, setShow] = useState<boolean | null>(null)
  const memoryKey = `postpilot_agent_${agent.id}_memoryv2`

  useEffect(() => {
    // Show the probe only when (1) the user hasn't dismissed it AND
    // (2) the adaptive memory has no explicit user-authored entries.
    if (typeof window === 'undefined') {
      setShow(false)
      return
    }
    try {
      const skipped = localStorage.getItem(SKIPPED_KEY(agent.id)) === '1'
      if (skipped) return setShow(false)
      const raw = localStorage.getItem(memoryKey)
      if (!raw) return setShow(true)
      const parsed = JSON.parse(raw) as Array<{ source?: string }>
      const hasExplicit = Array.isArray(parsed) && parsed.some((m) => m?.source === 'explicit')
      setShow(!hasExplicit)
    } catch {
      setShow(true)
    }
  }, [agent.id, memoryKey])

  function dismissForever() {
    try {
      localStorage.setItem(SKIPPED_KEY(agent.id), '1')
    } catch {
      // ignore
    }
    setShow(false)
  }

  function commit() {
    try {
      const raw = localStorage.getItem(memoryKey)
      const existing = raw ? (JSON.parse(raw) as unknown[]) : []
      const list = Array.isArray(existing) ? existing : []
      const newRows = probes
        .filter((p) => answers[p.id]?.trim())
        .map((p) => ({
          id: `m-probe-${p.id}-${Date.now()}`,
          source: 'explicit',
          confidence: 'high',
          body: `${prefixFor(p.id)}${answers[p.id].trim()}`,
          createdAt: 'just now',
          active: true,
          pinned: p.required,
        }))
      localStorage.setItem(memoryKey, JSON.stringify([...newRows, ...list]))
      toast.success(`${agent.name} is calibrated`, {
        description: `Learned ${newRows.length} new ${newRows.length === 1 ? 'thing' : 'things'} about you.`,
      })
      dismissForever()
    } catch {
      toast.error('Could not save — local storage blocked')
    }
  }

  if (!show) return null

  const step = probes[stepIdx]
  const value = answers[step.id] ?? ''
  const total = probes.length
  const isLast = stepIdx === total - 1
  const canNext = !step.required || value.trim().length > 0

  return (
    <Card className="overflow-hidden border-orange-300/50">
      <div
        className="px-5 pt-5 pb-3"
        style={{
          background: 'linear-gradient(135deg, oklch(0.652 0.214 36 / 0.06), oklch(0.588 0.238 352 / 0.04))',
        }}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-orange-700 dark:text-orange-300">
              Calibrate {agent.name}
            </p>
            <p className="mt-1 text-sm font-semibold leading-snug">
              Five short answers and {agent.name} will start sounding like you.
            </p>
          </div>
          <button
            type="button"
            onClick={dismissForever}
            className="text-[10px] font-semibold text-muted-foreground hover:text-foreground"
            aria-label="Skip probe"
          >
            Skip for now
          </button>
        </div>
        <div className="mt-3 flex items-center gap-2">
          {probes.map((_, i) => (
            <span
              key={i}
              className={cn(
                'h-1 flex-1 rounded-full transition-colors',
                i < stepIdx ? 'bg-orange-500' : i === stepIdx ? 'bg-orange-500/60' : 'bg-muted',
              )}
            />
          ))}
        </div>
      </div>
      <CardContent className="p-5 space-y-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            Step {stepIdx + 1} of {total}
            {!step.required && <span className="ml-2 text-muted-foreground/60">· optional</span>}
          </p>
          <h3 className="mt-1 text-base font-bold leading-snug">{step.question}</h3>
          <p className="mt-1 text-xs text-muted-foreground">{step.hint}</p>
        </div>
        <div>
          <Label htmlFor="probe-answer" className="sr-only">
            Answer
          </Label>
          <Textarea
            id="probe-answer"
            value={value}
            onChange={(e) => setAnswers((prev) => ({ ...prev, [step.id]: e.target.value }))}
            rows={4}
            placeholder={step.placeholder}
            className="resize-none"
          />
        </div>
        <div className="flex items-center justify-between gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setStepIdx((s) => Math.max(0, s - 1))}
            disabled={stepIdx === 0}
          >
            Back
          </Button>
          <div className="flex items-center gap-2">
            {!step.required && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  setStepIdx((s) => (isLast ? s : Math.min(total - 1, s + 1)))
                }
              >
                Skip this
              </Button>
            )}
            <Button
              size="sm"
              onClick={() => {
                if (isLast) {
                  commit()
                } else {
                  setStepIdx((s) => Math.min(total - 1, s + 1))
                }
              }}
              disabled={!canNext}
              style={canNext ? { background: 'linear-gradient(135deg, #EA580C, #DB2777)' } : undefined}
            >
              {isLast ? 'Save calibration' : 'Continue →'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function prefixFor(id: string): string {
  switch (id) {
    case 'audience': return 'Audience: '
    case 'success': return 'Success in 90 days: '
    case 'sample': return 'Voice sample: '
    case 'never': return 'Hard rules: '
    case 'format': return 'Default format: '
    case 'send-from': return 'Default sign-off: '
    default: return ''
  }
}
