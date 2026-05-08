import Link from 'next/link'

export default function DemoLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* Announcement bar */}
      <div
        style={{
          background: '#FDF6EC',
          borderBottom: '1px solid #C9973A',
          padding: '10px 24px',
          textAlign: 'center',
          fontFamily: "'DM Sans', sans-serif",
          fontSize: '14px',
          color: '#0D1B3E',
        }}
      >
        You're viewing a sample Careified profile. This is exactly what agencies see when they search for caregivers.
      </div>

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
    </>
  )
}