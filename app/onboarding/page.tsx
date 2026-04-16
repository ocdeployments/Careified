'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useAuth } from '@clerk/nextjs'
import Link from 'next/link'
import { Building2, Heart } from 'lucide-react'

export default function OnboardingPage() {
  const router = useRouter()
  const { userId, isLoaded } = useAuth()
  const [isLoading, setIsLoading] = useState<string | null>(null)

  const handleRoleSelection = async (role: 'agency' | 'caregiver') => {
    if (!userId) return
    
    setIsLoading(role)
    
    try {
      const res = await fetch('/api/onboarding/set-role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
      })

      if (res.ok) {
        // Redirect based on role
        if (role === 'agency') {
          router.push('/agency/search')
        } else {
          router.push('/profile/build')
        }
      } else {
        alert('Failed to set role. Please try again.')
      }
    } catch (error) {
      console.error('Error setting role:', error)
      alert('Something went wrong. Please try again.')
    } finally {
      setIsLoading(null)
    }
  }

  if (!isLoaded) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        background: 'linear-gradient(180deg, #F7F4F0 0%, #FFFFFF 100%)', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center' 
      }}>
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(180deg, #F7F4F0 0%, #FFFFFF 100%)', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      padding: '40px 20px' 
    }}>
      <div style={{ maxWidth: '600px', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: 800, color: '#0D1B3E', marginBottom: '12px' }}>
            Welcome to Careified!
          </h1>
          <p style={{ fontSize: '18px', color: '#64748B' }}>
            How will you be using our platform?
          </p>
        </div>

        <div style={{ display: 'grid', gap: '20px' }}>
          {/* Agency Option */}
          <button
            onClick={() => handleRoleSelection('agency')}
            disabled={!!isLoading}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '20px',
              padding: '28px',
              background: 'white',
              border: '2px solid #E2E8F0',
              borderRadius: '16px',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              opacity: isLoading ? 0.7 : 1,
              transition: 'all 0.2s',
              textAlign: 'left',
            }}
          >
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #0D1B3E, #1a2f5c)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '32px',
            }}>
              <Building2 style={{ width: '32px', height: '32px', color: '#FFFFFF' }} />
            </div>
            <div>
              <div style={{ fontSize: '20px', fontWeight: 700, color: '#0D1B3E', marginBottom: '4px' }}>
                I'm an Agency
              </div>
              <div style={{ fontSize: '14px', color: '#64748B' }}>
                Hiring healthcare professionals for your facility
              </div>
            </div>
          </button>

          {/* Caregiver Option */}
          <button
            onClick={() => handleRoleSelection('caregiver')}
            disabled={!!isLoading}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '20px',
              padding: '28px',
              background: 'white',
              border: '2px solid #E2E8F0',
              borderRadius: '16px',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              opacity: isLoading ? 0.7 : 1,
              transition: 'all 0.2s',
              textAlign: 'left',
            }}
          >
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #C9973A, #E8B86D)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '32px',
            }}>
              <Heart style={{ width: '32px', height: '32px', color: '#FFFFFF' }} />
            </div>
            <div>
              <div style={{ fontSize: '20px', fontWeight: 700, color: '#0D1B3E', marginBottom: '4px' }}>
                I'm a Caregiver
              </div>
              <div style={{ fontSize: '14px', color: '#64748B' }}>
                Looking for healthcare job opportunities
              </div>
            </div>
          </button>
        </div>

        <div style={{ textAlign: 'center', marginTop: '32px' }}>
          <Link href="/" style={{ color: '#64748B', textDecoration: 'none', fontSize: '14px' }}>
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}
