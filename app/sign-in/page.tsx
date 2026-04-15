import { SignIn } from '@clerk/nextjs'
import Link from 'next/link'

export default function SignInPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #F7F4F0 0%, #FFFFFF 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
      <div style={{ maxWidth: '440px', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ 
            width: '56px', height: '56px', 
            margin: '0 auto 20px',
            borderRadius: '14px', 
            background: 'linear-gradient(135deg, #C9973A, #E8B86D)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <span style={{ fontSize: '28px', fontWeight: 800, color: '#0D1B3E' }}>C</span>
          </div>
          <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#0D1B3E', marginBottom: '8px' }}>
            Welcome Back
          </h1>
          <p style={{ fontSize: '16px', color: '#64748B' }}>
            Sign in to your Careified account
          </p>
        </div>
        
        <div style={{ 
          background: 'white',
          borderRadius: '24px',
          padding: '40px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
        }}>
          <SignIn
            appearance={{
              elements: {
                rootBox: { width: '100%', margin: 0 },
                card: { boxShadow: 'none', padding: 0, margin: 0 },
                header: { display: 'none' },
                socialButtonsBlockButton: {
                  borderRadius: '12px',
                  border: '1px solid #E2E8F0',
                  fontSize: '14px',
                  fontWeight: 600,
                },
                formButtonPrimary: {
                  borderRadius: '12px',
                  background: '#0D1B3E',
                  fontSize: '14px',
                  fontWeight: 600,
                  padding: '14px',
                },
                formFieldInput: {
                  borderRadius: '12px',
                  border: '1px solid #E2E8F0',
                  padding: '14px',
                  fontSize: '14px',
                },
                footer: { display: 'none' },
              },
            }}
          />
          
          <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
            <Link 
              href="/agency/signup"
              style={{ 
                flex: 1,
                padding: '14px',
                background: '#0D1B3E',
                color: 'white',
                borderRadius: '12px',
                textDecoration: 'none',
                fontWeight: 600,
                fontSize: '14px',
                textAlign: 'center'
              }}
            >
              Agency Sign Up
            </Link>
            <Link 
              href="/profile/build"
              style={{ 
                flex: 1,
                padding: '14px',
                background: '#F7F4F0',
                color: '#0D1B3E',
                borderRadius: '12px',
                textDecoration: 'none',
                fontWeight: 600,
                fontSize: '14px',
                textAlign: 'center'
              }}
            >
              Caregiver Sign Up
            </Link>
          </div>
        </div>
        
        <div style={{ textAlign: 'center', marginTop: '24px' }}>
          <Link href="/" style={{ color: '#64748B', textDecoration: 'none', fontSize: '14px' }}>
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}
