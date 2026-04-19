'use client'

import { useState, useEffect } from 'react'
import { useProfileForm } from '@/lib/context/ProfileFormContext'
import { useProfileSave } from '@/lib/hooks/useProfileSave'
import { Heart, Star, Users } from 'lucide-react'

const FONT_SANS = "'Inter', sans-serif"
const FONT_SERIF = "'Inter', sans-serif"

const MOTIVATION_QUESTIONS = [
  {
    key: 'why_caregiving',
    label: 'Why did you become a caregiver?',
    helper: 'What drew you to this work — your values matter to agencies.',
    maxLength: 300,
    required: true,
  },
  {
    key: 'proudest_placement',
    label: "Tell us about a placement you're most proud of.",
    helper: '2–3 sentences — what happened, what you did. Optional but heavily encouraged.',
    maxLength: 500,
    required: false,
  },
  {
    key: 'ideal_client',
    label: 'What kind of client do you feel you were made to care for?',
    helper: 'Describe your ideal match in your own words. Optional but heavily encouraged.',
    maxLength: 300,
    required: false,
  },
]

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '12px 16px',
  borderRadius: '12px',
  fontSize: '13px',
  lineHeight: 1.6,
  resize: 'none' as const,
  fontFamily: FONT_SANS,
  background: '#FFFFFF',
  color: '#0D1B3E',
  outline: 'none',
  boxSizing: 'border-box',
}

export default function Step10OpenQuestions() {
  const { formData, updateField } = useProfileForm()
  
  // Load existing motivation data from context
  const motivation = formData.motivation || {}

  const [q1, setQ1] = useState(motivation.why_caregiving || '')
  const [q2, setQ2] = useState(motivation.proudest_placement || '')
  const [q3, setQ3] = useState(motivation.ideal_client || '')

  const q1Complete = q1.trim().length > 0
  const canContinue = q1Complete

  const handleChange = (key: string, value: string) => {
    if (key === 'why_caregiving') setQ1(value)
    if (key === 'proudest_placement') setQ2(value)
    if (key === 'ideal_client') setQ3(value)
    
    // Save to context (useProfileSave handles DB via onBlur)
    updateField('motivation', {
      ...motivation,
      [key]: value
    })
  }

  return (
    <div style={{ fontFamily: FONT_SANS, maxWidth: '800px' }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'inline-block', padding: '6px 12px', borderRadius: 20, background: 'rgba(201,151,58,0.1)', marginBottom: 12 }}>
          <span style={{ fontSize: '10px', fontWeight: 800, letterSpacing: '0.1em', color: '#C9973A' }}>YOUR STORY</span>
        </div>
        <h2 style={{ fontSize: 28, fontWeight: 800, fontFamily: FONT_SERIF, color: '#0D1B3E', marginBottom: 8, lineHeight: 1.1 }}>
          What Drives You
        </h2>
        <p style={{ fontSize: 13, color: '#64748B', lineHeight: 1.6 }}>
          Agencies use this to match you with clients who'll genuinely benefit from who you are.
        </p>
      </div>

      {/* Question 1 - Required */}
      <div style={{ marginBottom: 24, padding: 24, borderRadius: 16, background: '#FFFFFF', border: '1px solid #E2E8F0' }}>
        <div style={{ display: 'flex', alignItems: 'start', gap: 12, marginBottom: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, #C9973A, #E8B86D)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Heart size={16} color="#0D1B3E" />
          </div>
          <div style={{ flex: 1 }}>
            <h3 style={{ fontSize: 15, fontWeight: 800, color: '#0D1B3E', marginBottom: 4 }}>
              {MOTIVATION_QUESTIONS[0].label} <span style={{ color: '#DC2626' }}>*</span>
            </h3>
            <p style={{ fontSize: 12, color: '#94A3B8' }}>{MOTIVATION_QUESTIONS[0].helper}</p>
          </div>
        </div>
        <textarea
          value={q1}
          onChange={(e) => handleChange('why_caregiving', e.target.value)}
          maxLength={MOTIVATION_QUESTIONS[0].maxLength}
          rows={4}
          placeholder="I became a caregiver because..."
          style={{
            ...inputStyle,
            border: q1.length > 0 ? '1px solid #C9973A' : '1px solid #E2E8F0',
          }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
          <span style={{ fontSize: 11, color: q1Complete ? '#16A34A' : '#DC2626' }}>
            {q1Complete ? '✓ Required question answered' : 'Required'}
          </span>
          <span style={{ fontSize: 11, color: q1.length > MOTIVATION_QUESTIONS[0].maxLength - 20 ? '#DC2626' : '#94A3B8' }}>{q1.length}/{MOTIVATION_QUESTIONS[0].maxLength}</span>
        </div>
      </div>

      {/* Question 2 - Optional but encouraged */}
      <div style={{ marginBottom: 24, padding: 24, borderRadius: 16, background: '#FFFFFF', border: '1px solid #E2E8F0' }}>
        <div style={{ display: 'flex', alignItems: 'start', gap: 12, marginBottom: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, #1E3A8A, #2563EB)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Star size={16} color="#FFFFFF" />
          </div>
          <div style={{ flex: 1 }}>
            <h3 style={{ fontSize: 15, fontWeight: 800, color: '#0D1B3E', marginBottom: 4 }}>
              {MOTIVATION_QUESTIONS[1].label}
            </h3>
            <p style={{ fontSize: 12, color: '#94A3B8' }}>{MOTIVATION_QUESTIONS[1].helper}</p>
          </div>
        </div>
        <textarea
          value={q2}
          onChange={(e) => handleChange('proudest_placement', e.target.value)}
          maxLength={MOTIVATION_QUESTIONS[1].maxLength}
          rows={4}
          placeholder="One placement that stands out..."
          style={{
            ...inputStyle,
            border: q2.length > 0 ? '1px solid #1E3A8A' : '1px solid #E2E8F0',
          }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
          {!q2 && (
            <span style={{ fontSize: 11, color: '#C9973A' }}>
              Optional — but caregivers who answer get noticed more often
            </span>
          )}
          <span style={{ fontSize: 11, color: q2.length > MOTIVATION_QUESTIONS[1].maxLength - 20 ? '#DC2626' : '#94A3B8' }}>{q2.length}/{MOTIVATION_QUESTIONS[1].maxLength}</span>
        </div>
      </div>

      {/* Question 3 - Optional but encouraged */}
      <div style={{ marginBottom: 24, padding: 24, borderRadius: 16, background: '#FFFFFF', border: '1px solid #E2E8F0' }}>
        <div style={{ display: 'flex', alignItems: 'start', gap: 12, marginBottom: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, #B45309, #C97706)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Users size={16} color="#FFFFFF" />
          </div>
          <div style={{ flex: 1 }}>
            <h3 style={{ fontSize: 15, fontWeight: 800, color: '#0D1B3E', marginBottom: 4 }}>
              {MOTIVATION_QUESTIONS[2].label}
            </h3>
            <p style={{ fontSize: 12, color: '#94A3B8' }}>{MOTIVATION_QUESTIONS[2].helper}</p>
          </div>
        </div>
        <textarea
          value={q3}
          onChange={(e) => handleChange('ideal_client', e.target.value)}
          maxLength={MOTIVATION_QUESTIONS[2].maxLength}
          rows={4}
          placeholder="I feel most connected with clients who..."
          style={{
            ...inputStyle,
            border: q3.length > 0 ? '1px solid #B45309' : '1px solid #E2E8F0',
          }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
          {!q3 && (
            <span style={{ fontSize: 11, color: '#C9973A' }}>
              Optional — but helps agencies find your best fit
            </span>
          )}
          <span style={{ fontSize: 11, color: q3.length > MOTIVATION_QUESTIONS[2].maxLength - 20 ? '#DC2626' : '#94A3B8' }}>{q3.length}/{MOTIVATION_QUESTIONS[2].maxLength}</span>
        </div>
      </div>

      {/* Completion note */}
      {canContinue && (
        <div style={{ padding: 16, borderRadius: 12, background: '#FDF6EC', border: '1px solid rgba(201,151,58,0.2)', display: 'flex', alignItems: 'start', gap: 12 }}>
          <Star size={16} color="#C9973A" style={{ flexShrink: 0, marginTop: 2 }} />
          <p style={{ fontSize: 12, color: '#92400E', lineHeight: 1.6 }}>
            <strong>Your story is ready.</strong> Click Continue to review everything one last time, then submit for agency review.
          </p>
        </div>
      )}
    </div>
  )
}
