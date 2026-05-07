'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { Header } from '@/components/dashboard/header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

type Role = 'owner' | 'admin' | 'editor' | 'approver' | 'viewer'

interface Member {
  id: string
  name: string
  email: string
  role: Role
  avatar: string
  hue: string
  joinedAt: string
  lastActive: string
  agentAccess: string[] // which agent IDs they can use
}

interface Invite {
  id: string
  email: string
  role: Role
  invitedAt: string
  invitedBy: string
}

interface AuditEntry {
  id: string
  actor: string
  action: string
  target: string
  at: string
  type: 'permission' | 'publish' | 'auth' | 'config'
}

const ROLE_DEFS: Record<Role, { label: string; desc: string; color: string }> = {
  owner: {
    label: 'Owner',
    desc: 'Full control. Billing, deletion, role assignment, every agent.',
    color: 'bg-orange-500/10 text-orange-700 border-orange-200',
  },
  admin: {
    label: 'Admin',
    desc: 'Manage members, agents, connections, brand kit. No billing.',
    color: 'bg-violet-500/10 text-violet-700 border-violet-200',
  },
  editor: {
    label: 'Editor',
    desc: 'Draft, schedule, and publish through any agent they\'re granted.',
    color: 'bg-sky-500/10 text-sky-700 border-sky-200',
  },
  approver: {
    label: 'Approver',
    desc: 'Approve drafts before they publish. Cannot publish directly.',
    color: 'bg-emerald-500/10 text-emerald-700 border-emerald-200',
  },
  viewer: {
    label: 'Viewer',
    desc: 'Read-only access to dashboards, drafts, and analytics.',
    color: 'bg-slate-500/10 text-slate-700 border-slate-200',
  },
}

const ROLE_ORDER: Role[] = ['owner', 'admin', 'editor', 'approver', 'viewer']

const ALL_AGENTS = [
  { id: 'x', label: 'X Agent' },
  { id: 'meta', label: 'Meta Agent' },
  { id: 'linkedin', label: 'LinkedIn Agent' },
  { id: 'tiktok', label: 'TikTok Agent' },
  { id: 'gmail', label: 'Gmail Agent' },
  { id: 'outlook', label: 'Outlook Agent' },
]

const INITIAL_MEMBERS: Member[] = [
  {
    id: '1',
    name: 'Demi Laurence',
    email: 'demi@yourbrand.app',
    role: 'owner',
    avatar: 'D',
    hue: 'from-orange-500 to-pink-600',
    joinedAt: 'Founder',
    lastActive: 'Now',
    agentAccess: ALL_AGENTS.map((a) => a.id),
  },
  {
    id: '2',
    name: 'Priya Menon',
    email: 'priya@yourbrand.app',
    role: 'admin',
    avatar: 'PM',
    hue: 'from-violet-500 to-purple-600',
    joinedAt: 'Mar 2026',
    lastActive: '12m ago',
    agentAccess: ['x', 'meta', 'linkedin', 'tiktok'],
  },
  {
    id: '3',
    name: 'Theo Williams',
    email: 'theo@yourbrand.app',
    role: 'editor',
    avatar: 'TW',
    hue: 'from-sky-500 to-blue-600',
    joinedAt: 'Apr 2026',
    lastActive: '2h ago',
    agentAccess: ['x', 'linkedin'],
  },
  {
    id: '4',
    name: 'Olivia Park',
    email: 'olivia@yourbrand.app',
    role: 'approver',
    avatar: 'OP',
    hue: 'from-emerald-500 to-teal-600',
    joinedAt: 'Apr 2026',
    lastActive: '1d ago',
    agentAccess: ['x', 'meta', 'linkedin', 'tiktok', 'gmail', 'outlook'],
  },
  {
    id: '5',
    name: 'Jordan Hale',
    email: 'jordan@partnerco.com',
    role: 'viewer',
    avatar: 'JH',
    hue: 'from-slate-500 to-slate-700',
    joinedAt: 'May 2026',
    lastActive: '3d ago',
    agentAccess: [],
  },
]

const INITIAL_INVITES: Invite[] = [
  {
    id: 'inv-1',
    email: 'maya@yourbrand.app',
    role: 'editor',
    invitedAt: '2 days ago',
    invitedBy: 'Demi Laurence',
  },
  {
    id: 'inv-2',
    email: 'daniel@northwave.io',
    role: 'approver',
    invitedAt: '5h ago',
    invitedBy: 'Priya Menon',
  },
]

const SAMPLE_AUDIT: AuditEntry[] = [
  { id: 'a1', actor: 'Priya Menon', action: 'updated permissions on', target: 'X Agent', at: '8m ago', type: 'permission' },
  { id: 'a2', actor: 'Theo Williams', action: 'published post via', target: 'LinkedIn Agent', at: '34m ago', type: 'publish' },
  { id: 'a3', actor: 'Olivia Park', action: 'approved draft from', target: 'Meta Agent', at: '1h ago', type: 'publish' },
  { id: 'a4', actor: 'System', action: 'rotated OAuth token for', target: 'TikTok', at: '6h ago', type: 'auth' },
  { id: 'a5', actor: 'Demi Laurence', action: 'invited', target: 'maya@yourbrand.app · Editor', at: '2d ago', type: 'config' },
  { id: 'a6', actor: 'Demi Laurence', action: 'updated brand kit voice fingerprint', target: '', at: '3d ago', type: 'config' },
]

const TYPE_STYLE: Record<AuditEntry['type'], { dot: string; label: string }> = {
  permission: { dot: 'bg-violet-500', label: 'Permission' },
  publish: { dot: 'bg-emerald-500', label: 'Publish' },
  auth: { dot: 'bg-amber-500', label: 'Auth' },
  config: { dot: 'bg-sky-500', label: 'Config' },
}

export default function TeamPage() {
  const [workspaceName, setWorkspaceName] = useState('Your Brand')
  const [members, setMembers] = useState<Member[]>(INITIAL_MEMBERS)
  const [invites, setInvites] = useState<Invite[]>(INITIAL_INVITES)
  const [tab, setTab] = useState<'members' | 'invites' | 'roles' | 'audit'>('members')

  const [inviteOpen, setInviteOpen] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<Role>('editor')

  const counts = useMemo(() => {
    const c: Partial<Record<Role, number>> = {}
    for (const m of members) c[m.role] = (c[m.role] ?? 0) + 1
    return c
  }, [members])

  function changeRole(id: string, role: Role) {
    setMembers((prev) => prev.map((m) => (m.id === id ? { ...m, role } : m)))
    toast.success('Role updated')
  }

  function removeMember(id: string) {
    const m = members.find((x) => x.id === id)
    if (!m) return
    if (m.role === 'owner') {
      toast.error('Workspace must have an owner')
      return
    }
    setMembers((prev) => prev.filter((x) => x.id !== id))
    toast.success(`Removed ${m.name}`)
  }

  function toggleAgentAccess(id: string, agentId: string) {
    setMembers((prev) =>
      prev.map((m) => {
        if (m.id !== id) return m
        const has = m.agentAccess.includes(agentId)
        return { ...m, agentAccess: has ? m.agentAccess.filter((x) => x !== agentId) : [...m.agentAccess, agentId] }
      }),
    )
  }

  function sendInvite() {
    const email = inviteEmail.trim().toLowerCase()
    if (!email || !email.includes('@')) {
      toast.error('Enter a valid email')
      return
    }
    if (members.some((m) => m.email === email) || invites.some((i) => i.email === email)) {
      toast.error('Already invited or a member')
      return
    }
    setInvites((prev) => [
      {
        id: `inv-${Date.now()}`,
        email,
        role: inviteRole,
        invitedAt: 'just now',
        invitedBy: 'Demi Laurence',
      },
      ...prev,
    ])
    toast.success(`Invite sent to ${email}`)
    setInviteEmail('')
    setInviteRole('editor')
    setInviteOpen(false)
  }

  function revokeInvite(id: string) {
    setInvites((prev) => prev.filter((i) => i.id !== id))
    toast.message('Invite revoked')
  }

  function resendInvite(id: string) {
    const inv = invites.find((i) => i.id === id)
    if (inv) toast.success(`Resent to ${inv.email}`)
  }

  return (
    <div className="flex flex-col min-h-full">
      <Header
        title="Workspace & Team"
        description="Members, roles, invitations, agent access, and the audit log — in one place."
        action={
          <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
            <DialogTrigger asChild>
              <Button size="sm" style={{ background: 'linear-gradient(135deg, #EA580C, #DB2777)' }}>
                + Invite member
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Invite a teammate</DialogTitle>
                <DialogDescription>They&apos;ll get an email with a workspace invite link.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <div>
                  <Label htmlFor="inv-email" className="text-xs">Work email</Label>
                  <Input
                    id="inv-email"
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="teammate@yourbrand.app"
                    className="mt-1.5"
                    onKeyDown={(e) => e.key === 'Enter' && sendInvite()}
                  />
                </div>
                <div>
                  <Label className="text-xs">Role</Label>
                  <div className="mt-1.5 grid grid-cols-2 gap-2">
                    {(['admin', 'editor', 'approver', 'viewer'] as Role[]).map((r) => (
                      <button
                        key={r}
                        type="button"
                        aria-pressed={inviteRole === r}
                        onClick={() => setInviteRole(r)}
                        className={cn(
                          'rounded-lg border px-3 py-2 text-left text-xs transition-colors',
                          inviteRole === r
                            ? 'border-orange-500 bg-orange-500/5'
                            : 'border-border/60 hover:border-border',
                        )}
                      >
                        <p className="font-bold">{ROLE_DEFS[r].label}</p>
                        <p className="text-[10px] text-muted-foreground line-clamp-2 mt-0.5">{ROLE_DEFS[r].desc}</p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="ghost" onClick={() => setInviteOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={sendInvite}
                  style={{ background: 'linear-gradient(135deg, #EA580C, #DB2777)' }}
                >
                  Send invite
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="p-6 space-y-6">
        {/* Workspace meta */}
        <Card>
          <CardContent className="p-5 grid gap-4 sm:grid-cols-[1fr_auto] sm:items-center">
            <div className="flex items-center gap-4">
              <div
                className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-xl font-black text-white shadow-md"
                style={{ background: 'linear-gradient(135deg, #EA580C, #DB2777)' }}
              >
                {workspaceName.slice(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <Label htmlFor="ws-name" className="sr-only">Workspace name</Label>
                <Input
                  id="ws-name"
                  value={workspaceName}
                  onChange={(e) => setWorkspaceName(e.target.value)}
                  className="text-lg font-bold border-0 px-0 shadow-none focus-visible:ring-0 h-auto py-0.5"
                  aria-label="Workspace name"
                />
                <p className="text-xs text-muted-foreground">
                  postpilot.app/{workspaceName.trim().toLowerCase().replace(/\s+/g, '-') || 'your-workspace'} ·{' '}
                  <span className="text-emerald-600 font-medium">Pro plan</span>
                </p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3 sm:gap-6 text-center">
              <Stat label="Members" value={members.length} />
              <Stat label="Pending" value={invites.length} />
              <Stat label="Agents" value={ALL_AGENTS.length} />
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <div className="flex items-center gap-1.5 border-b border-border/60">
          {(
            [
              { id: 'members', label: 'Members', count: members.length },
              { id: 'invites', label: 'Pending invites', count: invites.length },
              { id: 'roles', label: 'Roles' },
              { id: 'audit', label: 'Audit log' },
            ] as const
          ).map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              aria-pressed={tab === t.id}
              className={cn(
                'relative px-4 py-2.5 text-sm font-semibold transition-colors -mb-px',
                tab === t.id
                  ? 'text-foreground border-b-2 border-orange-500'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {t.label}
              {'count' in t && t.count !== undefined && (
                <span
                  className={cn(
                    'ml-2 rounded-full px-1.5 py-0.5 text-[10px] font-bold',
                    tab === t.id ? 'bg-orange-500/15 text-orange-700' : 'bg-muted text-muted-foreground',
                  )}
                >
                  {t.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Members */}
        {tab === 'members' && (
          <Card>
            <CardContent className="p-0">
              {members.map((m, i) => (
                <div
                  key={m.id}
                  className={cn(
                    'flex items-center gap-4 px-5 py-4',
                    i !== members.length - 1 && 'border-b border-border/50',
                  )}
                >
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white bg-gradient-to-br ${m.hue}`}
                  >
                    {m.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold truncate">{m.name}</p>
                      {m.role === 'owner' && (
                        <Badge className="text-[9px] bg-orange-500/15 text-orange-700 border-orange-200">You</Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{m.email}</p>
                    <p className="mt-1 text-[10px] text-muted-foreground">
                      Joined {m.joinedAt} · Last active {m.lastActive} · {m.agentAccess.length}/{ALL_AGENTS.length} agents
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <select
                      value={m.role}
                      onChange={(e) => changeRole(m.id, e.target.value as Role)}
                      disabled={m.role === 'owner'}
                      aria-label={`Role for ${m.name}`}
                      className={cn(
                        'h-8 rounded-md border border-border/60 bg-background px-2 text-xs font-semibold disabled:opacity-50',
                      )}
                    >
                      {ROLE_ORDER.map((r) => (
                        <option key={r} value={r}>
                          {ROLE_DEFS[r].label}
                        </option>
                      ))}
                    </select>
                    {m.role !== 'owner' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 text-xs text-muted-foreground hover:text-rose-600"
                        onClick={() => removeMember(m.id)}
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Invites */}
        {tab === 'invites' && (
          <Card>
            <CardContent className="p-0">
              {invites.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-sm text-muted-foreground">No pending invites.</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-4"
                    onClick={() => setInviteOpen(true)}
                  >
                    + Invite someone
                  </Button>
                </div>
              ) : (
                invites.map((inv, i) => (
                  <div
                    key={inv.id}
                    className={cn(
                      'flex items-center gap-4 px-5 py-4',
                      i !== invites.length - 1 && 'border-b border-border/50',
                    )}
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted text-base text-muted-foreground">
                      ✉
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold truncate">{inv.email}</p>
                      <p className="text-[11px] text-muted-foreground">
                        {ROLE_DEFS[inv.role].label} · invited by {inv.invitedBy} · {inv.invitedAt}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => resendInvite(inv.id)}>
                        Resend
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 text-xs text-muted-foreground hover:text-rose-600"
                        onClick={() => revokeInvite(inv.id)}
                      >
                        Revoke
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        )}

        {/* Roles */}
        {tab === 'roles' && (
          <div className="space-y-6">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {ROLE_ORDER.map((r) => (
                <Card key={r}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <Badge className={cn('text-[10px] px-2 py-0.5', ROLE_DEFS[r].color)}>
                        {ROLE_DEFS[r].label}
                      </Badge>
                      <span className="text-[11px] text-muted-foreground">
                        {counts[r] ?? 0} {counts[r] === 1 ? 'member' : 'members'}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-muted-foreground leading-relaxed">{ROLE_DEFS[r].desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Agent access matrix</CardTitle>
                <CardDescription>
                  Decide which agents each member can use. Owners always have access to everything.
                </CardDescription>
              </CardHeader>
              <CardContent className="overflow-x-auto p-0">
                <table className="w-full text-sm">
                  <thead className="bg-muted/40">
                    <tr>
                      <th className="text-left px-5 py-3 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                        Member
                      </th>
                      {ALL_AGENTS.map((a) => (
                        <th
                          key={a.id}
                          className="text-center px-3 py-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground whitespace-nowrap"
                        >
                          {a.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {members
                      .filter((m) => m.role !== 'owner')
                      .map((m, i) => (
                        <tr key={m.id} className={i % 2 === 0 ? '' : 'bg-muted/20'}>
                          <td className="px-5 py-3">
                            <div className="flex items-center gap-2">
                              <div
                                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white bg-gradient-to-br ${m.hue}`}
                              >
                                {m.avatar}
                              </div>
                              <div className="min-w-0">
                                <p className="text-xs font-semibold truncate">{m.name}</p>
                                <p className="text-[10px] text-muted-foreground">{ROLE_DEFS[m.role].label}</p>
                              </div>
                            </div>
                          </td>
                          {ALL_AGENTS.map((a) => {
                            const has = m.agentAccess.includes(a.id)
                            return (
                              <td key={a.id} className="text-center px-3 py-3">
                                <button
                                  type="button"
                                  onClick={() => toggleAgentAccess(m.id, a.id)}
                                  aria-pressed={has}
                                  aria-label={`${has ? 'Revoke' : 'Grant'} ${a.label} for ${m.name}`}
                                  className={cn(
                                    'inline-flex h-6 w-6 items-center justify-center rounded-md transition-colors',
                                    has
                                      ? 'bg-emerald-500/15 text-emerald-700 hover:bg-emerald-500/25'
                                      : 'bg-muted text-muted-foreground/40 hover:bg-muted/80',
                                  )}
                                >
                                  {has ? '✓' : '·'}
                                </button>
                              </td>
                            )
                          })}
                        </tr>
                      ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Audit */}
        {tab === 'audit' && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base">Activity</CardTitle>
                <CardDescription>Every meaningful action in this workspace. Streamable to a SIEM on Business plans.</CardDescription>
              </div>
              <Link
                href="/security#subprocessors"
                className="text-[11px] font-semibold text-orange-600 hover:underline"
              >
                Compliance →
              </Link>
            </CardHeader>
            <CardContent className="p-0">
              {SAMPLE_AUDIT.map((e, i) => (
                <div
                  key={e.id}
                  className={cn(
                    'flex items-center gap-3 px-5 py-3 text-sm',
                    i !== SAMPLE_AUDIT.length - 1 && 'border-b border-border/40',
                  )}
                >
                  <span className={cn('h-2 w-2 rounded-full shrink-0', TYPE_STYLE[e.type].dot)} />
                  <div className="flex-1 min-w-0">
                    <p className="truncate">
                      <span className="font-semibold">{e.actor}</span>{' '}
                      <span className="text-muted-foreground">{e.action}</span>{' '}
                      {e.target && <span className="font-semibold">{e.target}</span>}
                    </p>
                  </div>
                  <Badge variant="outline" className="text-[10px] shrink-0">
                    {TYPE_STYLE[e.type].label}
                  </Badge>
                  <span className="text-[10px] text-muted-foreground shrink-0 w-16 text-right">{e.at}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <p className="text-2xl font-black tabular-nums">{value}</p>
      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{label}</p>
    </div>
  )
}
