import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'

export default async function DemoLoginPage() {
  const cookieStore = await cookies()
  const demoSession = cookieStore.get('careified_demo_session')

  if (demoSession) {
    redirect('/agency/dashboard')
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#F7F4F0',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '16px',
        border: '1px solid #E2E8F0',
        padding: '48px',
        maxWidth: '480px',
        width: '100%',
        textAlign: 'center'
      }}>
        <h1 style={{
          fontFamily: '"DM Serif Display", serif',
          fontSize: '32px',
          color: '#0D1B3E',
          marginBottom: '8px'
        }}>
          Careified
        </h1>
        <h2 style={{
          fontFamily: '"DM Sans", sans-serif',
          fontSize: '24px',
          fontWeight: 600,
          color: '#0D1B3E',
          marginTop: '24px',
          marginBottom: '12px'
        }}>
          Welcome to your Careified demo
        </h2>
        <p style={{
          fontFamily: '"DM Sans", sans-serif',
          fontSize: '16px',
          color: '#64748B',
          lineHeight: 1.6,
          marginBottom: '32px'
        }}>
          You&apos;re about to explore a pre-loaded agency account showing 2 weeks of platform activity.
        </p>
        <div style={{
          background: '#F7F4F0',
          borderRadius: '12px',
          padding: '24px',
          textAlign: 'left',
          marginBottom: '32px'
        }}>
          <p style={{
            fontFamily: '"DM Sans", sans-serif',
            fontSize: '14px',
            fontWeight: 600,
            color: '#0D1B3E',
            marginBottom: '16px'
          }}>
            What you&apos;ll see:
          </p>
          <ul style={{
            fontFamily: '"DM Sans", sans-serif',
            fontSize: '14px',
            color: '#475569',
            listStyle: 'none',
            padding: 0,
            margin: 0
          }}>
            <li style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ color: '#C9973A', marginRight: '8px' }}>•</span>
              4 caregivers on your roster
            </li>
            <li style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ color: '#C9973A', marginRight: '8px' }}>•</span>
              8 AIRecruit screening results
            </li>
            <li style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ color: '#C9973A', marginRight: '8px' }}>•</span>
              Active client matches
            </li>
            <li style={{ display: 'flex', alignItems: 'center' }}>
              <span style={{ color: '#C9973A', marginRight: '8px' }}>•</span>
              Full agency dashboard
            </li>
          </ul>
        </div>
        <form action="/api/demo/session" method="POST">
          <input type="hidden" name="agencyId" value="57e1d648-3ca0-4a95-afb6-93d854690aac" />
          <button
            type="submit"
            style={{
              width: '100%',
              padding: '16px 24px',
              background: 'linear-gradient(135deg, #C9973A, #E8B86D)',
              border: 'none',
              borderRadius: '12px',
              fontFamily: '"DM Sans", sans-serif',
              fontSize: '16px',
              fontWeight: 600,
              color: '#0D1B3E',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(201, 151, 58, 0.3)'
            }}
          >
            Enter Demo
          </button>
        </form>
        <p style={{
          fontFamily: '"DM Sans", sans-serif',
          fontSize: '12px',
          color: '#94A3B8',
          marginTop: '24px'
        }}>
          This is a demo environment. Data shown is for demonstration purposes only.
        </p>
      </div>
    </div>
  )
}
