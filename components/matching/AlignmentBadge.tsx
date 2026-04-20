// components/matching/AlignmentBadge.tsx
'use client'

function toneFor(score: number | null): { bg: string; textClass: string; color: string } {
  if (score == null) return { bg: 'bg-slate-100', textClass: 'text-slate-400', color: '#94A3B8' }
  if (score >= 80) return { bg: 'bg-green-50', textClass: 'text-green-700', color: '#15803D' }
  if (score >= 60) return { bg: 'bg-amber-50', textClass: 'text-amber-700', color: '#B45309' }
  if (score >= 40) return { bg: 'bg-orange-50', textClass: 'text-orange-600', color: '#EA580C' }
  return { bg: 'bg-red-50', textClass: 'text-red-600', color: '#DC2626' }
}

export function AlignmentScoreBadge({
  score,
  confidence,
  size = 'md',
}: {
  score: number | null
  confidence: number | null
  size?: 'sm' | 'md' | 'lg'
}) {
  const { bg, textClass } = toneFor(score)

  const sizeClasses = {
    sm: { wrap: 'px-3 py-2 rounded-xl min-w-[72px]', num: 'text-[22px]', label: 'text-[9px]' },
    md: { wrap: 'px-4 py-3 rounded-xl min-w-[90px]', num: 'text-[28px]', label: 'text-[10px]' },
    lg: { wrap: 'px-5 py-4 rounded-2xl min-w-[110px]', num: 'text-[36px]', label: 'text-[10px]' },
  }[size]

  return (
    <div
      className={`${bg} ${sizeClasses.wrap} text-center h-fit`}
      aria-label={score == null ? 'Alignment score unavailable' : `Alignment score ${score} of 100`}
    >
      <div className={`${textClass} ${sizeClasses.num} font-bold font-serif leading-none`}>
        {score ?? '—'}
      </div>
      <div className={`${textClass} ${sizeClasses.label} uppercase tracking-wide mt-1`}>
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
    confidence >= 0.7 ? 'bg-green-600' :
    confidence >= 0.5 ? 'bg-gold' :
    'bg-slate-300'

  return (
    <div className="mt-2">
      <div className="h-[3px] bg-slate-200 rounded-full overflow-hidden">
        <div
          className={`h-full ${barColor} rounded-full transition-all duration-500`}
          style={{ width: `${pct}%` }}
          role="progressbar"
          aria-valuenow={pct ?? 0}
          aria-label={`Confidence: ${pct}%`}
        />
      </div>
      <div className="text-[9px] text-slate-400 mt-0.5">{pct}% confidence</div>
    </div>
  )
}

export function TierBadge({ tier }: { tier: string }) {
  const styles: Record<string, string> = {
    high:   'bg-green-50 text-green-700 border-green-200',
    medium: 'bg-amber-50 text-amber-700 border-amber-200',
    low:    'bg-red-50 text-red-600 border-red-200',
  }
  const cls = styles[tier] ?? 'bg-slate-100 text-slate-500 border-slate-200'
  return (
    <span className={`inline-block px-2 py-0.5 rounded-full border text-[10px] font-semibold uppercase tracking-wide ${cls}`}>
      {tier}
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
  if (!disclaimer) return null
  return (
    <div className={`bg-amber-50 border border-amber-200 rounded-xl text-amber-800 ${compact ? 'px-3 py-2 text-xs' : 'px-4 py-3 text-sm'}`}>
      <span className="font-semibold">Note: </span>{disclaimer}
    </div>
  )
}
