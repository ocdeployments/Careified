import Link from 'next/link'
export default function ForAgenciesPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#F7F4F0', padding: '80px 20px 40px' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
        <h1 style={{ fontSize: '36px', fontWeight: 800, color: '#0D1B3E', marginBottom: '16px' }}>For Agencies</h1>
        <p style={{ fontSize: '18px', color: '#64748B', marginBottom: '32px' }}>Find verified, qualified caregivers for your clients.</p>
        <Link href="/agency/signup" style={{ display: 'inline-block', padding: '16px 32px', background: '#0D1B3E', color: 'white', borderRadius: '12px', textDecoration: 'none', fontWeight: 600 }}>Get Started</Link>
      </div>
    </div>
  )
}
