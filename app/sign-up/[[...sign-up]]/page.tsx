'use client'
import { SignUp } from '@clerk/nextjs'
import { useSearchParams } from 'next/navigation'
import { Suspense, useState } from 'react'

function SignUpContent() {
  const searchParams = useSearchParams()
  const urlRole = searchParams.get('role')
  const [selectedRole, setSelectedRole] = useState<'caregiver' | 'agency' | null>(
    urlRole === 'agency' ? 'agency' : urlRole === 'caregiver' ? 'caregiver' : null
  )

  const activeRole = selectedRole ?? urlRole
  const redirectUrl = activeRole === 'agency'
    ? '/api/onboarding/set-role?role=agency'
    : '/api/onboarding/set-role?role=caregiver'

  const handleRoleSelect = (selected: 'caregiver' | 'agency') => {
    setSelectedRole(selected)
    window.history.replaceState(null, '', `/sign-up?role=${selected}`)
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#F7F4F0',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 20px',
    }}>
      {!selectedRole && !urlRole ? (
        <div style={{
          textAlign: 'center',
          maxWidth: '700px',
        }}>
          <h1 style={{
            fontFamily: '"DM Serif Display", serif',
            fontSize: '48px',
            color: '#0D1B3E',
            marginBottom: '12px',
          }}>
            Join Careified
          </h1>
          <p style={{
            fontFamily: '"DM Sans", sans-serif',
            fontSize: '18px',
            color: '#0D1B3E',
            marginBottom: '40px',
          }}>
            How will you be using Careified?
          </p>
          <div style={{
            display: 'flex',
            gap: '24px',
            justifyContent: 'center',
            flexWrap: 'wrap',
          }}>
            <div
              onClick={() => handleRoleSelect('caregiver')}
              style={{
                background: '#FFFFFF',
                borderRadius: '16px',
                padding: '32px',
                width: '280px',
                cursor: 'pointer',
                border: '2px solid transparent',
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.border = '2px solid #C9973A'
                e.currentTarget.style.boxShadow = '0 4px 20px rgba(201, 151, 58, 0.25)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.border = '2px solid transparent'
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)'
              }}
            >
              <div style={{
                fontSize: '11px',
                letterSpacing: '1px',
                textTransform: 'uppercase',
                fontFamily: '"DM Sans", sans-serif',
                color: '#C9973A',
                marginBottom: '12px',
              }}>
                PSW · RPN · HCA
              </div>
              <h3 style={{
                fontFamily: '"DM Serif Display", serif',
                fontSize: '22px',
                color: '#0D1B3E',
                marginBottom: '8px',
              }}>
                I&apos;m a Caregiver
              </h3>
              <p style={{
                fontFamily: '"DM Sans", sans-serif',
                fontSize: '14px',
                color: '#64748B',
              }}>
                Build your profile and connect with agencies
              </p>
            </div>
            <div
              onClick={() => handleRoleSelect('agency')}
              style={{
                background: '#FFFFFF',
                borderRadius: '16px',
                padding: '32px',
                width: '280px',
                cursor: 'pointer',
                border: '2px solid transparent',
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.border = '2px solid #C9973A'
                e.currentTarget.style.boxShadow = '0 4px 20px rgba(201, 151, 58, 0.25)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.border = '2px solid transparent'
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)'
              }}
            >
              <div style={{
                fontSize: '11px',
                letterSpacing: '1px',
                textTransform: 'uppercase',
                fontFamily: '"DM Sans", sans-serif',
                color: '#0D1B3E',
                marginBottom: '12px',
              }}>
                Home Care Agency
              </div>
              <h3 style={{
                fontFamily: '"DM Serif Display", serif',
                fontSize: '22px',
                color: '#0D1B3E',
                marginBottom: '8px',
              }}>
                I&apos;m an Agency
              </h3>
              <p style={{
                fontFamily: '"DM Sans", sans-serif',
                fontSize: '14px',
                color: '#64748B',
              }}>
                Find and recruit verified caregivers
              </p>
            </div>
          </div>
        </div>
      ) : (
        <SignUp
          signInUrl="/sign-in"
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
      )}
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