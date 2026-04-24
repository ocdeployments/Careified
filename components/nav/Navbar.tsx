'use client'

import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'
import { Menu, X, ChevronDown } from 'lucide-react'
import { UserButton, useAuth } from '@clerk/nextjs'
import BrandLogo from '../BrandLogo'

// ── Auth buttons ──────────────────────────────────────────────────────────────
function AuthButton() {
  const { isLoaded, userId } = useAuth()
  if (!isLoaded) return null
  if (userId) {
    return (
      <div className="flex items-center gap-3">
        <Link
          href="/profile/strength"
          className="text-xs text-white/80 hover:text-white px-2.5 py-1.5 rounded-md transition-colors focus-visible:ring-2 focus-visible:ring-[#C9973A] focus-visible:outline-none"
        >
          Profile strength
        </Link>
        <Link
          href="/settings/data-rights"
          className="text-xs text-white/80 hover:text-white px-2.5 py-1.5 rounded-md transition-colors focus-visible:ring-2 focus-visible:ring-[#C9973A] focus-visible:outline-none"
        >
          Data rights
        </Link>
        <UserButton
          appearance={{
            elements: {
              userButtonAvatarBox: { width: '32px', height: '32px' },
              userButtonTrigger: { padding: '4px' },
            },
          }}
        />
      </div>
    )
  }
  return (
    <>
      <Link
        href="/sign-in"
        className="text-xs font-medium px-3.5 py-1.5 rounded-lg text-white/80 hover:text-white transition-colors focus-visible:ring-2 focus-visible:ring-[#C9973A] focus-visible:outline-none"
      >
        Sign in
      </Link>
      <Link
        href="/sign-up"
        className="text-xs font-semibold px-4 py-2 rounded-lg bg-[#C9973A] text-white hover:bg-[#b8862e] transition-colors focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none"
      >
        Get started
      </Link>
    </>
  )
}

// ── Dropdown panel data ───────────────────────────────────────────────────────
const panels = {
  caregivers: {
    accent: '#C9973A',
    title: 'For Caregivers',
    desc: 'Build a verified profile and get matched with agencies that fit you.',
    links: [
      { href: '/profile/build',    label: 'Build your profile',    desc: 'Free — takes 10 minutes'      },
      { href: '/opportunities',    label: 'Browse opportunities',  desc: 'See open placements'          },
      { href: '/for-caregivers',   label: 'How it works',          desc: 'See the caregiver journey'    },
    ],
    cta: { href: '/sign-up?role=caregiver', label: 'Join as a caregiver' },
  },
  agencies: {
    accent: '#2563EB',
    title: 'For Agencies',
    desc: 'Find, vet, and place caregivers faster with AI-powered matching.',
    links: [
      { href: '/agency/search',    label: 'Search caregivers', desc: 'Browse verified profiles'       },
      { href: '/agency/shortlist', label: 'Shortlist',         desc: 'Save and compare candidates'    },
      { href: '/for-agencies',     label: 'How it works',      desc: 'See the full agency workflow'   },
    ],
    cta: { href: '/agency/signup', label: 'Start as an agency' },
  },
  families: {
    accent: '#16A34A',
    title: 'For Families',
    desc: 'Find trusted, verified caregivers for your loved ones.',
    links: [
      { href: '/for-families', label: 'How it works', desc: 'See how families use Careified' },
      { href: '/about',        label: 'About us',     desc: 'Our mission and team'           },
    ],
    cta: { href: '/sign-up?role=family', label: 'Find a caregiver' },
  },
} as const

type PanelKey = keyof typeof panels

// ── Main Navbar ───────────────────────────────────────────────────────────────
export default function Navbar() {
  const [activePanel, setActivePanel] = useState<PanelKey | null>(null)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const navRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Close panel on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setActivePanel(null)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Close mobile menu on resize to desktop
  useEffect(() => {
    const handler = () => { if (window.innerWidth >= 768) setMobileOpen(false) }
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])

  const togglePanel = (key: PanelKey) =>
    setActivePanel(prev => (prev === key ? null : key))

  return (
    <nav
      ref={navRef}
      className={[
        'fixed top-0 left-0 right-0 z-50 transition-all duration-200 bg-[#0D1B3E]',
        scrolled ? 'shadow-lg shadow-black/20' : '',
      ].join(' ')}
      aria-label="Main navigation"
    >
      <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">

        {/* Logo */}
        <Link
          href="/"
          className="focus-visible:ring-2 focus-visible:ring-[#C9973A] focus-visible:outline-none rounded"
          onClick={() => { setActivePanel(null); setMobileOpen(false) }}
        >
          <BrandLogo size="sm" />
        </Link>

        {/* Desktop nav links */}
        <div className="hidden md:flex items-center gap-1">
          {(Object.keys(panels) as PanelKey[]).map(key => (
            <button
              key={key}
              onClick={() => togglePanel(key)}
              aria-expanded={activePanel === key}
              aria-haspopup="true"
              className={[
                'flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                'focus-visible:ring-2 focus-visible:ring-[#C9973A] focus-visible:outline-none',
                activePanel === key
                  ? 'text-white bg-white/10'
                  : 'text-white/80 hover:text-white hover:bg-white/10',
              ].join(' ')}
            >
              <span className="capitalize">{key}</span>
              <ChevronDown
                size={14}
                className={`transition-transform duration-200 ${activePanel === key ? 'rotate-180' : ''}`}
              />
            </button>
          ))}
          <Link
            href="/about"
            className="px-3 py-2 rounded-lg text-sm font-medium text-white/80 hover:text-white hover:bg-white/10 transition-colors focus-visible:ring-2 focus-visible:ring-[#C9973A] focus-visible:outline-none"
          >
            About
          </Link>
          <Link
            href="/contact"
            className="px-3 py-2 rounded-lg text-sm font-medium text-white/80 hover:text-white hover:bg-white/10 transition-colors focus-visible:ring-2 focus-visible:ring-[#C9973A] focus-visible:outline-none"
          >
            Contact
          </Link>
        </div>

        {/* Desktop auth */}
        <div className="hidden md:flex items-center gap-2">
          <AuthButton />
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden flex items-center justify-center w-9 h-9 rounded-lg text-white hover:bg-white/10 transition-colors focus-visible:ring-2 focus-visible:ring-[#C9973A] focus-visible:outline-none"
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* ── Desktop dropdown panel (light bg) ── */}
      {activePanel && (
        <div className="hidden md:block absolute top-full left-0 right-0 bg-white border-t border-slate-200 shadow-2xl">
          <div className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-3 gap-8">
            {/* Panel info */}
            <div>
              <h2 className="text-[#0D1B3E] font-serif text-xl font-bold mb-2">
                {panels[activePanel].title}
              </h2>
              <p className="text-slate-500 text-sm leading-relaxed">
                {panels[activePanel].desc}
              </p>
              <Link
                href={panels[activePanel].cta.href}
                onClick={() => setActivePanel(null)}
                className="inline-block mt-4 px-4 py-2 rounded-lg bg-[#C9973A] text-white text-sm font-semibold hover:bg-[#b8862e] transition-colors focus-visible:ring-2 focus-visible:ring-[#0D1B3E] focus-visible:outline-none"
              >
                {panels[activePanel].cta.label}
              </Link>
            </div>
            {/* Links */}
            <div className="col-span-2 grid grid-cols-2 gap-3">
              {panels[activePanel].links.map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setActivePanel(null)}
                  className="group p-4 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-colors focus-visible:ring-2 focus-visible:ring-[#C9973A] focus-visible:outline-none"
                >
                  <div className="text-sm font-semibold text-[#0D1B3E] group-hover:text-[#C9973A] transition-colors">
                    {link.label}
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">{link.desc}</div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Mobile menu ── */}
      {mobileOpen && (
        <div className="md:hidden bg-[#0D1B3E] border-t border-white/10 px-4 py-4 space-y-1">
          {(Object.keys(panels) as PanelKey[]).map(key => (
            <div key={key}>
              <button
                onClick={() => togglePanel(key)}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium text-white/80 hover:text-white hover:bg-white/10 transition-colors focus-visible:ring-2 focus-visible:ring-[#C9973A] focus-visible:outline-none"
              >
                <span className="capitalize">{key}</span>
                <ChevronDown
                  size={14}
                  className={`transition-transform duration-200 ${activePanel === key ? 'rotate-180' : ''}`}
                />
              </button>
              {activePanel === key && (
                <div className="ml-3 mt-1 space-y-1 border-l border-white/10 pl-3">
                  {panels[key].links.map(link => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => { setActivePanel(null); setMobileOpen(false) }}
                      className="block px-3 py-2 rounded-lg text-sm text-white/70 hover:text-white hover:bg-white/10 transition-colors focus-visible:ring-2 focus-visible:ring-[#C9973A] focus-visible:outline-none"
                    >
                      {link.label}
                    </Link>
                  ))}
                  <Link
                    href={panels[key].cta.href}
                    onClick={() => { setActivePanel(null); setMobileOpen(false) }}
                    className="block px-3 py-2 rounded-lg text-sm font-semibold text-[#C9973A] hover:text-[#E8B86D] transition-colors"
                  >
                    {panels[key].cta.label} →
                  </Link>
                </div>
              )}
            </div>
          ))}
          <Link
            href="/about"
            onClick={() => setMobileOpen(false)}
            className="block px-3 py-2.5 rounded-lg text-sm font-medium text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            About
          </Link>
          <div className="pt-3 border-t border-white/10 flex flex-col gap-2">
            <AuthButton />
          </div>
        </div>
      )}
    </nav>
  )
}
