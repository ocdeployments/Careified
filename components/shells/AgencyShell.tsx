'use client'
import { ReactNode, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Search, Bookmark, Users, Briefcase, Settings, ChevronRight, Menu, X } from 'lucide-react'

const NAV = [
  { href: '/agency/search',    label: 'Search',       icon: Search    },
  { href: '/agency/clients',   label: 'Clients',      icon: Briefcase },
  { href: '/agency/shortlist', label: 'Shortlist',    icon: Bookmark  },
  { href: '/opportunities',    label: 'Opportunities', icon: Users     },
  { href: '/settings/data-rights', label: 'Settings', icon: Settings  },
]

export function AgencyShell({
  children,
  title,
  subtitle,
}: {
  children: ReactNode
  title?: string
  subtitle?: string
}) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="flex min-h-[calc(100vh-73px)] bg-cream">

      {/* ── Mobile overlay ── */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-navy/50 md:hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* ── Sidebar (desktop: sticky left column; mobile: slide-in drawer) ── */}
      <aside
        className={[
          'bg-white border-r border-slate-100 flex flex-col z-50 transition-all duration-200',
          // Desktop: sticky sidebar, collapsible
          'hidden md:flex md:sticky md:top-[73px] md:h-[calc(100vh-73px)] md:overflow-y-auto md:overflow-x-hidden',
          collapsed ? 'md:w-16 md:min-w-[64px]' : 'md:w-56 md:min-w-[220px]',
          // Mobile: fixed drawer
          'fixed top-[73px] left-0 h-[calc(100vh-73px)] w-64',
          mobileOpen ? 'flex translate-x-0' : '-translate-x-full md:translate-x-0',
        ].join(' ')}
        aria-label="Agency navigation"
      >
        {/* Header */}
        <div className={[
          'px-4 py-5 border-b border-slate-50 flex items-center',
          collapsed ? 'justify-center' : 'justify-between',
        ].join(' ')}>
          {!collapsed && (
            <span className="text-[11px] font-bold tracking-widest uppercase text-slate-400">
              Agency
            </span>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden md:flex items-center justify-center w-6 h-6 rounded-md text-slate-400 hover:text-navy hover:bg-slate-50 transition-colors focus-visible:ring-2 focus-visible:ring-gold focus-visible:outline-none"
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <ChevronRight
              size={14}
              className={`transition-transform duration-200 ${collapsed ? 'rotate-0' : 'rotate-180'}`}
            />
          </button>
          {/* Mobile close */}
          <button
            onClick={() => setMobileOpen(false)}
            className="md:hidden flex items-center justify-center w-6 h-6 rounded-md text-slate-400 hover:text-navy transition-colors"
            aria-label="Close navigation"
          >
            <X size={14} />
          </button>
        </div>

        {/* Nav */}
        <nav className="p-2 flex-1" aria-label="Primary navigation">
          {NAV.map(item => {
            const active = pathname === item.href || pathname.startsWith(item.href + '/')
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                aria-current={active ? 'page' : undefined}
                className={[
                  'flex items-center gap-2.5 rounded-xl mb-0.5 text-[13px] transition-all duration-150',
                  'focus-visible:ring-2 focus-visible:ring-gold focus-visible:outline-none',
                  collapsed ? 'justify-center p-2.5' : 'px-3 py-2.5',
                  active
                    ? 'bg-gold/10 border-l-2 border-gold text-amber-800 font-semibold'
                    : 'border-l-2 border-transparent text-slate-500 hover:bg-slate-50 hover:text-navy font-normal',
                ].join(' ')}
              >
                <span className="flex-shrink-0 flex">
                  <Icon size={16} />
                </span>
                {!collapsed && <span className="flex-1">{item.label}</span>}
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        {!collapsed && (
          <div className="px-2 py-3 border-t border-slate-50">
            <span className="block px-3 py-2 text-[11px] text-slate-400">
              Careified Agency
            </span>
          </div>
        )}
      </aside>

      {/* ── Mobile top bar toggle ── */}
      <button
        onClick={() => setMobileOpen(true)}
        className="md:hidden fixed bottom-6 left-4 z-30 flex items-center gap-2 px-4 py-2.5 bg-navy text-white text-sm font-semibold rounded-full shadow-lg focus-visible:ring-2 focus-visible:ring-gold focus-visible:outline-none"
        aria-label="Open navigation"
        aria-expanded={mobileOpen}
      >
        <Menu size={16} />
        Menu
      </button>

      {/* ── Main content ── */}
      <main className="flex-1 min-w-0 overflow-auto">
        {(title || subtitle) && (
          <div className="px-4 md:px-8 pt-7 mb-6">
            {title && (
              <h1 className="m-0 font-serif text-2xl md:text-3xl font-normal text-navy tracking-tight leading-tight">
                {title}
              </h1>
            )}
            {subtitle && (
              <p className="mt-1.5 text-sm text-slate-500 leading-relaxed">
                {subtitle}
              </p>
            )}
          </div>
        )}
        <div className="px-4 md:px-8 pb-12">{children}</div>
      </main>
    </div>
  )
}

export default AgencyShell
