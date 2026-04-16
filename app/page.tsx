import Link from 'next/link'

export default function Home() {
  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #F7F4F0 0%, #FFFFFF 100%)' }}>
      {/* Hero Section */}
      <section style={{ padding: '120px 20px 80px', textAlign: 'center' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <div style={{ 
            display: 'inline-block', 
            padding: '8px 16px', 
            background: '#FDF6EC', 
            borderRadius: '100px', 
            marginBottom: '24px',
            border: '1px solid #E8B86D'
          }}>
            <span style={{ fontSize: '14px', color: '#92400E', fontWeight: 500 }}>
              🏥 Healthcare Hiring, Simplified
            </span>
          </div>
          
          <h1 style={{ 
            fontSize: 'clamp(40px, 6vw, 64px)', 
            fontWeight: 900, 
            color: '#0D1B3E', 
            lineHeight: 1.1,
            marginBottom: '24px'
          }}>
            Connecting Healthcare<br />
            <span style={{ background: 'linear-gradient(135deg, #C9973A, #E8B86D)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Professionals
            </span>{' '}
            With Agencies
          </h1>
          
          <p style={{ 
            fontSize: '20px', 
            color: '#64748B', 
            maxWidth: '600px', 
            margin: '0 auto 48px',
            lineHeight: 1.6
          }}>
            Careified is the trusted platform connecting qualified caregivers 
            with agencies. Find your match today.
          </p>
          
          {/* Who Are You? Choice */}
          <div style={{ 
            display: 'flex', 
            gap: '24px', 
            justifyContent: 'center', 
            flexWrap: 'wrap',
            marginBottom: '48px'
          }}>
            <div style={{
              background: 'white',
              borderRadius: '20px',
              padding: '40px',
              width: '300px',
              boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
              border: '2px solid transparent',
              transition: 'all 0.3s'
            }}>
              <div style={{ 
                width: '72px', height: '72px', 
                margin: '0 auto 20px',
                borderRadius: '18px', 
                background: 'linear-gradient(135deg, #0D1B3E, #1a2f5c)',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <span style={{ fontSize: '36px' }}>🏥</span>
              </div>
              <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#0D1B3E', marginBottom: '12px' }}>
                I am an Agency
              </h2>
              <p style={{ fontSize: '15px', color: '#64748B', marginBottom: '24px', lineHeight: 1.5 }}>
                Hire verified caregivers, post shifts, and manage your team.
              </p>
              <Link 
                href="/sign-up?role=agency"
                style={{ 
                  display: 'block',
                  padding: '14px 28px', 
                  background: 'linear-gradient(135deg, #C9973A, #E8B86D)',
                  color: '#0D1B3E', 
                  borderRadius: '12px', 
                  textDecoration: 'none', 
                  fontWeight: 700,
                  fontSize: '15px'
                }}
              >
                Start Hiring →
              </Link>
            </div>
            
            <div style={{
              background: 'white',
              borderRadius: '20px',
              padding: '40px',
              width: '300px',
              boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
              border: '2px solid transparent',
              transition: 'all 0.3s'
            }}>
              <div style={{ 
                width: '72px', height: '72px', 
                margin: '0 auto 20px',
                borderRadius: '18px', 
                background: 'linear-gradient(135deg, #C9973A, #E8B86D)',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <span style={{ fontSize: '36px' }}>👩‍⚕️</span>
              </div>
              <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#0D1B3E', marginBottom: '12px' }}>
                I am a Caregiver
              </h2>
              <p style={{ fontSize: '15px', color: '#64748B', marginBottom: '24px', lineHeight: 1.5 }}>
                Create your profile, get discovered, and find better opportunities.
              </p>
              <Link 
                href="/sign-up?role=caregiver"
                style={{ 
                  display: 'block',
                  padding: '14px 28px', 
                  background: '#0D1B3E',
                  color: 'white', 
                  borderRadius: '12px', 
                  textDecoration: 'none', 
                  fontWeight: 700,
                  fontSize: '15px'
                }}
              >
                Build Profile →
              </Link>
            </div>
          </div>
          
          <p style={{ fontSize: '14px', color: '#64748B' }}>
            Looking for care for a family member? <Link href="/for-families" style={{ color: '#C9973A', fontWeight: 600 }}>Learn more</Link>
          </p>
        </div>
      </section>

      {/* Stats Section */}
      <section style={{ padding: '60px 20px', background: '#0D1B3E' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '40px', textAlign: 'center' }}>
          {[
            { number: '2,500+', label: 'Verified Caregivers' },
            { number: '500+', label: 'Partner Agencies' },
            { number: '98%', label: 'Satisfaction Rate' },
            { number: '24hr', label: 'Average Match Time' },
          ].map((stat, i) => (
            <div key={i}>
              <div style={{ fontSize: '48px', fontWeight: 800, color: '#C9973A', marginBottom: '8px' }}>
                {stat.number}
              </div>
              <div style={{ fontSize: '16px', color: 'rgba(255,255,255,0.7)' }}>
                {stat.number === '98%' ? 'Satisfaction Rate' : stat.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section style={{ padding: '80px 20px' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: '36px', fontWeight: 800, color: '#0D1B3E', marginBottom: '16px' }}>
            How Careified Works
          </h2>
          <p style={{ fontSize: '18px', color: '#64748B', maxWidth: '600px', margin: '0 auto 48px' }}>
            A simple, transparent process for everyone
          </p>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ 
              display: 'flex', alignItems: 'center', gap: '24px',
              padding: '24px 32px',
              background: 'white',
              borderRadius: '16px',
              border: '1px solid #E2E8F0',
              textAlign: 'left',
              maxWidth: '600px',
              margin: '0 auto'
            }}>
              <div style={{ 
                width: '48px', height: '48px', 
                borderRadius: '12px', 
                background: '#FDF6EC',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '20px', fontWeight: 800, color: '#C9973A',
                flexShrink: 0
              }}>
                1
              </div>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0D1B3E', marginBottom: '4px' }}>
                  Create Your Profile
                </h3>
                <p style={{ fontSize: '14px', color: '#64748B' }}>
                  Agencies register or caregivers build their professional profile.
                </p>
              </div>
            </div>
            
            <div style={{ 
              display: 'flex', alignItems: 'center', gap: '24px',
              padding: '24px 32px',
              background: 'white',
              borderRadius: '16px',
              border: '1px solid #E2E8F0',
              textAlign: 'left',
              maxWidth: '600px',
              margin: '0 auto'
            }}>
              <div style={{ 
                width: '48px', height: '48px', 
                borderRadius: '12px', 
                background: '#FDF6EC',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '20px', fontWeight: 800, color: '#C9973A',
                flexShrink: 0
              }}>
                2
              </div>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0D1B3E', marginBottom: '4px' }}>
                  Get Verified
                </h3>
                <p style={{ fontSize: '14px', color: '#64748B' }}>
                  Credentials, certifications, and references are verified.
                </p>
              </div>
            </div>
            
            <div style={{ 
              display: 'flex', alignItems: 'center', gap: '24px',
              padding: '24px 32px',
              background: 'white',
              borderRadius: '16px',
              border: '1px solid #E2E8F0',
              textAlign: 'left',
              maxWidth: '600px',
              margin: '0 auto'
            }}>
              <div style={{ 
                width: '48px', height: '48px', 
                borderRadius: '12px', 
                background: '#FDF6EC',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '20px', fontWeight: 800, color: '#C9973A',
                flexShrink: 0
              }}>
                3
              </div>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0D1B3E', marginBottom: '4px' }}>
                  Connect & Grow
                </h3>
                <p style={{ fontSize: '14px', color: '#64748B' }}>
                  Find perfect matches and build lasting professional relationships.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* For Everyone Section */}
      <section style={{ padding: '80px 20px', background: 'white' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <h2 style={{ fontSize: '36px', fontWeight: 800, color: '#0D1B3E', marginBottom: '16px' }}>
              Built for Everyone in Healthcare
            </h2>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px' }}>
            {[
              {
                icon: '🏥',
                title: 'For Agencies',
                desc: 'Access thousands of verified caregivers. Post shifts, track performance, and build your dream team.',
                href: '/for-agencies',
                cta: 'Learn More'
              },
              {
                icon: '👩‍⚕️',
                title: 'For Caregivers',
                desc: 'Create your free profile, showcase your skills, and connect with agencies looking for talent like you.',
                href: '/for-caregivers',
                cta: 'Build Profile'
              },
              {
                icon: '👨‍👩‍👧',
                title: 'For Families',
                desc: 'Find trusted, verified caregivers to provide the best care for your loved ones at home.',
                href: '/for-families',
                cta: 'Learn More'
              },
            ].map((item, i) => (
              <div key={i} style={{ 
                padding: '32px', 
                background: '#F7F4F0',
                borderRadius: '20px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '48px', marginBottom: '20px' }}>{item.icon}</div>
                <h3 style={{ fontSize: '22px', fontWeight: 700, color: '#0D1B3E', marginBottom: '12px' }}>
                  {item.title}
                </h3>
                <p style={{ fontSize: '15px', color: '#64748B', lineHeight: 1.6, marginBottom: '24px' }}>
                  {item.desc}
                </p>
                <Link 
                  href={item.href}
                  style={{ 
                    display: 'inline-block',
                    padding: '12px 24px', 
                    background: '#0D1B3E',
                    color: 'white',
                    borderRadius: '10px',
                    textDecoration: 'none',
                    fontWeight: 600,
                    fontSize: '14px'
                  }}
                >
                  {item.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{ 
        padding: '80px 20px', 
        background: 'linear-gradient(135deg, #0D1B3E 0%, #1a2f5c 100%)',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '36px', fontWeight: 800, color: 'white', marginBottom: '16px' }}>
            Ready to Get Started?
          </h2>
          <p style={{ fontSize: '18px', color: 'rgba(255,255,255,0.7)', marginBottom: '32px' }}>
            Join thousands of healthcare professionals and agencies on Careified.
          </p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link 
              href="/sign-up?role=agency"
              style={{ 
                padding: '16px 32px', 
                background: 'linear-gradient(135deg, #C9973A, #E8B86D)',
                color: '#0D1B3E', 
                borderRadius: '12px', 
                textDecoration: 'none', 
                fontWeight: 700,
                fontSize: '16px'
              }}
            >
              Agency Sign Up
            </Link>
            <Link 
              href="/sign-up?role=caregiver"
              style={{ 
                padding: '16px 32px', 
                background: 'rgba(255,255,255,0.1)',
                color: 'white', 
                borderRadius: '12px', 
                textDecoration: 'none', 
                fontWeight: 600,
                fontSize: '16px',
                border: '2px solid rgba(255,255,255,0.2)'
              }}
            >
              Caregiver Sign Up
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ padding: '40px 20px', background: '#0D1B3E', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ 
              width: '32px', height: '32px', 
              borderRadius: '8px', 
              background: 'linear-gradient(135deg, #C9973A, #E8B86D)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <span style={{ fontWeight: 800, color: '#0D1B3E' }}>C</span>
            </div>
            <span style={{ color: 'white', fontWeight: 700 }}>Careified</span>
          </div>
          <div style={{ display: 'flex', gap: '24px' }}>
            <Link href="/for-agencies" style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none', fontSize: '14px' }}>For Agencies</Link>
            <Link href="/for-caregivers" style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none', fontSize: '14px' }}>For Caregivers</Link>
            <Link href="/for-families" style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none', fontSize: '14px' }}>For Families</Link>
            <Link href="/contact" style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none', fontSize: '14px' }}>Contact</Link>
            <Link href="/privacy" style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none', fontSize: '14px' }}>Privacy</Link>
            <Link href="/terms" style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none', fontSize: '14px' }}>Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
