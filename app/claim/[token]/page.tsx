'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Loader2, Check, AlertCircle, User } from 'lucide-react'

const N = '#0D1B3E'
const G = '#C9973A'
const G_LIGHT = '#E8B86D'
const WHITE = '#FFFFFF'
const GREY = '#6B7280'
const GREEN = '#16A34A'
const RED = '#DC2626'

interface ClaimInfo {
  caregiver_id: string
  first_name: string
  last_name: string
  email: string
  agency_name: string
}

export default function ClaimPage() {
  const params = useParams()
  const token = params?.token as string
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState<'valid' | 'claimed' | 'expired' | 'invalid'>('valid')
  const [claimInfo, setClaimInfo] = useState<ClaimInfo | null>(null)

  useEffect(() => {
    if (!token) return

    fetch(`/api/claim/${token}`)
      .then(res => {
        return res.json().then(data => ({ ok: res.ok, data }))
      })
      .then(({ ok, data }) => {
        if (ok) {
          setStatus('valid')
          setClaimInfo(data)
        } else if (data.error === 'already_claimed') {
          setStatus('claimed')
        } else if (data.error === 'token_expired') {
          setStatus('expired')
        } else {
          setStatus('invalid')
        }
      })
      .catch(() => {
        setStatus('invalid')
      })
      .finally(() => {
        setLoading(false)
      })
  }, [token])

  const handleSignUp = () => {
    const signUpUrl = `/sign-up?redirect_url=${encodeURIComponent(`/claim/${token}/complete`)}`
    window.location.href = signUpUrl
  }

  const handleSignIn = () => {
    const signInUrl = `/sign-in?redirect_url=${encodeURIComponent(`/claim/${token}/complete`)}`
    window.location.href = signInUrl
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#F7F4F0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Loader2 size={32} style={{ color: G, animation: 'spin 1s linear infinite' }} />
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  if (status === 'invalid') {
    return (
      <div style={{ minHeight: '100vh', background: '#F7F4F0', fontFamily: "'DM Sans', sans-serif", display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ maxWidth: 400, margin: '0 auto', padding: '48px 24px', textAlign: 'center' }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(220,38,38,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            <AlertCircle size={32} style={{ color: RED }} />
          </div>
          <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 24, color: N, margin: '0 0 12px' }}>
            Invalid Invite Link
          </h1>
          <p style={{ fontSize: 14, color: GREY, margin: 0 }}>
            This invitation link is not valid. Please contact your agency for a new invitation.
          </p>
        </div>
      </div>
    )
  }

  if (status === 'claimed') {
    return (
      <div style={{ minHeight: '100vh', background: '#F7F4F0', fontFamily: "'DM Sans', sans-serif", display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ maxWidth: 400, margin: '0 auto', padding: '48px 24px', textAlign: 'center' }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(22,163,74,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            <Check size={32} style={{ color: GREEN }} />
          </div>
          <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 24, color: N, margin: '0 0 12px' }}>
            Profile Already Claimed
          </h1>
          <p style={{ fontSize: 14, color: GREY, margin: '0 0 24px' }}>
            This profile has already been claimed. Sign in to access your profile.
          </p>
          <button
            onClick={handleSignIn}
            style={{
              padding: '12px 24px',
              background: `linear-gradient(135deg, ${G}, ${G_LIGHT})`,
              color: N,
              border: 'none',
              borderRadius: 8,
              fontWeight: 600,
              fontSize: 14,
              cursor: 'pointer',
            }}
          >
            Sign In
          </button>
        </div>
      </div>
    )
  }

  if (status === 'expired') {
    return (
      <div style={{ minHeight: '100vh', background: '#F7F4F0', fontFamily: "'DM Sans', sans-serif", display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ maxWidth: 400, margin: '0 auto', padding: '48px 24px', textAlign: 'center' }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(107,114,128,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            <AlertCircle size={32} style={{ color: GREY }} />
          </div>
          <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 24, color: N, margin: '0 0 12px' }}>
            Invite Link Expired
          </h1>
          <p style={{ fontSize: 14, color: GREY, margin: 0 }}>
            This invitation link has expired. Please contact your agency for a new one.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: N, fontFamily: "'DM Sans', sans-serif", display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ maxWidth: 480, margin: '0 auto', padding: '48px 24px', textAlign: 'center' }}>
        <div style={{ width: 80, height: 80, borderRadius: '50%', background: `linear-gradient(135deg, ${G}, ${G_LIGHT})`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
          <User size={40} style={{ color: N }} />
        </div>
        <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 32, color: WHITE, margin: '0 0 12px' }}>
          Your profile is ready
        </h1>
        <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.7)', margin: '0 0 32px' }}>
          Claim it now to start building your professional reputation.
        </p>

        {claimInfo && (
          <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: 12, padding: 20, marginBottom: 32, textAlign: 'left' }}>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
              Invitation from
            </div>
            <div style={{ fontSize: 18, fontWeight: 600, color: G_LIGHT, marginBottom: 4 }}>
              {claimInfo.agency_name}
            </div>
            <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)' }}>
              {claimInfo.first_name} {claimInfo.last_name} • {claimInfo.email}
            </div>
          </div>
        )}

        <button
          onClick={handleSignUp}
          style={{
            width: '100%',
            padding: '16px 24px',
            background: `linear-gradient(135deg, ${G}, ${G_LIGHT})`,
            color: N,
            border: 'none',
            borderRadius: 10,
            fontWeight: 700,
            fontSize: 16,
            cursor: 'pointer',
            marginBottom: 16,
          }}
        >
          Create Your Account
        </button>

        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>
          Already have an account?{' '}
          <button onClick={handleSignIn} style={{ background: 'none', border: 'none', color: G_LIGHT, cursor: 'pointer', textDecoration: 'underline' }}>
            Sign in
          </button>
        </div>
      </div>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}