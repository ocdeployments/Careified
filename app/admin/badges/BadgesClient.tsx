'use client'
import { useState } from 'react'
import Link from 'next/link'

const N = '#0D1B3E'
const G = '#C9973A'
const S = "'DM Sans', sans-serif"

type CaregiverBadge = {
  id: string
  first_name: string
  last_name: string
  email: string
  badges: Array<{
    id: string
    label: string
    description: string
    earned_at: string
  }>
}

export default function BadgesClient({ caregivers }: { caregivers: CaregiverBadge[] }) {
  const [search, setSearch] = useState('')

  const filtered = caregivers.filter(c => {
    const q = search.toLowerCase()
    return c.first_name?.toLowerCase().includes(q) ||
      c.last_name?.toLowerCase().includes(q) ||
      c.email?.toLowerCase().includes(q)
  })

  async function removeBadge(caregiverId: string, badgeId: string) {
    const caregiver = caregivers.find(c => c.id === caregiverId)
    if (!caregiver) return

    const updated = (caregiver.badges || []).filter(b => b.id !== badgeId)

    try {
      const res = await fetch(`/api/admin/badges`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ caregiverId, badges: updated }),
      })
      if (res.ok) {
        window.location.reload()
      }
    } catch (e) {
      alert('Failed to remove badge')
    }
  }

  return (
    <div style={{ fontFamily: S, color: N, maxWidth: 1000, margin: '0 auto', padding: '32px 24px' }}>
      <div style={{ marginBottom: 24 }}>
        <Link href="/admin" style={{ fontSize: 13, color: '#64748B', textDecoration: 'none' }}>
          ← Back to admin
        </Link>
        <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 28, margin: '8px 0 4px' }}>Badge Management</h1>
        <p style={{ fontSize: 13, color: '#64748B', margin: 0 }}>View and manage caregiver badges</p>
      </div>

      {/* Search */}
      <div style={{ marginBottom: 24 }}>
        <input
          type="text"
          placeholder="Search caregivers..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            width: '100%',
            maxWidth: 400,
            padding: '12px 16px',
            borderRadius: 10,
            border: '1.5px solid #E2E8F0',
            fontSize: 14,
            fontFamily: S,
            outline: 'none',
            boxSizing: 'border-box',
          }}
        />
      </div>

      {filtered.length === 0 ? (
        <div style={{ background: 'white', borderRadius: 12, padding: 40, textAlign: 'center', color: '#64748B' }}>
          {search ? 'No caregivers match your search' : 'No caregivers have earned badges yet'}
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 12 }}>
          {filtered.map(c => (
            <div key={c.id} style={{ background: 'white', borderRadius: 12, padding: 20, border: '1px solid #E2E8F0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: N }}>
                    {c.first_name} {c.last_name}
                  </div>
                  <div style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>{c.email}</div>
                </div>
                <Link
                  href={`/profile/${c.id}`}
                  style={{ fontSize: 12, color: G, textDecoration: 'none' }}
                >
                  View profile →
                </Link>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {c.badges.map(badge => (
                  <div
                    key={badge.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      background: 'linear-gradient(135deg, #C9973A, #E8B86D)',
                      color: N,
                      padding: '6px 12px',
                      borderRadius: 20,
                      fontSize: 12,
                      fontWeight: 600,
                    }}
                  >
                    <span title={badge.description}>{badge.label}</span>
                    <button
                      onClick={() => removeBadge(c.id, badge.id)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: N,
                        cursor: 'pointer',
                        fontSize: 14,
                        lineHeight: 1,
                        opacity: 0.6,
                        padding: 0,
                      }}
                      title="Remove badge"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}