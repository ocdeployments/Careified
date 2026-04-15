import Link from 'next/link'

export default function ForFamiliesPage() {
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
              For Families & Patients
            </span>
          </div>
          
          <h1 style={{ 
            fontSize: 'clamp(36px, 5vw, 56px)', 
            fontWeight: 900, 
            color: '#0D1B3E', 
            lineHeight: 1.1,
            marginBottom: '24px'
          }}>
            Peace of Mind for<br />
            <span style={{ background: 'linear-gradient(135deg, #C9973A, #E8B86D)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Your Loved Ones
            </span>
          </h1>
          
          <p style={{ 
            fontSize: '20px', 
            color: '#64748B', 
            maxWidth: '600px', 
            margin: '0 auto 40px',
            lineHeight: 1.6
          }}>
            Find trusted, verified caregivers to provide the best care for your 
            family members in the comfort of home.
          </p>
          
          <Link 
            href="/contact"
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
            Request Information →
          </Link>
        </div>
      </section>

      {/* Benefits */}
      <section style={{ padding: '60px 20px', background: 'white' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '32px', fontWeight: 800, color: '#0D1B3E', textAlign: 'center', marginBottom: '48px' }}>
            Why Families Trust Careified
          </h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '32px' }}>
            {[
              { title: 'Verified Caregivers', desc: 'All caregivers are background-checked and credential-verified.', icon: '🛡️' },
              { title: 'Quality Agencies', desc: 'We partner only with licensed, reputable home health agencies.', icon: '✅' },
              { title: 'Transparent Process', desc: 'Clear information about caregiver qualifications and experience.', icon: '🔍' },
              { title: 'Family Involvement', desc: 'Stay informed about care provided to your loved one.', icon: '👨‍👩‍👧' },
              { title: 'Flexible Care Options', desc: 'From part-time to live-in care, find what fits your needs.', icon: '⏰' },
              { title: 'Ongoing Support', desc: 'Our team is here to help you every step of the way.', icon: '💬' },
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
            Need Help Finding Care?
          </h2>
          <p style={{ fontSize: '18px', color: 'rgba(255,255,255,0.7)', marginBottom: '32px' }}>
            Contact us and we'll connect you with the right agency for your needs.
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
