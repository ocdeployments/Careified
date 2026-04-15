import Link from 'next/link'

export default function AboutPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#F7F4F0' }}>
      {/* Hero */}
      <section style={{ padding: '140px 20px 80px', textAlign: 'center' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h1 style={{ 
            fontSize: 'clamp(36px, 5vw, 56px)', 
            fontWeight: 900, 
            color: '#0D1B3E', 
            lineHeight: 1.1,
            marginBottom: '24px'
          }}>
            About <span style={{ background: 'linear-gradient(135deg, #C9973A, #E8B86D)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Careified</span>
          </h1>
          
          <p style={{ 
            fontSize: '20px', 
            color: '#64748B', 
            maxWidth: '700px', 
            margin: '0 auto',
            lineHeight: 1.6
          }}>
            We're on a mission to transform how healthcare agencies find and hire 
            quality caregivers. Careified connects verified professionals with 
            agencies that need them.
          </p>
        </div>
      </section>

      {/* Mission */}
      <section style={{ padding: '60px 20px', background: 'white' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <div style={{ 
            padding: '48px', 
            background: '#F7F4F0',
            borderRadius: '24px',
            textAlign: 'center'
          }}>
            <h2 style={{ fontSize: '32px', fontWeight: 800, color: '#0D1B3E', marginBottom: '24px' }}>
              Our Mission
            </h2>
            <p style={{ fontSize: '20px', color: '#64748B', lineHeight: 1.7, maxWidth: '700px', margin: '0 auto' }}>
              To ensure every person receives the quality care they deserve by 
              connecting agencies with verified, passionate healthcare professionals 
              who can deliver it.
            </p>
          </div>
        </div>
      </section>

      {/* Values */}
      <section style={{ padding: '80px 20px' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '32px', fontWeight: 800, color: '#0D1B3E', textAlign: 'center', marginBottom: '48px' }}>
            Our Values
          </h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '32px' }}>
            {[
              { title: 'Trust & Transparency', desc: 'We believe in honest, open relationships with everyone on our platform.' },
              { title: 'Quality Over Quantity', desc: 'We verify every caregiver to ensure the highest standards.' },
              { title: 'Empathy First', desc: 'We understand the heart of caregiving and honor that in everything we do.' },
              { title: 'Continuous Improvement', desc: 'We are always working to make our platform better for our community.' },
            ].map((item, i) => (
              <div key={i} style={{ 
                padding: '32px', 
                background: 'white',
                borderRadius: '16px',
                border: '1px solid #E2E8F0'
              }}>
                <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#0D1B3E', marginBottom: '12px' }}>
                  {item.title}
                </h3>
                <p style={{ fontSize: '15px', color: '#64748B', lineHeight: 1.6 }}>
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section style={{ 
        padding: '80px 20px', 
        background: '#0D1B3E',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '32px', fontWeight: 800, color: 'white', marginBottom: '16px' }}>
            Get In Touch
          </h2>
          <p style={{ fontSize: '18px', color: 'rgba(255,255,255,0.7)', marginBottom: '32px' }}>
            Have questions? We'd love to hear from you.
          </p>
          <Link 
            href="/contact"
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
            Contact Us →
          </Link>
        </div>
      </section>
    </div>
  )
}
