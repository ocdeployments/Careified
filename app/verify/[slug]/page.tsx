import { Pool } from 'pg'
import { ShieldCheck, MapPin } from 'lucide-react'

const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
})

export const dynamic = 'force-dynamic'

async function getCaregiverBySlug(slug: string) {
  const { rows } = await pool.query(
    'SELECT first_name, last_name, job_title, photo_url, city, state, aggregate_score, caregiver_code, verify_slug, status, years_experience FROM caregivers WHERE verify_slug = $1',
    [slug.toUpperCase()]
  )
  return rows[0] || null
}

export default async function VerifyPage({ 
  params 
}: { 
  params: Promise<{ slug: string }> 
}) {
  const { slug } = await params
  const caregiver = await getCaregiverBySlug(slug)
  
  if (!caregiver) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #0D1B3E 0%, #1E3A8A 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px 20px',
        fontFamily: 'system-ui, -apple-system, sans-serif',
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
            Caregiver Not Found
          </h1>
          <p style={{ color: '#64748B', fontSize: '14px' }}>
            This verification link may be invalid or expired.
          </p>
        </div>
      </div>
    )
  }

  const isActive = caregiver.status === 'approved'
  const initial = caregiver.last_name?.[0] || ''

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #0D1B3E 0%, #1E3A8A 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px 20px',
      fontFamily: 'system-ui, -apple-system, sans-serif',
    }}>
      <div style={{ width: '100%', maxWidth: '380px' }}>

        {/* Platform badge */}
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

        {/* Main card */}
        <div style={{
          background: 'white',
          borderRadius: '24px',
          overflow: 'hidden',
          boxShadow: '0 24px 64px rgba(0,0,0,0.4)',
        }}>
          <div style={{
            height: '4px',
            background: 'linear-gradient(90deg, #C9973A, #E8B86D, #C9973A)',
          }} />

          <div style={{ padding: '28px 24px 24px' }}>

            {/* Status */}
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
                Verified Professional
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

            {/* Photo + name */}
            <div style={{
              display: 'flex', alignItems: 'center',
              gap: '16px', marginBottom: '20px',
            }}>
              <div style={{
                width: '72px', height: '72px',
                borderRadius: '50%', overflow: 'hidden',
                flexShrink: 0,
                border: '3px solid #F1F5F9',
                background: 'linear-gradient(135deg, #C9973A, #E8B86D)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {caregiver.photo_url ? (
                  <img
                    src={caregiver.photo_url}
                    alt={caregiver.first_name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' as const }}
                  />
                ) : (
                  <span style={{ fontSize: '28px', fontWeight: 900, color: '#0D1B3E' }}>
                    {caregiver.first_name?.[0]}
                  </span>
                )}
              </div>
              <div>
                <div style={{
                  fontSize: '20px', fontWeight: 900,
                  color: '#0D1B3E', letterSpacing: '-0.02em', lineHeight: 1.1,
                }}>
                  {caregiver.first_name} {initial}.
                </div>
                <div style={{ fontSize: '13px', color: '#64748B', marginTop: '3px' }}>
                  {caregiver.job_title}
                </div>
                <div style={{
                  display: 'flex', alignItems: 'center',
                  gap: '4px', marginTop: '4px',
                }}>
                  <MapPin style={{ width: '11px', height: '11px', color: '#94A3B8' }} />
                  <span style={{ fontSize: '11px', color: '#94A3B8' }}>
                    {caregiver.city}, {caregiver.state}
                  </span>
                </div>
              </div>
            </div>

            {/* Score + experience */}
            <div style={{
              display: 'grid', gridTemplateColumns: '1fr 1fr',
              gap: '10px', marginBottom: '20px',
            }}>
              <div style={{
                background: '#FDF6EC', borderRadius: '12px',
                padding: '12px', textAlign: 'center' as const,
              }}>
                <div style={{
                  fontSize: '22px', fontWeight: 900,
                  color: '#C9973A', letterSpacing: '-0.02em',
                }}>
                  {caregiver.aggregate_score > 0
                    ? Number(caregiver.aggregate_score).toFixed(1)
                    : '—'}
                </div>
                <div style={{
                  fontSize: '9px', fontWeight: 700, color: '#92400E',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase' as const, marginTop: '2px',
                }}>
                  Trust Score
                </div>
              </div>
              <div style={{
                background: '#F8FAFC', borderRadius: '12px',
                padding: '12px', textAlign: 'center' as const,
              }}>
                <div style={{
                  fontSize: '22px', fontWeight: 900,
                  color: '#0D1B3E', letterSpacing: '-0.02em',
                }}>
                  {caregiver.years_experience || '—'}
                </div>
                <div style={{
                  fontSize: '9px', fontWeight: 700, color: '#64748B',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase' as const, marginTop: '2px',
                }}>
                  Yrs Experience
                </div>
              </div>
            </div>

            {/* Divider */}
            <div style={{ height: '1px', background: '#F1F5F9', marginBottom: '16px' }} />

            {/* Caregiver code */}
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
                  {caregiver.caregiver_code}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <ShieldCheck style={{ width: '14px', height: '14px', color: '#C9973A' }} />
                <span style={{ fontSize: '10px', fontWeight: 700, color: '#C9973A' }}>
                  Careified Verified
                </span>
              </div>
            </div>
          </div>

          <div style={{
            height: '3px',
            background: 'linear-gradient(90deg, #C9973A, #E8B86D, #C9973A)',
          }} />
        </div>

        {/* Scan timestamp */}
        <p style={{
          textAlign: 'center' as const,
          fontSize: '11px',
          color: 'rgba(255,255,255,0.35)',
          marginTop: '20px',
        }}>
          Scanned via Careified QR · {new Date().toLocaleDateString('en-US', {
            month: 'short', day: 'numeric', year: 'numeric'
          })}
        </p>
      </div>
    </div>
  )
}
