'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'

const FONT_SANS = "'DM Sans', sans-serif"
const FONT_SERIF = "'DM Serif Display', serif"

type StrengthReport = {
 score: number
 score_tier: 'weak' | 'fair' | 'strong' | 'complete'
 completed: string[]
 gaps: Array<{
 field: string
 label: string
 impact: 'high' | 'medium' | 'low'
 action: string
 dimensions_affected: string[]
 }>
 verification_mix: {
 tier_1: number
 tier_2: number
 tier_3: number
 tier_4: number
 }
 next_best_action: {
 label: string
 action: string
 impact: 'high' | 'medium' | 'low'
 } | null
}

export default function ProfileStrengthPage() {
 const [report, setReport] = useState<StrengthReport | null>(null)
 const [loading, setLoading] = useState(true)
 const [error, setError] = useState<string | null>(null)

 useEffect(() => {
 fetch('/api/profile/strength')
 .then(async r => {
 if (!r.ok) {
 const d = await r.json().catch(() => ({}))
 throw new Error(d.error || 'Failed to load')
 }
 return r.json()
 })
 .then(d => setReport(d.report))
 .catch(e => setError(e.message))
 .finally(() => setLoading(false))
 }, [])

 if (loading) {
 return <div style={{ padding: 40, fontFamily: FONT_SANS, color: '#64748B' }}>Loading…</div>
 }

 if (error || !report) {
 return (
 <div style={{ padding: 40, fontFamily: FONT_SANS }}>
 <h1 style={{ color: '#0D1B3E' }}>Profile strength unavailable</h1>
 <p style={{ color: '#64748B' }}>{error}</p>
 <Link href="/profile/build" style={{ color: '#C9973A' }}>Build your profile</Link>
 </div>
 )
 }

 const tierColor =
 report.score_tier === 'complete' ? '#15803D' :
 report.score_tier === 'strong' ? '#C9973A' :
 report.score_tier === 'fair' ? '#B45309' :
 '#DC2626'

 return (
 <div style={{ maxWidth: 960, margin: '0 auto', padding: '40px 24px', fontFamily: FONT_SANS }}>
 <Link href="/profile/build" style={{ color: '#64748B', fontSize: 13, textDecoration: 'none' }}>
 ← Back to profile builder
 </Link>

 <h1 style={{ fontFamily: FONT_SERIF, fontSize: 32, color: '#0D1B3E', margin: '12px 0 4px 0' }}>
 Your profile strength
 </h1>
 <p style={{ color: '#64748B', marginBottom: 32 }}>
 This is what agencies see. A stronger profile reaches more agencies with better matches.
 </p>

 {/* Score hero */}
 <div style={{
 background: 'white',
 border: '1px solid #E2E8F0',
 borderRadius: 16,
 padding: 32,
 marginBottom: 24,
 display: 'grid',
 gridTemplateColumns: '240px 1fr',
 gap: 32,
 alignItems: 'center',
 }}>
 <div style={{ textAlign: 'center' }}>
 <div style={{
 fontSize: 72,
 fontWeight: 700,
 color: tierColor,
 fontFamily: FONT_SERIF,
 lineHeight: 1,
 }}>
 {report.score}
 </div>
 <div style={{
 fontSize: 12,
 color: tierColor,
 textTransform: 'uppercase',
 letterSpacing: 0.8,
 marginTop: 8,
 fontWeight: 600,
 }}>
 {report.score_tier}
 </div>
 <div style={{ marginTop: 16, height: 8, background: '#E2E8F0', borderRadius: 4, overflow: 'hidden' }}>
 <div style={{
 width: `${report.score}%`,
 height: '100%',
 background: tierColor,
 transition: 'width 300ms',
 }} />
 </div>
 </div>

 <div>
 {report.next_best_action ? (
 <>
 <div style={{ fontSize: 12, color: '#64748B', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>
 Do this next
 </div>
 <div style={{
 fontFamily: FONT_SERIF,
 fontSize: 22,
 color: '#0D1B3E',
 marginBottom: 6,
 }}>
 {report.next_best_action.label}
 </div>
 <div style={{ fontSize: 14, color: '#64748B', marginBottom: 16 }}>
 {report.next_best_action.action}
 </div>
 <Link href="/profile/build" style={{
 display: 'inline-block',
 background: 'linear-gradient(135deg, #C9973A, #E8B86D)',
 color: '#0D1B3E',
 padding: '10px 20px',
 borderRadius: 10,
 fontWeight: 700,
 textDecoration: 'none',
 fontSize: 13,
 }}>
 Continue profile
 </Link>
 </>
 ) : (
 <div style={{
 fontFamily: FONT_SERIF,
 fontSize: 22,
 color: '#15803D',
 }}>
 Your profile is complete. Nice work.
 </div>
 )}
 </div>
 </div>

 {/* Verification mix */}
 <div style={{
 background: 'white',
 border: '1px solid #E2E8F0',
 borderRadius: 16,
 padding: 24,
 marginBottom: 24,
 }}>
 <h2 style={{ fontFamily: FONT_SERIF, fontSize: 18, color: '#0D1B3E', margin: '0 0 12px 0' }}>
 How your information is verified
 </h2>
 <p style={{ fontSize: 13, color: '#64748B', marginBottom: 16 }}>
 Higher tiers give agencies more confidence in your profile. Careified displays
 each tier honestly — we don\'t hide unverified claims, we label them clearly.
 </p>
 <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 12 }}>
 <VerifStat label="System verified" count={report.verification_mix.tier_1} color="#15803D" />
 <VerifStat label="Document on file" count={report.verification_mix.tier_2} color="#1D4ED8" />
 <VerifStat label="Reference confirmed" count={report.verification_mix.tier_3} color="#92400E" />
 <VerifStat label="Self-reported" count={report.verification_mix.tier_4} color="#64748B" />
 </div>
 </div>

 {/* Gaps */}
 {report.gaps.length > 0 && (
 <div style={{
 background: 'white',
 border: '1px solid #E2E8F0',
 borderRadius: 16,
 padding: 24,
 marginBottom: 24,
 }}>
 <h2 style={{ fontFamily: FONT_SERIF, fontSize: 18, color: '#0D1B3E', margin: '0 0 16px 0' }}>
 Ways to strengthen your profile ({report.gaps.length})
 </h2>
 <div style={{ display: 'grid', gap: 10 }}>
 {report.gaps.map(g => (
 <GapRow key={g.field} gap={g} />
 ))}
 </div>
 </div>
 )}

 {/* Completed */}
 {report.completed.length > 0 && (
 <div style={{
 background: 'white',
 border: '1px solid #E2E8F0',
 borderRadius: 16,
 padding: 24,
 }}>
 <h2 style={{ fontFamily: FONT_SERIF, fontSize: 18, color: '#0D1B3E', margin: '0 0 12px 0' }}>
 What you\'ve completed ({report.completed.length})
 </h2>
 <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
 {report.completed.map(label => (
 <span key={label} style={{
 fontSize: 12,
 background: '#DCFCE7',
 color: '#15803D',
 padding: '4px 12px',
 borderRadius: 20,
 fontWeight: 500,
 }}>
 ✓ {label}
 </span>
 ))}
 </div>
 </div>
 )}
 </div>
 )
}

function VerifStat({ label, count, color }: { label: string; count: number; color: string }) {
 return (
 <div style={{
 textAlign: 'center',
 padding: 12,
 background: '#F7F4F0',
 borderRadius: 10,
 }}>
 <div style={{ fontSize: 24, fontWeight: 700, color, fontFamily: FONT_SERIF }}>
 {count}
 </div>
 <div style={{ fontSize: 11, color: '#64748B', marginTop: 4, lineHeight: 1.3 }}>
 {label}
 </div>
 </div>
 )
}

function GapRow({ gap }: { gap: { label: string; action: string; impact: 'high'|'medium'|'low'; dimensions_affected: string[] } }) {
 const impactColor =
 gap.impact === 'high' ? '#DC2626' :
 gap.impact === 'medium' ? '#C9973A' :
 '#94A3B8'

 return (
 <div style={{
 display: 'flex',
 gap: 16,
 padding: 14,
 background: '#F7F4F0',
 borderRadius: 10,
 alignItems: 'flex-start',
 }}>
 <div style={{
 width: 8,
 height: 8,
 borderRadius: '50%',
 background: impactColor,
 marginTop: 6,
 flexShrink: 0,
 }} />
 <div style={{ flex: 1 }}>
 <div style={{ fontSize: 14, fontWeight: 600, color: '#0D1B3E', marginBottom: 2 }}>
 {gap.label}
 </div>
 <div style={{ fontSize: 12, color: '#64748B', marginBottom: 4 }}>
 {gap.action}
 </div>
 {gap.dimensions_affected.length > 0 && (
 <div style={{ fontSize: 10, color: '#94A3B8' }}>
 Affects: {gap.dimensions_affected.join(', ')}
 </div>
 )}
 </div>
 <span style={{
 fontSize: 10,
 fontWeight: 600,
 textTransform: 'uppercase',
 color: impactColor,
 padding: '2px 8px',
 border: `1px solid ${impactColor}`,
 borderRadius: 8,
 letterSpacing: 0.3,
 }}>
 {gap.impact}
 </span>
 </div>
 )
}
