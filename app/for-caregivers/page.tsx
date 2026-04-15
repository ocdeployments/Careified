import Link from 'next/link'

export default function ForCaregiversPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#F7F4F0' }}>
      {/* Hero */}
      <section style={{ padding: '140px 20px 80px', textAlign: 'center' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div style={{ 
            display: 'inline-block', 
            padding: '8px 16px', 
            background: '#FDF6EC', 
            borderRadius: '100px', 
            marginBottom: '24px',
            border: '1px solid #E8B86D'
          }}>
            <span style={{ fontSize: '14px', color: '#92400E', fontWeight: 500 }}>
              For Healthcare Professionals
            </span>
          </div>
          
          <h1 style={{ 
            fontSize: 'clamp(36px, 5vw, 56px)', 
            fontWeight: 900, 
            color: '#0D1B3E', 
            lineHeight: 1.1,
            marginBottom: '24px'
          }}>
            Find Your Perfect<br />
            <span style={{ background: 'linear-gradient(135deg, #C9973A, #E8B86D)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Care Placement
            </span>
          </h1>
          
          <p style={{ 
            fontSize: '20px', 
            color: '#64748B', 
            maxWidth: '600px', 
            margin: '0 auto 40px',
            lineHeight: 1.6
          }}>
            Create your free profile, showcase your skills, and connect with 
            agencies looking for talented caregivers like you.
          </p>
          
          <Link 
            href="/profile/build"
            style={{ 
              display: 'inline-block',
              padding: '16px 32px', 
              background: 'linear-gradient(135deg, #C9973A, #E8B86D)',
              color: '#0D1B3E', 
              borderRadius: '12px', 
              textDecoration: 'none', 
              fontWeight: 700,
              fontSize: '16px',
              boxShadow: '0 4px 14px rgba(201, 151, 58, 0.4)'
            }}
          >
            Build Your Profile Free →
          </Link>
        </div>
      </section>

      {/* Benefits */}
      <section style={{ padding: '60px 20px', background: 'white' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '32px', fontWeight: 800, color: '#0D1B3E', textAlign: 'center', marginBottom: '48px' }}>
            Why Caregivers Love Careified
          </h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '32px' }}>
            {[
              { title: 'Free Profile Builder', desc: 'Create a professional profile that highlights your skills and experience.', icon: '📝' },
              { title: 'Get Discovered', desc: 'Agencies search our database to find and recruit caregivers like you.', icon: '👀' },
              { title: 'Build Your Reputation', desc: 'Earn ratings from agencies to showcase your reliability and quality.', icon: '⭐' },
              { title: 'Find Better Fits', desc: 'Match with agencies that align with your schedule, location, and preferences.', icon: '🎯' },
              { title: 'Track Your Shifts', desc: 'Keep a record of all your work history in one convenient place.', icon: '📊' },
              { title: 'Grow Your Career', desc: 'Access resources and opportunities to advance your healthcare career.', icon: '📈' },
            ].map((item, i) => (
              <div key={i} style={{ 
                padding: '24px', 
                background: '#F7F4F0',
                borderRadius: '12px'
              }}>
                <div style={{ fontSize: '32px', marginBottom: '12px' }}>{item.icon}</div>
                <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0D1B3E', marginBottom: '8px' }}>
                  {item.title}
                </h3>
                <p style={{ fontSize: '14px', color: '#64748B', lineHeight: 1.5 }}>
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ 
        padding: '80px 20px', 
        background: '#0D1B3E',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '32px', fontWeight: 800, color: 'white', marginBottom: '16px' }}>
            Ready to Get Started?
          </h2>
          <p style={{ fontSize: '18px', color: 'rgba(255,255,255,0.7)', marginBottom: '32px' }}>
            Create your free profile in just 10 minutes.
          </p>
          <Link 
            href="/profile/build"
            style={{ 
              display: 'inline-block',
              padding: '18px 40px', 
              background: 'linear-gradient(135deg, #C9973A, #E8B86D)',
              color: '#0D1B3E', 
              borderRadius: '12px', 
              textDecoration: 'none', 
              fontWeight: 700,
              fontSize: '18px'
            }}
          >
            Build Your Profile →
          </Link>
        </div>
      </section>
    </div>
  )
}
