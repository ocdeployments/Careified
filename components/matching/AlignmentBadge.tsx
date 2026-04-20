// components/matching/AlignmentBadge.tsx
import type { CSSProperties } from 'react'

const FONT_SERIF = "'DM Serif Display', serif"
const FONT_SANS = "'DM Sans', sans-serif"

export function AlignmentScoreBadge({
 score,
 confidence,
 size = 'md',
}: {
 score: number | null
 confidence: number | null
 size?: 'sm' | 'md' | 'lg'
}) {
 const dim = size === 'lg' ? 110 : size === 'sm' ? 72 : 90

 const { bg, color } = toneFor(score)

 return (
 <div
 style={{
 background: bg,
 borderRadius: 12,
 padding: size === 'sm' ? '10px 14px' : '16px 20px',
 textAlign: 'center',
 minWidth: dim,
 height: 'fit-content',
 }}
 aria-label={
 score == null
 ? 'Alignment score unavailable'
 : `Alignment score ${score} of 100`
 }
 >
 <div
 style={{
 fontSize: size === 'lg' ? 36 : size === 'sm' ? 22 : 28,
 fontWeight: 700,
 color,
 fontFamily: FONT_SERIF,
 lineHeight: 1,
 }}
 >
 {score ?? '—'}
 </div>
 <div
 style={{
 fontSize: size === 'sm' ? 9 : 10,
 color,
 textTransform: 'uppercase',
 letterSpacing: 0.5,
 marginTop: 4,
 fontFamily: FONT_SANS,
 }}
 >
 Alignment
 </div>
 {confidence != null && (
 <ConfidenceBar confidence={confidence} size={size} />
 )}
 </div>
 )
}

export function ConfidenceBar({
 confidence,
 size = 'md',
}: {
 confidence: number
 size?: 'sm' | 'md' | 'lg'
}) {
 const pct = Math.round(confidence * 100)
 const barColor =
 confidence >= 0.7 ? '#15803D' :
 confidence >= 0.5 ? '#C9973A' :
 '#94A3B8'

 return (
 <div style={{ marginTop: 8 }}>
 <div
 style={{
 height: 3,
 background: '#E2E8F0',
 borderRadius: 2,
 overflow: 'hidden',
 }}
 role="progressbar"
 aria-valuemin={0}
 aria-valuemax={100}
 aria-valuenow={pct}
 aria-label={`Confidence ${pct}%`}
 >
 <div
 style={{
 width: `${pct}%`,
 height: '100%',
 background: barColor,
 transition: 'width 200ms',
 }}
 />
 </div>
 <div
 style={{
 fontSize: size === 'sm' ? 9 : 10,
 color: barColor,
 marginTop: 4,
 fontFamily: FONT_SANS,
 letterSpacing: 0.3,
 }}
 >
 {pct}% confidence
 </div>
 </div>
 )
}

export function TierBadge({ tier }: { tier: 1 | 2 | 3 | 4 }) {
 const map: Record<1 | 2 | 3 | 4, { label: string; bg: string; color: string; border: string }> = {
 1: { label: 'System verified', bg: '#DCFCE7', color: '#15803D', border: '#86EFAC' },
 2: { label: 'Document on file', bg: '#DBEAFE', color: '#1D4ED8', border: '#93C5FD' },
 3: { label: 'Reference confirmed', bg: '#FEF3C7', color: '#92400E', border: '#FCD34D' },
 4: { label: 'Self-reported', bg: '#F1F5F9', color: '#64748B', border: '#CBD5E1' },
 }
 const t = map[tier]
 return (
 <span
 style={{
 display: 'inline-flex',
 alignItems: 'center',
 gap: 4,
 fontSize: 10,
 fontWeight: 600,
 background: t.bg,
 color: t.color,
 border: `1px solid ${t.border}`,
 padding: '2px 8px',
 borderRadius: 10,
 fontFamily: FONT_SANS,
 letterSpacing: 0.3,
 }}
 title={`Tier ${tier} — ${t.label}`}
 >
 {t.label}
 </span>
 )
}

export function AlignmentDisclaimerBanner({
 disclaimer,
 compact = false,
}: {
 disclaimer: string
 compact?: boolean
}) {
 const style: CSSProperties = {
 background: '#F7F4F0',
 border: '1px solid #E2E8F0',
 borderRadius: 10,
 padding: compact ? '8px 12px' : '12px 16px',
 fontSize: compact ? 11 : 12,
 color: '#64748B',
 fontFamily: FONT_SANS,
 lineHeight: 1.5,
 }
 return (
 <div style={style} role="note">
 <strong style={{ color: '#0D1B3E', fontWeight: 600 }}>
 How alignment scores work:&nbsp;
 </strong>
 {disclaimer}
 </div>
 )
}

// Shared tone calculator
function toneFor(score: number | null) {
 if (score == null) return { bg: '#F1F5F9', color: '#64748B' }
 if (score >= 80) return { bg: '#DCFCE7', color: '#15803D' }
 if (score >= 60) return { bg: '#FDF6EC', color: '#C9973A' }
 return { bg: '#FEF3C7', color: '#B45309' }
}
