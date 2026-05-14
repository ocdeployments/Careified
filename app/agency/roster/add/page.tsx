'use client'

import { useState } from 'react'
import { auth, clerkClient } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { Plus, ArrowLeft, Loader2, Check } from 'lucide-react'

const N = '#0D1B3E'
const G = '#C9973A'
const G_LIGHT = '#E8B86D'
const WHITE = '#FFFFFF'
const RED = '#DC2626'
const GREY = '#6B7280'
const GREEN = '#16A34A'

const ROLES = ['PSW', 'HCA', 'DSW', 'Companion', 'LiveIn', 'Other']

export default function AddCaregiverPage() {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    role: '',
    years_experience: '',
    city: '',
    province_state: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState<{ email: string } | null>(null)

  const validate = (field: string, value: string) => {
    const newErrors = { ...errors }
    switch (field) {
      case 'first_name':
        if (!value || value.length < 2 || value.length > 50) {
          newErrors.first_name = 'Required, 2-50 characters'
        } else delete newErrors.first_name
        break
      case 'last_name':
        if (!value || value.length < 2 || value.length > 50) {
          newErrors.last_name = 'Required, 2-50 characters'
        } else delete newErrors.last_name
        break
      case 'email':
        if (!value || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          newErrors.email = 'Valid email required'
        } else delete newErrors.email
        break
      case 'phone':
        if (!value || !/^\d{10}$/.test(value)) {
          newErrors.phone = '10 digits required'
        } else delete newErrors.phone
        break
      case 'role':
        if (!value || !ROLES.includes(value)) {
          newErrors.role = 'Required'
        } else delete newErrors.role
        break
      case 'years_experience':
        if (value && (isNaN(Number(value)) || Number(value) < 0 || Number(value) > 50)) {
          newErrors.years_experience = '0-50'
        } else delete newErrors.years_experience
        break
    }
    setErrors(newErrors)
  }

  const handleBlur = (field: string) => {
    validate(field, formData[field as keyof typeof formData])
  }

  const handleChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate all fields
    Object.keys(formData).forEach(key => {
      if (['first_name', 'last_name', 'email', 'phone', 'role'].includes(key)) {
        validate(key, formData[key as keyof typeof formData])
      }
    })

    if (Object.keys(errors).length > 0) return

    setSubmitting(true)
    try {
      const res = await fetch('/api/roster/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          years_experience: formData.years_experience ? Number(formData.years_experience) : undefined,
        }),
      })

      if (res.status === 201) {
        const data = await res.json()
        setSuccess({ email: data.email_sent_to })
      } else if (res.status === 409) {
        const data = await res.json()
        setErrors({ email: data.message || 'A caregiver with this email already exists' })
      } else {
        setErrors({ submit: 'Something went wrong. Please try again.' })
      }
    } catch {
      setErrors({ submit: 'Something went wrong. Please try again.' })
    } finally {
      setSubmitting(false)
    }
  }

  if (success) {
    return (
      <div style={{ minHeight: '100vh', background: '#F7F4F0', fontFamily: "'DM Sans', sans-serif" }}>
        <div style={{ background: N, padding: '24px' }}>
          <a href="/agency/roster" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontSize: 14 }}>
            <ArrowLeft size={18} />
            Back to Roster
          </a>
        </div>
        <div style={{ maxWidth: 500, margin: '0 auto', padding: '48px 24px' }}>
          <div style={{ background: WHITE, borderRadius: 16, padding: '40px 32px', textAlign: 'center', border: '1px solid #E2E8F0' }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(22,163,74,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <Check size={32} style={{ color: GREEN }} />
            </div>
            <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 24, color: N, margin: '0 0 12px' }}>
              Invite Sent
            </h1>
            <p style={{ fontSize: 14, color: GREY, margin: '0 0 24px' }}>
              An invitation has been sent to <strong>{success.email}</strong>. They can claim their profile to start building their reputation.
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <button
                onClick={() => {
                  setSuccess(null)
                  setFormData({
                    first_name: '',
                    last_name: '',
                    email: '',
                    phone: '',
                    role: '',
                    years_experience: '',
                    city: '',
                    province_state: '',
                  })
                }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '10px 20px',
                  background: `linear-gradient(135deg, ${G}, ${G_LIGHT})`,
                  color: N,
                  border: 'none',
                  borderRadius: 8,
                  fontWeight: 600,
                  fontSize: 14,
                  cursor: 'pointer',
                }}
              >
                <Plus size={18} />
                Add Another
              </button>
              <a
                href="/agency/roster"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  padding: '10px 20px',
                  color: N,
                  textDecoration: 'none',
                  borderRadius: 8,
                  border: `1px solid ${N}`,
                  fontWeight: 500,
                  fontSize: 14,
                }}
              >
                Back to Roster
              </a>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const inputStyle = (field: string) => ({
    width: '100%',
    padding: '12px 14px',
    borderRadius: 8,
    fontSize: 14,
    fontFamily: "'DM Sans', sans-serif",
    border: errors[field] ? `1px solid ${RED}` : '1px solid #E2E8F0',
    outline: 'none',
    background: WHITE,
    color: N,
  })

  return (
    <div style={{ minHeight: '100vh', background: '#F7F4F0', fontFamily: "'DM Sans', sans-serif" }}>
      <div style={{ background: N, padding: '24px' }}>
        <a href="/agency/roster" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontSize: 14 }}>
          <ArrowLeft size={18} />
          Back to Roster
        </a>
      </div>

      <div style={{ maxWidth: 600, margin: '0 auto', padding: '32px 24px' }}>
        <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 28, color: N, margin: '0 0 8px' }}>
          Add Caregiver
        </h1>
        <p style={{ fontSize: 14, color: GREY, margin: '0 0 32px' }}>
          Add a caregiver to your roster. They'll receive an invitation to claim their profile.
        </p>

        <form onSubmit={handleSubmit} style={{ background: WHITE, borderRadius: 16, padding: 32, border: '1px solid #E2E8F0' }}>
          {errors.submit && (
            <div style={{ padding: '12px 16px', background: 'rgba(220,38,38,0.1)', color: RED, borderRadius: 8, marginBottom: 20, fontSize: 14 }}>
              {errors.submit}
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: N, marginBottom: 6 }}>First Name *</label>
              <input
                type="text"
                value={formData.first_name}
                onChange={(e) => handleChange('first_name', e.target.value)}
                onBlur={() => handleBlur('first_name')}
                style={inputStyle('first_name')}
              />
              {errors.first_name && <div style={{ color: RED, fontSize: 12, marginTop: 4 }}>{errors.first_name}</div>}
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: N, marginBottom: 6 }}>Last Name *</label>
              <input
                type="text"
                value={formData.last_name}
                onChange={(e) => handleChange('last_name', e.target.value)}
                onBlur={() => handleBlur('last_name')}
                style={inputStyle('last_name')}
              />
              {errors.last_name && <div style={{ color: RED, fontSize: 12, marginTop: 4 }}>{errors.last_name}</div>}
            </div>
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: N, marginBottom: 6 }}>Email *</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              onBlur={() => handleBlur('email')}
              style={inputStyle('email')}
            />
            {errors.email && <div style={{ color: RED, fontSize: 12, marginTop: 4 }}>{errors.email}</div>}
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: N, marginBottom: 6 }}>Phone *</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value.replace(/\D/g, '').slice(0, 10))}
              onBlur={() => handleBlur('phone')}
              placeholder="6471234567"
              style={inputStyle('phone')}
            />
            {errors.phone && <div style={{ color: RED, fontSize: 12, marginTop: 4 }}>{errors.phone}</div>}
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: N, marginBottom: 6 }}>Role *</label>
            <select
              value={formData.role}
              onChange={(e) => handleChange('role', e.target.value)}
              onBlur={() => handleBlur('role')}
              style={inputStyle('role')}
            >
              <option value="">Select role...</option>
              {ROLES.map(role => (
                <option key={role} value={role}>{role}</option>
              ))}
            </select>
            {errors.role && <div style={{ color: RED, fontSize: 12, marginTop: 4 }}>{errors.role}</div>}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: N, marginBottom: 6 }}>Years Experience</label>
              <input
                type="number"
                value={formData.years_experience}
                onChange={(e) => handleChange('years_experience', e.target.value)}
                onBlur={() => handleBlur('years_experience')}
                min={0}
                max={50}
                placeholder="0"
                style={inputStyle('years_experience')}
              />
              {errors.years_experience && <div style={{ color: RED, fontSize: 12, marginTop: 4 }}>{errors.years_experience}</div>}
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: N, marginBottom: 6 }}>City</label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => handleChange('city', e.target.value)}
                style={inputStyle('city')}
              />
            </div>
          </div>

          <div style={{ marginBottom: 32 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: N, marginBottom: 6 }}>Province/State</label>
            <input
              type="text"
              value={formData.province_state}
              onChange={(e) => handleChange('province_state', e.target.value)}
              placeholder="ON"
              style={inputStyle('province_state')}
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            style={{
              width: '100%',
              padding: '14px 24px',
              background: submitting ? '#94A3B8' : `linear-gradient(135deg, ${G}, ${G_LIGHT})`,
              color: N,
              border: 'none',
              borderRadius: 8,
              fontWeight: 600,
              fontSize: 15,
              cursor: submitting ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
            }}
          >
            {submitting ? (
              <>
                <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
                Sending Invite...
              </>
            ) : (
              <>
                <Plus size={18} />
                Send Invite
              </>
            )}
          </button>
        </form>

        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  )
}