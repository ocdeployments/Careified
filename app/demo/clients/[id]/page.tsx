'use client'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { DEMO_CLIENTS } from '@/lib/demo'
import { ArrowLeft, MapPin, Clock, User, Heart, Shield, Activity } from 'lucide-react'

export default function DemoClientDetailPage() {
  const params = useParams<{ id: string }>()
  const clientId = params.id

  // Find client from demo data
  const client = DEMO_CLIENTS.find((c: any) => c.id === clientId)

  if (!client) {
    return (
      <div style={{ textAlign: 'center', padding: '48px' }}>
        <h2 style={{ fontSize: '20px', color: '#0D1B3E', marginBottom: '12px' }}>Client not found</h2>
        <p style={{ color: '#64748B', marginBottom: '24px' }}>This demo client doesn&apos;t exist.</p>
        <Link href="/demo/clients" style={{ color: '#C9973A', textDecoration: 'none' }}>← Back to clients</Link>
      </div>
    )
  }

  // Mock match results for demo
  const mockMatches = [
    { name: 'Maria Santos', score: 92, confidence: 'High', match: true },
    { name: 'Jennifer Wilson', score: 85, confidence: 'High', match: true },
    { name: 'Robert Chen', score: 78, confidence: 'Medium', match: true },
    { name: 'Sarah Thompson', score: 71, confidence: 'Medium', match: false },
    { name: 'Michael Brown', score: 65, confidence: 'Low', match: false },
  ]

  return (
    <div>
      {/* Back link */}
      <Link
        href="/demo/clients"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: '14px',
          color: '#64748B',
          textDecoration: 'none',
          marginBottom: '20px',
        }}
      >
        <ArrowLeft size={16} />
        Back to clients
      </Link>

      {/* Client header */}
      <div style={{
        backgroundColor: '#fff',
        borderRadius: '16px',
        border: '1px solid #E2E8F0',
        padding: '24px',
        marginBottom: '24px',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#0D1B3E', fontFamily: 'DM Serif Display, serif', marginBottom: '8px' }}>
              {client.clientFirstName}
            </h1>
            <p style={{ fontSize: '16px', color: '#64748B', marginBottom: '16px' }}>{client.primaryCondition}</p>

            <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', color: '#64748B' }}>
                <MapPin size={16} />
                {client.city}, {client.state}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', color: '#64748B' }}>
                <Clock size={16} />
                {client.hoursPerWeek} hours/week
              </div>
              <div style={{ fontSize: '14px', color: '#64748B' }}>
                {client.placementType === 'live-in' ? 'Live-in' : 'Live-out'}
              </div>
              <div style={{ fontSize: '14px', color: '#64748B' }}>
                Max ${client.hourlyRateMax}/hr
              </div>
            </div>
          </div>

          <div style={{
            padding: '6px 12px',
            borderRadius: '999px',
            fontSize: '13px',
            fontWeight: '600',
            backgroundColor: '#F0FDF4',
            color: '#16A34A',
            border: '1px solid #BBF7D0',
          }}>
            Active
          </div>
        </div>
      </div>

      {/* Client details grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginBottom: '32px' }}>
        <div style={{ backgroundColor: '#fff', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <Heart size={18} color="#C9973A" />
            <span style={{ fontSize: '14px', fontWeight: '600', color: '#0D1B3E' }}>Care Needs</span>
          </div>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {client.servicesNeeded.map((service: string) => (
              <span key={service} style={{ fontSize: '12px', padding: '4px 8px', backgroundColor: '#F1F5F9', borderRadius: '4px', color: '#475569' }}>
                {service}
              </span>
            ))}
          </div>
        </div>

        <div style={{ backgroundColor: '#fff', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <Activity size={18} color="#C9973A" />
            <span style={{ fontSize: '14px', fontWeight: '600', color: '#0D1B3E' }}>Mobility & Meds</span>
          </div>
          <div style={{ fontSize: '13px', color: '#64748B' }}>
            <div>Mobility: <strong style={{ color: '#0D1B3E' }}>{client.mobilityLevel}</strong></div>
            <div>Complex meds: <strong style={{ color: client.medicationsComplex ? '#16A34A' : '#64748B' }}>{client.medicationsComplex ? 'Yes' : 'No'}</strong></div>
          </div>
        </div>

        <div style={{ backgroundColor: '#fff', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <User size={18} color="#C9973A" />
            <span style={{ fontSize: '14px', fontWeight: '600', color: '#0D1B3E' }}>Preferences</span>
          </div>
          <div style={{ fontSize: '13px', color: '#64748B' }}>
            <div>Gender: <strong style={{ color: '#0D1B3E' }}>{client.genderPreference === 'no-preference' ? 'No preference' : client.genderPreference}</strong></div>
            <div>Language: <strong style={{ color: '#0D1B3E' }}>{client.languageRequired}</strong></div>
          </div>
        </div>

        <div style={{ backgroundColor: '#fff', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <Shield size={18} color="#C9973A" />
            <span style={{ fontSize: '14px', fontWeight: '600', color: '#0D1B3E' }}>Care Intensity</span>
          </div>
          <div style={{ fontSize: '18px', fontWeight: '700', color: client.careIntensity === 'high' ? '#DC2626' : client.careIntensity === 'medium' ? '#D97706' : '#16A34A', textTransform: 'capitalize' }}>
            {client.careIntensity}
          </div>
        </div>
      </div>

      {/* Match results */}
      <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#0D1B3E', fontFamily: 'DM Serif Display, serif', marginBottom: '16px' }}>
        Top Caregiver Matches
      </h2>

      <div style={{ display: 'grid', gap: '12px', marginBottom: '24px' }}>
        {mockMatches.map((match, index) => (
          <div
            key={index}
            style={{
              backgroundColor: '#fff',
              borderRadius: '12px',
              border: '1px solid #E2E8F0',
              padding: '16px 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                backgroundColor: match.score >= 80 ? '#F0FDF4' : match.score >= 60 ? '#FEF3C7' : '#FEF2F2',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '14px',
                fontWeight: '700',
                color: match.score >= 80 ? '#16A34A' : match.score >= 60 ? '#D97706' : '#DC2626',
              }}>
                {index + 1}
              </div>
              <div>
                <div style={{ fontSize: '15px', fontWeight: '600', color: '#0D1B3E' }}>{match.name}</div>
                <div style={{ fontSize: '12px', color: '#64748B' }}>Confidence: {match.confidence}</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '20px', fontWeight: '700', color: match.score >= 80 ? '#16A34A' : match.score >= 60 ? '#D97706' : '#DC2626' }}>
                  {match.score}%
                </div>
                <div style={{ fontSize: '11px', color: '#64748B' }}>Alignment</div>
              </div>
              {match.match && (
                <div style={{
                  padding: '4px 8px',
                  borderRadius: '4px',
                  fontSize: '11px',
                  fontWeight: '600',
                  backgroundColor: '#F0FDF4',
                  color: '#16A34A',
                }}>
                  Good match
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Verify in call section */}
      <div style={{ backgroundColor: '#EFF6FF', borderRadius: '12px', padding: '20px', marginBottom: '24px' }}>
        <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#1E40AF', marginBottom: '12px' }}>
          Verify in your call
        </h3>
        <ul style={{ fontSize: '13px', color: '#1E3A8A', paddingLeft: '16px', margin: 0 }}>
          <li>Confirm availability for {client.hoursPerWeek} hours/week</li>
          <li>Discuss experience with {client.primaryCondition}</li>
          <li>Verify {client.genderPreference === 'no-preference' ? 'no gender preference' : `${client.genderPreference} caregiver preference`}</li>
          <li>Confirm hourly rate expectations (client max: ${client.hourlyRateMax}/hr)</li>
        </ul>
      </div>

      {/* Demo notice */}
      <div style={{ padding: '16px', backgroundColor: '#FEF3C7', borderRadius: '12px', textAlign: 'center' }}>
        <span style={{ fontSize: '13px', color: '#92400E' }}>
          Showing sample match results. In production, real caregivers would be matched against this client.
        </span>
      </div>
    </div>
  )
}