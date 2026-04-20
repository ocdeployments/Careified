'use client'
import { useEffect, useState, CSSProperties } from 'react'
import Link from 'next/link'

const FONT_SANS = "'DM Sans', sans-serif"
const FONT_SERIF = "'DM Serif Display', serif"

type PastRequest = {
 id: string
 request_type: 'export' | 'deletion' | 'correction'
 status: string
 created_at: string
 completed_at: string | null
 denied_reason: string | null
}

export default function DataRightsPage() {
 const [requests, setRequests] = useState<PastRequest[]>([])
 const [loading, setLoading] = useState(true)
 const [busy, setBusy] = useState<string | null>(null)
 const [error, setError] = useState<string | null>(null)
 const [exportReady, setExportReady] = useState<Record<string, unknown> | null>(null)
 const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)

 useEffect(() => {
 fetch('/api/data-rights/requests')
 .then(r => r.json())
 .then(d => setRequests(d.requests || []))
 .finally(() => setLoading(false))
 }, [])

 async function requestExport() {
 setBusy('export')
 setError(null)
 try {
 const r = await fetch('/api/data-rights/request', {
 method: 'POST',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify({ type: 'export' }),
 })
 if (!r.ok) throw new Error('Export failed')
 const d = await r.json()
 setExportReady(d.bundle)
 const rr = await fetch('/api/data-rights/requests').then(x => x.json())
 setRequests(rr.requests || [])
 } catch (e) {
 setError(e instanceof Error ? e.message : 'Unknown error')
 } finally {
 setBusy(null)
 }
 }

 function downloadExport() {
 if (!exportReady) return
 const blob = new Blob([JSON.stringify(exportReady, null, 2)], { type: 'application/json' })
 const url = URL.createObjectURL(blob)
 const a = document.createElement('a')
 a.href = url
 a.download = `careified-data-export-${Date.now()}.json`
 a.click()
 URL.revokeObjectURL(url)
 }

 async function requestDeletion() {
 setBusy('deletion')
 setError(null)
 try {
 const r = await fetch('/api/data-rights/request', {
 method: 'POST',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify({ type: 'deletion', payload: { confirm_deletion: true } }),
 })
 if (!r.ok) {
 const d = await r.json().catch(() => ({}))
 throw new Error(d.message || 'Deletion failed')
 }
 window.location.href = '/sign-out'
 } catch (e) {
 setError(e instanceof Error ? e.message : 'Unknown error')
 setBusy(null)
 }
 }

 return (
 <div style={{ maxWidth: 720, margin: '0 auto', padding: '40px 24px', fontFamily: FONT_SANS }}>
 <Link href="/" style={{ color: '#64748B', fontSize: 13, textDecoration: 'none' }}>← Home</Link>

 <h1 style={{ fontFamily: FONT_SERIF, fontSize: 32, color: '#0D1B3E', margin: '12px 0 4px 0' }}>
 Your data rights
 </h1>
 <p style={{ color: '#64748B', marginBottom: 32 }}>
 You own your data. Here&apos;s how to export it, correct it, or delete it.
 </p>

 {error && (
 <div style={{ background: '#FEE2E2', color: '#991B1B', padding: 16, borderRadius: 12, marginBottom: 16 }}>
 {error}
 </div>
 )}

 <Card title="Export your data">
 <p style={{ fontSize: 13, color: '#64748B', marginBottom: 16 }}>
 Get a full JSON copy of everything we hold about you.
 </p>
 {!exportReady ? (
 <button onClick={requestExport} disabled={busy === 'export'} style={btnPrimary(busy === 'export')}>
 {busy === 'export' ? 'Preparing export…' : 'Export my data'}
 </button>
 ) : (
 <div>
 <div style={{ color: '#15803D', fontSize: 13, marginBottom: 12 }}>✓ Export ready</div>
 <button onClick={downloadExport} style={btnPrimary(false)}>Download JSON</button>
 </div>
 )}
 </Card>

 <Card title="Correct your data">
 <p style={{ fontSize: 13, color: '#64748B', marginBottom: 16 }}>
 Most data can be edited directly in your profile.
 </p>
 <div style={{ display: 'flex', gap: 8 }}>
 <Link href="/profile/build" style={btnSecondary()}>Edit my profile</Link>
 <a href="mailto:privacy@careified.com?subject=Data correction request" style={btnSecondary()}>
 Email for other corrections
 </a>
 </div>
 </Card>

 <Card title="Delete my account and data" danger>
 <p style={{ fontSize: 13, color: '#64748B', marginBottom: 16 }}>
 This permanently deletes your profile and personal data. Some legal records
 (audit logs, consent records with PII removed) are retained as required.
 You cannot undo this action.
 </p>
 {!deleteConfirmOpen ? (
 <button onClick={() => setDeleteConfirmOpen(true)} style={btnDanger(false)}>
 Delete my account
 </button>
 ) : (
 <div>
 <div style={{
 background: '#FEE2E2', color: '#991B1B',
 padding: 12, borderRadius: 8, marginBottom: 12, fontSize: 13,
 }}>
 This will permanently delete your profile. Are you sure?
 </div>
 <div style={{ display: 'flex', gap: 8 }}>
 <button onClick={requestDeletion} disabled={busy === 'deletion'} style={btnDanger(busy === 'deletion')}>
 {busy === 'deletion' ? 'Deleting…' : 'Yes, delete everything'}
 </button>
 <button onClick={() => setDeleteConfirmOpen(false)} disabled={busy === 'deletion'} style={btnSecondary()}>
 Cancel
 </button>
 </div>
 </div>
 )}
 </Card>

 {!loading && requests.length > 0 && (
 <Card title="Past requests">
 <div style={{ display: 'grid', gap: 8 }}>
 {requests.map(r => (
 <div key={r.id} style={{
 display: 'flex', justifyContent: 'space-between',
 padding: 10, background: '#F7F4F0', borderRadius: 8, fontSize: 13,
 }}>
 <span style={{ color: '#0D1B3E', textTransform: 'capitalize' }}>
 {r.request_type} · {new Date(r.created_at).toLocaleDateString()}
 </span>
 <span style={{
 color: r.status === 'completed' ? '#15803D' :
 r.status === 'denied' ? '#DC2626' : '#64748B',
 textTransform: 'capitalize',
 }}>
 {r.status}
 </span>
 </div>
 ))}
 </div>
 </Card>
 )}
 </div>
 )
}

function Card({ title, children, danger }: { title: string; children: React.ReactNode; danger?: boolean }) {
 return (
 <div style={{
 background: 'white',
 border: `1px solid ${danger ? '#FCA5A5' : '#E2E8F0'}`,
 borderRadius: 16,
 padding: 24,
 marginBottom: 16,
 }}>
 <h2 style={{
 fontFamily: "'DM Serif Display', serif",
 fontSize: 18,
 color: danger ? '#991B1B' : '#0D1B3E',
 margin: '0 0 12px 0',
 }}>
 {title}
 </h2>
 {children}
 </div>
 )
}

function btnPrimary(disabled: boolean): CSSProperties {
 return {
 padding: '10px 20px', borderRadius: 10, border: 'none',
 background: disabled ? '#E2E8F0' : 'linear-gradient(135deg, #C9973A, #E8B86D)',
 color: '#0D1B3E', fontSize: 13, fontWeight: 700,
 cursor: disabled ? 'not-allowed' : 'pointer', fontFamily: FONT_SANS,
 textDecoration: 'none', display: 'inline-block',
 }
}

function btnSecondary(): CSSProperties {
 return {
 padding: '10px 20px', borderRadius: 10, border: '1.5px solid #E2E8F0',
 background: 'white', color: '#0D1B3E', fontSize: 13, fontWeight: 500,
 cursor: 'pointer', fontFamily: FONT_SANS,
 textDecoration: 'none', display: 'inline-block',
 }
}

function btnDanger(disabled: boolean): CSSProperties {
 return {
 padding: '10px 20px', borderRadius: 10, border: '1.5px solid #DC2626',
 background: disabled ? '#FEE2E2' : 'white', color: '#DC2626',
 fontSize: 13, fontWeight: 600,
 cursor: disabled ? 'not-allowed' : 'pointer', fontFamily: FONT_SANS,
 }
}
