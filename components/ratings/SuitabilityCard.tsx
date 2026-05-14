// Suitability display component for Careified rating system

interface CaregiverSuitability {
  dementia_alzheimers: number | null
  parkinsons: number | null
  palliative_end_of_life: number | null
  post_surgical_recovery: number | null
  acquired_brain_injury: number | null
  developmental_disability: number | null
  companion_social: number | null
  high_acuity_medical: number | null
  pediatric: number | null
  mental_health_support: number | null
  suitability_summary: string | null
  credibility_narrative: string | null
  best_match_types: string[] | null
  caution_types: string[] | null
  review_count_at_computation: number | null
}

interface SuitabilityCardProps {
  suitability: CaregiverSuitability | null
  reviewCount: number
  caregiverFirstName: string
}

export default function SuitabilityCard({ suitability, reviewCount, caregiverFirstName }: SuitabilityCardProps) {
  if (!suitability || reviewCount < 3) {
    return (
      <div style={{
        background: '#F9FAFB',
        padding: '24px',
        borderRadius: '12px',
        border: '1px solid #E2E8F0',
      }}>
        <h3 style={{
          fontFamily: 'DM Serif Display, serif',
          fontSize: '20px',
          color: '#0D1B3E',
          marginTop: 0,
          marginBottom: '8px',
        }}>
          Client Suitability Analysis
        </h3>
        <p style={{ color: '#666', margin: 0 }}>
          Suitability analysis updates as placement history grows.
        </p>
        <p style={{ color: '#999', fontSize: '14px', marginTop: '8px' }}>
          Based on {reviewCount} placement review{reviewCount !== 1 ? 's' : ''}.
        </p>
      </div>
    )
  }

  // Build sorted client type bars
  const clientTypes = [
    { key: 'dementia_alzheimers', label: 'Dementia / Alzheimer\'s', score: suitability.dementia_alzheimers },
    { key: 'parkinsons', label: 'Parkinson\'s', score: suitability.parkinsons },
    { key: 'palliative_end_of_life', label: 'Palliative / End of Life', score: suitability.palliative_end_of_life },
    { key: 'post_surgical_recovery', label: 'Post-Surgical Recovery', score: suitability.post_surgical_recovery },
    { key: 'acquired_brain_injury', label: 'Acquired Brain Injury', score: suitability.acquired_brain_injury },
    { key: 'developmental_disability', label: 'Developmental Disability', score: suitability.developmental_disability },
    { key: 'companion_social', label: 'Companion / Social', score: suitability.companion_social },
    { key: 'high_acuity_medical', label: 'High Acuity Medical', score: suitability.high_acuity_medical },
    { key: 'pediatric', label: 'Pediatric', score: suitability.pediatric },
    { key: 'mental_health_support', label: 'Mental Health Support', score: suitability.mental_health_support },
  ].filter(ct => ct.score !== null && ct.score > 0)

  clientTypes.sort((a, b) => (b.score || 0) - (a.score || 0))

  const bestMatchSet = new Set((suitability.best_match_types || []).map(t => t.toLowerCase()))
  const cautionSet = new Set((suitability.caution_types || []).map(t => t.toLowerCase()))

  return (
    <div style={{
      background: 'white',
      padding: '24px',
      borderRadius: '12px',
      border: '1px solid #E2E8F0',
    }}>
      <h3 style={{
        fontFamily: 'DM Serif Display, serif',
        fontSize: '20px',
        color: '#0D1B3E',
        marginTop: 0,
        marginBottom: '4px',
      }}>
        Client Suitability Analysis
      </h3>
      <p style={{ color: '#666', fontSize: '14px', marginBottom: '20px' }}>
        Based on {reviewCount} placement review{reviewCount !== 1 ? 's' : ''}.
      </p>

      {/* Bar chart */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
        {clientTypes.map(({ key, label, score }) => {
          const normalizedLabel = label.toLowerCase()
          const isBestMatch = bestMatchSet.has(normalizedLabel) || bestMatchSet.has(normalizedLabel.replace('/', '').trim())
          const isCaution = cautionSet.has(normalizedLabel) || cautionSet.has(normalizedLabel.replace('/', '').trim())

          let barColor = '#1E3A8A' // Navy for regular
          if (isBestMatch) barColor = '#C9973A' // Gold for best match
          if (isCaution) barColor = '#9CA3AF' // Grey for caution

          return (
            <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '180px', flexShrink: 0 }}>
                <span style={{ fontSize: '14px', color: '#374151' }}>{label}</span>
              </div>
              <div style={{ flex: 1, background: '#E5E7EB', borderRadius: '4px', height: '20px', overflow: 'hidden' }}>
                <div style={{
                  width: `${((score || 0) / 10) * 100}%`,
                  background: barColor,
                  height: '100%',
                  borderRadius: '4px',
                  transition: 'width 0.3s ease',
                }} />
              </div>
              <div style={{ width: '30px', textAlign: 'right' }}>
                <span style={{ fontSize: '14px', fontWeight: '600', color: '#0D1B3E' }}>
                  {score}
                </span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Suitability summary */}
      {suitability.suitability_summary && (
        <div style={{ marginBottom: '16px' }}>
          <p style={{ fontSize: '15px', color: '#374151', margin: 0, lineHeight: '1.6' }}>
            {suitability.suitability_summary}
          </p>
        </div>
      )}

      {/* Credibility narrative */}
      {suitability.credibility_narrative && (
        <div style={{
          background: '#F9FAFB',
          padding: '16px',
          borderRadius: '8px',
          borderLeft: '4px solid #C9973A',
          marginBottom: '16px',
        }}>
          <p style={{ fontSize: '14px', color: '#666', margin: 0, fontStyle: 'italic', lineHeight: '1.6' }}>
            {suitability.credibility_narrative}
          </p>
        </div>
      )}

      {/* Non-recommender disclaimer */}
      <p style={{ fontSize: '12px', color: '#9CA3AF', margin: 0, textAlign: 'center' }}>
        This analysis is based on placement data as reported. Careified does not verify or endorse any caregiver.
      </p>
    </div>
  )
}