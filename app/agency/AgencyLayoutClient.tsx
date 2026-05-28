'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import AgencySidebar, { SIDEBAR_WIDTHS } from '@/components/nav/AgencySidebar'

interface AgencyLayoutClientProps {
  children: React.ReactNode
}

export default function AgencyLayoutClient({ children }: AgencyLayoutClientProps) {
  const pathname = usePathname()
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200)
  const [counts, setCounts] = useState({
    unmatched_clients: 0,
    pipeline: 0,
    expiring_credentials: 0,
    airecruit_results: 0,
  })

  // Check excluded paths
  const excludedPaths = ['/agency/signup', '/agency/pending-approval', '/agency/join']
  const isExcluded = excludedPaths.some(path => pathname.startsWith(path))

  // Handle window resize
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Responsive breakpoints
  const isMobile = windowWidth < 768
  const isTablet = windowWidth >= 768 && windowWidth < 1024

  // Calculate sidebar width based on breakpoint
  const sidebarWidth = isMobile
    ? SIDEBAR_WIDTHS.mobile
    : isTablet
    ? SIDEBAR_WIDTHS.tablet
    : SIDEBAR_WIDTHS.desktop

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
        })
      })
      .catch(() => {})
  }, [isExcluded])

  if (isExcluded) {
    return <>{children}</>
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#080F1E' }}>
      <AgencySidebar counts={counts} currentPath={pathname} />
      <main style={{ marginLeft: sidebarWidth, flex: 1, minHeight: '100vh' }}>
        {children}
      </main>
    </div>
  )
}