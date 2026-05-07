'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

const CRISIS_KEY = 'postpilot_crisis_mode_v1'

interface CrisisState {
  active: boolean
  reason?: string
  pausedBy?: string
  pausedAt?: string // ISO
}

function readCrisis(): CrisisState {
  if (typeof window === 'undefined') return { active: false }
  try {
    const raw = window.localStorage.getItem(CRISIS_KEY)
    if (!raw) return { active: false }
    const parsed = JSON.parse(raw) as CrisisState
    return parsed && typeof parsed.active === 'boolean' ? parsed : { active: false }
  } catch {
    return { active: false }
  }
}

function writeCrisis(state: CrisisState) {
  try {
    window.localStorage.setItem(CRISIS_KEY, JSON.stringify(state))
  } catch {
    // ignore
  }
}

/**
 * The compact button — lives in the dashboard top bar. Glows when armed.
 */
export function CrisisModeButton() {
  const [state, setState] = useState<CrisisState>({ active: false })
  const [open, setOpen] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [reason, setReason] = useState('')

  // Hydrate + sync across tabs
  useEffect(() => {
    setState(readCrisis())
    function onStorage(e: StorageEvent) {
      if (e.key === CRISIS_KEY) setState(readCrisis())
    }
    function onCustom() {
      setState(readCrisis())
    }
    window.addEventListener('storage', onStorage)
    window.addEventListener('crisis:changed', onCustom)
    return () => {
      window.removeEventListener('storage', onStorage)
      window.removeEventListener('crisis:changed', onCustom)
    }
  }, [])

  function arm() {
    if (!reason.trim()) {
      toast.error('Add a reason — it goes in the audit log.')
      return
    }
    const next: CrisisState = {
      active: true,
      reason: reason.trim(),
      pausedBy: 'Demi Laurence',
      pausedAt: new Date().toISOString(),
    }
    writeCrisis(next)
    setState(next)
    setOpen(false)
    setConfirmOpen(false)
    setReason('')
    window.dispatchEvent(new Event('crisis:changed'))
    toast.success('Crisis mode ON', {
      description: 'Auto-Pilot paused. Scheduled posts held. Approvals frozen.',
    })
  }

  function disarm() {
    const next: CrisisState = { active: false }
    writeCrisis(next)
    setState(next)
    setOpen(false)
    window.dispatchEvent(new Event('crisis:changed'))
    toast.success('Crisis mode OFF', {
      description: 'Auto-Pilot resumed. Held posts will publish on their next slot.',
    })
  }

  const minutesActive = state.pausedAt
    ? Math.max(1, Math.floor((Date.now() - new Date(state.pausedAt).getTime()) / 60_000))
    : 0

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          'inline-flex items-center gap-1.5 rounded-xl px-2.5 h-9 text-[11px] font-bold uppercase tracking-widest transition-all',
          state.active
            ? 'text-rose-700 dark:text-rose-300 shadow-[0_0_0_1px_rgba(244,63,94,0.4)]'
            : 'text-muted-foreground hover:text-rose-600',
        )}
        style={
          state.active
            ? { background: 'oklch(0.65 0.22 18 / 0.12)' }
            : undefined
        }
        aria-label={state.active ? 'Crisis mode is on — click to manage' : 'Crisis mode (panic stop)'}
      >
        <span className="relative flex h-2 w-2">
          {state.active && (
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-500 opacity-70" />
          )}
          <span
            className={cn(
              'relative inline-flex h-2 w-2 rounded-full',
              state.active ? 'bg-rose-500' : 'bg-muted-foreground/40',
            )}
          />
        </span>
        {state.active ? 'Crisis · ON' : 'Crisis'}
      </button>

      {/* Manage / Arm dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {state.active ? '🛑 Crisis mode is ON' : 'Crisis mode'}
              {state.active && (
                <Badge className="bg-rose-500/15 text-rose-700 border-rose-200 text-[10px]">
                  paused {minutesActive}m
                </Badge>
              )}
            </DialogTitle>
            <DialogDescription>
              One tap to halt every agent and the entire scheduled queue. Use it during a PR incident, an outage, or
              any time you need to be sure nothing goes out without your eyes on it.
            </DialogDescription>
          </DialogHeader>

          {state.active ? (
            <>
              <div className="rounded-2xl border border-rose-200 bg-rose-50/40 dark:bg-rose-500/5 p-4 space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-widest text-rose-700 dark:text-rose-300">
                  Reason
                </p>
                <p className="text-sm">{state.reason}</p>
                <p className="text-[10px] text-muted-foreground pt-1">
                  Armed by {state.pausedBy} · {state.pausedAt && new Date(state.pausedAt).toLocaleString()}
                </p>
              </div>
              <div className="rounded-xl border border-border/60 bg-muted/30 p-4 text-sm space-y-1.5">
                <p className="font-semibold">While crisis mode is on:</p>
                <ul className="text-xs text-muted-foreground space-y-1 leading-relaxed">
                  <li>· Auto-Pilot is paused across every agent</li>
                  <li>· The scheduled queue is held — no posts go live</li>
                  <li>· Approvals are frozen — drafts stay drafts</li>
                  <li>· Inbox AI replies require manual send</li>
                  <li>· Every action is recorded in the audit log</li>
                </ul>
              </div>
              <DialogFooter>
                <Button variant="ghost" onClick={() => setOpen(false)}>
                  Keep paused
                </Button>
                <Button
                  onClick={disarm}
                  style={{ background: 'linear-gradient(135deg, #10B981, #14B8A6)' }}
                >
                  Resume normal operation
                </Button>
              </DialogFooter>
            </>
          ) : (
            <>
              <div className="rounded-2xl border border-border/60 bg-muted/30 p-4 text-sm space-y-2">
                <p className="font-semibold">Arming will:</p>
                <ul className="text-xs text-muted-foreground space-y-1 leading-relaxed">
                  <li>· Pause Auto-Pilot for every agent</li>
                  <li>· Hold every scheduled post</li>
                  <li>· Freeze approvals and inbox auto-replies</li>
                  <li>· Notify owners + admins via email and Slack</li>
                  <li>· Log a workspace audit entry</li>
                </ul>
              </div>
              <div>
                <Label htmlFor="crisis-reason" className="text-xs">
                  Reason <span className="text-muted-foreground/70">(required for the audit log)</span>
                </Label>
                <Textarea
                  id="crisis-reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={3}
                  placeholder="e.g. Investigating a customer complaint about pricing — pausing until resolved."
                  className="mt-1.5 resize-none"
                />
              </div>
              <DialogFooter>
                <Button variant="ghost" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    if (!reason.trim()) {
                      toast.error('Add a reason — it goes in the audit log.')
                      return
                    }
                    setConfirmOpen(true)
                  }}
                  className="text-white"
                  style={{ background: 'linear-gradient(135deg, #F43F5E, #BE123C)' }}
                  disabled={!reason.trim()}
                >
                  Arm crisis mode
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Final confirmation */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>You sure?</DialogTitle>
            <DialogDescription>
              This stops every agent and every scheduled post in the workspace. Type <strong>PAUSE</strong> to confirm.
            </DialogDescription>
          </DialogHeader>
          <ConfirmTyping onConfirmed={arm} />
        </DialogContent>
      </Dialog>
    </>
  )
}

function ConfirmTyping({ onConfirmed }: { onConfirmed: () => void }) {
  const [text, setText] = useState('')
  return (
    <div className="space-y-3">
      <input
        autoFocus
        value={text}
        onChange={(e) => setText(e.target.value)}
        aria-label="Type PAUSE to confirm"
        placeholder="Type PAUSE"
        className="h-9 w-full rounded-md border border-border/60 bg-background px-3 text-sm font-mono"
      />
      <Button
        onClick={onConfirmed}
        disabled={text.trim().toUpperCase() !== 'PAUSE'}
        className="w-full text-white"
        style={{ background: 'linear-gradient(135deg, #F43F5E, #BE123C)' }}
      >
        Pause everything
      </Button>
    </div>
  )
}

/**
 * Persistent banner. Shows on every dashboard page when Crisis Mode is ON
 * so it can never be forgotten about. Lives at the top of the layout.
 */
export function CrisisBanner() {
  const [state, setState] = useState<CrisisState>({ active: false })

  useEffect(() => {
    setState(readCrisis())
    function sync() {
      setState(readCrisis())
    }
    window.addEventListener('storage', sync)
    window.addEventListener('crisis:changed', sync)
    return () => {
      window.removeEventListener('storage', sync)
      window.removeEventListener('crisis:changed', sync)
    }
  }, [])

  if (!state.active) return null

  return (
    <div
      role="alert"
      className="flex items-center justify-center gap-3 px-4 py-2 text-[12px] font-semibold text-white"
      style={{ background: 'linear-gradient(90deg, #BE123C, #F43F5E)' }}
    >
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white/70 opacity-70" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-white" />
      </span>
      <span>
        <strong>Crisis mode is ON.</strong> Every agent paused, every scheduled post held.
      </span>
      <span className="opacity-75 text-[11px]">·</span>
      <span className="opacity-90 truncate max-w-md">{state.reason}</span>
    </div>
  )
}
