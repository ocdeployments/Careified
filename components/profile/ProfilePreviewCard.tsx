// Careified — Live Profile Preview Card
// Mirrors the actual /profile/[id] page aesthetic
// Ghost profile (Maria Santos, PSW) fades to live data as caregiver types

'use client'

import { useState, useEffect } from 'react'
import { MapPin, Briefcase, Globe, Zap, Home, Car, Shield, Clock, Star, CheckCircle } from 'lucide-react'

// ─── Ghost data (Maria Santos) ─────────────────────────────────────────────
const GHOST = {
  firstName: 'Maria',
  lastName: 'Santos',
  jobTitle: 'Personal Support Worker',
  city: 'Toronto',
  state: 'ON',
  bio: 'Compassionate PSW with 8 years supporting seniors and individuals with complex needs. Known for patience, reliability, and building genuine rapport with clients and families.',
  languages: ['English', 'Portuguese'],
  credentials: ['PSW'],
  specializations: ['Dementia Care', 'Palliative Care', 'Mobility Assistance'],
  services: ['Personal hygiene', 'Medication reminders', 'Meal preparation', 'Companionship'],
  availabilityStatus: 'available_now',
  placementTypes: ['Live-out', 'Overnight', 'Respite'],
  hasVehicle: true,
  yearsExperience: 8,
  hourlyRateMin: 22,
  hourlyRateMax: 28,
  profileCompletionPct: 94,
}

// ─── Types ──────────────────────────────────────────────────────────────────
interface PreviewData {
  firstName?: string
  lastName?: string
  preferredName?: string
  jobTitle?: string
  city?: string
  state?: string
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
  hourlyRateMin?: number
  hourlyRateMax?: number
  profileCompletionPct?: number
  photoUrl?: string
}

interface ProfilePreviewCardProps {
  data: PreviewData
  step: number
}

// ─── Helpers ────────────────────────────────────────────────────────────────
function getBannerState(pct: number) {
  if (pct >= 90) return { text: 'Top 10% — elite caregiver profile', bg: 'linear-gradient(135deg, #C9973A, #E8B86D)', color: '#0D1B3E' }
  if (pct >= 80) return { text: 'Strong profile — you\'re standing out', bg: '#0D1B3E', color: '#E8B86D' }
  if (pct >= 50) return { text: 'Looking good — agencies can see you', bg: '#1E3A8A', color: 'white' }
  if (pct >= 20) return { text: 'Taking shape — keep going', bg: '#92400E', color: '#FDE68A' }
  return { text: 'Preview — this is what your profile could look like', bg: '#475569', color: 'white' }
}

function getAvailability(status?: string) {
  if (status === 'available_now') return { label: 'Available now', color: '#16A34A', dot: '#16A34A' }
  if (status === 'open_to_opportunities') return { label: 'Open to opportunities', color: '#D97706', dot: '#D97706' }
  if (status === 'available_soon') return { label: 'Available soon', color: '#2563EB', dot: '#2563EB' }
  return { label: 'Status unknown', color: '#94A3B8', dot: '#94A3B8' }
}

// Blend: show live value if present, ghost if not (ghost at reduced opacity)
function useVal<T>(live: T | undefined, ghost: T): { value: T; isGhost: boolean } {
  const hasLive = live !== undefined && live !== null && live !== '' &&
    !(Array.isArray(live) && (live as any[]).length === 0)
  return { value: hasLive ? live! : ghost, isGhost: !hasLive }
}

// ─── Component ──────────────────────────────────────────────────────────────
export default function ProfilePreviewCard({ data, step }: ProfilePreviewCardProps) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])

  const completion = data.profileCompletionPct || Math.min((step - 1) * 11, 85)
  const banner = getBannerState(completion)

  const name = useVal(
    data.firstName || data.preferredName
      ? `${data.preferredName || data.firstName || ''} ${data.lastName || ''}`.trim()
      : undefined,
    `${GHOST.firstName} ${GHOST.lastName}`
  )
  const jobTitle = useVal(data.jobTitle, GHOST.jobTitle)
  const city = useVal(
    data.city ? `${data.city}${data.state ? ', ' + data.state : ''}` : undefined,
    `${GHOST.city}, ${GHOST.state}`
  )
  const bio = useVal(data.bio, GHOST.bio)
  const languages = useVal(data.languages, GHOST.languages)
  const credentials = useVal(data.credentials, GHOST.credentials)
  const specializations = useVal(data.specializations, GHOST.specializations)
  const services = useVal(data.services, GHOST.services)
  const avStatus = useVal(data.availabilityStatus, GHOST.availabilityStatus)
  const placementTypes = useVal(data.placementTypes, GHOST.placementTypes)
  const yearsExp = useVal(data.yearsExperience, GHOST.yearsExperience)
  const hasVehicle = useVal(data.hasVehicle, GHOST.hasVehicle)
  const rateMin = useVal(data.hourlyRateMin, GHOST.hourlyRateMin)
  const rateMax = useVal(data.hourlyRateMax, GHOST.hourlyRateMax)

  const avail = getAvailability(avStatus.value)

  const initials = name.isGhost
    ? 'MS'
    : `${(data.preferredName || data.firstName || '')[0] || ''}${(data.lastName || '')[0] || ''}`.toUpperCase() || '?'

  const ghostStyle = (isGhost: boolean): React.CSSProperties =>
    isGhost ? { opacity: 0.35, transition: 'opacity 0.4s ease' } : { opacity: 1, transition: 'opacity 0.4s ease' }

  if (!mounted) return null

  return (
    <div style={{ position: 'sticky', top: '140px', fontFamily: 'system-ui, sans-serif' }}>

      {/* Banner */}
      <div style={{
        background: banner.bg,
        color: banner.color,
        fontSize: '11px',
        fontWeight: 700,
        padding: '8px 14px',
        borderRadius: '10px 10px 0 0',
        textAlign: 'center',
        letterSpacing: '0.03em',
        transition: 'background 0.5s ease',
      }}>
        {banner.text}
      </div>

      {/* Main card */}
      <div style={{
        background: 'white',
        border: '1px solid #E2E8F0',
        borderTop: 'none',
        borderRadius: '0 0 16px 16px',
        overflow: 'hidden',
        boxShadow: '0 8px 24px rgba(13,27,62,0.08)',
      }}>

        {/* Navy hero */}
        <div style={{ background: '#0D1B3E', padding: '20px 16px 16px', position: 'relative' }}>
          {/* Subtle grain */}
          <div style={{ position: 'absolute', inset: 0, opacity: 0.04, backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\'/%3E%3C/svg%3E")', pointerEvents: 'none' }} />

          <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', position: 'relative' }}>
            {/* Avatar */}
            <div style={{ width: '52px', height: '52px', borderRadius: '50%', padding: '2px', background: 'linear-gradient(135deg, #C9973A, #E8B86D)', flexShrink: 0 }}>
              <div style={{ width: '100%', height: '100%', borderRadius: '50%', background: '#1a2a4a', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                {data.photoUrl
                  ? <img src={data.photoUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <span style={{ fontSize: '16px', fontWeight: 900, color: '#F5F0E8' }}>{initials}</span>
                }
              </div>
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              {/* Name */}
              <div style={{ ...ghostStyle(name.isGhost) }}>
                <div style={{ fontSize: '17px', fontWeight: 800, color: '#F5F0E8', lineHeight: 1.2, marginBottom: '2px' }}>
                  {name.value}
                </div>
              </div>

              {/* Job title */}
              <div style={{ ...ghostStyle(jobTitle.isGhost) }}>
                <div style={{ fontSize: '11px', color: '#C9973A', fontStyle: 'italic', marginBottom: '6px' }}>
                  {jobTitle.value}
                </div>
              </div>

              {/* Meta row */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: 'rgba(255,255,255,0.55)', ...ghostStyle(city.isGhost) }}>
                  <MapPin size={10} />{city.value}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: 'rgba(255,255,255,0.55)', ...ghostStyle(yearsExp.isGhost) }}>
                  <Briefcase size={10} />{yearsExp.value} yrs
                </span>
                {languages.value.length > 0 && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: 'rgba(255,255,255,0.55)', ...ghostStyle(languages.isGhost) }}>
                    <Globe size={10} />{languages.value.slice(0, 2).join(', ')}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Chips row */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '12px', position: 'relative' }}>
            {/* Availability */}
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '10px', fontWeight: 700, padding: '4px 10px', borderRadius: '999px', background: 'rgba(255,255,255,0.08)', color: avail.color, ...ghostStyle(avStatus.isGhost) }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: avail.color }} />
              {avail.label}
            </span>
            {(data.openToUrgent) && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '10px', fontWeight: 700, padding: '4px 10px', borderRadius: '999px', background: 'rgba(251,146,60,0.15)', color: '#FB923C' }}>
                <Zap size={9} /> Urgent
              </span>
            )}
            {(data.willingLiveIn || placementTypes.value.includes('Live-in')) && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '10px', fontWeight: 700, padding: '4px 10px', borderRadius: '999px', background: 'rgba(139,92,246,0.15)', color: '#A78BFA', ...ghostStyle(placementTypes.isGhost) }}>
                <Home size={9} /> Live-in
              </span>
            )}
            {hasVehicle.value && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '10px', fontWeight: 600, padding: '4px 10px', borderRadius: '999px', background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.55)', ...ghostStyle(hasVehicle.isGhost) }}>
                <Car size={9} /> Vehicle
              </span>
            )}
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>

          {/* Credential badge */}
          {credentials.value.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', ...ghostStyle(credentials.isGhost) }}>
              {credentials.value.slice(0, 3).map((c, i) => (
                <span key={i} style={{ fontSize: '10px', fontWeight: 700, padding: '3px 10px', borderRadius: '6px', background: '#EFF6FF', color: '#1E3A8A', border: '1px solid #BFDBFE' }}>
                  {c}
                </span>
              ))}
            </div>
          )}

          {/* Bio */}
          <div style={{ ...ghostStyle(bio.isGhost) }}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '4px' }}>About</div>
            <p style={{ fontSize: '12px', color: '#475569', lineHeight: 1.6, margin: 0, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
              {bio.value}
            </p>
          </div>

          {/* Specializations */}
          {specializations.value.length > 0 && (
            <div style={{ ...ghostStyle(specializations.isGhost) }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '6px' }}>Specialties</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                {specializations.value.slice(0, 4).map((s, i) => (
                  <span key={i} style={{ fontSize: '10px', padding: '3px 10px', borderRadius: '999px', border: '1px solid rgba(201,151,58,0.35)', color: '#0D1B3E' }}>
                    {s}
                  </span>
                ))}
                {specializations.value.length > 4 && (
                  <span style={{ fontSize: '10px', color: '#94A3B8', padding: '3px' }}>+{specializations.value.length - 4}</span>
                )}
              </div>
            </div>
          )}

          {/* Services */}
          {services.value.length > 0 && (
            <div style={{ ...ghostStyle(services.isGhost) }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '6px' }}>Services</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px' }}>
                {services.value.slice(0, 4).map((s, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', color: '#475569' }}>
                    <CheckCircle size={11} color="#16A34A" />{s}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Availability + Rate row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <div style={{ background: '#F8FAFC', borderRadius: '10px', padding: '10px 12px' }}>
              <div style={{ fontSize: '10px', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '4px' }}>Placement</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px', ...ghostStyle(placementTypes.isGhost) }}>
                {placementTypes.value.slice(0, 3).map((t, i) => (
                  <span key={i} style={{ fontSize: '10px', padding: '2px 7px', borderRadius: '5px', background: 'white', border: '1px solid #E2E8F0', color: '#475569' }}>{t}</span>
                ))}
              </div>
            </div>
            <div style={{ background: '#F8FAFC', borderRadius: '10px', padding: '10px 12px' }}>
              <div style={{ fontSize: '10px', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '4px' }}>Rate</div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#0D1B3E', ...ghostStyle(rateMin.isGhost) }}>
                ${rateMin.value}–${rateMax.value}<span style={{ fontSize: '10px', fontWeight: 400, color: '#94A3B8' }}>/hr</span>
              </div>
            </div>
          </div>

        </div>

        {/* Completion bar */}
        <div style={{ padding: '10px 16px 14px', borderTop: '1px solid #F1F5F9', background: '#FAFAFA' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#94A3B8', marginBottom: '5px' }}>
            <span>Profile strength</span>
            <span style={{ color: '#C9973A', fontWeight: 700 }}>{completion}%</span>
          </div>
          <div style={{ height: '4px', background: '#E2E8F0', borderRadius: '2px', overflow: 'hidden' }}>
            <div style={{
              height: '100%',
              borderRadius: '2px',
              background: completion >= 80 ? 'linear-gradient(90deg, #C9973A, #E8B86D)' : completion >= 50 ? '#1E3A8A' : '#94A3B8',
              width: `${completion}%`,
              transition: 'width 0.6s cubic-bezier(0.4,0,0.2,1)',
            }} />
          </div>
          <p style={{ fontSize: '10px', color: '#94A3B8', marginTop: '5px', marginBottom: 0, lineHeight: 1.4 }}>
            {completion < 20 ? 'Start filling in your details to build your profile.' :
             completion < 50 ? 'Add credentials and availability to appear in search.' :
             completion < 80 ? 'References and certifications will boost your ranking.' :
             'Strong profile — agencies can find and shortlist you.'}
          </p>
        </div>

      </div>

      {/* Footer note */}
      <p style={{ fontSize: '10px', color: '#94A3B8', textAlign: 'center', marginTop: '10px', lineHeight: 1.4 }}>
        This is exactly what agencies see. {name.isGhost ? 'Ghost preview — fill in your details.' : 'Your live profile.'}
      </p>

    </div>
  )
}
