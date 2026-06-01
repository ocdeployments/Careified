'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useWindowSize } from '@/lib/hooks/useWindowSize'
import {
  LayoutDashboard,
  Users,
  Bookmark,
  BookOpen,
  Search,
  PhoneCall,
  TrendingUp,
  Settings,
  HelpCircle,
} from 'lucide-react'

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
    agency_name?: string | null
    agency_plan?: string | null
  }
  currentPath: string
  isTablet?: boolean
  agencyName?: string
  agencyPlan?: string
}

interface NavItem {
  label: string
  href: string
  badge?: 'unmatched' | 'pipeline' | 'credentials' | 'airecruit'
  icon: React.ComponentType<{ size?: number; color?: string }>
}

interface NavSection {
  title: string
  items: NavItem[]
}

const navSections: NavSection[] = [
  {
    title: 'Find coverage',
    items: [
      { label: 'Dashboard', href: '/agency/dashboard', icon: LayoutDashboard },
      { label: 'Clients', href: '/agency/clients', badge: 'unmatched', icon: Users },
      { label: 'Shortlist', href: '/agency/shortlist', badge: 'pipeline', icon: Bookmark },
    ],
  },
  {
    title: 'Build your team',
    items: [
      { label: 'Roster', href: '/agency/roster', badge: 'credentials', icon: BookOpen },
      { label: 'Find Caregivers', href: '/agency/caregivers', icon: Search },
      { label: 'AIRecruit', href: '/agency/airecruit', badge: 'airecruit', icon: PhoneCall },
    ],
  },
  {
    title: 'Intelligence',
    items: [
      { label: 'Performance', href: '/agency/intelligence', icon: TrendingUp },
    ],
  },
]

const bottomItems = [
  { label: 'Settings', href: '/agency/settings', icon: Settings },
  { label: 'Support', href: '/agency/support', icon: HelpCircle },
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

function getBadgeStyle(badge?: string): React.CSSProperties {
  if (badge === 'unmatched') {
    return {
      background: 'rgba(226,75,74,0.18)',
      color: '#E24B4A',
    }
  }
  if (badge === 'pipeline' || badge === 'airecruit') {
    return {
      background: 'rgba(129,140,248,0.15)',
      color: '#818CF8',
    }
  }
  if (badge === 'credentials') {
    return {
      background: 'rgba(245,158,11,0.15)',
      color: '#F59E0B',
    }
  }
  return {
    background: 'rgba(201,151,58,0.15)',
    color: '#C9973A',
  }
}

export default function AgencySidebar({ counts, currentPath, isTablet: propIsTablet, agencyName, agencyPlan }: AgencySidebarProps) {
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

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  const containerStyle: React.CSSProperties = {
    width: isTablet ? 60 : 220,
    background: '#0D1728',
    borderRight: '0.5px solid rgba(255,255,255,0.06)',
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

  const sectionLabelStyle: React.CSSProperties = {
    fontSize: 9,
    letterSpacing: '0.1em',
    color: 'rgba(255,255,255,0.25)',
    textTransform: 'uppercase',
    padding: isTablet ? '24px 4px 8px' : '14px 8px 4px',
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    fontWeight: 600,
  }

  const navItemStyle = (item: NavItem, active: boolean): React.CSSProperties => ({
    padding: isTablet ? '12px 8px' : '7px 8px',
    borderRadius: 7,
    borderLeft: active ? '2px solid #C9973A' : '2px solid transparent',
    marginBottom: 2,
    cursor: 'pointer' as const,
    transition: 'background 150ms ease',
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    background: active ? 'rgba(201,151,58,0.1)' : (hoveredItem === item.href ? 'rgba(255,255,255,0.04)' : 'transparent'),
    textDecoration: 'none',
  })

  const iconStyle = (active: boolean): React.CSSProperties => ({
    width: 15,
    height: 15,
    color: active ? '#C9973A' : 'rgba(255,255,255,0.32)',
    flexShrink: 0,
  })

  const textStyle = (active: boolean): React.CSSProperties => ({
    fontSize: 12,
    color: active ? '#F8FAFC' : 'rgba(255,255,255,0.42)',
    fontWeight: active ? 500 : 400,
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    whiteSpace: 'nowrap' as const,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  })

  const badgeStyle: React.CSSProperties = {
    fontSize: 10,
    fontWeight: 600,
    borderRadius: 99,
    padding: '2px 7px',
    marginLeft: 'auto',
    ...getBadgeStyle(undefined),
  }

  const bottomSectionStyle: React.CSSProperties = {
    borderTop: '0.5px solid rgba(255,255,255,0.06)',
    paddingTop: 10,
    marginTop: 'auto',
    display: isTablet ? 'none' : 'block',
  }

  const bottomItemStyle = (active: boolean): React.CSSProperties => ({
    padding: '7px 8px',
    borderRadius: 7,
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    cursor: 'pointer' as const,
    transition: 'background 150ms ease',
    background: active ? 'rgba(201,151,58,0.1)' : (hoveredItem ? 'rgba(255,255,255,0.04)' : 'transparent'),
    textDecoration: 'none',
  })

  return (
    <aside style={containerStyle}>
      {/* Navigation Sections */}
      <nav style={{ flex: 1, paddingTop: 16 }}>
        {navSections.map((section) => (
          <div key={section.title}>
            {!isTablet && <div style={sectionLabelStyle}>{section.title}</div>}
            {section.items.map((item) => {
              const active = isActive(item.href)
              const badgeCount = getBadgeCount(counts, item.badge)
              const showBadge = item.badge && badgeCount > 0
              const Icon = item.icon

              return (
                <Link
                  key={item.href}
                  href={getBadgeHref(item)}
                  style={navItemStyle(item, active)}
                  onMouseEnter={() => setHoveredItem(item.href)}
                  onMouseLeave={() => setHoveredItem(null)}
                >
                  <Icon size={15} color={active ? '#C9973A' : 'rgba(255,255,255,0.32)'} />
                  {!isTablet && <span style={textStyle(active)}>{item.label}</span>}
                  {showBadge && !isTablet && (
                    <span style={{ ...badgeStyle, ...getBadgeStyle(item.badge) }}>
                      {badgeCount}
                    </span>
                  )}
                </Link>
              )
            })}
          </div>
        ))}
      </nav>

      {/* Bottom Items */}
      <div style={{ padding: isTablet ? '16px 8px' : '0 8px' }}>
        {bottomItems.map((item) => {
          const active = isActive(item.href)
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              style={bottomItemStyle(active)}
              onMouseEnter={() => setHoveredItem(item.href)}
              onMouseLeave={() => setHoveredItem(null)}
            >
              <Icon size={15} color={active ? '#C9973A' : 'rgba(255,255,255,0.32)'} />
              {!isTablet && <span style={textStyle(active)}>{item.label}</span>}
            </Link>
          )
        })}
      </div>

      {/* Agency Block */}
      {!isTablet && (
        <div style={bottomSectionStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 26,
                height: 26,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #C9973A, #E8B86D)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 10,
                fontWeight: 600,
                color: '#0D1728',
              }}
            >
              {getInitials(agencyName || 'Agency')}
            </div>
            <div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', fontWeight: 500 }}>
                {agencyName || 'Your Agency'}
              </div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.28)' }}>
                {agencyPlan || 'Growth Plan'}
              </div>
            </div>
          </div>
        </div>
      )}
    </aside>
  )
}