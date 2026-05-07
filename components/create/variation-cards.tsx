'use client'

import { cn } from '@/lib/utils'
import { PLATFORMS, type PlatformId } from '@/lib/constants/platforms'
import { PlatformIcon } from './platform-selector'
import type { ContentVariation } from '@/lib/schemas/content'

interface VariationCardsProps {
  variations: ContentVariation[]
  selectedId: string | null
  onSelect: (id: string) => void
  selectedPlatform: PlatformId
}

function ScoreBadge({ score }: { score?: number }) {
  if (!score) return null
  const cls =
    score >= 8
      ? 'bg-emerald-50 text-emerald-700 border-emerald-200/60'
      : score >= 6
      ? 'bg-amber-50 text-amber-700 border-amber-200/60'
      : 'bg-red-50 text-red-600 border-red-200/60'
  return (
    <span className={cn('rounded-full border px-2 py-0.5 text-[11px] font-semibold tabular-nums', cls)}>
      {score}/10
    </span>
  )
}

export function VariationCards({ variations, selectedId, onSelect, selectedPlatform }: VariationCardsProps) {
  const platform = PLATFORMS[selectedPlatform]

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {variations.map((variation, index) => {
        const isSelected = selectedId === variation.id
        return (
          <button
            key={variation.id}
            type="button"
            aria-pressed={isSelected}
            onClick={() => onSelect(variation.id)}
            className={cn(
              'group relative flex flex-col rounded-xl border p-4 text-left transition-all duration-200',
              isSelected
                ? 'border-transparent shadow-lg'
                : 'border-border/60 hover:border-orange-200 hover:shadow-md hover:-translate-y-0.5'
            )}
            style={
              isSelected
                ? { boxShadow: '0 0 0 2px #EA580C, 0 8px 24px #EA580C22', background: '#FFF7F4' }
                : undefined
            }
          >
            {/* Header */}
            <div className="mb-3 flex items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-xs font-medium text-muted-foreground">
                  V{index + 1}
                </span>
                {variation.angle && (
                  <span
                    className="rounded-full px-2 py-0.5 text-[11px] font-medium text-white"
                    style={{ background: 'linear-gradient(135deg, #EA580C 0%, #DB2777 100%)' }}
                  >
                    {variation.angle}
                  </span>
                )}
                {variation.hookType && (
                  <span className="rounded-full bg-muted/80 border border-border/40 px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                    {variation.hookType}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <ScoreBadge score={variation.score} />
                {isSelected && (
                  <span
                    className="flex h-5 w-5 items-center justify-center rounded-full"
                    style={{ background: 'linear-gradient(135deg, #EA580C 0%, #DB2777 100%)' }}
                  >
                    <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  </span>
                )}
              </div>
            </div>

            {/* Content */}
            <p className="flex-1 text-sm leading-relaxed">{variation.content}</p>

            {/* Hashtags */}
            {variation.hashtags.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1">
                {variation.hashtags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-orange-50 px-2 py-0.5 text-xs font-medium text-orange-600 border border-orange-200/60"
                  >
                    #{tag}
                  </span>
                ))}
                {variation.hashtags.length > 3 && (
                  <span className="text-xs text-muted-foreground">+{variation.hashtags.length - 3}</span>
                )}
              </div>
            )}

            {/* Character count */}
            <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
              <PlatformIcon platform={selectedPlatform} className="h-3 w-3" />
              <span className={cn(variation.content.length > platform.maxLength ? 'text-destructive font-medium' : '')}>
                {variation.content.length}/{platform.maxLength}
              </span>
            </div>

            {/* Platform tip */}
            {variation.platformTip && (
              <div
                className="mt-2 rounded-xl px-3 py-2"
                style={{ background: '#FFF3EC', border: '1px solid #FDDCCA' }}
              >
                <p className="text-[11px] font-medium" style={{ color: '#EA580C' }}>
                  💡 {variation.platformTip}
                </p>
              </div>
            )}
          </button>
        )
      })}
    </div>
  )
}
