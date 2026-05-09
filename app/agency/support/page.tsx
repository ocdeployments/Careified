import { Mail } from 'lucide-react'

export default function AgencySupportPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#F7F4F0' }}>
      {/* Header */}
      <section style={{
        background: '#0D1B3E',
        padding: '48px 24px',
        textAlign: 'center',
      }}>
        <h1 style={{
          fontFamily: "'DM Serif Display', Georgia, serif",
          fontSize: '36px',
          color: '#fff',
          margin: '0 0 12px',
        }}>
          Agency Support
        </h1>
        <p style={{
          fontFamily: "'DM Sans', system-ui, sans-serif",
          fontSize: '16px',
          color: 'rgba(255,255,255,0.7)',
          margin: '0 auto',
          maxWidth: '500px',
        }}>
          Submit a request and our team will respond within 1 business day.
        </p>
      </section>

      {/* Content */}
      <div style={{ maxWidth: '500px', margin: '0 auto', padding: '48px 24px' }}>
        <a
          href="mailto:support@careified.com"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            padding: '10px 24px',
            background: 'linear-gradient(135deg, #C9973A, #E8B86D)',
            color: '#0D1B3E',
            borderRadius: '8px',
            fontWeight: 600,
            fontSize: '15px',
            fontFamily: "'DM Sans', system-ui, sans-serif",
            textDecoration: 'none',
            boxShadow: '0 2px 8px rgba(201,151,58,0.3)',
          }}
        >
          <Mail size={18} />
          Email Support
        </a>

        <p style={{
          fontFamily: "'DM Sans', system-ui, sans-serif",
          fontSize: '13px',
          color: '#64748B',
          marginTop: '24px',
          textAlign: 'center',
        }}>
          Ticketing system coming soon.
        </p>
      </div>
    </div>
  )
}
