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
          <div style={{ 
            padding: '24px',
            background: '#FDF6EC',
            borderRadius: '12px',
            textAlign: 'center',
            marginBottom: '24px'
          }}>
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>🔐</div>
            <p style={{ fontSize: '14px', color: '#92400E', fontWeight: 500 }}>
              Sign in coming soon!
            </p>
            <p style={{ fontSize: '13px', color: '#B45309', marginTop: '8px' }}>
              We're building a secure authentication system.
            </p>
          </div>
          
          <div style={{ display: 'flex', gap: '12px' }}>
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
