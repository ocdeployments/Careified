import { Pool } from 'pg'
import { notFound } from 'next/navigation'
import { ShieldCheck, MapPin } from 'lucide-react'
import QRCodeDisplay from '@/components/id/QRCodeDisplay'

const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
})

async function getCaregiver(id: string) {
  // Try ID first, then caregiver_code, then verify_slug
  const { rows } = await pool.query(
    'SELECT id, first_name, last_name, job_title, photo_url, city, state, aggregate_score, caregiver_code, verify_slug, status, years_experience FROM caregivers WHERE id = $1 OR caregiver_code = $1 OR verify_slug = $1 LIMIT 1',
    [id]
  )
  return rows[0] || null
}

export default async function IDCardPage({
  params
}: {
  params: Promise<{ caregiverId: string }>
}) {
  const { caregiverId } = await params
  const c = await getCaregiver(caregiverId)
  if (!c) notFound()

  const verifyUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'https://careified.vercel.app'}/verify/${c.verify_slug}`

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0D1B3E',
      display: 'flex',
      flexDirection: 'column' as const,
      alignItems: 'center',
      justifyContent: 'center',
      padding: '32px 20px',
      fontFamily: 'system-ui, -apple-system, sans-serif',
    }}>

      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center',
        gap: '8px', marginBottom: '32px',
      }}>
        <div style={{
          width: '36px', height: '36px', borderRadius: '10px',
          background: 'linear-gradient(135deg, #C9973A, #E8B86D)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '18px', fontWeight: 900, color: '#0D1B3E',
        }}>C</div>
        <span style={{
          fontSize: '16px', fontWeight: 800,
          color: 'white', letterSpacing: '0.04em',
        }}>CAREIFIED</span>
      </div>

      {/* ID Card */}
      <div style={{
        width: '100%', maxWidth: '360px',
        background: 'linear-gradient(145deg, #1a1a2e 0%, #0D1B3E 50%, #0a1628 100%)',
        borderRadius: '24px',
        overflow: 'hidden',
        boxShadow: '0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(201,151,58,0.2)',
        position: 'relative' as const,
      }}>

        {/* Background glow */}
        <div style={{
          position: 'absolute' as const, inset: 0,
          backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(201,151,58,0.05) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(30,58,138,0.15) 0%, transparent 50%)',
          pointerEvents: 'none' as const,
        }} />

        {/* Gold top accent */}
        <div style={{
          height: '3px',
          background: 'linear-gradient(90deg, transparent, #C9973A, #E8B86D, #C9973A, transparent)',
        }} />

        <div style={{ padding: '28px 24px', position: 'relative' as const }}>

          {/* Card type + verified badge */}
          <div style={{
            display: 'flex', justifyContent: 'space-between',
            alignItems: 'center', marginBottom: '24px',
          }}>
            <span style={{
              fontSize: '8px', fontWeight: 800,
              letterSpacing: '0.2em',
              textTransform: 'uppercase' as const,
              color: 'rgba(201,151,58,0.7)',
            }}>
              Professional ID
            </span>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '4px',
              padding: '3px 8px', borderRadius: '20px',
              background: 'rgba(201,151,58,0.1)',
              border: '1px solid rgba(201,151,58,0.2)',
            }}>
              <div style={{
                width: '5px', height: '5px',
                borderRadius: '50%', background: '#C9973A',
              }} />
              <span style={{ fontSize: '9px', fontWeight: 700, color: '#C9973A' }}>
                Verified
              </span>
            </div>
          </div>

          {/* Photo */}
          <div style={{
            display: 'flex', justifyContent: 'center', marginBottom: '20px',
          }}>
            <div style={{
              width: '88px', height: '88px', borderRadius: '50%',
              border: '3px solid rgba(201,151,58,0.4)',
              overflow: 'hidden',
              background: 'linear-gradient(135deg, #C9973A, #E8B86D)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 0 6px rgba(201,151,58,0.08)',
            }}>
              {c.photo_url ? (
                <img
                  src={c.photo_url}
                  alt={c.first_name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' as const }}
                />
              ) : (
                <span style={{ fontSize: '36px', fontWeight: 900, color: '#0D1B3E' }}>
                  {c.first_name?.[0]}
                </span>
              )}
            </div>
          </div>

          {/* Name */}
          <div style={{ textAlign: 'center' as const, marginBottom: '20px' }}>
            <div style={{
              fontSize: '22px', fontWeight: 900, color: 'white',
              letterSpacing: '-0.02em', lineHeight: 1.1,
            }}>
              {c.first_name} {c.last_name}
            </div>
            <div style={{
              fontSize: '13px', color: 'rgba(255,255,255,0.5)',
              marginTop: '4px', fontWeight: 500,
            }}>
              {c.job_title}
            </div>
            <div style={{
              display: 'flex', alignItems: 'center',
              justifyContent: 'center', gap: '4px', marginTop: '6px',
            }}>
              <MapPin style={{ width: '11px', height: '11px', color: 'rgba(255,255,255,0.3)' }} />
              <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)' }}>
                {c.city}, {c.state} · {c.country || 'US'}
              </span>
            </div>
          </div>

          {/* Stats */}
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 1px 1fr 1px 1fr',
            marginBottom: '24px',
            background: 'rgba(255,255,255,0.04)',
            borderRadius: '14px',
            border: '1px solid rgba(255,255,255,0.07)',
            overflow: 'hidden',
          }}>
            {[
              { value: c.aggregate_score > 0 ? c.aggregate_score.toFixed(1) : '—', label: 'Score' },
              { divider: true },
              { value: String(c.years_experience || '—'), label: 'Years' },
              { divider: true },
              { value: String(c.credentials?.length || '—'), label: 'Creds' },
            ].map((item, i) => {
              if ('divider' in item) {
                return <div key={i} style={{ width: '1px', background: 'rgba(255,255,255,0.07)' }} />
              }
              return (
                <div key={i} style={{ padding: '14px 8px', textAlign: 'center' as const }}>
                  <div style={{
                    fontSize: '18px', fontWeight: 900,
                    color: '#C9973A', letterSpacing: '-0.02em',
                  }}>
                    {item.value}
                  </div>
                  <div style={{
                    fontSize: '8px', fontWeight: 700,
                    color: 'rgba(255,255,255,0.3)',
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase' as const, marginTop: '2px',
                  }}>
                    {item.label}
                  </div>
                </div>
              )
            })}
          </div>

          {/* QR Code */}
          <div style={{
            display: 'flex', justifyContent: 'center', marginBottom: '20px',
          }}>
            <div style={{
              background: 'white', borderRadius: '16px', padding: '16px',
              display: 'inline-flex', flexDirection: 'column' as const,
              alignItems: 'center', gap: '8px',
            }}>
              <QRCodeDisplay value={verifyUrl} size={120} />
              <span style={{
                fontSize: '9px', fontWeight: 700, color: '#94A3B8',
                letterSpacing: '0.08em',
                textTransform: 'uppercase' as const,
              }}>
                Scan to verify
              </span>
            </div>
          </div>

          {/* Caregiver code */}
          <div style={{ textAlign: 'center' as const, marginBottom: '20px' }}>
            <div style={{
              fontSize: '13px', fontWeight: 900,
              color: 'rgba(255,255,255,0.6)',
              letterSpacing: '0.15em', fontFamily: 'monospace',
            }}>
              {c.caregiver_code}
            </div>
          </div>

          {/* Credentials */}
          {c.credentials?.length > 0 && (
            <div style={{
              display: 'flex', flexWrap: 'wrap' as const,
              gap: '6px', justifyContent: 'center', marginBottom: '20px',
            }}>
              {c.credentials.slice(0, 4).map((cred: string) => (
                <div key={cred} style={{
                  display: 'flex', alignItems: 'center', gap: '4px',
                  padding: '4px 8px', borderRadius: '6px',
                  background: 'rgba(30,58,138,0.3)',
                  border: '1px solid rgba(30,58,138,0.5)',
                }}>
                  <ShieldCheck style={{ width: '10px', height: '10px', color: '#93C5FD' }} />
                  <span style={{ fontSize: '9px', fontWeight: 700, color: '#93C5FD' }}>
                    {cred}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Gold bottom accent */}
        <div style={{
          height: '3px',
          background: 'linear-gradient(90deg, transparent, #C9973A, #E8B86D, #C9973A, transparent)',
        }} />
      </div>

      {/* Add to Wallet — scaffolded, not yet functional */}
      <div style={{ marginTop: '24px', width: '100%', maxWidth: '360px' }}>
        <button
          disabled
          style={{
            width: '100%', padding: '14px', borderRadius: '14px',
            background: 'black',
            border: '1px solid rgba(255,255,255,0.15)',
            color: 'white', fontSize: '14px', fontWeight: 600,
            display: 'flex', alignItems: 'center',
            justifyContent: 'center', gap: '10px',
            cursor: 'not-allowed', opacity: 0.6,
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
            <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
          </svg>
          Add to Apple Wallet
          <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', fontWeight: 400 }}>
            (Coming soon)
          </span>
        </button>
        <p style={{
          textAlign: 'center' as const, fontSize: '11px',
          color: 'rgba(255,255,255,0.25)', marginTop: '12px',
        }}>
          Apple Developer certificate required · developer.apple.com
        </p>
      </div>
    </div>
  )
}