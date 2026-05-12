'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { auth } from '@clerk/nextjs/server'
import { Loader2 } from 'lucide-react'

const N = '#0D1B3E'
const G = '#C9973A'

export default function ClaimCompletePage() {
  const params = useParams()
  const router = useRouter()
  const token = params?.token as string
  const [error, setError] = useState<string | null>(null)
  const [processing, setProcessing] = useState(true)

  useEffect(() => {
    const completeClaim = async () => {
      try {
        // Get Clerk user
        const { userId } = await auth()

        if (!userId) {
          // Not signed in, redirect to sign up
          router.push(`/sign-up?redirect_url=/claim/${token}/complete`)
          return
        }

        // Submit claim
        const res = await fetch(`/api/claim/${token}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ clerk_user_id: userId }),
        })

        if (res.ok || res.status === 409) {
          // Success or already claimed - redirect to profile build
          router.push('/profile/build')
        } else {
          const data = await res.json()
          setError(data.message || 'Something went wrong')
        }
      } catch (err) {
        setError('Something went wrong. Please try again.')
      } finally {
        setProcessing(false)
      }
    }

    if (token) {
      completeClaim()
    }
  }, [token, router])

  if (processing) {
    return (
      <div style={{ minHeight: '100vh', background: '#F7F4F0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <Loader2 size={32} style={{ color: G, animation: 'spin 1s linear infinite', marginBottom: 16 }} />
          <div style={{ fontSize: 14, color: N }}>Setting up your profile...</div>
        </div>
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ minHeight: '100vh', background: '#F7F4F0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ maxWidth: 400, padding: '48px 24px', textAlign: 'center' }}>
          <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 24, color: N, margin: '0 0 12px' }}>
            Something went wrong
          </h1>
          <p style={{ fontSize: 14, color: '#6B7280', margin: '0 0 24px' }}>
            {error}
          </p>
          <a
            href="/support"
            style={{
              display: 'inline-block',
              padding: '12px 24px',
              background: `linear-gradient(135deg, ${G}, #E8B86D)`,
              color: N,
              textDecoration: 'none',
              borderRadius: 8,
              fontWeight: 600,
              fontSize: 14,
            }}
          >
            Contact Support
          </a>
        </div>
      </div>
    )
  }

  return null
}