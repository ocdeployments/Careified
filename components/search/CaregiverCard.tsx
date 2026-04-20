'use client'
import Link from 'next/link'
import { User, MapPin, Star } from 'lucide-react'
import { CaregiverSearchResult } from '@/lib/types/search'
import { AlignmentScoreBadge } from '@/components/matching/AlignmentBadge'
import { ShortlistButton } from './ShortlistButton'

interface CaregiverCardProps {
  caregiver: CaregiverSearchResult
}

export function CaregiverCard({ caregiver }: CaregiverCardProps) {
  const {
    id, firstName, lastName, specialties, languages,
    yearsExperience, city, state, availabilityLabel,
    score, alignment_score, overall_confidence,
  } = caregiver

  return (
    <div className="group relative bg-white rounded-2xl border border-slate-100 hover:border-gold/40 hover:shadow-lg hover:shadow-gold/10 hover:-translate-y-0.5 transition-all duration-200">
      {/* Shortlist button */}
      <div className="absolute top-3 right-3 z-10">
        <ShortlistButton caregiverId={id} />
      </div>

      <Link
        href={`/agency/profile/${id}`}
        className="block p-5 focus-visible:ring-2 focus-visible:ring-gold focus-visible:outline-none rounded-2xl"
        aria-label={`View profile of ${firstName} ${lastName}`}
      >
        {/* Header row */}
        <div className="flex items-start gap-3 mb-4 pr-8">
          {/* Avatar */}
          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0">
            <User size={20} className="text-slate-400" />
          </div>
          {/* Name + location */}
          <div className="flex-1 min-w-0">
            <div className="text-[15px] font-semibold text-navy truncate">
              {firstName} {lastName}
            </div>
            {(city || state) && (
              <div className="flex items-center gap-1 mt-0.5 text-xs text-slate-500">
                <MapPin size={11} />
                {[city, state].filter(Boolean).join(', ')}
              </div>
            )}
          </div>
          {/* Score badge */}
          <AlignmentScoreBadge
            score={alignment_score ?? score ?? null}
            confidence={overall_confidence ?? null}
            size="sm"
          />
        </div>

        {/* Availability */}
        {availabilityLabel && (
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-50 text-green-700 text-[11px] font-semibold mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500" aria-hidden="true" />
            {availabilityLabel}
          </div>
        )}

        {/* Experience */}
        {yearsExperience > 0 && (
          <div className="flex items-center gap-1 text-xs text-slate-500 mb-3">
            <Star size={11} className="text-gold" />
            {yearsExperience} yr{yearsExperience !== 1 ? 's' : ''} experience
          </div>
        )}

        {/* Specialties */}
        {specialties.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {specialties.slice(0, 3).map(s => (
              <span
                key={s}
                className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[11px] font-medium"
              >
                {s}
              </span>
            ))}
            {specialties.length > 3 && (
              <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-400 text-[11px]">
                +{specialties.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Languages */}
        {languages.length > 0 && (
          <div className="mt-2 text-[11px] text-slate-400">
            {languages.slice(0, 3).join(' · ')}
          </div>
        )}
      </Link>
    </div>
  )
}
