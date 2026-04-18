'use client'

import { useState, useEffect } from 'react'
import { useProfileForm } from '@/lib/context/ProfileFormContext'
import { useProfileSave } from '@/lib/hooks/useProfileSave'
import { MessageSquare, Sparkles, Users } from 'lucide-react'

const FONT_SANS = "'DM Sans', sans-serif"
const FONT_SERIF = "'DM Serif Display', serif"

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
  const { formData } = useProfileForm()
  const { saveField } = useProfileSave()

  const [q1, setQ1] = useState(formData.openQ1 || '')
  const [q2, setQ2] = useState(formData.openQ2 || '')
  const [q3, setQ3] = useState(formData.openQ3 || '')
  const [canContinue, setCanContinue] = useState(false)

  useEffect(() => {
    setCanContinue(
      q1.trim().length >= 50 &&
      q2.trim().length >= 50 &&
      q3.trim().length >= 50
    )
  }, [q1, q2, q3])

  const handleBlur = (field: 'openQ1' | 'openQ2' | 'openQ3', value: string) => {
    saveField(field, value.trim())
  }

  return (
    <div style={{ fontFamily: FONT_SANS, maxWidth: '800px' }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'inline-block', padding: '6px 12px', borderRadius: 20, background: 'rgba(201,151,58,0.1)', marginBottom: 12 }}>
          <span style={{ fontSize: '10px', fontWeight: 800, letterSpacing: '0.1em', color: '#C9973A' }}>FINAL STEP - TELL YOUR STORY</span>
        </div>
        <h2 style={{ fontSize: 28, fontWeight: 800, fontFamily: FONT_SERIF, color: '#0D1B3E', marginBottom: 8, lineHeight: 1.1 }}>
          In Your Own Words
        </h2>
        <p style={{ fontSize: 13, color: '#64748B', lineHeight: 1.6 }}>
          These open-ended questions let agencies see your personality, communication style, and what drives you as a caregiver. Be honest and specific - this is where you stand out.
        </p>
      </div>

      {/* Question 1 */}
      <div style={{ marginBottom: 24, padding: 24, borderRadius: 16, background: '#FFFFFF', border: '1px solid #E2E8F0' }}>
        <div style={{ display: 'flex', alignItems: 'start', gap: 12, marginBottom: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, #C9973A, #E8B86D)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <MessageSquare size={16} color="#0D1B3E" />
          </div>
          <div style={{ flex: 1 }}>
            <h3 style={{ fontSize: 15, fontWeight: 800, color: '#0D1B3E', marginBottom: 4 }}>
              Tell us about a time you made a real difference in someone's life as a caregiver.
            </h3>
            <p style={{ fontSize: 12, color: '#94A3B8' }}>What happened, and why does it matter to you?</p>
          </div>
        </div>
        <textarea
          value={q1}
          onChange={(e) => setQ1(e.target.value)}
          onBlur={(e) => handleBlur('openQ1', e.target.value)}
          maxLength={500}
          rows={5}
          placeholder="Example: I cared for Mrs. Chen for 18 months. She had advanced dementia and often didn't recognize her own family. But she always remembered me as 'the kind one.' On her final week, she held my hand and smiled. Her daughter told me I gave her mother dignity when she needed it most. That's why I do this work..."
          style={{
            ...inputStyle,
            border: q1.length >= 50 ? '1px solid #C9973A' : '1px solid #E2E8F0',
          }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
          <span style={{ fontSize: 11, color: q1.length < 50 ? '#DC2626' : '#16A34A' }}>
            {q1.length < 50 ? `Need ${50 - q1.length} more characters (minimum 50)` : 'Looking good'}
          </span>
          <span style={{ fontSize: 11, color: '#94A3B8' }}>{q1.length}/500</span>
        </div>
      </div>

      {/* Question 2 */}
      <div style={{ marginBottom: 24, padding: 24, borderRadius: 16, background: '#FFFFFF', border: '1px solid #E2E8F0' }}>
        <div style={{ display: 'flex', alignItems: 'start', gap: 12, marginBottom: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, #1E3A8A, #2563EB)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Sparkles size={16} color="#FFFFFF" />
          </div>
          <div style={{ flex: 1 }}>
            <h3 style={{ fontSize: 15, fontWeight: 800, color: '#0D1B3E', marginBottom: 4 }}>
              What's the most challenging situation you've faced in caregiving, and how did you handle it?
            </h3>
            <p style={{ fontSize: 12, color: '#94A3B8' }}>Agencies want to see problem-solving and resilience.</p>
          </div>
        </div>
        <textarea
          value={q2}
          onChange={(e) => setQ2(e.target.value)}
          onBlur={(e) => handleBlur('openQ2', e.target.value)}
          maxLength={500}
          rows={5}
          placeholder="Example: I worked with a client who refused all medication. Family was frustrated. I tried music during med time, then his favorite snack after. Nothing worked. Finally I asked why. He said pills reminded him of the hospital where his wife died. Once I understood, I got the doctor to switch to liquid form in juice. He took it every day after that..."
          style={{
            ...inputStyle,
            border: q2.length >= 50 ? '1px solid #C9973A' : '1px solid #E2E8F0',
          }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
          <span style={{ fontSize: 11, color: q2.length < 50 ? '#DC2626' : '#16A34A' }}>
            {q2.length < 50 ? `Need ${50 - q2.length} more characters (minimum 50)` : 'Looking good'}
          </span>
          <span style={{ fontSize: 11, color: '#94A3B8' }}>{q2.length}/500</span>
        </div>
      </div>

      {/* Question 3 */}
      <div style={{ marginBottom: 24, padding: 24, borderRadius: 16, background: '#FFFFFF', border: '1px solid #E2E8F0' }}>
        <div style={{ display: 'flex', alignItems: 'start', gap: 12, marginBottom: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, #B45309, #C97706)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Users size={16} color="#FFFFFF" />
          </div>
          <div style={{ flex: 1 }}>
            <h3 style={{ fontSize: 15, fontWeight: 800, color: '#0D1B3E', marginBottom: 4 }}>
              If a family asked why they should choose you as their caregiver, what would you want them to know?
            </h3>
            <p style={{ fontSize: 12, color: '#94A3B8' }}>This is your elevator pitch. What makes you different?</p>
          </div>
        </div>
        <textarea
          value={q3}
          onChange={(e) => setQ3(e.target.value)}
          onBlur={(e) => handleBlur('openQ3', e.target.value)}
          maxLength={500}
          rows={5}
          placeholder="Example: I don't just follow a care plan - I get to know the person. I learn their stories, their habits, what makes them smile. I've worked with dementia clients for 8 years and I still remember every single one. Your loved one won't be a task list to me. They'll be a person I care about..."
          style={{
            ...inputStyle,
            border: q3.length >= 50 ? '1px solid #C9973A' : '1px solid #E2E8F0',
          }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
          <span style={{ fontSize: 11, color: q3.length < 50 ? '#DC2626' : '#16A34A' }}>
            {q3.length < 50 ? `Need ${50 - q3.length} more characters (minimum 50)` : 'Looking good'}
          </span>
          <span style={{ fontSize: 11, color: '#94A3B8' }}>{q3.length}/500</span>
        </div>
      </div>

      {/* Completion note */}
      {canContinue && (
        <div style={{ padding: 16, borderRadius: 12, background: '#FDF6EC', border: '1px solid rgba(201,151,58,0.2)', display: 'flex', alignItems: 'start', gap: 12 }}>
          <Sparkles size={16} color="#C9973A" style={{ flexShrink: 0, marginTop: 2 }} />
          <p style={{ fontSize: 12, color: '#92400E', lineHeight: 1.6 }}>
            <strong>Your profile is ready to submit.</strong> Click Continue to review everything one last time, then submit for agency review. Once approved, you'll appear in search results.
          </p>
        </div>
      )}
    </div>
  )
}