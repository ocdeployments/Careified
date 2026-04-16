import { Pool } from 'pg'
import { ShieldCheck, MapPin, Star } from 'lucide-react'
import QRCodeDisplay from '@/components/id/QRCodeDisplay'

const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
})

export const dynamic = 'force-dynamic'

async function getCaregiver(id: string) {
  try {
    // Try numeric ID first
    const numId = parseInt(id, 10)
    if (!isNaN(numId)) {
      const { rows } = await pool.query(
        'SELECT id, first_name, last_name, job_title, photo_url, city, state, aggregate_score, caregiver_code, verify_slug, status, years_experience FROM caregivers WHERE id = $1 LIMIT 1',
        [numId]
      )
      if (rows.length > 0) return rows[0]
    }
    // Try caregiver_code or verify_slug
    const upperId = id.toUpperCase()
    const { rows } = await pool.query(
      'SELECT id, first_name, last_name, job_title, photo_url, city, state, aggregate_score, caregiver_code, verify_slug, status, years_experience FROM caregivers WHERE caregiver_code = $1 OR verify_slug = $1 LIMIT 1',
      [upperId]
    )
    return rows[0] || null
  } catch (e) {
    console.error('getCaregiver error:', e)
    return null
  }
}

export default async function IDCardPage({
  params
}: {
  params: Promise<{ caregiverId: string }>
}) {
  const { caregiverId } = await params
  const c = await getCaregiver(caregiverId)
  
  if (!c) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#0D1B3E',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        fontFamily: 'system-ui, sans-serif',
      }}>
        <div style={{ 
          background: 'white', 
          borderRadius: '24px', 
          padding: '48px', 
          textAlign: 'center',
          maxWidth: '380px',
        }}>
          <ShieldCheck style={{ width: 64, height: 64, color: '#94A3B8', marginBottom: '16px' }} />
          <h1 style={{ fontSize: '20px', fontWeight: 900, color: '#0D1B3E', marginBottom: '8px' }}>
            ID Not Found
          </h1>
          <p style={{ color: '#64748B', fontSize: '14px' }}>
            This caregiver ID is invalid.
          </p>
        </div>
      </div>
    )
  }

  const isActive = c.status === 'approved'
  const initial = c.last_name?.[0] || ''

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #0D1B3E 0%, #1E3A8A 100%)',
      padding: '24px 20px 48px',
      fontFamily: 'system-ui, -apple-system, sans-serif',
    }}>
      <div style={{ maxWidth: '420px', margin: '0 auto' }}>
        
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          marginBottom: '24px',
        }}>
          <div style={{
            width: '32px', height: '32px',
            borderRadius: '8px',
            background: 'linear-gradient(135deg, #C9973A, #E8B86D)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '16px', fontWeight: 900, color: '#0D1B3E',
          }}>C</div>
          <span style={{
            fontSize: '14px', fontWeight: 700,
            color: 'rgba(255,255,255,0.9)',
            letterSpacing: '0.05em',
          }}>CAREIFIED</span>
        </div>

        {/* Main Card */}
        <div style={{
          background: 'white',
          borderRadius: '24px',
          overflow: 'hidden',
          boxShadow: '0 24px 64px rgba(0,0,0,0.4)',
        }}>
          {/* Gold accent */}
          <div style={{
            height: '4px',
            background: 'linear-gradient(90deg, #C9973A, #E8B86D, #C9973A)',
          }} />

          <div style={{ padding: '28px 24px' }}>

            {/* Status badge */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px',
            }}>
              <span style={{
                fontSize: '9px', fontWeight: 800,
                letterSpacing: '0.12em',
                textTransform: 'uppercase' as const,
                color: '#94A3B8',
              }}>
                Digital ID Card
              </span>
              <div style={{
                display: 'flex', alignItems: 'center', gap: '4px',
                padding: '4px 10px', borderRadius: '20px',
                background: isActive ? '#F0FDF4' : '#FEF2F2',
                border: `1px solid ${isActive ? '#BBF7D0' : '#FECACA'}`,
              }}>
                <div style={{
                  width: '6px', height: '6px', borderRadius: '50%',
                  background: isActive ? '#16A34A' : '#DC2626',
                }} />
                <span style={{
                  fontSize: '10px', fontWeight: 700,
                  color: isActive ? '#15803D' : '#DC2626',
                }}>
                  {isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>

            {/* Avatar + Name */}
            <div style={{
              display: 'flex', alignItems: 'center',
              gap: '16px', marginBottom: '24px',
            }}>
              <div style={{
                width: '80px', height: '80px',
                borderRadius: '50%', overflow: 'hidden',
                flexShrink: 0,
                border: '4px solid #F1F5F9',
                background: 'linear-gradient(135deg, #C9973A, #E8B86D)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {c.photo_url ? (
                  <img
                    src={c.photo_url}
                    alt={c.first_name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' as const }}
                  />
                ) : (
                  <span style={{ fontSize: '32px', fontWeight: 900, color: '#0D1B3E' }}>
                    {c.first_name?.[0]}
                  </span>
                )}
              </div>
              <div>
                <div style={{
                  fontSize: '22px', fontWeight: 900,
                  color: '#0D1B3E', letterSpacing: '-0.02em', lineHeight: 1.1,
                }}>
                  {c.first_name} {initial}.
                </div>
                <div style={{ fontSize: '14px', color: '#64748B', marginTop: '4px' }}>
                  {c.job_title}
                </div>
                <div style={{
                  display: 'flex', alignItems: 'center',
                  gap: '4px', marginTop: '6px',
                }}>
                  <MapPin style={{ width: '12px', height: '12px', color: '#94A3B8' }} />
                  <span style={{ fontSize: '12px', color: '#94A3B8' }}>
                    {c.city}, {c.state}
                  </span>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div style={{
              display: 'grid', gridTemplateColumns: '1fr 1fr',
              gap: '12px', marginBottom: '24px',
            }}>
              <div style={{
                background: '#FDF6EC', borderRadius: '16px',
                padding: '16px', textAlign: 'center' as const,
              }}>
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  gap: '4px', marginBottom: '4px',
                }}>
                  <Star style={{ width: '16px', height: '16px', fill: '#C9973A', color: '#C9973A' }} />
                  <div style={{
                    fontSize: '24px', fontWeight: 900,
                    color: '#C9973A', letterSpacing: '-0.02em',
                  }}>
                    {c.aggregate_score > 0
                      ? Number(c.aggregate_score).toFixed(1)
                      : '—'}
                  </div>
                </div>
                <div style={{
                  fontSize: '9px', fontWeight: 700, color: '#92400E',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase' as const,
                }}>
                  Trust Score
                </div>
              </div>
              <div style={{
                background: '#F8FAFC', borderRadius: '16px',
                padding: '16px', textAlign: 'center' as const,
              }}>
                <div style={{
                  fontSize: '24px', fontWeight: 900,
                  color: '#0D1B3E', letterSpacing: '-0.02em',
                }}>
                  {c.years_experience || '—'}
                </div>
                <div style={{
                  fontSize: '9px', fontWeight: 700, color: '#64748B',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase' as const,
                }}>
                  Years Exp
                </div>
              </div>
            </div>

            {/* QR Code */}
            <div style={{
              background: 'white',
              borderRadius: '16px',
              padding: '20px',
              border: '1px solid #E2E8F0',
              marginBottom: '20px',
            }}>
              <div style={{
                fontSize: '9px', fontWeight: 800, color: '#94A3B8',
                letterSpacing: '0.1em',
                textTransform: 'uppercase' as const,
                marginBottom: '12px',
                textAlign: 'center',
              }}>
                Scan to Verify
              </div>
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <QRCodeDisplay value={`https://careified.com/verify/${c.verify_slug}`} size={140} />
              </div>
            </div>

            {/* Divider */}
            <div style={{ height: '1px', background: '#F1F5F9', marginBottom: '16px' }} />

            {/* ID */}
            <div style={{
              display: 'flex', alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <div>
                <div style={{
                  fontSize: '9px', fontWeight: 800, color: '#94A3B8',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase' as const, marginBottom: '3px',
                }}>
                  Caregiver ID
                </div>
                <div style={{
                  fontSize: '15px', fontWeight: 900,
                  color: '#0D1B3E', letterSpacing: '0.05em',
                  fontFamily: 'monospace',
                }}>
                  {c.caregiver_code}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <ShieldCheck style={{ width: '14px', height: '14px', color: '#C9973A' }} />
                <span style={{ fontSize: '10px', fontWeight: 700, color: '#C9973A' }}>
                  Verified
                </span>
              </div>
            </div>
          </div>

          {/* Gold footer */}
          <div style={{
            height: '3px',
            background: 'linear-gradient(90deg, #C9973A, #E8B86D, #C9973A)',
          }} />
        </div>

        {/* Footer */}
        <p style={{
          textAlign: 'center' as const,
          fontSize: '11px',
          color: 'rgba(255,255,255,0.35)',
          marginTop: '20px',
        }}>
          Careified Digital ID · {new Date().toLocaleDateString('en-US', {
            month: 'short', day: 'numeric', year: 'numeric'
          })}
        </p>
      </div>
    </div>
  )
}
