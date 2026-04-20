'use client'

import { useState, useEffect } from 'react'
import { Star, CheckCircle, XCircle } from 'lucide-react'

interface RatingsDisplayProps {
  caregiverId: string
}

interface RatingData {
  id: string
  agencyName: string
  reliability: number
  punctuality: number
  warmth: number
  dignity: number
  hygiene: number
  skillsMatch: number
  wouldReengage: boolean
  publicComment: string | null
  createdAt: string
}

function CategoryBar({ label, value }: { label: string; value: number }) {
  const pct = Math.round((value / 5) * 100)
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm text-slate-700">{label}</span>
        <span className="text-sm font-medium text-slate-900">{value.toFixed(1)}</span>
      </div>
      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-amber-400 rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
          role="progressbar"
          aria-valuenow={pct}
          aria-label={`${label}: ${value.toFixed(1)} out of 5`}
        />
      </div>
    </div>
  )
}

export function RatingsDisplay({ caregiverId }: RatingsDisplayProps) {
  const [ratings, setRatings] = useState<RatingData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/caregivers/${caregiverId}/ratings`)
      .then(res => res.json())
      .then(data => { setRatings(data.ratings || []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [caregiverId])

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-100 p-6">
        <h2 className="text-lg font-bold text-navy mb-4">Ratings &amp; Reviews</h2>
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-slate-200 rounded w-3/4" />
          <div className="h-4 bg-slate-200 rounded w-1/2" />
        </div>
      </div>
    )
  }

  if (!ratings || ratings.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-100 p-6">
        <h2 className="text-lg font-bold text-navy mb-4">Ratings &amp; Reviews</h2>
        <p className="text-sm text-slate-500">No ratings yet</p>
      </div>
    )
  }

  const averages = {
    reliability: ratings.reduce((s, r) => s + r.reliability, 0) / ratings.length,
    punctuality: ratings.reduce((s, r) => s + r.punctuality, 0) / ratings.length,
    warmth:      ratings.reduce((s, r) => s + r.warmth, 0) / ratings.length,
    dignity:     ratings.reduce((s, r) => s + r.dignity, 0) / ratings.length,
    hygiene:     ratings.reduce((s, r) => s + r.hygiene, 0) / ratings.length,
    skillsMatch: ratings.reduce((s, r) => s + r.skillsMatch, 0) / ratings.length,
  }
  const avg = Object.values(averages).reduce((s, v) => s + v, 0) / 6
  const reengagePct = Math.round((ratings.filter(r => r.wouldReengage).length / ratings.length) * 100)

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-6">
      <h2 className="text-lg font-bold text-navy mb-4">Ratings &amp; Reviews</h2>

      <div className="flex items-start gap-6 mb-6">
        <div className="text-center flex-shrink-0">
          <div className="text-4xl font-bold text-navy">{avg.toFixed(1)}</div>
          <div className="flex items-center gap-0.5 mt-1">
            {[1,2,3,4,5].map(star => (
              <Star key={star} className={`w-4 h-4 ${star <= Math.floor(avg) ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} />
            ))}
          </div>
          <p className="text-xs text-slate-500 mt-1">{ratings.length} ratings</p>
        </div>
        <div className="flex-1 grid grid-cols-2 gap-x-6 gap-y-3">
          <CategoryBar label="Reliability" value={averages.reliability} />
          <CategoryBar label="Punctuality" value={averages.punctuality} />
          <CategoryBar label="Warmth" value={averages.warmth} />
          <CategoryBar label="Dignity" value={averages.dignity} />
          <CategoryBar label="Hygiene" value={averages.hygiene} />
          <CategoryBar label="Skills Match" value={averages.skillsMatch} />
        </div>
      </div>

      <div className="mb-4 p-3 bg-slate-50 rounded-xl">
        <p className="text-sm font-medium text-slate-700 flex items-center gap-1">
          <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
          {reengagePct}% would re-engage this caregiver
        </p>
      </div>

      <div className="space-y-4">
        {ratings.map(rating => (
          <div key={rating.id} className="border-t border-slate-100 pt-4">
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="text-sm font-medium text-navy">{rating.agencyName || 'Agency'}</p>
                <p className="text-xs text-slate-500">{new Date(rating.createdAt).toLocaleDateString()}</p>
              </div>
              {rating.wouldReengage ? (
                <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full bg-green-100 text-green-700">
                  <CheckCircle className="w-3 h-3" /> Would re-engage
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full bg-red-100 text-red-700">
                  <XCircle className="w-3 h-3" /> Would not
                </span>
              )}
            </div>
            <div className="flex items-center gap-1 mb-3">
              {[1,2,3,4,5].map(star => (
                <Star key={star} className={`w-4 h-4 ${star <= Math.floor(avg) ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} />
              ))}
              <span className="text-sm text-slate-600 ml-2">{avg.toFixed(1)}</span>
            </div>
            {rating.publicComment && (
              <p className="text-sm text-slate-700 italic">&ldquo;{rating.publicComment}&rdquo;</p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
