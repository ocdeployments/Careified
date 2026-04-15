import Link from 'next/link'

export default function ForAgenciesPage() {
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
              For Home Health Agencies
            </span>
          </div>
          
          <h1 style={{ 
            fontSize: 'clamp(36px, 5vw, 56px)', 
            fontWeight: 900, 
            color: '#0D1B3E', 
            lineHeight: 1.1,
            marginBottom: '24px'
          }}>
            Hire Top Healthcare<br />
            <span style={{ background: 'linear-gradient(135deg, #C9973A, #E8B86D)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Talent Faster
            </span>
          </h1>
          
          <p style={{ 
            fontSize: '20px', 
            color: '#64748B', 
            maxWidth: '600px', 
            margin: '0 auto 40px',
            lineHeight: 1.6
          }}>
            Access thousands of verified caregivers. Post shifts, track performance, 
            and build your dream team—all in one place.
          </p>
          
          <Link 
            href="/agency/signup"
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
            Start Free Trial →
          </Link>
        </div>
      </section>

      {/* Benefits */}
      <section style={{ padding: '60px 20px', background: 'white' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '32px', fontWeight: 800, color: '#0D1B3E', textAlign: 'center', marginBottom: '48px' }}>
            Everything You Need to Succeed
          </h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '32px' }}>
            {[
              { title: 'Quick Search & Match', desc: 'Find caregivers by specialty, location, availability, and credentials in seconds.', icon: '🔍' },
              { title: 'Verified Caregivers', desc: 'Every profile includes background checks, certifications, and references.', icon: '✅' },
              { title: 'Performance Ratings', desc: 'See ratings from other agencies to make informed hiring decisions.', icon: '⭐' },
              { title: 'Shift Management', desc: 'Post shifts, track hours, and manage your team from one dashboard.', icon: '📅' },
              { title: 'No Long-term Contracts', desc: 'Use the platform as much or as little as you need. No commitments.', icon: '📋' },
              { title: 'Dedicated Support', desc: 'Our team is available to help you find the right fit.', icon: '💬' },
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

      {/* How It Works */}
      <section style={{ padding: '80px 20px' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: '32px', fontWeight: 800, color: '#0D1B3E', marginBottom: '48px' }}>
            How It Works
          </h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            {[
              { step: '1', title: 'Create Your Account', desc: 'Sign up in minutes. No credit card required.' },
              { step: '2', title: 'Search Caregivers', desc: 'Browse our database of verified healthcare professionals.' },
              { step: '3', title: 'Connect & Hire', desc: 'Message caregivers, schedule interviews, and build your roster.' },
            ].map((item, i) => (
              <div key={i} style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '24px',
                padding: '24px',
                background: 'white',
                borderRadius: '16px',
                border: '1px solid #E2E8F0',
                textAlign: 'left'
              }}>
                <div style={{ 
                  width: '60px', height: '60px', 
                  borderRadius: '50%', 
                  background: 'linear-gradient(135deg, #C9973A, #E8B86D)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '24px', fontWeight: 800, color: '#0D1B3E',
                  flexShrink: 0
                }}>
                  {item.step}
                </div>
                <div>
                  <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#0D1B3E', marginBottom: '4px' }}>
                    {item.title}
                  </h3>
                  <p style={{ fontSize: '16px', color: '#64748B' }}>{item.desc}</p>
                </div>
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
            Join 500+ agencies who trust Careified for their hiring needs.
          </p>
          <Link 
            href="/agency/signup"
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
            Create Free Account →
          </Link>
        </div>
      </section>
    </div>
  )
}
