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

const FONT_SANS = "'DM Sans', sans-serif"
const FONT_SERIF = "'DM Serif Display', serif"

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
 style={{
 display: 'flex',
 alignItems: 'center',
 gap: 6,
 background: 'transparent',
 border: 'none',
 color: '#C9973A',
 fontSize: 13,
 fontWeight: 600,
 cursor: 'pointer',
 padding: '8px 0',
 fontFamily: FONT_SANS,
 }}
 aria-expanded={expanded}
 >
 {expanded ? '− Hide' : '+ Show'} alignment breakdown
 </button>

 {expanded && (
 <div style={{
 marginTop: 12,
 background: '#F7F4F0',
 border: '1px solid #E2E8F0',
 borderRadius: 12,
 padding: 16,
 }}>
 <div style={{ display: 'grid', gap: 12 }}>
 {DIMENSION_ORDER.map(key => (
 <DimensionRow key={key} dimensionKey={key} data={dimensions[key]} />
 ))}
 </div>
 <div style={{
 marginTop: 16,
 paddingTop: 12,
 borderTop: '1px solid #E2E8F0',
 fontSize: 11,
 color: '#64748B',
 lineHeight: 1.6,
 fontFamily: FONT_SANS,
 }}>
 Each dimension is weighted and multiplied by its confidence level
 before contributing to the overall alignment score. Dimensions with
 no data are excluded from the calculation, not assumed.
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
 data: DimensionScoreShape | undefined
}) {
 const meta = DIMENSION_META[dimensionKey]

 if (!data || data.score == null) {
 return (
 <div style={{
 display: 'grid',
 gridTemplateColumns: '160px 1fr',
 gap: 16,
 alignItems: 'center',
 padding: '8px 0',
 borderBottom: '1px solid #E2E8F0',
 }}>
 <div>
 <div style={{
 fontSize: 13,
 fontWeight: 600,
 color: '#0D1B3E',
 fontFamily: FONT_SANS,
 }}>
 {meta.label}
 </div>
 <div style={{ fontSize: 10, color: '#94A3B8', marginTop: 2 }}>
 {Math.round(meta.weight * 100)}% weight
 </div>
 </div>
 <div style={{ fontSize: 12, color: '#94A3B8', fontStyle: 'italic' }}>
 No data — this dimension excluded from score
 </div>
 </div>
 )
 }

 const score = data.score
 const conf = data.confidence_multiplier
 const tier = tierFromMultiplier(conf)

 return (
 <div style={{
 display: 'grid',
 gridTemplateColumns: '160px 1fr',
 gap: 16,
 alignItems: 'center',
 padding: '8px 0',
 borderBottom: '1px solid #E2E8F0',
 }}>
 <div>
 <div style={{
 fontSize: 13,
 fontWeight: 600,
 color: '#0D1B3E',
 fontFamily: FONT_SANS,
 }}>
 {meta.label}
 </div>
 <div style={{ fontSize: 10, color: '#94A3B8', marginTop: 2 }}>
 {Math.round(meta.weight * 100)}% weight
 </div>
 </div>

 <div>
 <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
 <div style={{
 fontSize: 20,
 fontWeight: 700,
 color: toneColor(score),
 fontFamily: FONT_SERIF,
 minWidth: 40,
 }}>
 {score}
 </div>
 <div style={{
 flex: 1,
 height: 6,
 background: '#E2E8F0',
 borderRadius: 3,
 overflow: 'hidden',
 }}>
 <div style={{
 width: `${score}%`,
 height: '100%',
 background: toneColor(score),
 transition: 'width 200ms',
 }} />
 </div>
 </div>

 <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
 <TierBadge tier={tier} />
 <span style={{ fontSize: 10, color: '#64748B' }}>
 {confidenceLabel(conf)} · {Math.round(conf * 100)}% confidence
 </span>
 </div>

 {data.attributes_used.length > 0 && (
 <div style={{ fontSize: 10, color: '#94A3B8', marginTop: 4 }}>
 Based on: {data.attributes_used.map(a => a.replace(/_/g, ' ')).join(', ')}
 </div>
 )}
 </div>
 </div>
 )
}

function toneColor(score: number): string {
 if (score >= 80) return '#15803D'
 if (score >= 60) return '#C9973A'
 return '#B45309'
}
