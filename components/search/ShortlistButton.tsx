'use client'

import { useState } from 'react'
import { Bookmark, BookmarkCheck } from 'lucide-react'

interface ShortlistButtonProps {
  caregiverId: string
  initialSaved?: boolean
  size?: 'sm' | 'md'
}

export default function ShortlistButton({ 
  caregiverId, 
  initialSaved = false,
  size = 'md'
}: ShortlistButtonProps) {
  const [saved, setSaved] = useState(initialSaved)
  const [loading, setLoading] = useState(false)

  const toggle = async () => {
    setLoading(true)
    try {
      const method = saved ? 'DELETE' : 'POST'
      const res = await fetch('/api/agency/shortlist', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ caregiverId }),
      })
      if (res.ok) {
        setSaved(!saved)
      }
    } catch (error) {
      console.error('Shortlist toggle error:', error)
    } finally {
      setLoading(false)
    }
  }

  const iconSize = size === 'sm' ? 14 : 16

  return (
    <button
      onClick={toggle}
      disabled={loading}
      title={saved ? 'Remove from shortlist' : 'Add to shortlist'}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        padding: size === 'sm' ? '6px 10px' : '8px 14px',
        borderRadius: '8px',
        border: saved ? '1.5px solid #C9973A' : '1.5px solid #E2E8F0',
        background: saved ? '#FDF6EC' : 'white',
        color: saved ? '#92400E' : '#64748B',
        fontSize: size === 'sm' ? '11px' : '12px',
        fontWeight: 600,
        cursor: loading ? 'not-allowed' : 'pointer',
        opacity: loading ? 0.6 : 1,
        transition: 'all 0.2s',
        whiteSpace: 'nowrap',
      }}
    >
      {saved ? (
        <BookmarkCheck style={{ width: iconSize, height: iconSize }} />
      ) : (
        <Bookmark style={{ width: iconSize, height: iconSize }} />
      )}
      {saved ? 'Saved' : 'Shortlist'}
    </button>
  )
}