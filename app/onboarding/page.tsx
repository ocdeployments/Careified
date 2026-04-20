'use client'
import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@clerk/nextjs'
import { Suspense } from 'react'

function OnboardingContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { userId, isLoaded } = useAuth()

  useEffect(() => {
    if (!isLoaded) return
    if (!userId) {
      router.push('/sign-in')
      return
    }
    // If role param present, go directly to set-role
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
    // No role — redirect to landing page to pick entry point
    router.push('/')
  }, [isLoaded, userId, router, searchParams])

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
