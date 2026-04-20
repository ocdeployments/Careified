// components/matching/DimensionBreakdown.tsx
'use client'
import { useState } from 'react'
import {
  DIMENSION_META,
  DIMENSION_ORDER,
  confidenceLabel,
  tierFromMultiplier,
} from '@/lib/matching/dimension-meta'
import type { DimensionKey } from '@/lib/matching/types'
import { TierBadge } from './AlignmentBadge'
import { ChevronDown, ChevronUp } from 'lucide-react'

type DimensionScoreShape = {
  score: number | null
  confidence: string
  confidence_multiplier: number
  source: string
  weight_applied: number
  attributes_used: string[]
}

type Dimensions = Record<DimensionKey, DimensionScoreShape>

export function DimensionBreakdown({
  dimensions,
  defaultExpanded = false,
}: {
  dimensions: Dimensions
  defaultExpanded?: boolean
}) {
  const [expanded, setExpanded] = useState(defaultExpanded)

  return (
    <div>
      <button
        onClick={() => setExpanded(e => !e)}
        aria-expanded={expanded}
        className="flex items-center gap-1.5 text-gold text-[13px] font-semibold py-2 hover:text-gold-warm transition-colors focus-visible:ring-2 focus-visible:ring-gold focus-visible:outline-none rounded"
      >
        {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        {expanded ? 'Hide' : 'Show'} alignment breakdown
      </button>

      {expanded && (
        <div className="mt-3 bg-cream border border-slate-200 rounded-xl p-4">
          <div className="grid gap-3">
            {DIMENSION_ORDER.map(key => (
              <DimensionRow
                key={key}
                dimensionKey={key}
                data={dimensions[key]}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function DimensionRow({
  dimensionKey,
  data,
}: {
  dimensionKey: DimensionKey
  data: DimensionScoreShape
}) {
  const meta = DIMENSION_META[dimensionKey]
  const tier = tierFromMultiplier(data.confidence_multiplier)
  const pct = data.score != null ? Math.round(data.score) : null

  return (
    <div className="flex items-start gap-3">
      {/* Icon */}
      <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center flex-shrink-0 text-base">
        {meta?.icon ?? '•'}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-1">
          <span className="text-[13px] font-semibold text-navy">{meta?.label ?? dimensionKey}</span>
          <TierBadge tier={tier} />
          <span className="text-[10px] text-slate-400">{confidenceLabel(data.confidence_multiplier)}</span>
        </div>

        {/* Score bar */}
        <div className="flex items-center gap-2">
          <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
            <div
              className={[
                'h-full rounded-full transition-all duration-500',
                pct != null && pct >= 80 ? 'bg-green-500' :
                pct != null && pct >= 60 ? 'bg-amber-400' :
                pct != null && pct >= 40 ? 'bg-orange-400' :
                'bg-red-400',
              ].join(' ')}
              style={{ width: pct != null ? `${pct}%` : '0%' }}
              role="progressbar"
              aria-valuenow={pct ?? 0}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          </div>
          <span className="text-[12px] font-semibold text-navy w-8 text-right">
            {pct != null ? pct : '—'}
          </span>
        </div>

        {/* Source */}
        {data.source && (
          <div className="text-[10px] text-slate-400 mt-0.5">
            Source: {data.source}
            {data.attributes_used.length > 0 && ` · ${data.attributes_used.slice(0, 3).join(', ')}`}
          </div>
        )}
      </div>
    </div>
  )
}
