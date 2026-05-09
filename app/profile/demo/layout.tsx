import Link from 'next/link'

export default function DemoLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* Minimal header */}
      <header
        style={{
          background: '#0D1B3E',
          height: '56px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 32px',
        }}
      >
        {/* Logo */}
        <Link
          href="/"
          style={{
            fontFamily: "'DM Serif Display', serif",
            fontSize: '22px',
            color: '#F5F0E8',
            textDecoration: 'none',
          }}
        >
          Careified
        </Link>

        {/* CTA */}
        <Link
          href="/profile/start"
          style={{
            background: 'linear-gradient(135deg, #C9973A, #E8B86D)',
            color: '#0D1B3E',
            fontWeight: 700,
            padding: '10px 20px',
            borderRadius: '999px',
            fontSize: '14px',
            textDecoration: 'none',
            display: 'inline-block',
          }}
        >
          Build My Profile →
        </Link>
      </header>

      {/* Page content */}
      {children}

      {/* Sticky bottom CTA bar */}
      <div
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          background: '#0D1B3E',
          height: '52px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '20px',
          padding: '0 24px',
        }}
      >
        <span style={{ color: 'white', fontFamily: "'DM Sans', sans-serif", fontSize: '13px', whiteSpace: 'nowrap' }}>
          Agencies see this profile when they search for caregivers
        </span>
        <Link
          href="/profile/start"
          style={{
            background: 'linear-gradient(135deg, #C9973A, #E8B86D)',
            color: '#0D1B3E',
            fontWeight: 700,
            padding: '10px 20px',
            borderRadius: '999px',
            fontSize: '14px',
            textDecoration: 'none',
            display: 'inline-block',
          }}
        >
          Build Mine Free →
        </Link>
      </div>

      {/* Bottom padding to account for fixed bar */}
      <div style={{ height: '52px' }} />
    </>
  )
}