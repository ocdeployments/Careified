'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface BenchStrengthData {
  dementia: number
  french: number
  livein: number
  wound: number
  available: number
  claimed: number
}

interface BenchStrengthWidgetProps {
  compact?: boolean
}

const PAGE_BG = '#080F1E'
const CARD_BG = 'rgba(255,255,255,0.04)'
const CARD_BORDER = 'rgba(255,255,255,0.08)'
const TEXT_PRIMARY = '#F5F0E8'
const TEXT_MUTED = 'rgba(255,255,255,0.55)'
const GOLD = '#C9973A'
const GL = '#E8B86D'
const SERIF = "'DM Serif Display', Georgia, serif"
const SANS = "'DM Sans', sans-serif"

const skillConfig = [
  { key: 'dementia', label: 'Dementia Care', color: '#ef4444' },
  { key: 'palliative', label: 'Palliative Care', color: '#ef4444' },
  { key: 'livein', label: 'Live-in Available', color: '#f59e0b' },
  { key: 'wound', label: 'Wound Care', color: '#f59e0b' },
  { key: 'french', label: 'French-Speaking', color: '#C9973A' },
  { key: 'overnight', label: 'Overnight Shift', color: '#C9973A' },
  { key: 'complex_care', label: 'Complex Care', color: '#4ade80' },
  { key: 'medication', label: 'Medication Admin', color: '#4ade80' },
  { key: 'mobility', label: 'Mobility Support', color: '#4ade80' },
  { key: 'available', label: 'Currently Available', color: '#4ade80' },
]

export default function BenchStrengthWidget({ compact = false }: BenchStrengthWidgetProps) {
  const [data, setData] = useState<BenchStrengthData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/agency/dashboard', { cache: 'no-store' })
      .then(r => {
        if (!r.ok) {
          throw new Error(`HTTP ${r.status}`)
        }
        return r.json()
      })
      .then(d => {
        setData(d && d.bench_strength ? d.bench_strength : null)
        setLoading(false)
      })
      .catch((e) => {
        console.error('BenchStrengthWidget fetch error:', e)
        setLoading(false)
      })
  }, [])

  const getColorForCount = (count: number): string => {
    if (count === 0) return '#ef4444' // critical - red
    if (count <= 2) return '#f59e0b' // low - amber
    if (count <= 5) return GOLD // moderate - gold
    return '#4ade80' // strong - green
  }

  const maxCount = Math.max(...(data ? Object.values(data) : [0]), 1)

  if (loading) {
    return (
      <div style={{ padding: compact ? 12 : 20, background: CARD_BG, border: `1px solid ${CARD_BORDER}`, borderRadius: 12 }}>
        {[1, 2, 3].map(i => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: i < 3 ? 12 : 0 }}>
            <div style={{ flex: 1, height: 8, background: 'rgba(255,255,255,0.08)', borderRadius: 4 }} />
            <div style={{ width: 30, height: 8, background: 'rgba(255,255,255,0.08)', borderRadius: 4 }} />
          </div>
        ))}
      </div>
    )
  }

  const displaySkills = compact ? skillConfig.slice(0, 4) : skillConfig

  return (
    <div style={{
      background: CARD_BG,
      border: `1px solid ${CARD_BORDER}`,
      borderRadius: 12,
      padding: compact ? 12 : 20,
      maxHeight: compact ? 200 : undefined,
      overflowY: compact ? 'auto' : undefined,
    }}>
      {!compact && (
        <div style={{ fontSize: 14, fontWeight: 600, color: TEXT_PRIMARY, marginBottom: 16, fontFamily: SERIF }}>
          Bench Strength
        </div>
      )}

      {displaySkills.map(skill => {
        const key = skill.key as keyof BenchStrengthData
        const count = data?.[key] || 0
        const pct = Math.min((count / maxCount) * 100, 100)
        const barColor = getColorForCount(count)

        return (
          <Link
            key={skill.key}
            href={`/agency/caregivers?specialization=${skill.key}`}
            style={{
              display: 'block',
              marginBottom: compact ? 8 : 14,
              textDecoration: 'none',
              padding: compact ? '4px 0' : '6px 0',
              borderRadius: 4,
              cursor: 'pointer',
            }}
            className="hover-row"
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
              <span style={{ fontSize: compact ? 12 : 13, color: TEXT_MUTED }}>{skill.label}</span>
              <span style={{ fontSize: compact ? 11 : 12, fontWeight: 600, color: count > 0 ? barColor : TEXT_MUTED }}>
                {count}
              </span>
            </div>
            <div style={{ height: compact ? 4 : 6, background: 'rgba(255,255,255,0.08)', borderRadius: 3, overflow: 'hidden' }}>
              <div
                style={{
                  height: '100%',
                  width: `${pct}%`,
                  background: barColor,
                  borderRadius: 3,
                  transition: 'width 0.3s ease',
                }}
              />
            </div>
            {count === 0 && !compact && (
              <span
                style={{
                  fontSize: 11,
                  color: GL,
                  marginTop: 4,
                  display: 'inline-block',
                }}
              >
                Recruit →
              </span>
            )}
          </Link>
        )
      })}

      {(!data || Object.values(data).every(v => v === 0)) && (
        <div style={{ fontSize: 13, color: TEXT_MUTED, textAlign: 'center', padding: 20, fontStyle: 'italic' }}>
          Add caregivers to your roster to see bench strength
        </div>
      )}
    </div>
  )
}