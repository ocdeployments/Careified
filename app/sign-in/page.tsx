import Link from 'next/link'
export default function SignInPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#F7F4F0', padding: '80px 20px 40px' }}>
      <div style={{ maxWidth: '400px', margin: '0 auto', background: 'white', borderRadius: '16px', padding: '40px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#0D1B3E', marginBottom: '24px', textAlign: 'center' }}>Sign In</h1>
        <p style={{ color: '#64748B', textAlign: 'center' }}>Sign in functionality coming soon.</p>
        <div style={{ marginTop: '24px', textAlign: 'center' }}>
          <Link href="/" style={{ color: '#1E3A8A' }}>← Back to Home</Link>
        </div>
      </div>
    </div>
  )
}
