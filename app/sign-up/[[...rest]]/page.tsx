'use client'
import { SignUp } from '@clerk/nextjs'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function SignUpContent() {
  const searchParams = useSearchParams()
  const role = searchParams.get('role') || 'caregiver'
  const redirectUrl = role === 'agency'
    ? `/api/onboarding/set-role?role=agency&redirect=/agency/pending-approval`
    : `/api/onboarding/set-role?role=caregiver&redirect=/profile/start`

  return (
    <div style={{
      minHeight: '100vh',
      background: '#F7F4F0',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 20px',
    }}>
      <SignUp
        forceRedirectUrl={redirectUrl}
        appearance={{
          variables: {
            colorPrimary: '#C9973A',
            colorBackground: '#FFFFFF',
            colorText: '#0D1B3E',
            borderRadius: '12px',
          },
          elements: {
            formButtonPrimary: {
              background: 'linear-gradient(135deg, #C9973A, #E8B86D)',
              color: '#0D1B3E',
              fontWeight: 700,
            },
          },
        }}
      />
    </div>
  )
}

export default function SignUpPage() {
  return (
    <Suspense>
      <SignUpContent />
    </Suspense>
  )
}