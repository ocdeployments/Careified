'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface CaregiverData {
  id: string
  first_name: string
  last_name: string
  email: string
  phone?: string
  city?: string
  job_title?: string
  years_experience?: number
  agency_name?: string
}

interface ClaimFormProps {
  caregiver: CaregiverData
  token: string
}

const N = '#0D1B3E'
const G = '#C9973A'
const S = "'DM Sans', sans-serif"

export default function ClaimForm({ caregiver, token }: ClaimFormProps) {
  const router = useRouter()
  const [agreed, setAgreed] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    if (!agreed) {
      setError('Please agree to the Terms of Service and Privacy Policy')
      return
    }

    setLoading(true)
    setError('')

    try {
      // Record consent
      const consentRes = await fetch('/api/agency/roster/consent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          caregiverId: caregiver.id,
          consentVersion: '1.0',
        }),
      })

      if (!consentRes.ok) {
        throw new Error('Failed to record consent')
      }

      // Redirect to sign-up with claim token
      const signUpUrl = `/sign-up?role=caregiver&claim_token=${token}&redirect_url=/profile/build`
      router.push(signUpUrl)
    } catch (err) {
      setError('Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#F7F4F0',
      fontFamily: S,
      padding: '40px 24px',
    }}>
      <div style={{
        maxWidth: 600,
        margin: '0 auto',
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <h1 style={{
            fontFamily: "'DM Serif Display', serif",
            fontSize: 36,
            color: N,
            marginBottom: 8,
          }}>
            Hi {caregiver.first_name}!
          </h1>
          <p style={{
            fontSize: 18,
            color: '#64748B',
          }}>
            {caregiver.agency_name || 'Your agency'} started your professional profile
          </p>
        </div>

        {/* Profile Summary Card */}
        <div style={{
          background: 'white',
          borderRadius: 16,
          border: '1px solid #E2E8F0',
          padding: 24,
          marginBottom: 24,
        }}>
          <h2 style={{
            fontSize: 14,
            fontWeight: 700,
            color: N,
            marginBottom: 16,
            textTransform: 'uppercase',
            letterSpacing: 0.5,
          }}>
            What&apos;s been filled in
          </h2>
          <div style={{ display: 'grid', gap: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#64748B', fontSize: 14 }}>Name</span>
              <span style={{ color: N, fontSize: 14, fontWeight: 600 }}>
                {caregiver.first_name} {caregiver.last_name}
              </span>
            </div>
            {caregiver.job_title && (
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748B', fontSize: 14 }}>Role</span>
                <span style={{ color: N, fontSize: 14, fontWeight: 600 }}>
                  {caregiver.job_title}
                </span>
              </div>
            )}
            {caregiver.years_experience && (
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748B', fontSize: 14 }}>Experience</span>
                <span style={{ color: N, fontSize: 14, fontWeight: 600 }}>
                  {caregiver.years_experience} years
                </span>
              </div>
            )}
            {caregiver.city && (
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748B', fontSize: 14 }}>Location</span>
                <span style={{ color: N, fontSize: 14, fontWeight: 600 }}>
                  {caregiver.city}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* What's left */}
        <div style={{
          background: 'white',
          borderRadius: 16,
          border: '1px solid #E2E8F0',
          padding: 24,
          marginBottom: 24,
        }}>
          <h2 style={{
            fontSize: 14,
            fontWeight: 700,
            color: N,
            marginBottom: 16,
            textTransform: 'uppercase',
            letterSpacing: 0.5,
          }}>
            Complete these sections to go live
          </h2>
          <div style={{ display: 'grid', gap: 10 }}>
            {[
              { label: 'Availability', required: true },
              { label: 'Working style', required: true },
              { label: 'References', required: false },
              { label: 'Compliance', required: true },
            ].map(item => (
              <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{
                  width: 20,
                  height: 20,
                  borderRadius: 4,
                  border: '2px solid #E2E8F0',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <span style={{ width: 10, height: 10, borderRadius: 2, background: '#E2E8F0' }} />
                </span>
                <span style={{ fontSize: 14, color: N }}>
                  {item.label}
                  {item.required && <span style={{ color: '#DC2626', marginLeft: 4 }}>*</span>}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Consent */}
        <div style={{
          background: 'white',
          borderRadius: 16,
          border: '1px solid #E2E8F0',
          padding: 24,
          marginBottom: 24,
        }}>
          <label style={{ display: 'flex', alignItems: 'flex-start', gap: 12, cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              style={{ marginTop: 4, width: 18, height: 18, accentColor: G }}
            />
            <span style={{ fontSize: 13, color: '#475569', lineHeight: 1.5 }}>
              I agree to the{' '}
              <a href="/terms" target="_blank" style={{ color: G, textDecoration: 'none' }}>Terms of Service</a>
              {' '}and{' '}
              <a href="/privacy" target="_blank" style={{ color: G, textDecoration: 'none' }}>Privacy Policy</a>
            </span>
          </label>
        </div>

        {/* Error */}
        {error && (
          <div style={{
            background: '#FEF2F2',
            border: '1px solid #FECACA',
            borderRadius: 8,
            padding: '12px 16px',
            marginBottom: 16,
            color: '#DC2626',
            fontSize: 14,
          }}>
            {error}
          </div>
        )}

        {/* CTA */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          style={{
            width: '100%',
            padding: '16px 24px',
            background: loading ? '#94A3B8' : `linear-gradient(135deg, ${G}, #E8B86D)`,
            color: N,
            border: 'none',
            borderRadius: 12,
            fontSize: 16,
            fontWeight: 700,
            cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'all 0.15s',
          }}
        >
          {loading ? 'Processing...' : 'Create my account and complete profile'}
        </button>

        <p style={{
          textAlign: 'center',
          fontSize: 12,
          color: '#94A3B8',
          marginTop: 16,
        }}>
          Takes about 15 minutes to complete your profile
        </p>
      </div>
    </div>
  )
}
