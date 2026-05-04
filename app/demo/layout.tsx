'use client'
import { ReactNode } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Search, Bookmark, Users, Briefcase, Phone, Home, X } from 'lucide-react'
import { DEMO_BANNER } from '@/lib/demo'

const DEMO_NAV = [
  { href: '/demo', label: 'Dashboard', icon: Home },
  { href: '/demo/search', label: 'Search', icon: Search },
  { href: '/demo/clients', label: 'Clients', icon: Briefcase },
  { href: '/demo/shortlist', label: 'Shortlist', icon: Bookmark },
  { href: '/demo/airecruit', label: 'AIRecruit', icon: Phone },
]

export default function DemoLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname()

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F7F4F0' }}>
      {/* Demo Banner */}
      <div style={{
        backgroundColor: '#0D1B3E',
        color: '#fff',
        padding: '8px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '12px',
        fontSize: '13px',
      }}>
        <span>{DEMO_BANNER.message}</span>
        <Link
          href={DEMO_BANNER.ctaLink}
          style={{
            backgroundColor: '#C9973A',
            color: '#0D1B3E',
            padding: '4px 12px',
            borderRadius: '4px',
            fontWeight: '600',
            fontSize: '12px',
            textDecoration: 'none',
          }}
        >
          {DEMO_BANNER.cta}
        </Link>
      </div>

      {/* Main layout */}
      <div style={{ display: 'flex', minHeight: 'calc(100vh - 41px)' }}>
        {/* Sidebar */}
        <aside style={{
          width: '220px',
          backgroundColor: '#fff',
          borderRight: '1px solid #E2E8F0',
          padding: '20px 0',
          flexShrink: 0,
        }}>
          {/* Logo area */}
          <div style={{ padding: '0 20px', marginBottom: '24px' }}>
            <div style={{ fontSize: '18px', fontWeight: '700', color: '#0D1B3E', fontFamily: 'DM Serif Display, serif' }}>
              CareFirst
            </div>
            <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>Demo Agency</div>
          </div>

          {/* Navigation */}
          <nav>
            {DEMO_NAV.map(item => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '10px 20px',
                    color: isActive ? '#0D1B3E' : '#64748B',
                    backgroundColor: isActive ? '#FDF6EC' : 'transparent',
                    borderLeft: isActive ? '3px solid #C9973A' : '3px solid transparent',
                    textDecoration: 'none',
                    fontSize: '14px',
                    fontWeight: isActive ? '600' : '400',
                  }}
                >
                  <Icon size={18} />
                  {item.label}
                </Link>
              )
            })}
          </nav>

          {/* Demo notice */}
          <div style={{
            margin: 'auto 16px 0',
            padding: '12px',
            backgroundColor: '#FEF3C7',
            borderRadius: '8px',
            fontSize: '12px',
            color: '#92400E',
          }}>
            This is a demo. Data is read-only and will not be saved.
          </div>
        </aside>

        {/* Main content */}
        <main style={{ flex: 1, padding: '24px 32px', overflowX: 'hidden' }}>
          {children}
        </main>
      </div>
    </div>
  )
}