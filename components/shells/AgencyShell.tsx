'use client'
import { ReactNode, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Search, Bookmark, Users, ChevronRight } from 'lucide-react'

const NAV = [
  { href: '/agency/search', label: 'Search', icon: <Search size={16} /> },
  { href: '/agency/shortlist', label: 'Shortlist', icon: <Bookmark size={16} /> },
  { href: '/agency/roster', label: 'Roster', icon: <Users size={16} /> },
]

export function AgencyShell({ children, title, subtitle }: { children: ReactNode; title?: string; subtitle?: string }) {
  const pathname = usePathname()
  const [col, setCol] = useState(false)

  return (
    <div style={{ display: 'flex', minHeight: 'calc(100vh - 73px)', background: '#F7F4F0' }}>

      {/* Sidebar */}
      <aside style={{
        width: col ? '64px' : '220px',
        minWidth: col ? '64px' : '220px',
        background: '#FFFFFF',
        borderRight: '1px solid #E2E8F0',
        display: 'flex',
        flexDirection: 'column',
        position: 'sticky',
        top: '73px',
        height: 'calc(100vh - 73px)',
        overflowY: 'auto',
        overflowX: 'hidden',
        transition: 'width 200ms ease, min-width 200ms ease',
        zIndex: 10,
      }}>
        {/* Header */}
        <div style={{ padding: '20px 16px 12px', borderBottom: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', justifyContent: col ? 'center' : 'space-between' }}>
          {!col && <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#94A3B8' }}>Agency</span>}
          <button onClick={() => setCol(!col)} style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '24px',
            height: '24px',
            borderRadius: '6px',
            border: 'none',
            background: 'transparent',
            cursor: 'pointer',
            color: '#94A3B8',
            transform: col ? 'rotate(0deg)' : 'rotate(180deg)',
            transition: 'transform 200ms ease',
          }}>
            <ChevronRight size={14} />
          </button>
        </div>

        {/* Nav */}
        <nav style={{ padding: '8px', flex: 1 }}>
          {NAV.map(item => {
            const active = pathname === item.href || pathname.startsWith(item.href + '/')
            return (
              <Link key={item.href} href={item.href} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: col ? '10px' : '9px 12px',
                borderRadius: '10px',
                marginBottom: '2px',
                textDecoration: 'none',
                justifyContent: col ? 'center' : 'flex-start',
                background: active ? 'rgba(201,151,58,0.08)' : 'transparent',
                borderLeft: active ? '2px solid #C9973A' : '2px solid transparent',
                color: active ? '#92400E' : '#64748B',
                fontFamily: "'Inter', sans-serif",
                fontSize: '13px',
                fontWeight: active ? 600 : 400,
                transition: 'all 150ms ease',
              }}
                onMouseEnter={e => { if (!active) { e.currentTarget.style.background = '#F8FAFC'; e.currentTarget.style.color = '#0D1B3E' } }}
                onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#64748B' } }}
              >
                <span style={{ flexShrink: 0, display: 'flex' }}>{item.icon}</span>
                {!col && <span style={{ flex: 1 }}>{item.label}</span>}
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        <div style={{ padding: '12px 8px', borderTop: '1px solid #F1F5F9' }}>
          {!col && <span style={{ display: 'block', padding: '8px 12px', fontFamily: "'Inter', sans-serif", fontSize: '11px', color: '#94A3B8' }}>Careified Agency</span>}
        </div>
      </aside>

      {/* Main */}
      <main style={{ flex: 1, minWidth: 0, overflow: 'auto' }}>
        {(title || subtitle) && (
          <div style={{ padding: '28px 32px 0', marginBottom: '24px' }}>
            {title && <h1 style={{ margin: 0, fontFamily: "'Inter', sans-serif", fontSize: '28px', fontWeight: 400, color: '#0D1B3E', letterSpacing: '-0.02em', lineHeight: 1.2 }}>{title}</h1>}
            {subtitle && <p style={{ margin: '6px 0 0', fontFamily: "'Inter', sans-serif", fontSize: '14px', color: '#64748B', lineHeight: 1.5 }}>{subtitle}</p>}
          </div>
        )}
        <div style={{ padding: '0 32px 48px' }}>{children}</div>
      </main>
    </div>
  )
}

export default AgencyShell