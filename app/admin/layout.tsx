import { ReactNode } from 'react'
import Link from 'next/link'
import { Users, Shield, Settings } from 'lucide-react'

const ADMIN_NAV = [
  { href: '/admin', label: 'Dashboard', icon: Shield },
  { href: '/admin/caregivers', label: 'Caregivers', icon: Users },
  { href: '/admin/status', label: 'Build Status', icon: Shield },
]

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F7F4F0' }}>
      {/* Sidebar */}
      <aside style={{
        width: '240px',
        background: '#0D1B3E',
        padding: '24px 16px',
        display: 'flex',
        flexDirection: 'column',
      }}>
        <div style={{ marginBottom: '32px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 12px',
            background: '#C9A84C',
            borderRadius: '6px',
            marginBottom: '24px',
          }}>
            <Shield size={14} color="#0D1B3E" />
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#0D1B3E', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Admin
            </span>
          </div>
          <h1 style={{
            fontFamily: "'DM Serif Display', Georgia, serif",
            fontSize: '20px',
            color: 'white',
            margin: 0,
          }}>
            Careified
          </h1>
        </div>

        <nav style={{ flex: 1 }}>
          {ADMIN_NAV.map(item => {
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  color: 'rgba(255,255,255,0.7)',
                  textDecoration: 'none',
                  fontSize: '14px',
                  marginBottom: '4px',
                  transition: 'all 0.15s',
                }}
              >
                <Icon size={18} />
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '16px' }}>
          <Link
            href="/settings/data-rights"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 16px',
              borderRadius: '8px',
              color: 'rgba(255,255,255,0.5)',
              textDecoration: 'none',
              fontSize: '14px',
            }}
          >
            <Settings size={18} />
            Settings
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <main style={{ flex: 1, padding: '32px', overflow: 'auto' }}>
        {children}
      </main>
    </div>
  )
}
