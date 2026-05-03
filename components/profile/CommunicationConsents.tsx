'use client'

import { useState, useEffect } from 'react'
import { getAllConsentTypes } from '@/lib/consent/types'

const COLORS = {
  navy: '#0D1B3E',
  gold: '#C9973A',
  red: '#DC2626',
  amber: '#D97706',
  slate: '#64748B',
  border: '#E2E8F0',
}

interface Props {
  mode: 'signup' | 'settings'
  onSubmit?: () => void
}

export default function CommunicationConsents({ mode, onSubmit }: Props) {
  const types = getAllConsentTypes()
  const [granted, setGranted] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {}
    types.forEach(t => { initial[t.id] = t.defaultGranted })
    return initial
  })
  const [loading, setLoading] = useState(false)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (mode === 'settings') {
      fetch('/api/profile/consents')
        .then(r => r.json())
        .then(data => {
          if (data.consents) {
            const map: Record<string, boolean> = {}
            types.forEach(t => { map[t.id] = t.defaultGranted })
            data.consents.forEach((c: any) => {
              map[c.consentType] = c.revokedAt ? false : c.granted
            })
            setGranted(map)
          }
        })
        .catch(() => {})
    }
  }, [mode])

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
            method: mode === 'signup' ? 'signup_form' : 'settings_page',
          }),
        })
      }
      setSaved(true)
      onSubmit?.()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', color: COLORS.navy }}>
      <div style={{ marginBottom: '24px' }}>
        <div style={{ fontSize: '20px', fontWeight: 700, marginBottom: '8px' }}>
          Communication preferences
        </div>
        <p style={{ fontSize: '14px', color: COLORS.slate, lineHeight: 1.5, margin: 0 }}>
          Control which calls Careified can make on your behalf. You can change these any time.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {types.map(type => {
          const isHigh = type.riskLevel === 'high'
          const isMed = type.riskLevel === 'medium'
          const isExpanded = expanded === type.id
          const isOn = granted[type.id]

          return (
            <div key={type.id} style={{
              border: '1px solid ' + (isHigh && isOn ? COLORS.red : COLORS.border),
              borderRadius: '12px',
              padding: '16px',
              background: isHigh && isOn ? '#FEF2F2' : 'white',
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
                      <span style={{ fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '4px', background: '#F1F5F9', color: COLORS.slate }}>
                        REQUIRED
                      </span>
                    )}
                    {isHigh && (
                      <span style={{ fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '4px', background: '#FEF2F2', color: COLORS.red }}>
                        HIGH RISK
                      </span>
                    )}
                    {isMed && (
                      <span style={{ fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '4px', background: '#FFFBEB', color: COLORS.amber }}>
                        MEDIUM
                      </span>
                    )}
                  </div>
                  <p style={{ fontSize: '13px', color: COLORS.slate, margin: 0, lineHeight: 1.5 }}>
                    {type.description}
                  </p>
                  {type.warningText && (
                    <button
                      type="button"
                      onClick={e => { e.preventDefault(); setExpanded(isExpanded ? null : type.id) }}
                      style={{ fontSize: '12px', color: COLORS.red, background: 'none', border: 'none', padding: '8px 0 0', cursor: 'pointer', textDecoration: 'underline' }}
                    >
                      {isExpanded ? 'Hide warning' : 'Read this first'}
                    </button>
                  )}
                  {isExpanded && type.warningText && (
                    <div style={{ marginTop: '8px', padding: '12px', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '8px', fontSize: '13px', color: '#991B1B', lineHeight: 1.5 }}>
                      {type.warningText}
                    </div>
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
          {loading ? 'Saving...' : mode === 'signup' ? 'Continue' : 'Save preferences'}
        </button>
        {saved && (
          <span style={{ fontSize: '13px', color: '#16A34A', fontWeight: 500 }}>Saved</span>
        )}
      </div>
    </div>
  )
}
