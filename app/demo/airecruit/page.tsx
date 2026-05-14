import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'

export default async function DemoAirecruitPage() {
  const cookieStore = await cookies()
  const demoSession = cookieStore.get('careified_demo_session')

  if (!demoSession) {
    redirect('/demo/login')
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#F7F4F0',
      fontFamily: '"DM Sans", sans-serif',
      color: '#0D1B3E'
    }}>
      {/* Header */}
      <header style={{
        background: '#0D1B3E',
        padding: '16px 24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <h1 style={{
            fontFamily: '"DM Serif Display", serif',
            fontSize: '24px',
            color: 'white',
            margin: 0
          }}>
            Careified
          </h1>
          <p style={{
            fontSize: '12px',
            color: '#94A3B8',
            margin: '4px 0 0'
          }}>
            Demo — AIRecruit Screening Results
          </p>
        </div>
        <a
          href="/agency/dashboard"
          style={{
            padding: '8px 16px',
            background: 'rgba(255,255,255,0.1)',
            borderRadius: '8px',
            color: 'white',
            textDecoration: 'none',
            fontSize: '13px'
          }}
        >
          Back to Dashboard
        </a>
      </header>

      {/* Main content */}
      <main style={{ padding: '32px 24px', maxWidth: '1000px', margin: '0 auto' }}>
        <div style={{
          background: 'white',
          borderRadius: '16px',
          border: '1px solid #E2E8F0',
          overflow: 'hidden'
        }}>
          <div style={{
            padding: '20px 24px',
            borderBottom: '1px solid #E2E8F0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div>
              <h2 style={{
                fontSize: '18px',
                fontWeight: 700,
                margin: 0
              }}>
                AI Screening Results
              </h2>
              <p style={{
                fontSize: '13px',
                color: '#64748B',
                margin: '4px 0 0'
              }}>
                Demo campaign — 8 candidates screened
              </p>
            </div>
            <div style={{
              display: 'flex',
              gap: '12px'
            }}>
              <span style={{
                padding: '6px 12px',
                background: '#F0FDF4',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: 600,
                color: '#16A34A'
              }}>
                5 Advance
              </span>
              <span style={{
                padding: '6px 12px',
                background: '#FEF3C7',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: 600,
                color: '#D97706'
              }}>
                2 Review
              </span>
              <span style={{
                padding: '6px 12px',
                background: '#FEE2E2',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: 600,
                color: '#DC2626'
              }}>
                1 Pass
              </span>
            </div>
          </div>

          {/* Results table */}
          <div style={{ padding: '0 24px 24px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #E2E8F0' }}>
                  <th style={{ textAlign: 'left', padding: '12px 8px', fontSize: '11px', color: '#64748B', fontWeight: 600 }}>CANDIDATE</th>
                  <th style={{ textAlign: 'left', padding: '12px 8px', fontSize: '11px', color: '#64748B', fontWeight: 600 }}>SCORE</th>
                  <th style={{ textAlign: 'left', padding: '12px 8px', fontSize: '11px', color: '#64748B', fontWeight: 600 }}>RECOMMENDATION</th>
                  <th style={{ textAlign: 'left', padding: '12px 8px', fontSize: '11px', color: '#64748B', fontWeight: 600 }}>SUMMARY</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { name: 'Sarah Miller', score: 92, rec: 'advance', summary: 'Strong communication, 7 years experience, available immediately' },
                  { name: 'Jennifer Lee', score: 88, rec: 'advance', summary: 'Excellent fit, specialized in dementia care' },
                  { name: 'David Park', score: 85, rec: 'advance', summary: 'Good skills, references pending verification' },
                  { name: 'Maria Santos', score: 82, rec: 'advance', summary: 'Experienced PSW, strong assessment skills' },
                  { name: 'James Wilson', score: 79, rec: 'advance', summary: 'Available, needs credential verification' },
                  { name: 'Michael Brown', score: 75, rec: 'review', summary: 'Good candidate, needs verification on certifications' },
                  { name: 'Linda Chen', score: 68, rec: 'review', summary: 'Some experience, limited availability' },
                  { name: 'Robert Johnson', score: 55, rec: 'pass', summary: 'Does not meet minimum requirements' },
                ].map((c, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #F1F5F9' }}>
                    <td style={{ padding: '14px 8px', fontSize: '14px', fontWeight: 600 }}>{c.name}</td>
                    <td style={{ padding: '14px 8px' }}>
                      <span style={{
                        display: 'inline-block',
                        width: '40px',
                        height: '40px',
                        lineHeight: '40px',
                        textAlign: 'center',
                        borderRadius: '8px',
                        background: c.score >= 80 ? '#F0FDF4' : c.score >= 70 ? '#FEF3C7' : '#FEE2E2',
                        color: c.score >= 80 ? '#16A34A' : c.score >= 70 ? '#D97706' : '#DC2626',
                        fontWeight: 700,
                        fontSize: '13px'
                      }}>
                        {c.score}
                      </span>
                    </td>
                    <td style={{ padding: '14px 8px' }}>
                      <span style={{
                        padding: '4px 10px',
                        borderRadius: '12px',
                        fontSize: '11px',
                        fontWeight: 700,
                        background: c.rec === 'advance' ? '#F0FDF4' : c.rec === 'review' ? '#FEF3C7' : '#FEE2E2',
                        color: c.rec === 'advance' ? '#16A34A' : c.rec === 'review' ? '#D97706' : '#DC2626',
                        textTransform: 'uppercase'
                      }}>
                        {c.rec}
                      </span>
                    </td>
                    <td style={{ padding: '14px 8px', fontSize: '13px', color: '#64748B' }}>{c.summary}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Disclaimer */}
        <p style={{
          textAlign: 'center',
          fontSize: '12px',
          color: '#94A3B8',
          marginTop: '24px'
        }}>
          This is a demo. All data shown is for demonstration purposes only.
        </p>
      </main>
    </div>
  )
}
