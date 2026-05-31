'use client'
import { useState } from 'react'

export default function WaitlistPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: '' as '' | 'caregiver' | 'agency',
    country: '' as '' | 'CA' | 'US',
    city: '',
    province_state: '',
  })
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('loading')
    setErrorMsg('')

    const res = await fetch('/api/waitlist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    })

    if (res.ok) {
      setStatus('success')
    } else {
      const data = await res.json()
      setErrorMsg(data.error || 'Something went wrong')
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#0D1B3E',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'DM Sans, sans-serif',
        padding: '24px',
      }}>
        <div style={{
          textAlign: 'center',
          color: '#C9973A',
          fontSize: 20,
          fontWeight: 600,
        }}>
          You're on the list. We'll be in touch.
        </div>
      </div>
    )
  }

  const provinceLabel = formData.country === 'US' ? 'State' : formData.country === 'CA' ? 'Province' : 'Province/State'

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0D1B3E',
      fontFamily: 'DM Sans, sans-serif',
      padding: '80px 24px 60px',
    }}>
      <div style={{ maxWidth: 680, margin: '0 auto' }}>
        {/* Logo */}
        <div style={{
          fontSize: 28,
          fontWeight: 700,
          color: '#C9973A',
          fontFamily: 'DM Serif Display, serif',
          textAlign: 'center',
          marginBottom: 48,
        }}>
          Careified
        </div>

        {/* Headline */}
        <h1 style={{
          fontSize: 42,
          fontWeight: 400,
          color: '#fff',
          fontFamily: 'DM Serif Display, serif',
          textAlign: 'center',
          marginBottom: 20,
          lineHeight: 1.2,
        }}>
          Qualified. Recognised. Verified.
        </h1>

        {/* Subhead */}
        <p style={{
          fontSize: 16,
          color: 'rgba(255,255,255,0.7)',
          textAlign: 'center',
          marginBottom: 40,
          lineHeight: 1.6,
        }}>
          For PSWs and caregivers: build a verified professional profile that agencies trust.{' '}
          For home care agencies: recruit interview-ready caregivers with verified credentials — without the manual screening.
        </p>

        {/* Coming soon badge */}
        <div style={{
          textAlign: 'center',
          marginBottom: 40,
        }}>
          <span style={{
            display: 'inline-block',
            padding: '6px 16px',
            borderRadius: 20,
            background: 'rgba(201,151,58,0.15)',
            border: '1px solid #C9973A',
            color: '#C9973A',
            fontSize: 12,
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
          }}>
            Coming soon
          </span>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {/* Name */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 13, color: 'rgba(255,255,255,0.6)', marginBottom: 6 }}>
              Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              required
              style={{
                width: '100%',
                padding: '12px 14px',
                borderRadius: 8,
                fontSize: 15,
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.15)',
                color: '#fff',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {/* Email */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 13, color: 'rgba(255,255,255,0.6)', marginBottom: 6 }}>
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={e => setFormData({ ...formData, email: e.target.value })}
              required
              style={{
                width: '100%',
                padding: '12px 14px',
                borderRadius: 8,
                fontSize: 15,
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.15)',
                color: '#fff',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {/* Role */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 13, color: 'rgba(255,255,255,0.6)', marginBottom: 8 }}>
              Role
            </label>
            <div style={{ display: 'flex', gap: 12 }}>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, role: 'caregiver' })}
                style={{
                  flex: 1,
                  padding: '12px 16px',
                  borderRadius: 8,
                  fontSize: 14,
                  fontWeight: 500,
                  background: formData.role === 'caregiver'
                    ? 'linear-gradient(135deg, #C9973A, #E8B86D)'
                    : 'rgba(255,255,255,0.06)',
                  border: formData.role === 'caregiver'
                    ? 'none'
                    : '1px solid rgba(255,255,255,0.15)',
                  color: formData.role === 'caregiver' ? '#0D1B3E' : 'rgba(255,255,255,0.7)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                I'm a Caregiver
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, role: 'agency' })}
                style={{
                  flex: 1,
                  padding: '12px 16px',
                  borderRadius: 8,
                  fontSize: 14,
                  fontWeight: 500,
                  background: formData.role === 'agency'
                    ? 'linear-gradient(135deg, #C9973A, #E8B86D)'
                    : 'rgba(255,255,255,0.06)',
                  border: formData.role === 'agency'
                    ? 'none'
                    : '1px solid rgba(255,255,255,0.15)',
                  color: formData.role === 'agency' ? '#0D1B3E' : 'rgba(255,255,255,0.7)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                I'm an Agency
              </button>
            </div>
          </div>

          {/* Country */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 13, color: 'rgba(255,255,255,0.6)', marginBottom: 8 }}>
              Country
            </label>
            <div style={{ display: 'flex', gap: 12 }}>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, country: 'CA', province_state: '' })}
                style={{
                  flex: 1,
                  padding: '12px 16px',
                  borderRadius: 8,
                  fontSize: 14,
                  fontWeight: 500,
                  background: formData.country === 'CA'
                    ? 'linear-gradient(135deg, #C9973A, #E8B86D)'
                    : 'rgba(255,255,255,0.06)',
                  border: formData.country === 'CA'
                    ? 'none'
                    : '1px solid rgba(255,255,255,0.15)',
                  color: formData.country === 'CA' ? '#0D1B3E' : 'rgba(255,255,255,0.7)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                Canada
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, country: 'US', province_state: '' })}
                style={{
                  flex: 1,
                  padding: '12px 16px',
                  borderRadius: 8,
                  fontSize: 14,
                  fontWeight: 500,
                  background: formData.country === 'US'
                    ? 'linear-gradient(135deg, #C9973A, #E8B86D)'
                    : 'rgba(255,255,255,0.06)',
                  border: formData.country === 'US'
                    ? 'none'
                    : '1px solid rgba(255,255,255,0.15)',
                  color: formData.country === 'US' ? '#0D1B3E' : 'rgba(255,255,255,0.7)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                United States
              </button>
            </div>
          </div>

          {/* City */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 13, color: 'rgba(255,255,255,0.6)', marginBottom: 6 }}>
              City
            </label>
            <input
              type="text"
              value={formData.city}
              onChange={e => setFormData({ ...formData, city: e.target.value })}
              required
              style={{
                width: '100%',
                padding: '12px 14px',
                borderRadius: 8,
                fontSize: 15,
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.15)',
                color: '#fff',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {/* Province/State */}
          <div style={{ marginBottom: 28 }}>
            <label style={{ display: 'block', fontSize: 13, color: 'rgba(255,255,255,0.6)', marginBottom: 6 }}>
              {provinceLabel}
            </label>
            <input
              type="text"
              value={formData.province_state}
              onChange={e => setFormData({ ...formData, province_state: e.target.value })}
              required
              style={{
                width: '100%',
                padding: '12px 14px',
                borderRadius: 8,
                fontSize: 15,
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.15)',
                color: '#fff',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {/* Error */}
          {status === 'error' && (
            <div style={{
              fontSize: 13,
              color: '#F87171',
              marginBottom: 16,
              padding: '10px 14px',
              borderRadius: 8,
              background: 'rgba(248,113,113,0.1)',
              border: '1px solid rgba(248,113,113,0.3)',
            }}>
              {errorMsg}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={status === 'loading' || !formData.role || !formData.country}
            style={{
              width: '100%',
              padding: '14px 24px',
              borderRadius: 10,
              fontSize: 15,
              fontWeight: 600,
              background: 'linear-gradient(135deg, #C9973A, #E8B86D)',
              color: '#0D1B3E',
              border: 'none',
              cursor: status === 'loading' ? 'wait' : 'pointer',
              opacity: status === 'loading' || !formData.role || !formData.country ? 0.6 : 1,
              transition: 'all 0.15s ease',
            }}
          >
            {status === 'loading' ? 'Submitting...' : 'Join the Waitlist'}
          </button>
        </form>

        {/* Footer note */}
        <p style={{
          textAlign: 'center',
          fontSize: 12,
          color: 'rgba(255,255,255,0.4)',
          marginTop: 32,
        }}>
          No spam. Invite only. Launching in Ontario, Canada.
        </p>
      </div>
    </div>
  )
}