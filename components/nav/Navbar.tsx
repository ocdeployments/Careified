'use client'

import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'
import { Menu, X, ChevronDown, Info, Briefcase, UserCheck, Building2, Presentation, Play, Heart, Users } from 'lucide-react'
import { UserButton, useAuth, useUser } from '@clerk/nextjs'
import BrandLogo from '../BrandLogo'

// ── Auth buttons ──────────────────────────────────────────────────────────────
function AuthButton() {
  const { isLoaded, userId } = useAuth()
  const { user } = useUser()
  const userRole = user?.publicMetadata?.role as string | undefined

  if (!isLoaded) return null
  if (userId) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <Link
          href="/profile/strength"
          style={{
            fontSize: '12px',
            color: 'rgba(255,255,255,0.8)',
            padding: '6px 10px',
            borderRadius: '6px',
            transition: 'color 0.15s',
            textDecoration: 'none',
          }}
        >
          Profile strength
        </Link>
        <Link
          href="/settings/data-rights"
          style={{
            fontSize: '12px',
            color: 'rgba(255,255,255,0.8)',
            padding: '6px 10px',
            borderRadius: '6px',
            transition: 'color 0.15s',
            textDecoration: 'none',
          }}
        >
          Data rights
        </Link>
        <Link
          href="/settings/communications"
          style={{
            fontSize: '12px',
            color: 'rgba(255,255,255,0.8)',
            padding: '6px 10px',
            borderRadius: '6px',
            transition: 'color 0.15s',
            textDecoration: 'none',
          }}
        >
          Communications
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
        href="/sign-up"
        style={{
          fontSize: '12px',
          fontWeight: 500,
          padding: '6px 14px',
          borderRadius: '8px',
          border: '1px solid rgba(255,255,255,0.15)',
          color: 'rgba(255,255,255,0.75)',
          background: 'none',
          textDecoration: 'none',
          transition: 'all 0.15s ease',
        }}
      >
        Sign in
      </Link>
      <Link
        href="/sign-up"
        style={{
          fontSize: '12px',
          fontWeight: 600,
          padding: '8px 16px',
          borderRadius: '8px',
          background: 'linear-gradient(135deg, #C9973A, #E8B86D)',
          color: '#0D1B3E',
          boxShadow: '0 2px 8px rgba(201,151,58,0.3)',
          textDecoration: 'none',
          transition: 'all 0.15s ease',
        }}
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
    title: 'For Professional Caregivers',
    desc: "You don't need another app. Build once. Be seen forever.",
    icon: Info,
    links: [
      { href: '/for-caregivers#why-build', label: 'Why Should I Build My Profile?', desc: 'See how a verified profile gets you discovered by agencies that match your skills.', icon: Info },
      { href: '/opportunities',            label: 'Browse Opportunities',           desc: 'See open roles matched to your skills, availability, and location.', icon: Briefcase },
      { href: '/sign-up?role=caregiver&redirect_url=/profile/build', label: 'Start Your Careified Profile',             desc: 'Build once. Be seen forever. Free — takes 15 minutes.', icon: UserCheck },
    ],
    cta: { href: '/sign-up?role=caregiver&redirect_url=/profile/build', label: 'Build My Profile' },
  },
  agencies: {
    accent: '#1E3A8A',
    title: 'Recruit Without the Legwork.',
    desc: 'We deliver interview-ready professionals with intelligent AI-powered matches.',
    icon: Building2,
    links: [
      { href: '/agency/signup',  label: 'Join the Careified Network', desc: 'Start recruiting smarter — no manual screening required.', icon: Building2 },
      { href: '/for-agencies',   label: 'How It Works',               desc: 'See the Careified workflow end-to-end — from search to placement.', icon: Presentation },
      { href: '/demo',           label: 'Try the Platform',           desc: 'Explore a live demo — no login required.', icon: Play },
    ],
    cta: { href: '/agency/signup', label: 'Join the Careified Network' },
  },
  families: {
    accent: '#16A34A',
    title: 'For Families',
    desc: 'Find trusted, verified caregivers for your loved ones.',
    icon: Heart,
    links: [
      { href: '/for-families', label: 'How it works', desc: 'See how families use Careified', icon: Heart },
      { href: '/about',        label: 'About us',     desc: 'Our mission and team',           icon: Users },
    ],
    cta: { href: '/sign-up', label: 'Find a caregiver' },
  },
} as const

type PanelKey = keyof typeof panels

// ── Main Navbar ───────────────────────────────────────────────────────────────
export default function Navbar() {
  const { user } = useUser()
  const userRole = user?.publicMetadata?.role as string | undefined
  const isAgency = userRole === 'agency'

  const [activePanel, setActivePanel] = useState<PanelKey | null>(null)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const navRef = useRef<HTMLElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Track current path for active indicator
  const [currentPath, setCurrentPath] = useState('')
  useEffect(() => {
    setCurrentPath(window.location.pathname)
  }, [])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Close panel on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (navRef.current?.contains(e.target as Node)) return
      setActivePanel(null)
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

  // Check if section is active based on current path
  const isSectionActive = (key: PanelKey) => {
    const panelLinks = panels[key].links.map(l => l.href)
    return panelLinks.some(href => currentPath.startsWith(href.split('#')[0]))
  }

  return (
    <nav
      ref={navRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        background: 'rgba(13,27,62,0.97)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(201,151,58,0.15)',
        transition: 'box-shadow 0.2s',
        boxShadow: scrolled ? '0 4px 20px rgba(0,0,0,0.2)' : 'none',
      }}
      aria-label="Main navigation"
    >
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 40px', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>

        {/* Logo */}
        <Link
          href="/"
          style={{ borderRadius: '4px', outline: 'none' }}
          onClick={() => { setActivePanel(null); setMobileOpen(false) }}
        >
          <img
            src="/Careified-logo.png"
            alt="Careified"
            style={{
              height: '64px',
              width: 'auto',
              display: 'block',
              objectFit: 'contain',
            }}
          />
        </Link>

        {/* Desktop nav links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
          {(Object.keys(panels) as PanelKey[]).map(key => {
            const isActive = isSectionActive(key)
            return (
              <button
                key={key}
                onClick={() => togglePanel(key)}
                aria-expanded={activePanel === key}
                aria-haspopup="true"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '8px 14px',
                  borderRadius: '6px',
                  fontFamily: 'DM Sans, sans-serif',
                  fontSize: '13px',
                  fontWeight: 500,
                  letterSpacing: '0.01em',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  background: activePanel === key ? 'rgba(201,151,58,0.08)' : 'transparent',
                  color: activePanel === key ? '#E8B86D' : 'rgba(255,255,255,0.75)',
                }}
                onMouseEnter={(e) => {
                  if (activePanel !== key) {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.07)'
                    e.currentTarget.style.color = '#fff'
                  }
                }}
                onMouseLeave={(e) => {
                  if (activePanel !== key) {
                    e.currentTarget.style.background = 'transparent'
                    e.currentTarget.style.color = 'rgba(255,255,255,0.75)'
                  }
                }}
              >
                <span style={{ textTransform: 'capitalize' }}>{key}</span>
                {isActive && (
                  <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#C9973A', marginLeft: '4px', display: 'inline-block' }} />
                )}
                <ChevronDown
                  size={14}
                  style={{
                    marginLeft: '4px',
                    opacity: 0.6,
                    transition: 'transform 0.2s ease',
                    transform: activePanel === key ? 'rotate(180deg)' : 'rotate(0deg)',
                  }}
                />
              </button>
            )
          })}
          <Link
            href="/about"
            onClick={() => setActivePanel(null)}
            style={{
              padding: '8px 12px',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 500,
              color: 'rgba(255,255,255,0.75)',
              textDecoration: 'none',
              transition: 'all 0.15s ease',
            }}
          >
            About
          </Link>
          <Link
            href="/contact"
            onClick={() => setActivePanel(null)}
            style={{
              padding: '8px 12px',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 500,
              color: 'rgba(255,255,255,0.75)',
              textDecoration: 'none',
              transition: 'all 0.15s ease',
            }}
          >
            Contact
          </Link>
        </div>

        {/* Desktop auth */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AuthButton />
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          style={{
            display: 'none',
            alignItems: 'center',
            justifyContent: 'center',
            width: '36px',
            height: '36px',
            borderRadius: '8px',
            border: 'none',
            cursor: 'pointer',
            background: 'transparent',
            color: '#fff',
          }}
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* ── Desktop dropdown panel (dark theme) ── */}
      {activePanel && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            background: '#0D1B3E',
            border: '1px solid rgba(201,151,58,0.2)',
            borderTop: 'none',
            borderRadius: '0 0 12px 12px',
            overflow: 'hidden',
            boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
          }}
        >
          <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '24px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '32px' }}>
            {/* Panel header */}
            <div style={{ paddingBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#E8B86D', marginBottom: '4px' }}>
                {panels[activePanel].title}
              </div>
              <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.45)' }}>
                {panels[activePanel].desc}
              </div>
              <Link
                href={panels[activePanel].cta.href}
                onClick={() => setActivePanel(null)}
                style={{
                  display: 'inline-block',
                  marginTop: '16px',
                  padding: '10px 16px',
                  borderRadius: '8px',
                  background: 'linear-gradient(135deg, #C9973A, #E8B86D)',
                  color: '#0D1B3E',
                  fontSize: '14px',
                  fontWeight: 600,
                  textDecoration: 'none',
                  boxShadow: '0 2px 8px rgba(201,151,58,0.3)',
                  transition: 'all 0.15s ease',
                }}
              >
                {panels[activePanel].cta.label}
              </Link>
            </div>
            {/* Links */}
            <div style={{ gridColumn: 'span 2', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
              {panels[activePanel].links
                .filter(link => !link.href.includes('/agency/sitemap') || isAgency)
                .map((link, idx) => {
                  const PanelIcon = link.icon
                  const isFeatured = idx === 0
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setActivePanel(null)}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '12px',
                        padding: '16px',
                        borderRadius: '12px',
                        border: isFeatured ? '1px solid rgba(201,151,58,0.35)' : '1px solid rgba(255,255,255,0.07)',
                        background: isFeatured ? 'rgba(201,151,58,0.06)' : 'rgba(255,255,255,0.03)',
                        textDecoration: 'none',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '7px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        background: isFeatured ? 'rgba(201,151,58,0.15)' : 'rgba(255,255,255,0.07)',
                      }}>
                        <PanelIcon size={16} style={{ color: isFeatured ? '#E8B86D' : 'rgba(255,255,255,0.6)' }} />
                      </div>
                      <div>
                        <div style={{ fontSize: '14px', fontWeight: 600, color: '#fff', marginBottom: '2px' }}>
                          {link.label}
                        </div>
                        <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>{link.desc}</div>
                      </div>
                    </Link>
                  )
                })}
            </div>
          </div>
        </div>
      )}

      {/* ── Mobile menu ── */}
      {mobileOpen && (
        <div style={{ display: 'block', background: '#0D1B3E', borderTop: '1px solid rgba(255,255,255,0.1)', padding: '16px 24px' }}>
          {(Object.keys(panels) as PanelKey[]).map(key => (
            <div key={key}>
              <button
                onClick={() => togglePanel(key)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: 500,
                  border: 'none',
                  cursor: 'pointer',
                  background: 'transparent',
                  color: 'rgba(255,255,255,0.8)',
                }}
              >
                <span style={{ textTransform: 'capitalize' }}>{key}</span>
                <ChevronDown
                  size={14}
                  style={{
                    transition: 'transform 0.2s ease',
                    transform: activePanel === key ? 'rotate(180deg)' : 'rotate(0deg)',
                  }}
                />
              </button>
              {activePanel === key && (
                <div style={{ marginLeft: '12px', marginTop: '4px', paddingLeft: '12px', borderLeft: '1px solid rgba(255,255,255,0.1)' }}>
                  {panels[key].links
                    .filter(link => !link.href.includes('/agency/sitemap') || isAgency)
                    .map(link => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => { setActivePanel(null); setMobileOpen(false) }}
                      style={{
                        display: 'block',
                        padding: '8px 12px',
                        borderRadius: '8px',
                        fontSize: '14px',
                        color: 'rgba(255,255,255,0.7)',
                        textDecoration: 'none',
                      }}
                    >
                      {link.label}
                    </Link>
                  ))}
                  <Link
                    href={panels[key].cta.href}
                    onClick={() => { setActivePanel(null); setMobileOpen(false) }}
                    style={{
                      display: 'block',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: 600,
                      color: '#C9973A',
                      textDecoration: 'none',
                    }}
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
            style={{
              display: 'block',
              padding: '10px 12px',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 500,
              color: 'rgba(255,255,255,0.8)',
              textDecoration: 'none',
            }}
          >
            About
          </Link>
          <div style={{ paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <AuthButton />
          </div>
        </div>
      )}
    </nav>
  )
}
