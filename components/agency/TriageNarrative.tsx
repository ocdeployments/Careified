'use client'

import { useState, useEffect } from 'react'

interface TriageData {
  narrative: string
  cached: boolean
  fallback?: boolean
}

export default function TriageNarrative() {
  const [data, setData] = useState<TriageData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    fetch('/api/agency/triage-narrative')
      .then(res => {
        if (!res.ok) throw new Error('Failed')
        return res.json()
      })
      .then(d => {
        setData(d)
        setLoading(false)
      })
      .catch(() => {
        setError(true)
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ height: 12, width: '90%', background: 'rgba(255,255,255,0.06)', borderRadius: 4, animation: 'pulse 1.5s ease-in-out infinite' }} />
        <div style={{ height: 12, width: '75%', background: 'rgba(255,255,255,0.06)', borderRadius: 4, animation: 'pulse 1.5s ease-in-out infinite', animationDelay: '0.2s' }} />
        <div style={{ height: 12, width: '60%', background: 'rgba(255,255,255,0.06)', borderRadius: 4, animation: 'pulse 1.5s ease-in-out infinite', animationDelay: '0.4s' }} />
        <style>{`
          @keyframes pulse {
            0%, 100% { opacity: 0.4; }
            50% { opacity: 0.8; }
          }
        `}</style>
      </div>
    )
  }

  if (error) {
    return <div style={{ fontSize: 15, color: 'rgba(255,255,255,0.55)', lineHeight: 1.7 }}>Triage summary unavailable</div>
  }

  if (!data?.narrative) {
    return <div style={{ fontSize: 15, color: 'rgba(255,255,255,0.55)', lineHeight: 1.7 }}>No triage data available</div>
  }

  // Parse [Name](caregiverId) links
  const renderNarrative = () => {
    const parts = data.narrative.split(/(\[([^\]]+)\]\(([^)]+)\))/g)

    return parts.map((part, i) => {
      const match = part.match(/\[([^\]]+)\]\(([^)]+)\)/)
      if (match) {
        const [, name, caregiverId] = match
        return (
          <a
            key={i}
            href={`/profile/${caregiverId}`}
            style={{
              color: '#C9973A',
              textDecoration: 'none',
            }}
            onMouseEnter={e => (e.currentTarget.style.textDecoration = 'underline')}
            onMouseLeave={e => (e.currentTarget.style.textDecoration = 'none')}
          >
            {name}
          </a>
        )
      }
      return part
    })
  }

  return (
    <div style={{ fontSize: 15, color: '#F5F0E8', lineHeight: 1.7 }}>
      {renderNarrative()}
    </div>
  )
}