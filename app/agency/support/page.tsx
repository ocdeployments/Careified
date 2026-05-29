'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import { toast } from 'sonner'

const N = '#0D1B3E'
const G = '#C9973A'
const M = 'rgba(255,255,255,0.55)'
const B = 'rgba(255,255,255,0.08)'
const C = 'rgba(255,255,255,0.04)'

const TICKET_TYPES = [
  { value: 'billing', label: 'Billing' },
  { value: 'platform', label: 'Technical Issue' },
  { value: 'verification', label: 'Verification' },
  { value: 'feature', label: 'Feature Request' },
  { value: 'general', label: 'General' },
]

const STATUS_COLORS: Record<string, string> = {
  open: '#EF4444',
  in_progress: '#F59E0B',
  pending_user: '#3B82F6',
  resolved: '#16A34A',
  closed: '#6B7280',
}

export default function AgencySupportPage() {
  const { user, isLoaded } = useUser()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [tickets, setTickets] = useState<any[]>([])
  const [fetching, setFetching] = useState(true)
  const [showSuccess, setShowSuccess] = useState(false)
  const [successNumber, setSuccessNumber] = useState('')
  const [form, setForm] = useState({ type: '', subject: '', description: '' })
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (isLoaded && !user) router.push('/sign-in?redirect_url=/agency/support')
  }, [isLoaded, user, router])

  useEffect(() => {
    if (user) {
      fetch('/api/tickets/list').then(r => r.json()).then(data => { if (data.tickets) setTickets(data.tickets) }).catch(console.error).finally(() => setFetching(false))
    }
  }, [user])

  function validate() {
    const e: Record<string, string> = {}
    if (!form.type) e.type = 'Required'
    if (!form.subject || form.subject.length < 5) e.subject = 'Subject must be at least 5 characters'
    if (!form.description || form.description.length < 20) e.description = 'Description must be at least 20 characters'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      const res = await fetch('/api/tickets/create', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to create ticket')
      setSuccessNumber(data.ticket_number)
      setShowSuccess(true)
      setForm({ type: '', subject: '', description: '' })
      const ticketsRes = await fetch('/api/tickets/list')
      const ticketsData = await ticketsRes.json()
      if (ticketsData.tickets) setTickets(ticketsData.tickets)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to submit ticket')
    } finally {
      setLoading(false)
    }
  }

  if (!isLoaded) return <div style={{ padding: 40, textAlign: 'center', color: M }}>Loading...</div>

  return (
    <div style={{ minHeight: '100vh', background: '#080F1E', padding: '40px 20px' }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 32, color: '#F5F0E8', marginBottom: 24 }}>Agency Support</h1>

        {showSuccess && (
          <div style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: 12, padding: 24, marginBottom: 24 }}>
            <p style={{ fontSize: 16, color: '#22C55E', fontWeight: 600, marginBottom: 8 }}>Ticket {successNumber} submitted. We'll respond within 5 business days.</p>
            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={() => setShowSuccess(false)} style={{ padding: '8px 16px', borderRadius: 8, border: `1px solid ${B}`, background: 'transparent', color: '#F5F0E8', fontSize: 14, cursor: 'pointer' }}>Submit another</button>
            </div>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
          {/* Submit form */}
          <div style={{ background: C, borderRadius: 16, padding: 24, border: `1px solid ${B}` }}>
            <h2 style={{ fontSize: 18, fontWeight: 600, color: '#F5F0E8', marginBottom: 20 }}>Submit a ticket</h2>
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#F5F0E8', marginBottom: 6 }}>Type <span style={{ color: '#EF4444' }}>*</span></label>
                <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} style={{ width: '100%', padding: '11px 14px', borderRadius: 10, border: errors.type ? '1px solid #EF4444' : `1.5px solid ${B}`, fontSize: 14, outline: 'none', background: 'rgba(255,255,255,0.06)', color: '#F5F0E8' }}>
                  <option value="">Select...</option>
                  {TICKET_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
                {errors.type && <p style={{ fontSize: 12, color: '#EF4444', marginTop: 4 }}>{errors.type}</p>}
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#F5F0E8', marginBottom: 6 }}>Subject <span style={{ color: '#EF4444' }}>*</span></label>
                <input type="text" value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} style={{ width: '100%', padding: '11px 14px', borderRadius: 10, border: errors.subject ? '1px solid #EF4444' : `1.5px solid ${B}`, fontSize: 14, outline: 'none', background: 'rgba(255,255,255,0.06)', color: '#F5F0E8' }} placeholder="Brief description of the issue" />
                {errors.subject && <p style={{ fontSize: 12, color: '#EF4444', marginTop: 4 }}>{errors.subject}</p>}
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#F5F0E8', marginBottom: 6 }}>Description <span style={{ color: '#EF4444' }}>*</span></label>
                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} style={{ width: '100%', padding: '11px 14px', borderRadius: 10, border: errors.description ? '1px solid #EF4444' : `1.5px solid ${B}`, fontSize: 14, outline: 'none', minHeight: 120, resize: 'vertical', background: 'rgba(255,255,255,0.06)', color: '#F5F0E8' }} placeholder="Please provide details about your issue..." />
                {errors.description && <p style={{ fontSize: 12, color: '#EF4444', marginTop: 4 }}>{errors.description}</p>}
              </div>

              <button type="submit" disabled={loading} style={{ width: '100%', padding: '12px 24px', borderRadius: 10, border: 'none', background: loading ? 'rgba(255,255,255,0.1)' : `linear-gradient(135deg, ${G}, #E8B86D)`, color: loading ? M : N, fontSize: 14, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer' }}>
                {loading ? 'Submitting...' : 'Submit Ticket'}
              </button>
            </form>
          </div>

          {/* Ticket list */}
          <div style={{ background: C, borderRadius: 16, padding: 24, border: `1px solid ${B}` }}>
            <h2 style={{ fontSize: 18, fontWeight: 600, color: '#F5F0E8', marginBottom: 20 }}>My Tickets</h2>
            {fetching ? (
              <p style={{ color: M, fontSize: 14 }}>Loading...</p>
            ) : tickets.length === 0 ? (
              <p style={{ color: M, fontSize: 14 }}>No tickets yet.</p>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${B}` }}>
                    <th style={{ textAlign: 'left', fontSize: 11, fontWeight: 600, color: M, paddingBottom: 8, textTransform: 'uppercase' }}>Ticket</th>
                    <th style={{ textAlign: 'left', fontSize: 11, fontWeight: 600, color: M, paddingBottom: 8, textTransform: 'uppercase' }}>Subject</th>
                    <th style={{ textAlign: 'left', fontSize: 11, fontWeight: 600, color: M, paddingBottom: 8, textTransform: 'uppercase' }}>Type</th>
                    <th style={{ textAlign: 'left', fontSize: 11, fontWeight: 600, color: M, paddingBottom: 8, textTransform: 'uppercase' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {tickets.map(ticket => (
                    <tr key={ticket.id} style={{ borderBottom: `1px solid ${B}` }}>
                      <td style={{ padding: '12px 0', fontSize: 13, fontFamily: 'monospace', color: '#F5F0E8' }}>{ticket.ticket_number}</td>
                      <td style={{ padding: '12px 0', fontSize: 13, color: '#F5F0E8' }}>{ticket.subject}</td>
                      <td style={{ padding: '12px 0', fontSize: 13, color: '#F5F0E8', textTransform: 'capitalize' }}>{ticket.type}</td>
                      <td style={{ padding: '12px 0' }}>
                        <span style={{ display: 'inline-block', padding: '4px 10px', borderRadius: 12, fontSize: 11, fontWeight: 600, background: STATUS_COLORS[ticket.status] + '20', color: STATUS_COLORS[ticket.status] }}>{ticket.status.replace('_', ' ')}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
