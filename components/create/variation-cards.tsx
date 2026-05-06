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

export function VariationCards({ variations, selectedId, onSelect, selectedPlatform }: VariationCardsProps) {
  const platform = PLATFORMS[selectedPlatform]

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {variations.map((variation, index) => (
        <button
          key={variation.id}
          type="button"
          onClick={() => onSelect(variation.id)}
          className={cn(
            'group relative flex flex-col rounded-xl border p-4 text-left transition-all',
            selectedId === variation.id
              ? 'border-primary bg-primary/5 ring-2 ring-primary'
              : 'border-border hover:border-primary/50 hover:bg-muted/50'
          )}
        >
          {/* Header */}
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-muted-foreground">
                Variation {index + 1}
              </span>
              {variation.angle && (
                <span className="rounded-md bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">
                  {variation.angle}
                </span>
              )}
            </div>
            {selectedId === variation.id && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary">
                <svg className="h-3 w-3 text-primary-foreground" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              </span>
            )}
          </div>

          {/* Content */}
          <p className="flex-1 text-sm leading-relaxed">
            {variation.content}
          </p>

          {/* Hashtags */}
          {variation.hashtags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1">
              {variation.hashtags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="rounded-md bg-primary/10 px-2 py-0.5 text-xs text-primary"
                >
                  #{tag}
                </span>
              ))}
              {variation.hashtags.length > 3 && (
                <span className="text-xs text-muted-foreground">
                  +{variation.hashtags.length - 3} more
                </span>
              )}
            </div>
          )}

          {/* Character count */}
          <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
            <PlatformIcon platform={selectedPlatform} className="h-3 w-3" />
            <span className={cn(
              variation.content.length > platform.maxLength ? 'text-destructive font-medium' : ''
            )}>
              {variation.content.length}/{platform.maxLength}
            </span>
          </div>
        </button>
      ))}
    </div>
  )
}
