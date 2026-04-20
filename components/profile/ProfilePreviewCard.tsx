// Careified — Live Profile Preview Card
// Shown in split view during profile builder
// Updates in real time as caregiver fills in data

'use client'

import { MapPin, Briefcase, Globe, Zap, Home, Car } from 'lucide-react'
import { motion } from 'framer-motion'

interface PreviewData {
  firstName?: string
  lastName?: string
  preferredName?: string
  jobTitle?: string
  city?: string
  state?: string
  gender?: string
  bio?: string
  languages?: string[]
  credentials?: string[]
  specializations?: string[]
  services?: string[]
  availabilityStatus?: string
  placementTypes?: string[]
  willingLiveIn?: boolean
  openToUrgent?: boolean
  hasVehicle?: boolean
  yearsExperience?: number
  hourlyRate?: number
  profileCompletionPct?: number
}

interface ProfilePreviewCardProps {
  data: PreviewData
  step: number
}

export default function ProfilePreviewCard({ data, step }: ProfilePreviewCardProps) {

  const displayName = data.preferredName
    ? `${data.preferredName} ${data.lastName || ''}`.trim()
    : `${data.firstName || ''} ${data.lastName || ''}`.trim()

  const initials = `${data.firstName?.[0] || ''}${data.lastName?.[0] || ''}`.toUpperCase() || '?'

  const completion = data.profileCompletionPct || Math.min((step - 1) * 17, 85)

  const tier =
    completion >= 80 ? { label: 'Professional', colorClass: 'text-blue-900 bg-blue-50' } :
    completion >= 60 ? { label: 'Verified',      colorClass: 'text-green-700 bg-green-50' } :
    completion >= 40 ? { label: 'Basic',          colorClass: 'text-slate-500 bg-slate-50' } :
                       { label: 'Incomplete',     colorClass: 'text-slate-400 bg-slate-50' }

  const availLabel =
    data.availabilityStatus === 'available_now'          ? 'Available now' :
    data.availabilityStatus === 'open_to_opportunities'  ? 'Open to opportunities' :
    data.availabilityStatus === 'available_from'         ? 'Available from date' :
    null

  const availClasses =
    data.availabilityStatus === 'available_now'         ? 'text-green-700 bg-green-50' :
    data.availabilityStatus === 'open_to_opportunities' ? 'text-amber-600 bg-amber-50' :
    'text-slate-500 bg-slate-50'

  const availDotClass =
    data.availabilityStatus === 'available_now'         ? 'bg-green-600' :
    data.availabilityStatus === 'open_to_opportunities' ? 'bg-amber-500' :
    'bg-slate-400'

  const isEmpty = !data.firstName && !data.lastName

  return (
    <div className="sticky top-[140px] font-sans">

      {/* Label */}
      <div className="flex items-center gap-1.5 mb-3 text-[10px] font-bold tracking-[0.08em] uppercase text-slate-400">
        <span className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />
        Live preview — what agencies see
      </div>

      {/* Card */}
      <motion.div
        whileHover={{ scale: 1.02, boxShadow: '0 12px 32px rgba(13, 27, 62, 0.12)' }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className={[
          'bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-[0_8px_24px_rgba(13,27,62,0.06)] transition-all duration-300',
          isEmpty ? 'opacity-50' : 'opacity-100',
        ].join(' ')}
      >
        {/* Gold accent bar */}
        <div className="h-[3px] bg-gradient-to-r from-gold to-gold-warm" />

        <div className="p-4">

          {/* Header */}
          <div className="flex gap-3 mb-3">

            {/* Avatar */}
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gold to-gold-warm flex items-center justify-center text-base font-black text-navy shrink-0">
              {initials}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className={[
                    'text-[32px] font-black m-0 mb-0.5 tracking-tight leading-[1.1] min-h-[36px]',
                    isEmpty ? 'bg-slate-100 rounded text-transparent' : 'text-navy',
                  ].join(' ')}>
                    {displayName || 'Your name'}
                  </h3>
                  {data.jobTitle ? (
                    <p className="text-[11px] text-slate-500 mb-1">
                      {data.jobTitle}
                    </p>
                  ) : data.credentials?.[0] ? (
                    <p className="text-[11px] text-slate-500 mb-1">
                      {data.credentials[0]}
                    </p>
                  ) : null}
                  <div className="flex gap-2 flex-wrap">
                    {data.credentials?.[0] && (
                      <span className="text-[10px] font-bold text-blue-900 bg-blue-50 px-[7px] py-0.5 rounded-[5px]">
                        {data.credentials[0]}
                      </span>
                    )}
                    {(data.yearsExperience || 0) > 0 && (
                      <span className="flex items-center gap-[3px] text-[11px] text-slate-500">
                        <Briefcase size={10} /> {data.yearsExperience}y
                      </span>
                    )}
                    {data.city && (
                      <span className="flex items-center gap-[3px] text-[11px] text-slate-500">
                        <MapPin size={10} /> {data.city}{data.state ? `, ${data.state}` : ''}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Availability */}
          {availLabel && (
            <div className="flex flex-wrap gap-[5px] mb-2.5">
              <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-[3px] rounded-full ${availClasses}`}>
                <span className={`w-[5px] h-[5px] rounded-full ${availDotClass}`} />
                {availLabel}
              </span>
              {data.openToUrgent && (
                <span className="inline-flex items-center gap-[3px] text-[10px] font-semibold px-2 py-[3px] rounded-full bg-orange-50 text-orange-700">
                  <Zap size={9} /> Urgent
                </span>
              )}
              {data.willingLiveIn && (
                <span className="inline-flex items-center gap-[3px] text-[10px] font-semibold px-2 py-[3px] rounded-full bg-violet-50 text-violet-700">
                  <Home size={9} /> Live-in
                </span>
              )}
            </div>
          )}

          {/* Specialties */}
          {(data.specializations || []).length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2.5">
              {(data.specializations || []).slice(0, 3).map((s, i) => (
                <span key={i} className="text-[10px] px-2 py-[3px] rounded-[5px] bg-slate-50 text-slate-600 border border-slate-200">
                  {s}
                </span>
              ))}
              {(data.specializations || []).length > 3 && (
                <span className="text-[10px] text-slate-400 p-[3px]">
                  +{(data.specializations || []).length - 3} more
                </span>
              )}
            </div>
          )}

          {/* Languages */}
          {(data.languages || []).length > 0 && (
            <div className="flex items-center gap-[5px] mb-2.5">
              <Globe size={11} className="text-slate-400" />
              <span className="text-[11px] text-slate-500">
                {(data.languages || []).slice(0, 3).join(' · ')}
              </span>
            </div>
          )}

          {/* Bio snippet */}
          {data.bio && (
            <p className="text-[11px] text-slate-500 leading-[1.5] mb-2.5 line-clamp-2">
              {data.bio}
            </p>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between pt-2.5 border-t border-slate-100">
            <div className="flex gap-2">
              {data.hasVehicle && (
                <span className="flex items-center gap-[3px] text-[10px] text-slate-500">
                  <Car size={11} /> Vehicle
                </span>
              )}
              {data.hourlyRate && (
                <span className="text-[10px] text-slate-500">
                  ${data.hourlyRate}/hr
                </span>
              )}
            </div>
            <span className={`text-[10px] font-bold px-[7px] py-0.5 rounded-[5px] ${tier.colorClass}`}>
              {tier.label}
            </span>
          </div>
        </div>

        {/* Completion bar */}
        <div className="px-4 pt-2.5 pb-3 border-t border-slate-50 bg-[#FAFAFA]">
          <div className="flex justify-between text-[10px] text-slate-400 mb-[5px]">
            <span>Profile strength</span>
            <span className="text-gold font-bold">{completion}%</span>
          </div>
          <div className="h-[3px] bg-slate-100 rounded-sm overflow-hidden">
            <div
              className="h-[3px] rounded-sm bg-gradient-to-r from-gold to-gold-warm transition-[width] duration-[600ms] ease-[cubic-bezier(0.4,0,0.2,1)]"
              style={{ width: `${completion}%` }}
            />
          </div>
          <p className="text-[10px] text-slate-400 mt-1.5 mb-0 leading-[1.4]">
            {completion < 40
              ? 'Complete more steps to appear in agency search.'
              : completion < 60
              ? 'Add credentials and references to unlock Verified status.'
              : completion < 80
              ? 'Almost there — references and certifications will boost your score.'
              : 'Strong profile — agencies can find and shortlist you.'}
          </p>
        </div>
      </motion.div>

      {/* What agencies see note */}
      <p className="text-[10px] text-slate-400 text-center mt-2.5 leading-[1.4]">
        This is exactly what agencies see when they find your profile.
        Complete more steps to strengthen your listing.
      </p>
    </div>
  )
}
