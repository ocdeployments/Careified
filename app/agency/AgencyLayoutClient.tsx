'use client'

import { useState, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import AgencySidebar, { SIDEBAR_WIDTHS } from '@/components/nav/AgencySidebar'
import { useWindowSize } from '@/lib/hooks/useWindowSize'
import { LayoutDashboard, Users, Briefcase, Zap, MoreHorizontal } from 'lucide-react'

interface AgencyLayoutClientProps {
  children: React.ReactNode
}

const MOBILE_TABS = [
  { label: 'Dashboard', href: '/agency/dashboard', icon: LayoutDashboard },
  { label: 'Clients', href: '/agency/clients', icon: Users },
  { label: 'Caregivers', href: '/agency/caregivers', icon: Briefcase },
  { label: 'Paracle', href: '/agency/airecruit', icon: Zap },
  { label: 'More', href: '/agency/settings', icon: MoreHorizontal },
]

export default function AgencyLayoutClient({ children }: AgencyLayoutClientProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { width: windowWidth, isMobile, isTablet } = useWindowSize()
  const [counts, setCounts] = useState({
    unmatched_clients: 0,
    pipeline: 0,
    expiring_credentials: 0,
    airecruit_results: 0,
    trial_ends_at: null as string | null,
    agency_name: null as string | null,
    agency_plan: null as string | null,
  })

  // Check excluded paths
  const excludedPaths = ['/agency/signup', '/agency/pending-approval', '/agency/join']
  const isExcluded = excludedPaths.some(path => pathname.startsWith(path))

  // Calculate sidebar width based on breakpoint
  const sidebarWidth = isMobile
    ? 0
    : isTablet
    ? SIDEBAR_WIDTHS.tablet
    : SIDEBAR_WIDTHS.desktop

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [pathname])

  // Fetch nav counts
  useEffect(() => {
    if (isExcluded) return

    fetch('/api/agency/nav-counts')
      .then(r => r.json())
      .then(data => {
        setCounts({
          unmatched_clients: data.clients_unmatched || 0,
          pipeline: data.pipeline || 0,
          expiring_credentials: data.credentials_expiring || 0,
          airecruit_results: data.airecruit_ready || 0,
          trial_ends_at: data.trial_ends_at || null,
          agency_name: data.agency_name || null,
          agency_plan: data.plan_tier || null,
        })
      })
      .catch(() => {})
  }, [isExcluded])

  if (isExcluded) {
    return <>{children}</>
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#080F1E', paddingBottom: isMobile ? 64 : 0 }}>
      {!isMobile && <AgencySidebar counts={counts} currentPath={pathname} isTablet={isTablet} agencyName={counts.agency_name || undefined} agencyPlan={counts.agency_plan || undefined} />}
      <main style={{ marginLeft: sidebarWidth, flex: 1, minHeight: '100vh', paddingBottom: isMobile ? 64 : 0 }}>
        {children}
      </main>
      {/* Mobile bottom tab bar */}
      {isMobile && (
        <div style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          height: 64,
          background: '#0D1B3E',
          borderTop: '1px solid rgba(255,255,255,0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-around',
          zIndex: 100,
        }}>
          {MOBILE_TABS.map(tab => {
            const isActive = pathname.startsWith(tab.href)
            const Icon = tab.icon
            return (
              <Link
                key={tab.href}
                href={tab.href}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 4,
                  textDecoration: 'none',
                  padding: '8px 12px',
                }}
              >
                <Icon size={20} color={isActive ? '#C9973A' : 'rgba(255,255,255,0.5)'} />
                <span style={{ fontSize: 10, color: isActive ? '#C9973A' : 'rgba(255,255,255,0.5)', fontWeight: 500 }}>
                  {tab.label}
                </span>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
