// Careified — Live Profile Preview Card
// Shown in split view during profile builder
// Updates in real time as caregiver fills in data

'use client'

import { MapPin, Star, Briefcase, Globe, Shield, Zap, Home, Car } from 'lucide-react'
import { motion } from 'framer-motion'

const FONT_SERIF = "'DM Serif Display', serif"
const FONT_SANS = "'DM Sans', sans-serif"

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
    completion >= 80 ? { label: 'Professional', color: '#1E3A8A', bg: '#EFF6FF' } :
    completion >= 60 ? { label: 'Verified', color: '#16A34A', bg: '#F0FDF4' } :
    completion >= 40 ? { label: 'Basic', color: '#64748B', bg: '#F8FAFC' } :
    { label: 'Incomplete', color: '#94A3B8', bg: '#F8FAFC' }

  const availLabel =
    data.availabilityStatus === 'available_now' ? 'Available now' :
    data.availabilityStatus === 'open_to_opportunities' ? 'Open to opportunities' :
    data.availabilityStatus === 'available_from' ? 'Available from date' :
    null

  const availColor =
    data.availabilityStatus === 'available_now' ? '#16A34A' :
    data.availabilityStatus === 'open_to_opportunities' ? '#D97706' :
    '#64748B'

  const isEmpty = !data.firstName && !data.lastName

  return (
    <div style={{
      position: 'sticky',
      top: '140px',
      fontFamily: FONT_SANS,
    }}>

      {/* Label */}
      <div style={{
        fontSize: '10px', fontWeight: 700,
        letterSpacing: '0.08em', textTransform: 'uppercase',
        color: '#94A3B8', marginBottom: '12px',
        display: 'flex', alignItems: 'center', gap: '6px',
      }}>
        <div style={{
          width: '6px', height: '6px', borderRadius: '50%',
          background: '#C9973A',
          animation: 'pulse 2s infinite',
        }} />
        Live preview — what agencies see
      </div>

      {/* Card */}
      <motion.div
whileHover={{ scale: 1.02, boxShadow: '0 12px 32px rgba(13, 27, 62, 0.12)' }}
transition={{ duration: 0.2, ease: 'easeOut' }}
style={{
        background: 'white',
        borderRadius: '16px',
        border: '1px solid #E2E8F0',
        overflow: 'hidden',
        transition: 'all 0.3s ease',
        opacity: isEmpty ? 0.5 : 1,
        padding: '40px',
        boxShadow: '0 8px 24px rgba(13, 27, 62, 0.06)',
      }}>

        {/* Gold accent bar */}
        <div style={{
          height: '3px',
          background: 'linear-gradient(90deg, #C9973A, #E8B86D)',
        }} />

        <div style={{ padding: '16px' }}>

          {/* Header */}
          <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>

            {/* Avatar */}
            <div style={{
              width: '48px', height: '48px', borderRadius: '50%',
              background: 'linear-gradient(135deg, #C9973A, #E8B86D)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '16px', fontWeight: 900, color: '#0D1B3E',
              flexShrink: 0,
            }}>
              {initials}
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <div>
                  <h3 style={{
                    fontSize: '32px', fontWeight: 900,
                    margin: '0 0 2px', fontFamily: FONT_SERIF,
                    letterSpacing: '-0.025em', lineHeight: 1.1,
                    minHeight: '36px',
                    background: isEmpty ? '#F1F5F9' : 'transparent',
                    borderRadius: isEmpty ? '4px' : '0',
                    color: isEmpty ? 'transparent' : '#0D1B3E',
                  }}>
                    {displayName || 'Your name'}
                  </h3>
                  {data.jobTitle ? (
                    <p style={{ fontSize: '11px', color: '#64748B', margin: '0 0 4px' }}>
                      {data.jobTitle}
                    </p>
                  ) : data.credentials?.[0] ? (
                    <p style={{ fontSize: '11px', color: '#64748B', margin: '0 0 4px' }}>
                      {data.credentials[0]}
                    </p>
                  ) : null}
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {data.credentials?.[0] && (
                      <span style={{
                        fontSize: '10px', fontWeight: 700,
                        color: '#1E3A8A', background: '#EFF6FF',
                        padding: '2px 7px', borderRadius: '5px',
                      }}>
                        {data.credentials[0]}
                      </span>
                    )}
                    {(data.yearsExperience || 0) > 0 && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '11px', color: '#64748B' }}>
                        <Briefcase size={10} /> {data.yearsExperience}y
                      </span>
                    )}
                    {data.city && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '11px', color: '#64748B' }}>
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
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginBottom: '10px' }}>
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: '4px',
                fontSize: '10px', fontWeight: 600,
                padding: '3px 8px', borderRadius: '999px',
                color: availColor,
                background: data.availabilityStatus === 'available_now' ? '#F0FDF4' :
                  data.availabilityStatus === 'open_to_opportunities' ? '#FFFBEB' : '#F8FAFC',
              }}>
                <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: availColor }} />
                {availLabel}
              </span>
              {data.openToUrgent && (
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: '3px',
                  fontSize: '10px', fontWeight: 600,
                  padding: '3px 8px', borderRadius: '999px',
                  background: '#FFF7ED', color: '#C2410C',
                }}>
                  <Zap size={9} /> Urgent
                </span>
              )}
              {data.willingLiveIn && (
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: '3px',
                  fontSize: '10px', fontWeight: 600,
                  padding: '3px 8px', borderRadius: '999px',
                  background: '#F5F3FF', color: '#7C3AED',
                }}>
                  <Home size={9} /> Live-in
                </span>
              )}
            </div>
          )}

          {/* Specialties */}
          {(data.specializations || []).length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '10px' }}>
              {(data.specializations || []).slice(0, 3).map((s, i) => (
                <span key={i} style={{
                  fontSize: '10px', padding: '3px 8px', borderRadius: '5px',
                  background: '#F8FAFC', color: '#475569', border: '1px solid #E2E8F0',
                }}>
                  {s}
                </span>
              ))}
              {(data.specializations || []).length > 3 && (
                <span style={{ fontSize: '10px', color: '#94A3B8', padding: '3px' }}>
                  +{(data.specializations || []).length - 3} more
                </span>
              )}
            </div>
          )}

          {/* Languages */}
          {(data.languages || []).length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '10px' }}>
              <Globe size={11} color="#94A3B8" />
              <span style={{ fontSize: '11px', color: '#64748B' }}>
                {(data.languages || []).slice(0, 3).join(' · ')}
              </span>
            </div>
          )}

          {/* Bio snippet */}
          {data.bio && (
            <p style={{
              fontSize: '11px', color: '#64748B',
              lineHeight: 1.5, marginBottom: '10px',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}>
              {data.bio}
            </p>
          )}

          {/* Footer */}
          <div style={{
            display: 'flex', alignItems: 'center',
            justifyContent: 'space-between',
            paddingTop: '10px',
            borderTop: '1px solid #F1F5F9',
          }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              {data.hasVehicle && (
                <span style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '10px', color: '#64748B' }}>
                  <Car size={11} /> Vehicle
                </span>
              )}
              {data.hourlyRate && (
                <span style={{ fontSize: '10px', color: '#64748B' }}>
                  ${data.hourlyRate}/hr
                </span>
              )}
            </div>
            <span style={{
              fontSize: '10px', fontWeight: 700,
              padding: '2px 7px', borderRadius: '5px',
              background: tier.bg, color: tier.color,
            }}>
              {tier.label}
            </span>
          </div>
        </div>

        {/* Completion bar */}
        <div style={{
          padding: '10px 16px 12px',
          borderTop: '1px solid #F8FAFC',
          background: '#FAFAFA',
        }}>
          <div style={{
            display: 'flex', justifyContent: 'space-between',
            fontSize: '10px', color: '#94A3B8', marginBottom: '5px',
          }}>
            <span>Profile strength</span>
            <span style={{ color: '#C9973A', fontWeight: 700 }}>{completion}%</span>
          </div>
          <div style={{ height: '3px', background: '#F1F5F9', borderRadius: '2px', overflow: 'hidden' }}>
            <div style={{
              height: '3px', borderRadius: '2px',
              background: 'linear-gradient(90deg, #C9973A, #E8B86D)',
              width: `${completion}%`,
              transition: 'width 0.6s cubic-bezier(0.4,0,0.2,1)',
            }} />
          </div>
          <p style={{
            fontSize: '10px', color: '#94A3B8',
            marginTop: '6px', marginBottom: 0,
            lineHeight: 1.4,
          }}>
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
      <p style={{
        fontSize: '10px', color: '#94A3B8',
        textAlign: 'center', marginTop: '10px',
        lineHeight: 1.4,
      }}>
        This is exactly what agencies see when they find your profile.
        Complete more steps to strengthen your listing.
      </p>
    </div>
  )
}
