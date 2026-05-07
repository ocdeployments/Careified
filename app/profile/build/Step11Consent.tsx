'use client'

import { useState } from 'react'
import { useProfileForm } from '@/lib/context/ProfileFormContext'
import { useProfileSave } from '@/lib/hooks/useProfileSave'
import { getAllConsentTypes } from '@/lib/consent/types'

const COLORS = {
  navy: '#0D1B3E',
  gold: '#C9973A',
  slate: '#64748B',
  border: '#E2E8F0',
  muted: '#94A3B8',
}

export default function Step11Consent() {
  const types = getAllConsentTypes()
  const { saveField } = useProfileSave()
  const [granted, setGranted] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {}
    types.forEach(t => { initial[t.id] = t.defaultGranted })
    return initial
  })
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)

  const toggle = (id: string, required: boolean) => {
    if (required && granted[id]) return
    setGranted(prev => ({ ...prev, [id]: !prev[id] }))
  }

  const handleSave = async () => {
    setLoading(true)
    setSaved(false)
    try {
      for (const type of types) {
        await fetch('/api/profile/consents', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: granted[type.id] ? 'grant' : 'revoke',
            consentType: type.id,
            method: 'signup_form',
          }),
        })
      }
      setSaved(true)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', color: COLORS.navy }}>
      <div style={{ marginBottom: '24px' }}>
        <div style={{ fontSize: '20px', fontWeight: 700, marginBottom: '8px' }}>
          Stay in control of how Careified reaches out
        </div>
        <p style={{ fontSize: '14px', color: COLORS.slate, lineHeight: 1.5, margin: 0 }}>
          You choose what Careified can do on your behalf. You can change your mind anytime in Settings.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {types.map(type => {
          const isOn = granted[type.id]
          const isCurrentEmployer = type.id === 'current_employer_calls'

          return (
            <div key={type.id} style={{
              border: '1px solid ' + COLORS.border,
              borderRadius: '12px',
              padding: '16px',
              background: 'white',
              transition: 'background 0.2s',
            }}>
              <label style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', cursor: (type.required && isOn) ? 'not-allowed' : 'pointer' }}>
                <input
                  type="checkbox"
                  checked={isOn}
                  onChange={() => toggle(type.id, type.required)}
                  disabled={type.required && isOn}
                  style={{ marginTop: '2px', accentColor: COLORS.gold, width: '18px', height: '18px', flexShrink: 0 }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '4px' }}>
                    <span style={{ fontSize: '14px', fontWeight: 600 }}>{type.label}</span>
                    {type.required && (
                      <span style={{ fontSize: '12px', color: COLORS.muted, fontStyle: 'italic' }}>
                        (required)
                      </span>
                    )}
                  </div>
                  <p style={{ fontSize: '13px', color: COLORS.slate, margin: 0, lineHeight: 1.5 }}>
                    {type.description}
                  </p>
                  {isCurrentEmployer && (
                    <p style={{ fontSize: '12px', color: COLORS.muted, margin: '8px 0 0', fontStyle: 'italic' }}>
                      We recommend caution — this may alert your current employer.
                    </p>
                  )}
                </div>
              </label>
            </div>
          )
        })}
      </div>

      <div style={{ marginTop: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button
          type="button"
          onClick={handleSave}
          disabled={loading}
          style={{
            padding: '12px 32px',
            background: loading ? '#94A3B8' : COLORS.navy,
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '15px',
            fontWeight: 600,
            cursor: loading ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? 'Saving...' : 'Save preferences'}
        </button>
        {saved && (
          <span style={{ fontSize: '13px', color: '#16A34A', fontWeight: 500 }}>Saved</span>
        )}
      </div>
    </div>
  )
}