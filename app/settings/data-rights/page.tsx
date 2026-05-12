'use client'

import { useState, useEffect, CSSProperties } from 'react'
import Link from 'next/link'
import { useUser } from '@clerk/nextjs'

const FONT_SANS = "'DM Sans', sans-serif"
const FONT_SERIF = "'DM Serif Display', serif"

type PastTicket = {
  id: string
  ticket_number: string
  type: string
  status: string
  created_at: string
}

export default function DataRightsPage() {
  const { user, isLoaded } = useUser()
  const [tickets, setTickets] = useState<PastTicket[]>([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [successNumber, setSuccessNumber] = useState<string | null>(null)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)

  useEffect(() => {
    if (user && isLoaded) {
      fetch('/api/tickets/list?type=data_rights')
        .then(r => r.json())
        .then(d => setTickets(d.tickets || []))
        .finally(() => setLoading(false))
    }
  }, [user, isLoaded])

  async function requestExport() {
    setBusy('export')
    setError(null)
    setSuccessNumber(null)
    try {
      const r = await fetch('/api/tickets/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'data_rights',
          subject: 'Data Export Request',
          description: 'User requested full data export under PIPEDA rights.',
        }),
      })
      if (!r.ok) throw new Error('Export request failed')
      const d = await r.json()
      setSuccessNumber(d.ticket_number)
      // Refresh tickets
      const rr = await fetch('/api/tickets/list?type=data_rights').then(x => x.json())
      setTickets(rr.tickets || [])
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error')
    } finally {
      setBusy(null)
    }
  }

  async function requestDeletion() {
    setBusy('deletion')
    setError(null)
    try {
      const r = await fetch('/api/tickets/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'data_rights',
          subject: 'Account Deletion Request',
          description: 'User requested account deletion under PIPEDA rights.',
        }),
      })
      if (!r.ok) throw new Error('Deletion request failed')
      const d = await r.json()
      setSuccessNumber(d.ticket_number)
      setDeleteConfirmOpen(false)
      // Refresh tickets
      const rr = await fetch('/api/tickets/list?type=data_rights').then(x => x.json())
      setTickets(rr.tickets || [])
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error')
    } finally {
      setBusy(null)
    }
  }

  if (!isLoaded) {
    return <div style={{ padding: 40, textAlign: 'center', color: '#64748B' }}>Loading...</div>
  }

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '40px 24px', fontFamily: FONT_SANS }}>
      <Link href="/settings" style={{ color: '#64748B', fontSize: 13, textDecoration: 'none' }}>← Back to Settings</Link>

      <h1 style={{ fontFamily: FONT_SERIF, fontSize: 32, color: '#0D1B3E', margin: '12px 0 4px 0' }}>
        Data & Privacy
      </h1>
      <p style={{ color: '#64748B', marginBottom: 32 }}>
        Under PIPEDA, you have the right to access, export, and delete your personal data.
      </p>

      {error && (
        <div style={{ background: '#FEE2E2', color: '#991B1B', padding: 16, borderRadius: 12, marginBottom: 16 }}>
          {error}
        </div>
      )}

      {successNumber && (
        <div style={{ background: '#F0FDF4', border: '1px solid #16A34A', borderRadius: 12, padding: 16, marginBottom: 16 }}>
          <p style={{ color: '#15803D', fontSize: 14, fontWeight: 600 }}>
            Your request has been submitted. Ticket: {successNumber}
          </p>
          <p style={{ color: '#15803D', fontSize: 13, marginTop: 4 }}>
            We'll deliver your data within 30 days to your email on file.
          </p>
        </div>
      )}

      <Card title="Export my data">
        <p style={{ fontSize: 13, color: '#64748B', marginBottom: 16 }}>
          Request a full copy of all your data. We'll deliver it within 30 days.
        </p>
        <button onClick={requestExport} disabled={busy === 'export'} style={btnPrimary(busy === 'export')}>
          {busy === 'export' ? 'Submitting...' : 'Request Data Export'}
        </button>
      </Card>

      <Card title="Delete my account" danger>
        <p style={{ fontSize: 13, color: '#64748B', marginBottom: 16 }}>
          This will permanently delete your profile, credentials, and all associated data.
          This cannot be undone.
        </p>
        {!deleteConfirmOpen ? (
          <button onClick={() => setDeleteConfirmOpen(true)} style={btnDanger(false)}>
            Request Account Deletion
          </button>
        ) : (
          <div>
            <div style={{
              background: '#FEE2E2', color: '#991B1B',
              padding: 12, borderRadius: 8, marginBottom: 12, fontSize: 13,
            }}>
              This will permanently delete your profile, credentials, and all associated data. This cannot be undone.
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={requestDeletion} disabled={busy === 'deletion'} style={btnDanger(busy === 'deletion')}>
                {busy === 'deletion' ? 'Submitting...' : 'Yes, delete my account'}
              </button>
              <button onClick={() => setDeleteConfirmOpen(false)} disabled={busy === 'deletion'} style={btnSecondary()}>
                Cancel
              </button>
            </div>
          </div>
        )}
      </Card>

      {!loading && tickets.length > 0 && (
        <Card title="Past requests">
          <div style={{ display: 'grid', gap: 8 }}>
            {tickets.map(t => (
              <div key={t.id} style={{
                display: 'flex', justifyContent: 'space-between',
                padding: 10, background: '#F7F4F0', borderRadius: 8, fontSize: 13,
              }}>
                <span style={{ color: '#0D1B3E', textTransform: 'capitalize' }}>
                  {t.type === 'data_rights' ? 'Data rights' : t.type} · {t.ticket_number} · {new Date(t.created_at).toLocaleDateString()}
                </span>
                <span style={{
                  color: t.status === 'resolved' ? '#15803D' :
                  t.status === 'closed' ? '#64748B' : '#F59E0B',
                  textTransform: 'capitalize',
                }}>
                  {t.status.replace('_', ' ')}
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