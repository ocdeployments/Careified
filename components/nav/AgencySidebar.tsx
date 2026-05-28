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
  X,
  MoreHorizontal,
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

const SIDEBAR_DESKTOP = 220
const SIDEBAR_TABLET = 60
const BREAKPOINT_TABLET = 1024
const BREAKPOINT_MOBILE = 768

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
  }
  currentPath: string
}

interface NavItem {
  label: string
  href: string
  badge?: 'unmatched' | 'pipeline' | 'credentials' | 'airecruit'
  disabled?: boolean
  icon?: React.ReactNode
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
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200)
  const [tabletExpanded, setTabletExpanded] = useState(false)
  const [mobileSheetOpen, setMobileSheetOpen] = useState(false)

  // Responsive breakpoints
  const isMobile = windowWidth < BREAKPOINT_MOBILE
  const isTablet = windowWidth >= BREAKPOINT_MOBILE && windowWidth < BREAKPOINT_TABLET

  // Handle window resize
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const isActive = (href: string) => {
    if (href.includes('?')) {
      return pathname === href.split('?')[0]
    }
    return pathname.startsWith(href)
  }

  // Mobile: hide sidebar, show bottom tab bar
  if (isMobile) {
    const tabs = [
      { label: 'Dashboard', href: '/agency/dashboard', icon: LayoutDashboard },
      { label: 'Clients', href: '/agency/clients', icon: Users, badge: counts?.unmatched_clients },
      { label: 'Caregivers', href: '/agency/caregivers', icon: Briefcase },
      { label: 'AIRecruit', href: '/agency/airecruit', icon: Zap, badge: counts?.airecruit_results },
      { label: 'More', icon: MoreHorizontal, action: true },
    ]

    return (
      <>
        {/* Bottom tab bar */}
        <div
          style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            height: 56,
            background: NAV_BG,
            borderTop: `1px solid ${CARD_BORDER}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-around',
            paddingBottom: 'env(safe-area-inset-bottom, 0px)',
            zIndex: 300,
          }}
        >
          {tabs.map((tab) => {
            const isActive = tab.href ? pathname.startsWith(tab.href) : false
            const Icon = tab.icon
            return (
              <Link
                key={tab.label}
                href={tab.href || '#'}
                onClick={tab.action ? (e => { e.preventDefault(); setMobileSheetOpen(true) }) : undefined}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer', textDecoration: 'none', position: 'relative' }}
              >
                <Icon size={20} color={isActive ? GOLD : TEXT_MUTED} />
                <span style={{ fontSize: 11, color: isActive ? GOLD : TEXT_MUTED, marginTop: 2 }}>{tab.label}</span>
                {tab.badge && tab.badge > 0 && (
                  <span style={{ position: 'absolute', top: 2, right: '30%', width: 8, height: 8, borderRadius: '50%', background: RED }} />
                )}
              </Link>
            )
          })}
        </div>

        {/* Mobile "More" sheet */}
        {mobileSheetOpen && (
          <>
            <div
              onClick={() => setMobileSheetOpen(false)}
              style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 350 }}
            />
            <div
              style={{
                position: 'fixed',
                bottom: 0,
                left: 0,
                right: 0,
                height: '80vh',
                background: NAV_BG,
                borderRadius: '16px 16px 0 0',
                borderTop: `1px solid ${CARD_BORDER}`,
                zIndex: 400,
                padding: 20,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
                <span style={{ fontSize: 16, color: TEXT_PRIMARY, fontWeight: 600 }}>More</span>
                <button onClick={() => setMobileSheetOpen(false)} style={{ background: 'none', border: 'none', color: TEXT_MUTED, cursor: 'pointer' }}>
                  <X size={20} />
                </button>
              </div>
              {[
                { label: 'Roster', href: '/agency/roster', icon: ClipboardList },
                { label: 'Intelligence', href: '/agency/intelligence', icon: BarChart2 },
                { label: 'Settings', href: '/agency/settings', icon: Settings },
                { label: 'Support', href: '/agency/support', icon: HelpCircle },
              ].map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileSheetOpen(false)}
                    style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', color: TEXT_PRIMARY, fontSize: 14, borderBottom: `1px solid ${CARD_BORDER}`, textDecoration: 'none' }}
                  >
                    <Icon size={18} color={TEXT_MUTED} />
                    {item.label}
                  </Link>
                )
              })}
            </div>
          </>
        )}
      </>
    )
  }

  // Tablet: 60px icon-only with hover expand
  const sidebarWidth = isTablet && !tabletExpanded ? SIDEBAR_TABLET : SIDEBAR_DESKTOP

  return (
    <aside
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: sidebarWidth,
        height: '100vh',
        background: NAV_BG,
        borderRight: `1px solid ${CARD_BORDER}`,
        display: 'flex',
        flexDirection: 'column',
        zIndex: isTablet && tabletExpanded ? 200 : 100,
        overflowY: 'auto',
        transition: 'width 0.2s ease',
      }}
      onMouseLeave={() => isTablet && setTabletExpanded(false)}
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