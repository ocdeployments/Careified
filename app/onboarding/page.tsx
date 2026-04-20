'use client'
import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth, useUser } from '@clerk/nextjs'
import { Suspense } from 'react'

// ── Family Early Access card ──────────────────────────────────────────────────
function FamilyWaitlistCard() {
  const { user } = useUser()
  const router = useRouter()
  const [email, setEmail] = useState(user?.primaryEmailAddress?.emailAddress ?? '')
  const [status, setStatus] = useState<'idle' | 'submitting' | 'done' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('submitting')
    setErrorMsg('')
    try {
      const res = await fetch('/api/onboarding/family-waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      if (!res.ok) {
        setErrorMsg(data.error ?? 'Something went wrong.')
        setStatus('error')
        return
      }
      setStatus('done')
    } catch {
      setErrorMsg('Network error. Please try again.')
      setStatus('error')
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#F7F4F0',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
    }}>
      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '48px 40px',
        maxWidth: '480px',
        width: '100%',
        boxShadow: '0 4px 24px rgba(13,27,62,0.08)',
        textAlign: 'center',
      }}>
        {/* Icon */}
        <div style={{
          width: '56px',
          height: '56px',
          borderRadius: '14px',
          background: 'linear-gradient(135deg, #C9973A, #E8B86D)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 24px',
          fontSize: '24px',
        }}>
          🏠
        </div>

        {status === 'done' ? (
          <>
            <h1 style={{
              fontFamily: "'DM Serif Display', serif",
              fontSize: '1.75rem',
              color: '#0D1B3E',
              marginBottom: '12px',
              fontWeight: 400,
            }}>
              You&apos;re on the list.
            </h1>
            <p style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: '15px',
              color: '#64748B',
              lineHeight: 1.6,
              marginBottom: '32px',
            }}>
              We&apos;ll notify you at <strong>{email}</strong> when the family portal launches.
              Thank you for your interest in Careified.
            </p>
            <button
              onClick={() => router.push('/')}
              style={{
                padding: '12px 32px',
                background: '#0D1B3E',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 500,
                fontFamily: "'DM Sans', sans-serif",
                cursor: 'pointer',
              }}
            >
              Back to home
            </button>
          </>
        ) : (
          <>
            <h1 style={{
              fontFamily: "'DM Serif Display', serif",
              fontSize: '1.75rem',
              color: '#0D1B3E',
              marginBottom: '12px',
              fontWeight: 400,
            }}>
              Family portal coming soon.
            </h1>
            <p style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: '15px',
              color: '#64748B',
              lineHeight: 1.6,
              marginBottom: '32px',
            }}>
              We&apos;re building a dedicated space for families to find, vet, and connect
              with verified caregivers. Enter your email and we&apos;ll notify you the moment
              it&apos;s ready.
            </p>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="your@email.com"
                style={{
                  padding: '12px 16px',
                  border: '1.5px solid #E2E8F0',
                  borderRadius: '8px',
                  fontSize: '15px',
                  fontFamily: "'DM Sans', sans-serif",
                  color: '#0D1B3E',
                  outline: 'none',
                  width: '100%',
                  boxSizing: 'border-box',
                }}
              />
              {errorMsg && (
                <p style={{ fontSize: '13px', color: '#DC2626', margin: 0 }}>{errorMsg}</p>
              )}
              <button
                type="submit"
                disabled={status === 'submitting'}
                style={{
                  padding: '12px 32px',
                  background: 'linear-gradient(135deg, #C9973A, #E8B86D)',
                  color: '#0D1B3E',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: 600,
                  fontFamily: "'DM Sans', sans-serif",
                  cursor: status === 'submitting' ? 'not-allowed' : 'pointer',
                  opacity: status === 'submitting' ? 0.7 : 1,
                  letterSpacing: '0.02em',
                }}
              >
                {status === 'submitting' ? 'Saving…' : 'Notify me when ready →'}
              </button>
            </form>

            <p style={{
              marginTop: '20px',
              fontSize: '12px',
              color: '#94A3B8',
              fontFamily: "'DM Sans', sans-serif",
            }}>
              No spam. Unsubscribe any time.
            </p>
          </>
        )}
      </div>
    </div>
  )
}

// ── Main onboarding content ───────────────────────────────────────────────────
function OnboardingContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { userId, isLoaded } = useAuth()
  const [showFamily, setShowFamily] = useState(false)

  useEffect(() => {
    if (!isLoaded) return
    if (!userId) {
      router.push('/sign-in')
      return
    }
    const role = searchParams.get('role')
    if (role === 'agency' || role === 'caregiver') {
      const redirect = role === 'agency'
        ? '/agency/pending-approval'
        : '/profile/start'
      fetch('/api/onboarding/set-role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
      }).then(() => router.push(redirect))
      return
    }
    if (role === 'family') {
      setShowFamily(true)
      return
    }
    // No role — redirect to landing page to pick entry point
    router.push('/')
  }, [isLoaded, userId, router, searchParams])

  if (showFamily) {
    return <FamilyWaitlistCard />
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#F7F4F0',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <p style={{ color: '#64748B', fontSize: '14px' }}>Setting up your account...</p>
    </div>
  )
}

export default function OnboardingPage() {
  return (
    <Suspense>
      <OnboardingContent />
    </Suspense>
  )
}
