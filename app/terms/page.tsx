import Link from 'next/link'

export default function TermsPage() {
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
            Terms of <span style={{ background: 'linear-gradient(135deg, #C9973A, #E8B86D)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Service</span>
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
                  1. Acceptance of Terms
                </h2>
                <p>By accessing and using Careified, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our platform.</p>
              </section>
              
              <section>
                <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#0D1B3E', marginBottom: '16px' }}>
                  2. Description of Service
                </h2>
                <p>Careified provides a platform connecting healthcare agencies with qualified caregivers. We facilitate introductions and provide tools for managing the hiring process, but we are not a party to any employment relationship.</p>
              </section>
              
              <section>
                <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#0D1B3E', marginBottom: '16px' }}>
                  3. User Responsibilities
                </h2>
                <p>As a user of Careified, you agree to:</p>
                <ul style={{ paddingLeft: '24px', marginTop: '12px' }}>
                  <li>Provide accurate and truthful information</li>
                  <li>Maintain the security of your account</li>
                  <li>Use the platform in compliance with applicable laws</li>
                  <li>Not engage in fraudulent or misleading conduct</li>
                </ul>
              </section>
              
              <section>
                <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#0D1B3E', marginBottom: '16px' }}>
                  4. Verification and Background Checks
                </h2>
                <p>While we encourage verification of credentials and background checks, Careified does not guarantee the accuracy of information provided by users. Agencies are responsible for conducting their own due diligence.</p>
              </section>
              
              <section>
                <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#0D1B3E', marginBottom: '16px' }}>
                  5. Limitation of Liability
                </h2>
                <p>Careified is not responsible for any employment-related decisions made between agencies and caregivers. We are not a recruiting agency and do not employ caregivers ourselves.</p>
              </section>
              
              <section>
                <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#0D1B3E', marginBottom: '16px' }}>
                  6. Changes to Terms
                </h2>
                <p>We reserve the right to modify these terms at any time. Continued use of the platform after changes constitutes acceptance of the new terms.</p>
              </section>
              
              <section>
                <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#0D1B3E', marginBottom: '16px' }}>
                  7. Contact
                </h2>
                <p>For questions about these Terms, please contact us at <a href="mailto:legal@careified.com" style={{ color: '#C9973A' }}>legal@careified.com</a></p>
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
