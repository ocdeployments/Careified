export default function ContactPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#F7F4F0', padding: '80px 20px 40px' }}>
      <div style={{ maxWidth: '600px', margin: '0 auto', background: 'white', borderRadius: '16px', padding: '40px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#0D1B3E', marginBottom: '24px', textAlign: 'center' }}>Contact Us</h1>
        <p style={{ color: '#64748B', textAlign: 'center', marginBottom: '24px' }}>Have questions? We'd love to hear from you.</p>
        <div style={{ textAlign: 'center', padding: '24px', background: '#F7F4F0', borderRadius: '12px' }}>
          <p style={{ fontWeight: 600, color: '#0D1B3E', marginBottom: '8px' }}>Email</p>
          <a href="mailto:support@careified.com" style={{ color: '#1E3A8A' }}>support@careified.com</a>
        </div>
      </div>
    </div>
  )
}
