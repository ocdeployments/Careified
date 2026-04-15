import Link from 'next/link'

export default function PrivacyPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#F7F4F0' }}>
      <section style={{ padding: '140px 20px 80px' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h1 style={{ 
            fontSize: 'clamp(32px, 4vw, 48px)', 
            fontWeight: 900, 
            color: '#0D1B3E', 
            marginBottom: '16px'
          }}>
            Privacy <span style={{ background: 'linear-gradient(135deg, #C9973A, #E8B86D)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Policy</span>
          </h1>
          <p style={{ fontSize: '14px', color: '#64748B', marginBottom: '40px' }}>
            Last updated: April 14, 2026
          </p>
          
          <div style={{ 
            background: 'white',
            borderRadius: '24px',
            padding: '48px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', color: '#64748B', lineHeight: 1.8, fontSize: '15px' }}>
              <section>
                <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#0D1B3E', marginBottom: '16px' }}>
                  1. Information We Collect
                </h2>
                <p>We collect information you provide directly, including:</p>
                <ul style={{ paddingLeft: '24px', marginTop: '12px' }}>
                  <li>Contact information (name, email, phone number)</li>
                  <li>Professional credentials and certifications</li>
                  <li>Work history and experience</li>
                  <li>Profile information and photos</li>
                  <li>Agency business information</li>
                </ul>
              </section>
              
              <section>
                <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#0D1B3E', marginBottom: '16px' }}>
                  2. How We Use Your Information
                </h2>
                <p>We use the information we collect to:</p>
                <ul style={{ paddingLeft: '24px', marginTop: '12px' }}>
                  <li>Provide and improve our services</li>
                  <li>Match caregivers with agencies</li>
                  <li>Communicate about your account and updates</li>
                  <li>Ensure platform security and compliance</li>
                </ul>
              </section>
              
              <section>
                <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#0D1B3E', marginBottom: '16px' }}>
                  3. Information Sharing
                </h2>
                <p>We share your information only in these circumstances:</p>
                <ul style={{ paddingLeft: '24px', marginTop: '12px' }}>
                  <li>With agencies when you apply for positions</li>
                  <li>With your consent</li>
                  <li>As required by law</li>
                </ul>
              </section>
              
              <section>
                <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#0D1B3E', marginBottom: '16px' }}>
                  4. Data Security
                </h2>
                <p>We implement appropriate security measures to protect your personal information from unauthorized access, alteration, or destruction.</p>
              </section>
              
              <section>
                <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#0D1B3E', marginBottom: '16px' }}>
                  5. Contact Us
                </h2>
                <p>If you have questions about this Privacy Policy, please contact us at <a href="mailto:privacy@careified.com" style={{ color: '#C9973A' }}>privacy@careified.com</a></p>
              </section>
            </div>
          </div>
          
          <div style={{ textAlign: 'center', marginTop: '40px' }}>
            <Link href="/" style={{ color: '#64748B', textDecoration: 'none' }}>
              ← Back to Home
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
