'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { UserButton, useUser } from '@clerk/nextjs'
import {
  LayoutDashboard,
  Users,
  Briefcase,
  Star,
  Search,
  ClipboardList,
  Zap,
  BarChart2,
  TrendingUp,
  Settings,
  HelpCircle,
} from 'lucide-react'

// Design tokens
const PAGE_BG = '#080F1E'
const NAV_BG = '#0D1B3E'
const CARD_BG = 'rgba(255,255,255,0.04)'
const CARD_BORDER = 'rgba(255,255,255,0.08)'
const GOLD = '#C9973A'
const GL = '#E8B86D'
const TEXT_PRIMARY = '#F5F0E8'
const TEXT_MUTED = 'rgba(255,255,255,0.55)'
const TEXT_TERTIARY = 'rgba(255,255,255,0.3)'
const RED = '#E24B4A'
const AMBER = '#F59E0B'

interface AgencySidebarProps {
  counts?: {
    unmatched_clients: number
    pipeline: number
    expiring_credentials: number
    airecruit_results: number
  }
  currentPath: string
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

function isBadgeActive(badge?: string, counts?: AgencySidebarProps['counts']): boolean {
  const count = getBadgeCount(counts, badge)
  return count > 0
}

export default function AgencySidebar({ counts, currentPath }: AgencySidebarProps) {
  const { user } = useUser()
  const pathname = usePathname()
  const [hoveredSection, setHoveredSection] = useState<string | null>(null)
  const [hoveredItem, setHoveredItem] = useState<string | null>(null)

  const isActive = (href: string) => {
    if (href.includes('?')) {
      return pathname === href.split('?')[0]
    }
    return pathname.startsWith(href)
  }

  return (
    <aside
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: 220,
        height: '100vh',
        background: NAV_BG,
        borderRight: `1px solid ${CARD_BORDER}`,
        display: 'flex',
        flexDirection: 'column',
        zIndex: 100,
        overflowY: 'auto',
      }}
    >
      {/* Logo area */}
      <div
        style={{
          padding: '20px 16px',
          borderBottom: `1px solid ${CARD_BORDER}`,
        }}
      >
        <Link href="/agency/dashboard" style={{ textDecoration: 'none' }}>
          <span
            style={{
              fontFamily: "'DM Serif Display', Georgia, serif",
              fontSize: 18,
              color: TEXT_PRIMARY,
            }}
          >
            Careified
          </span>
        </Link>
      </div>

      {/* Navigation sections */}
      <nav style={{ flex: 1, padding: '12px 0' }}>
        {navSections.map((section) => (
          <div key={section.title} style={{ marginBottom: 16 }}>
            <div
              style={{
                padding: '4px 16px',
                fontSize: 11,
                fontWeight: 500,
                color: TEXT_TERTIARY,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              {section.title}
            </div>
            {section.items.map((item) => {
              const active = isActive(item.href)
              const badgeCount = getBadgeCount(counts, item.badge)
              const badgeActive = isBadgeActive(item.badge, counts)

              const itemStyle: React.CSSProperties = {
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 16px',
                fontSize: 14,
                fontFamily: "'DM Sans', sans-serif",
                color: item.disabled
                  ? TEXT_TERTIARY
                  : active
                  ? TEXT_PRIMARY
                  : TEXT_MUTED,
                background: active
                  ? 'rgba(201,151,58,0.12)'
                  : hoveredItem === item.href
                  ? 'rgba(255,255,255,0.04)'
                  : 'transparent',
                borderLeft: active ? '2px solid #C9973A' : '2px solid transparent',
                cursor: item.disabled ? 'not-allowed' : 'pointer',
                opacity: item.disabled ? 0.4 : 1,
                textDecoration: 'none',
                transition: 'all 0.15s ease',
              }

              const badgeStyle: React.CSSProperties = {
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 11,
                fontWeight: 600,
                padding: '1px 6px',
                borderRadius: 10,
                minWidth: 18,
                height: 18,
              }

              const content = (
                <>
                  <span>
                    {item.label}
                    {item.disabled && (
                      <span
                        style={{
                          fontSize: 10,
                          color: TEXT_TERTIARY,
                          marginLeft: 4,
                        }}
                      >
                        (soon)
                      </span>
                    )}
                  </span>
                  {item.badge && !item.disabled && badgeCount > 0 && (
                    <span
                      style={{
                        ...badgeStyle,
                        background:
                          item.badge === 'unmatched'
                            ? RED
                            : 'rgba(201,151,58,0.2)',
                        color:
                          item.badge === 'unmatched'
                            ? 'white'
                            : GL,
                        border:
                          item.badge === 'unmatched'
                            ? 'none'
                            : '1px solid rgba(201,151,58,0.4)',
                      }}
                    >
                      {badgeCount}
                    </span>
                  )}
                </>
              )

              if (item.disabled) {
                return (
                  <div
                    key={item.href}
                    style={itemStyle}
                    onMouseEnter={() => setHoveredItem(item.href)}
                    onMouseLeave={() => setHoveredItem(null)}
                  >
                    {content}
                  </div>
                )
              }

              return (
                <Link
                  key={item.href}
                  href={getBadgeHref(item)}
                  style={itemStyle}
                  onMouseEnter={() => setHoveredItem(item.href)}
                  onMouseLeave={() => setHoveredItem(null)}
                >
                  {content}
                </Link>
              )
            })}
          </div>
        ))}
      </nav>

      {/* Bottom section */}
      <div
        style={{
          padding: 16,
          borderTop: `1px solid ${CARD_BORDER}`,
          background: 'rgba(0,0,0,0.2)',
        }}
      >
        <div
          style={{
            fontSize: 12,
            color: TEXT_MUTED,
            marginBottom: 4,
          }}
        >
          Growth Plan
        </div>
        <div
          style={{
            fontSize: 11,
            color: TEXT_TERTIARY,
            marginBottom: 12,
          }}
        >
          28 days remaining
        </div>
        <div style={{ display: 'flex', alignItems: 'center' }}>
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

// Also export a hook for responsive width
export function useSidebarWidth() {
  const [width, setWidth] = useState(220)

  useEffect(() => {
    const updateWidth = () => {
      if (typeof window === 'undefined') return
      if (window.innerWidth < 768) {
        setWidth(0)
      } else if (window.innerWidth < 1024) {
        setWidth(60)
      } else {
        setWidth(220)
      }
    }

    updateWidth()
    window.addEventListener('resize', updateWidth)
    return () => window.removeEventListener('resize', updateWidth)
  }, [])

  return width
}