'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { UserButton } from '@clerk/nextjs'
import { useWindowSize } from '@/lib/hooks/useWindowSize'

export const SIDEBAR_WIDTHS = {
  desktop: 220,
  tablet: 60,
  mobile: 0,
}

interface AgencySidebarProps {
  counts?: {
    unmatched_clients: number
    pipeline: number
    expiring_credentials: number
    airecruit_results: number
    trial_ends_at: string | null
  }
  currentPath: string
  isTablet?: boolean
}

interface NavItem {
  label: string
  href: string
  badge?: 'unmatched' | 'pipeline' | 'credentials' | 'airecruit'
  disabled?: boolean
}

interface NavSection {
  title: string
  items: NavItem[]
}

const navSections: NavSection[] = [
  {
    title: 'TRIAGE',
    items: [
      { label: 'Dashboard', href: '/agency/dashboard' },
    ],
  },
  {
    title: 'CLIENT OPERATIONS',
    items: [
      { label: 'Clients', href: '/agency/clients', badge: 'unmatched' },
      { label: 'Placements', href: '/agency/placements', disabled: true },
      { label: 'Shortlist', href: '/agency/shortlist', badge: 'pipeline' },
    ],
  },
  {
    title: 'TALENT ACQUISITION',
    items: [
      { label: 'Find Caregivers', href: '/agency/caregivers' },
      { label: 'Roster', href: '/agency/roster', badge: 'credentials' },
      { label: 'AIRecruit', href: '/agency/airecruit', badge: 'airecruit' },
      { label: 'QuickFill', href: '/agency/quickfill', disabled: true },
    ],
  },
  {
    title: 'INTELLIGENCE',
    items: [
      { label: 'Performance', href: '/agency/intelligence' },
      { label: 'Bench Strength', href: '/agency/intelligence?tab=bench', disabled: true },
    ],
  },
  {
    title: 'ADMIN',
    items: [
      { label: 'Settings', href: '/agency/settings' },
      { label: 'Support', href: '/agency/support' },
    ],
  },
]

function getBadgeHref(item: NavItem): string {
  if (item.badge === 'unmatched') return '/agency/clients?tab=unmatched'
  if (item.badge === 'airecruit') return '/agency/airecruit?tab=results'
  if (item.badge === 'credentials') return '/agency/roster?tab=credentials'
  return item.href
}

function getBadgeCount(counts: AgencySidebarProps['counts'], badge?: string): number {
  if (!counts) return 0
  if (badge === 'unmatched') return counts.unmatched_clients
  if (badge === 'pipeline') return counts.pipeline
  if (badge === 'credentials') return counts.expiring_credentials
  if (badge === 'airecruit') return counts.airecruit_results
  return 0
}

export default function AgencySidebar({ counts, currentPath, isTablet: propIsTablet }: AgencySidebarProps) {
  const pathname = usePathname()
  const { isTablet: hookIsTablet } = useWindowSize()
  const isTablet = propIsTablet ?? hookIsTablet
  const [hoveredItem, setHoveredItem] = useState<string | null>(null)

  const isActive = (href: string) => {
    if (href.includes('?')) {
      return pathname === href.split('?')[0]
    }
    return pathname.startsWith(href)
  }

  const containerStyle: React.CSSProperties = {
    width: isTablet ? 60 : 220,
    background: '#0D1B3E',
    borderRight: '1px solid rgba(255,255,255,0.07)',
    paddingTop: '0',
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    position: 'fixed',
    top: 0,
    left: 0,
    overflowY: 'auto',
    overflowX: 'hidden',
    zIndex: 100,
  }

  const logoAreaStyle: React.CSSProperties = {
    padding: isTablet ? '16px 8px' : '20px 20px 16px',
    borderBottom: '1px solid rgba(255,255,255,0.07)',
    marginBottom: '8px',
    display: 'flex',
    justifyContent: 'center',
  }

  const logoTextStyle: React.CSSProperties = {
    fontSize: isTablet ? 18 : 16,
    fontWeight: 700,
    color: '#F5F0E8',
    fontFamily: "'DM Serif Display', serif",
    letterSpacing: '-0.01em',
  }

  const sectionLabelStyle: React.CSSProperties = {
    fontSize: isTablet ? 0 : 10,
    fontWeight: 700,
    letterSpacing: '0.12em',
    color: 'rgba(255,255,255,0.35)',
    textTransform: 'uppercase',
    padding: isTablet ? '24px 4px 8px' : '24px 20px 8px',
    fontFamily: "'DM Sans', sans-serif",
    overflow: 'hidden',
    whiteSpace: 'nowrap',
  }

  const navItemStyle = (item: NavItem, active: boolean): React.CSSProperties => ({
    fontSize: isTablet ? 0 : 14,
    fontWeight: active ? 600 : 400,
    fontFamily: "'DM Sans', sans-serif",
    padding: isTablet ? '12px 8px' : '9px 20px',
    color: item.disabled ? 'rgba(255,255,255,0.25)' : (active || hoveredItem === item.href ? '#F5F0E8' : 'rgba(255,255,255,0.65)'),
    display: 'flex',
    alignItems: 'center',
    justifyContent: isTablet ? 'center' : 'space-between',
    borderLeft: active ? '2px solid #C9973A' : (hoveredItem === item.href && !item.disabled ? '2px solid rgba(201,151,58,0.4)' : '2px solid transparent'),
    transition: 'background 0.15s ease, color 0.15s ease, border-color 0.15s ease',
    cursor: item.disabled ? 'not-allowed' : 'pointer',
    textDecoration: 'none',
    borderRadius: '0 6px 6px 0',
    marginRight: isTablet ? '0' : '8px',
    background: active ? 'rgba(201,151,58,0.1)' : (hoveredItem === item.href && !item.disabled ? 'rgba(255,255,255,0.06)' : 'transparent'),
    overflow: 'hidden',
    whiteSpace: 'nowrap',
  })

  const soonTextStyle: React.CSSProperties = {
    fontSize: 10,
    color: 'rgba(255,255,255,0.2)',
    marginLeft: 6,
    fontStyle: 'italic',
  }

  const redBadgeStyle: React.CSSProperties = {
    background: '#E24B4A',
    color: 'white',
    fontSize: 11,
    fontWeight: 700,
    padding: '2px 7px',
    borderRadius: '10px',
    minWidth: '20px',
    textAlign: 'center',
  }

  const goldBadgeStyle: React.CSSProperties = {
    background: 'rgba(201,151,58,0.15)',
    color: '#E8B86D',
    border: '1px solid rgba(201,151,58,0.5)',
    fontSize: 11,
    fontWeight: 700,
    padding: '2px 7px',
    borderRadius: '10px',
    minWidth: '20px',
    textAlign: 'center',
  }

  const bottomSectionStyle: React.CSSProperties = {
    borderTop: '1px solid rgba(255,255,255,0.07)',
    padding: isTablet ? '16px 4px' : '16px 20px',
    marginTop: 'auto',
    display: isTablet ? 'none' : 'block',
  }

  const planLabelStyle: React.CSSProperties = {
    fontSize: 12,
    color: 'rgba(255,255,255,0.4)',
    fontWeight: 500,
  }

  const daysRemainingStyle: React.CSSProperties = {
    fontSize: 11,
    color: 'rgba(255,255,255,0.25)',
    marginTop: 3,
  }

  // Compute days remaining from trial_ends_at
  const trialEndsAt = counts?.trial_ends_at
  const daysLeft = trialEndsAt ? Math.max(0, Math.ceil((new Date(trialEndsAt).getTime() - Date.now()) / 86400000)) : null
  const daysText = daysLeft === null
    ? '28 days remaining'
    : daysLeft <= 0
    ? 'Trial expired'
    : `${daysLeft} day${daysLeft === 1 ? '' : 's'} remaining`
  const daysColor = daysLeft === null
    ? 'rgba(255,255,255,0.25)'
    : daysLeft <= 0
    ? '#E24B4A'
    : daysLeft <= 7
    ? '#F59E0B'
    : 'rgba(255,255,255,0.25)'

  return (
    <aside style={containerStyle}>
      {/* Top Logo Area */}
      <div style={logoAreaStyle}>
        <Link href="/agency/dashboard" style={{ textDecoration: 'none' }}>
          <span style={logoTextStyle}>{isTablet ? 'C' : 'Careified'}</span>
        </Link>
      </div>

      {/* Navigation Sections */}
      <nav style={{ flex: 1 }}>
        {navSections.map((section) => (
          <div key={section.title}>
            <div style={sectionLabelStyle}>{section.title}</div>
            {section.items.map((item) => {
              const active = isActive(item.href)
              const badgeCount = getBadgeCount(counts, item.badge)
              const showBadge = item.badge && !item.disabled && badgeCount > 0

              if (item.disabled) {
                return (
                  <div
                    key={item.href}
                    style={navItemStyle(item, active)}
                    onMouseEnter={() => setHoveredItem(item.href)}
                    onMouseLeave={() => setHoveredItem(null)}
                  >
                    <span>
                      {item.label}
                      <span style={soonTextStyle}>(soon)</span>
                    </span>
                  </div>
                )
              }

              return (
                <Link
                  key={item.href}
                  href={getBadgeHref(item)}
                  style={navItemStyle(item, active)}
                  onMouseEnter={() => setHoveredItem(item.href)}
                  onMouseLeave={() => setHoveredItem(null)}
                >
                  <span>{item.label}</span>
                  {showBadge && (
                    <span style={item.badge === 'unmatched' ? redBadgeStyle : goldBadgeStyle}>
                      {badgeCount}
                    </span>
                  )}
                </Link>
              )
            })}
          </div>
        ))}
      </nav>

      {/* Bottom Section */}
      <div style={bottomSectionStyle}>
        <div style={planLabelStyle}>Growth Plan</div>
        <div style={{ ...daysRemainingStyle, color: daysColor }}>{daysText}</div>
        <div style={{ display: 'flex', alignItems: 'center', marginTop: 12 }}>
          <UserButton
            appearance={{
              elements: {
                userButtonAvatarBox: { width: 32, height: 32 },
                userButtonTrigger: { padding: 4 },
              },
            }}
          />
        </div>
      </div>
    </aside>
  )
}
