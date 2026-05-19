'use client'

export default function PendingApprovalPage() {
  return (
    <div style={{
      minHeight: '100vh',
      background: '#0D1B3E',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 24px',
      fontFamily: '"DM Sans", sans-serif',
    }}>
      <div style={{
        maxWidth: '520px',
        width: '100%',
        textAlign: 'center',
      }}>
        {/* Logo */}
        <div style={{
          fontFamily: '"DM Serif Display", serif',
          fontSize: '24px',
          color: '#C9973A',
          marginBottom: '40px',
        }}>
          Careified
        </div>

        {/* Headline */}
        <h1 style={{
          fontFamily: '"DM Serif Display", serif',
          fontSize: '36px',
          color: '#FFFFFF',
          marginBottom: '16px',
        }}>
          Application Received
        </h1>

        {/* Subtext */}
        <p style={{
          fontSize: '16px',
          color: 'rgba(255,255,255,0.7)',
          lineHeight: 1.6,
          marginBottom: '32px',
        }}>
          We&apos;re reviewing your agency profile. You&apos;ll receive an email once approved — usually within 1 business day.
        </p>

        {/* Status Card */}
        <div style={{
          background: '#FFFFFF',
          borderRadius: '16px',
          padding: '32px',
          textAlign: 'left',
          marginBottom: '32px',
        }}>
          {/* Status indicator */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            marginBottom: '24px',
          }}>
            <div style={{
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              background: '#C9973A',
            }} />
            <span style={{
              fontSize: '14px',
              fontWeight: 600,
              color: '#C9973A',
            }}>
              Under Review
            </span>
          </div>

          {/* What happens next */}
          <div>
            <div style={{
              fontSize: '13px',
              fontWeight: 600,
              color: '#0D1B3E',
              marginBottom: '16px',
            }}>
              What happens next
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {[
                'We verify your agency details',
                'You receive an approval email',
                'Full platform access unlocked',
              ].map((step, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <div style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    background: '#0D1B3E',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <span style={{
                      fontSize: '12px',
                      color: '#FFFFFF',
                      fontWeight: 600,
                    }}>
                      {i + 1}
                    </span>
                  </div>
                  <span style={{
                    fontSize: '14px',
                    color: '#64748B',
                    lineHeight: 1.5,
                  }}>
                    {step}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Contact link */}
        <a
          href="/contact"
          style={{
            fontSize: '13px',
            color: 'rgba(255,255,255,0.5)',
            textDecoration: 'none',
          }}
        >
          Questions? Contact us
        </a>
      </div>
    </div>
  )
}
