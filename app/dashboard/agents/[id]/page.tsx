'use client'

import { use, useState } from 'react'
import { getAgentById } from '@/lib/agents'
import { cn } from '@/lib/utils'
import { AgentChat } from '@/components/agents/agent-chat'
import { WorkflowComposer } from '@/components/agents/workflow-composer'
import { AgentSettings } from '@/components/agents/agent-settings'
import { PremiumGate } from '@/components/agents/premium-gate'

const TABS = ['Chat', 'Workflows', 'Memory', 'Settings'] as const
type Tab = (typeof TABS)[number]

export default function AgentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const agent = getAgentById(id)
  const [activeTab, setActiveTab] = useState<Tab>('Chat')

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* Agent header bar */}
      <div className="border-b" style={{ background: 'oklch(0.135 0.018 48)' }}>
        <div className="flex h-16 items-center px-4 gap-4">
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-base font-bold text-white shadow-md"
            style={{ background: 'linear-gradient(135deg, #EA580C 0%, #DB2777 100%)' }}
          >
            {agent.avatar}
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <h1 className="text-base font-semibold leading-none text-white">{agent.name}</h1>
              {agent.premium && (
                <span className="inline-flex items-center rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-amber-400">
                  Premium
                </span>
              )}
            </div>
            <p className="mt-0.5 text-xs text-white/60">{agent.role}</p>
          </div>

          <div
            className="ml-auto flex items-center gap-0.5 rounded-lg p-1"
            style={{ background: 'oklch(0.195 0.025 48)' }}
          >
            {TABS.map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={cn(
                  'h-7 rounded-md px-4 text-xs font-medium transition-all duration-200',
                  activeTab === tab ? 'text-white shadow-sm' : 'text-white/50 hover:text-white/80'
                )}
                style={
                  activeTab === tab
                    ? { background: 'linear-gradient(135deg, #EA580C 0%, #DB2777 100%)' }
                    : undefined
                }
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden flex flex-col">
        {activeTab === 'Chat' && (
          <div className="flex-1 overflow-hidden">
            <PremiumGate agentPremium={agent.premium}>
              <AgentChat agent={agent} />
            </PremiumGate>
          </div>
        )}
        {activeTab === 'Workflows' && (
          <div className="flex-1 overflow-y-auto p-6">
            <PremiumGate agentPremium={agent.premium}>
              <WorkflowComposer agent={agent} />
            </PremiumGate>
          </div>
        )}
        {activeTab === 'Memory' && (
          <div className="flex-1 overflow-y-auto p-6">
            <AgentSettings agent={agent} mode="memory" />
          </div>
        )}
        {activeTab === 'Settings' && (
          <div className="flex-1 overflow-y-auto p-6">
            <AgentSettings agent={agent} mode="settings" />
          </div>
        )}
      </div>
    </div>
  )
}
