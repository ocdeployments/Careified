'use client'
import { ReactNode } from 'react'

// AgencyShell - simplified wrapper for agency pages
// Note: The sidebar navigation is now handled by AgencySidebar in the layout
// This component just provides the title/subtitle area and content wrapper

export function AgencyShell({
  children,
  title,
  subtitle,
}: {
  children: ReactNode
  title?: string
  subtitle?: string
}) {
  return (
    <div style={{ minHeight: '100vh', background: '#080F1E' }}>
      {/* ── Header area ── */}
      {(title || subtitle) && (
        <div style={{ padding: '24px 32px 0' }}>
          {title && (
            <h1 style={{
              margin: 0,
              fontFamily: "'DM Serif Display', Georgia, serif",
              fontSize: 'clamp(24px, 5vw, 32px)',
              fontWeight: 400,
              color: '#F5F0E8',
              letterSpacing: '-0.02em',
              lineHeight: 1.2,
            }}>
              {title}
            </h1>
          )}
          {subtitle && (
            <p style={{
              margin: '8px 0 0',
              fontSize: 14,
              color: 'rgba(255,255,255,0.55)',
              lineHeight: 1.6,
            }}>
              {subtitle}
            </p>
          )}
        </div>
      )}
      {/* ── Content ── */}
      <div style={{ padding: '24px 32px 48px' }}>
        {children}
      </div>
    </div>
  )
}

export default AgencyShell
