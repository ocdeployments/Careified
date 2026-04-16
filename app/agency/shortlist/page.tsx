'use client'

import { useEffect, useState } from 'react'
import { Bookmark, User } from 'lucide-react'
import Link from 'next/link'

interface ShortlistedCaregiver {
  id: string
  caregiver_id: string
  first_name: string
  last_name: string
  job_title: string
  photo_url: string | null
  aggregate_score: number
  city: string
  state: string
  availability_status: string
  years_experience: number
  specializations: string[]
  notes: string | null
  created_at: string
}

export default function ShortlistPage() {
  const [caregivers, setCaregivers] = useState<ShortlistedCaregiver[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/agency/shortlist')
      .then(r => r.json())
      .then(data => {
        if (data.success) setCaregivers(data.caregivers)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const remove = async (caregiverId: string) => {
    await fetch('/api/agency/shortlist', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ caregiverId }),
    })
    setCaregivers(prev => prev.filter(c => c.caregiver_id !== caregiverId))
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#F7F4F0',
      padding: '32px 24px',
    }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
 
        {/* Header */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '12px',
          marginBottom: '32px' 
        }}>
          <Bookmark style={{ 
            width: '24px', height: '24px', color: '#C9973A' 
          }} />
          <div>
            <h1 style={{ 
              fontSize: '24px', 
              fontWeight: 800, 
              color: '#0D1B3E',
              margin: 0,
              letterSpacing: '-0.02em'
            }}>
              Shortlist
            </h1>
            <p style={{ 
              fontSize: '13px', 
              color: '#64748B', 
              margin: '2px 0 0' 
            }}>
              {caregivers.length} saved {caregivers.length === 1 ? 'caregiver' : 'caregivers'}
            </p>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <p style={{ color: '#64748B', fontSize: '14px' }}>Loading...</p>
        )}

        {/* Empty state */}
        {!loading && caregivers.length === 0 && (
          <div style={{
            background: 'white',
            borderRadius: '16px',
            border: '1px solid #E2E8F0',
            padding: '60px 40px',
            textAlign: 'center',
          }}>
            <Bookmark style={{ 
              width: '32px', height: '32px', 
              color: '#CBD5E1', margin: '0 auto 16px' 
            }} />
            <p style={{ 
              fontSize: '16px', fontWeight: 700, 
              color: '#0D1B3E', marginBottom: '8px' 
            }}>
              No caregivers shortlisted yet
            </p>
            <p style={{ fontSize: '13px', color: '#64748B', marginBottom: '24px' }}>
              Browse caregivers and click Shortlist to save them here.
            </p>
            <Link href="/agency/search" style={{
              display: 'inline-block',
              padding: '10px 24px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #C9973A, #E8B86D)',
              color: '#0D1B3E',
              fontWeight: 700,
              fontSize: '13px',
              textDecoration: 'none',
            }}>
              Browse Caregivers
            </Link>
          </div>
        )}

        {/* Caregiver list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {caregivers.map((c) => (
            <div key={c.caregiver_id} style={{
              background: 'white',
              borderRadius: '16px',
              border: '1px solid #E2E8F0',
              padding: '20px 24px',
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
            }}>
              {/* Photo */}
              <div style={{
                width: '52px',
                height: '52px',
                borderRadius: '50%',
                background: '#F1F5F9',
                overflow: 'hidden',
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                {c.photo_url ? (
                  <img 
                    src={c.photo_url} 
                    alt={c.first_name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <User style={{ width: '20px', height: '20px', color: '#94A3B8' }} />
                )}
              </div>

              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ 
                  fontSize: '15px', fontWeight: 700, color: '#0D1B3E',
                  marginBottom: '2px'
                }}>
                  {c.first_name} {c.last_name}
                </div>
                <div style={{ fontSize: '12px', color: '#64748B' }}>
                  {c.job_title} · {c.city}, {c.state}
                </div>
                {c.aggregate_score > 0 && (
                  <div style={{ 
                    fontSize: '12px', color: '#C9973A', 
                    fontWeight: 600, marginTop: '2px' 
                  }}>
                    {c.aggregate_score.toFixed(1)}★
                  </div>
                )}
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                <Link
                  href={`/profile/${c.caregiver_id}`}
                  style={{
                    padding: '7px 14px',
                    borderRadius: '8px',
                    background: 'linear-gradient(135deg, #1E3A8A, #2563EB)',
                    color: 'white',
                    fontSize: '12px',
                    fontWeight: 600,
                    textDecoration: 'none',
                  }}
                >
                  View Profile
                </Link>
                <button
                  onClick={() => remove(c.caregiver_id)}
                  style={{
                    padding: '7px 14px',
                    borderRadius: '8px',
                    border: '1.5px solid #E2E8F0',
                    background: 'white',
                    color: '#94A3B8',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}