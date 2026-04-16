import { Clock, Mail } from 'lucide-react'
import Link from 'next/link'

export default function PendingApprovalPage() {
  return (
    <div style={{
      minHeight: '100vh',
      background: '#F7F4F0',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 20px',
      fontFamily: 'system-ui, -apple-system, sans-serif',
    }}>
      <div style={{ maxWidth: '480px', width: '100%', textAlign: 'center' }}>

        {/* Icon */}
        <div style={{
          width: '72px', height: '72px',
          borderRadius: '20px',
          background: 'linear-gradient(135deg, #C9973A, #E8B86D)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 24px',
        }}>
          <Clock style={{ width: '32px', height: '32px', color: '#0D1B3E' }} />
        </div>

        {/* Heading */}
        <h1 style={{
          fontSize: '28px', fontWeight: 900,
          color: '#0D1B3E', letterSpacing: '-0.02em',
          marginBottom: '12px',
        }}>
          Application received
        </h1>

        <p style={{
          fontSize: '15px', color: '#64748B',
          lineHeight: 1.6, marginBottom: '32px',
        }}>
          Your agency account is under review. We verify all agencies
          before granting access to caregiver profiles.
          You will receive an email once your account is approved.
        </p>

        {/* Status card */}
        <div style={{
          background: 'white',
          borderRadius: '16px',
          border: '1px solid #E2E8F0',
          padding: '24px',
          marginBottom: '24px',
          textAlign: 'left',
        }}>
          {[
            { label: 'Application submitted', done: true },
            { label: 'Identity verification', done: false },
            { label: 'Agency review', done: false },
            { label: 'Access granted', done: false },
          ].map((step, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: '12px',
              padding: '10px 0',
              borderBottom: i < 3 ? '1px solid #F1F5F9' : 'none',
            }}>
              <div style={{
                width: '24px', height: '24px', borderRadius: '50%',
                background: step.done
                  ? 'linear-gradient(135deg, #C9973A, #E8B86D)'
                  : '#F1F5F9',
                border: step.done ? 'none' : '2px solid #E2E8F0',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                {step.done && (
                  <div style={{
                    width: '8px', height: '8px',
                    borderRadius: '50%', background: '#0D1B3E',
                  }} />
                )}
              </div>
              <span style={{
                fontSize: '13px',
                fontWeight: step.done ? 600 : 400,
                color: step.done ? '#0D1B3E' : '#94A3B8',
              }}>
                {step.label}
              </span>
              {i === 0 && (
                <span style={{
                  marginLeft: 'auto',
                  fontSize: '10px', fontWeight: 700,
                  color: '#C9973A',
                  background: '#FDF6EC',
                  padding: '2px 8px', borderRadius: '20px',
                }}>
                  Complete
                </span>
              )}
            </div>
          ))}
        </div>

        {/* Contact note */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          justifyContent: 'center',
          fontSize: '13px', color: '#64748B',
        }}>
          <Mail style={{ width: '14px', height: '14px' }} />
          Questions? Contact us at support@careified.com
        </div>

        <div style={{ marginTop: '24px' }}>
          <Link href="/" style={{
            fontSize: '13px', color: '#94A3B8',
            textDecoration: 'none',
          }}>
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  )
}
