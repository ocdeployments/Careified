'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { AlignmentScoreBadge, AlignmentDisclaimerBanner } from '@/components/matching/AlignmentBadge'

const FONT_SANS = "'DM Sans', sans-serif"
const FONT_SERIF = "'DM Serif Display', serif"

type Opportunity = {
 client_needs_id: string
 alignment_score: number | null
 overall_confidence: number | null
 scope: string
 criteria_aligned: string[]
 criteria_not_aligned: string[]
 unknowns: string[]
 primary_condition: string | null
 placement_type: string | null
 care_intensity: string | null
 city: string | null
 state: string | null
 language_required: string | null
 hourly_rate_max: number | null
 duration_expected: string | null
 hours_per_week: number | null
 start_date: string | null
 already_interested: boolean
}

export default function OpportunitiesPage() {
 const [opportunities, setOpportunities] = useState<Opportunity[]>([])
 const [loading, setLoading] = useState(true)
 const [error, setError] = useState<string | null>(null)
 const [pending, setPending] = useState<Set<string>>(new Set())

 useEffect(() => { load() }, [])

 async function load() {
 setLoading(true)
 try {
 const r = await fetch('/api/opportunities')
 if (!r.ok) throw new Error('Failed to load')
 const d = await r.json()
 setOpportunities(d.opportunities || [])
 } catch (e) {
 setError(e instanceof Error ? e.message : 'Unknown error')
 } finally {
 setLoading(false)
 }
 }

 async function expressInterest(id: string, alignmentScore: number | null) {
 setPending(p => new Set(p).add(id))
 try {
 await fetch(`/api/opportunities/${id}/interest`, {
 method: 'POST',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify({ alignment_score: alignmentScore }),
 })
 setOpportunities(opps => opps.map(o =>
 o.client_needs_id === id ? { ...o, already_interested: true } : o
 ))
 } finally {
 setPending(p => { const n = new Set(p); n.delete(id); return n })
 }
 }

 async function withdraw(id: string) {
 setPending(p => new Set(p).add(id))
 try {
 await fetch(`/api/opportunities/${id}/interest`, { method: 'DELETE' })
 setOpportunities(opps => opps.map(o =>
 o.client_needs_id === id ? { ...o, already_interested: false } : o
 ))
 } finally {
 setPending(p => { const n = new Set(p); n.delete(id); return n })
 }
 }

 async function dismiss(id: string) {
 setPending(p => new Set(p).add(id))
 try {
 await fetch(`/api/opportunities/${id}/dismiss`, { method: 'POST' })
 setOpportunities(opps => opps.filter(o => o.client_needs_id !== id))
 } finally {
 setPending(p => { const n = new Set(p); n.delete(id); return n })
 }
 }

 if (loading) return <div style={{ padding: 40, fontFamily: FONT_SANS, color: '#64748B' }}>Loading opportunities…</div>

 return (
 <div style={{ maxWidth: 900, margin: '0 auto', padding: '40px 24px', fontFamily: FONT_SANS }}>
 <h1 style={{ fontFamily: FONT_SERIF, fontSize: 32, color: '#0D1B3E', margin: '0 0 4px 0' }}>
 Opportunities for you
 </h1>
 <p style={{ color: '#64748B', marginBottom: 24 }}>
 Open client needs aligned to your disclosures. Express interest to let the agency know.
 </p>

 <div style={{ marginBottom: 20 }}>
 <AlignmentDisclaimerBanner
 disclaimer="These opportunities are open client needs ranked by how your disclosures align with their criteria. Expressing interest notifies the agency, who then decides whether to reach out. Careified does not recommend or match you automatically."
 compact
 />
 </div>

 {error && (
 <div style={{ background: '#FEE2E2', color: '#991B1B', padding: 16, borderRadius: 12, marginBottom: 16 }}>
 {error}
 </div>
 )}

 {opportunities.length === 0 && !loading && (
 <div style={{
 background: 'white',
 border: '1px solid #E2E8F0',
 borderRadius: 16,
 padding: 40,
 textAlign: 'center',
 color: '#64748B',
 }}>
 <div style={{ fontSize: 16, color: '#0D1B3E', marginBottom: 8 }}>No opportunities right now</div>
 <div style={{ fontSize: 13, marginBottom: 16 }}>
 We&apos;ll show you open client needs that align with your profile as they come in.
 </div>
 <Link href="/profile/strength" style={{ color: '#C9973A', fontSize: 13 }}>
 Strengthen your profile to reach more matches →
 </Link>
 </div>
 )}

 <div style={{ display: 'grid', gap: 16 }}>
 {opportunities.map(o => (
 <OpportunityCard
 key={o.client_needs_id}
 opportunity={o}
 pending={pending.has(o.client_needs_id)}
 onInterest={() => expressInterest(o.client_needs_id, o.alignment_score)}
 onWithdraw={() => withdraw(o.client_needs_id)}
 onDismiss={() => dismiss(o.client_needs_id)}
 />
 ))}
 </div>
 </div>
 )
}

function OpportunityCard({
 opportunity,
 pending,
 onInterest,
 onWithdraw,
 onDismiss,
}: {
 opportunity: Opportunity
 pending: boolean
 onInterest: () => void
 onWithdraw: () => void
 onDismiss: () => void
}) {
 const o = opportunity

 return (
 <div style={{
 background: 'white',
 border: `1px solid ${o.already_interested ? '#C9973A' : '#E2E8F0'}`,
 borderRadius: 16,
 padding: 24,
 }}>
 <div style={{ display: 'flex', gap: 16, justifyContent: 'space-between' }}>
 <div style={{ flex: 1 }}>
 <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
 <div style={{ fontFamily: FONT_SERIF, fontSize: 20, color: '#0D1B3E' }}>
 {o.primary_condition || 'Care opportunity'}
 </div>
 <span style={{
 fontSize: 11,
 background: '#F1F5F9',
 color: '#64748B',
 padding: '2px 10px',
 borderRadius: 10,
 }}>
 {o.city}, {o.state}
 </span>
 </div>

 <div style={{ fontSize: 13, color: '#64748B', marginBottom: 12 }}>
 {[o.placement_type, o.care_intensity && `${o.care_intensity} care`,
 o.hours_per_week && `${o.hours_per_week} hrs/week`,
 o.duration_expected, o.language_required && `${o.language_required} required`,
 o.hourly_rate_max && `up to $${o.hourly_rate_max}/hr`]
 .filter(Boolean).join(' · ')}
 </div>

 {o.criteria_aligned.length > 0 && (
 <div style={{ marginBottom: 8 }}>
 <div style={{ fontSize: 10, color: '#64748B', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>
 Why this is for you
 </div>
 <div style={{ fontSize: 13, color: '#0D1B3E' }}>
 {o.criteria_aligned.slice(0, 3).join(' · ')}
 </div>
 </div>
 )}

 {o.criteria_not_aligned.length > 0 && (
 <div style={{ marginBottom: 8 }}>
 <div style={{ fontSize: 10, color: '#64748B', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>
 Things to consider
 </div>
 <div style={{ fontSize: 12, color: '#B45309' }}>
 {o.criteria_not_aligned.slice(0, 2).join(' · ')}
 </div>
 </div>
 )}
 </div>

 <AlignmentScoreBadge score={o.alignment_score} confidence={o.overall_confidence} size="sm" />
 </div>

 <div style={{ display: 'flex', gap: 8, marginTop: 16, justifyContent: 'flex-end' }}>
 {!o.already_interested && (
 <button
 onClick={onDismiss}
 disabled={pending}
 style={{
 padding: '10px 16px',
 borderRadius: 10,
 border: '1.5px solid #E2E8F0',
 background: 'white',
 color: '#64748B',
 fontSize: 13,
 fontWeight: 500,
 cursor: pending ? 'not-allowed' : 'pointer',
 fontFamily: FONT_SANS,
 }}
 >
 Not interested
 </button>
 )}
 {o.already_interested ? (
 <button
 onClick={onWithdraw}
 disabled={pending}
 style={{
 padding: '10px 20px',
 borderRadius: 10,
 border: '1.5px solid #C9973A',
 background: '#FDF6EC',
 color: '#92400E',
 fontSize: 13,
 fontWeight: 600,
 cursor: pending ? 'not-allowed' : 'pointer',
 fontFamily: FONT_SANS,
 }}
 >
 ✓ Interest expressed — withdraw
 </button>
 ) : (
 <button
 onClick={onInterest}
 disabled={pending}
 style={{
 padding: '10px 20px',
 borderRadius: 10,
 border: 'none',
 background: pending ? '#E2E8F0' : 'linear-gradient(135deg, #C9973A, #E8B86D)',
 color: '#0D1B3E',
 fontSize: 13,
 fontWeight: 700,
 cursor: pending ? 'not-allowed' : 'pointer',
 fontFamily: FONT_SANS,
 }}
 >
 Express interest
 </button>
 )}
 </div>
 </div>
 )
}
