import Link from 'next/link'

export default function SignUpPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#F7F4F0', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
      <div style={{ maxWidth: '900px', width: '100%', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '40px', alignItems: 'center' }}>
        
        {/* Left - Info */}
        <div>
          <h1 style={{ 
            fontSize: 'clamp(32px, 4vw, 48px)', 
            fontWeight: 900, 
            color: '#0D1B3E', 
            marginBottom: '24px',
            lineHeight: 1.1
          }}>
            Join <span style={{ background: 'linear-gradient(135deg, #C9973A, #E8B86D)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Careified</span>
          </h1>
          <p style={{ 
            fontSize: '18px', 
            color: '#64748B', 
            marginBottom: '32px',
            lineHeight: 1.6
          }}>
            Choose how you want to get started. We're here to help connect 
            healthcare professionals with agencies that need them.
          </p>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {[
              { icon: '🏥', title: 'Agency', desc: 'Find and hire qualified caregivers', href: '/agency/signup' },
              { icon: '👩‍⚕️', title: 'Caregiver', desc: 'Create your profile and get discovered', href: '/profile/build' },
            ].map((option, i) => (
              <Link 
                key={i}
                href={option.href}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '20px',
                  padding: '24px',
                  background: 'white',
                  borderRadius: '16px',
                  border: '2px solid #E2E8F0',
                  textDecoration: 'none',
                  transition: 'all 0.2s'
                }}
              >
                <div style={{ 
                  width: '56px', height: '56px', 
                  borderRadius: '14px', 
                  background: '#FDF6EC',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '28px'
                }}>
                  {option.icon}
                </div>
                <div>
                  <div style={{ fontSize: '18px', fontWeight: 700, color: '#0D1B3E', marginBottom: '4px' }}>
                    {option.title}
                  </div>
                  <div style={{ fontSize: '14px', color: '#64748B' }}>
                    {option.desc}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
        
        {/* Right - Visual */}
        <div style={{ 
          padding: '40px',
          background: 'white',
          borderRadius: '24px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          textAlign: 'center'
        }}>
          <div style={{ 
            width: '80px', height: '80px', 
            margin: '0 auto 24px',
            borderRadius: '20px', 
            background: 'linear-gradient(135deg, #0D1B3E, #1a2f5c)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <span style={{ fontSize: '40px' }}>🏥</span>
          </div>
          
          <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#0D1B3E', marginBottom: '12px' }}>
            Trusted Platform
          </h2>
          
          <p style={{ fontSize: '16px', color: '#64748B', marginBottom: '24px' }}>
            Join thousands of agencies and caregivers who trust Careified 
            for their healthcare hiring needs.
          </p>
          
          <div style={{ display: 'flex', justifyContent: 'center', gap: '32px' }}>
            {[
              { number: '2,500+', label: 'Caregivers' },
              { number: '500+', label: 'Agencies' },
            ].map((stat, i) => (
              <div key={i}>
                <div style={{ fontSize: '24px', fontWeight: 800, color: '#C9973A' }}>
                  {stat.number}
                </div>
                <div style={{ fontSize: '12px', color: '#64748B' }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
