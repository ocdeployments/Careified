import Link from 'next/link'
export default function SignUpPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#F7F4F0', padding: '80px 20px 40px' }}>
      <div style={{ maxWidth: '400px', margin: '0 auto', background: 'white', borderRadius: '16px', padding: '40px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#0D1B3E', marginBottom: '24px', textAlign: 'center' }}>Get Started</h1>
        <p style={{ color: '#64748B', textAlign: 'center' }}>Choose your path:</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '24px' }}>
          <Link href="/profile/build" style={{ display: 'block', padding: '16px', background: '#0D1B3E', color: 'white', borderRadius: '12px', textAlign: 'center', textDecoration: 'none' }}>I'm a Caregiver</Link>
          <Link href="/agency/signup" style={{ display: 'block', padding: '16px', background: '#1E3A8A', color: 'white', borderRadius: '12px', textAlign: 'center', textDecoration: 'none' }}>I'm an Agency</Link>
        </div>
      </div>
    </div>
  )
}
