'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import { toast } from 'sonner'

const N = '#0D1B3E'
const G = '#C9973A'

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
  const [form, setForm] = useState({
    type: '',
    subject: '',
    description: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (isLoaded && !user) {
      router.push('/sign-in?redirect_url=/agency/support')
    }
  }, [isLoaded, user, router])

  useEffect(() => {
    if (user) {
      fetch('/api/tickets/list')
        .then(r => r.json())
        .then(data => {
          if (data.tickets) setTickets(data.tickets)
        })
        .catch(console.error)
        .finally(() => setFetching(false))
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
      const res = await fetch('/api/tickets/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Failed to create ticket')
      }
      setSuccessNumber(data.ticket_number)
      setShowSuccess(true)
      setForm({ type: '', subject: '', description: '' })
      // Refresh tickets
      const ticketsRes = await fetch('/api/tickets/list')
      const ticketsData = await ticketsRes.json()
      if (ticketsData.tickets) setTickets(ticketsData.tickets)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to submit ticket')
    } finally {
      setLoading(false)
    }
  }

  if (!isLoaded) {
    return <div style={{ padding: 40, textAlign: 'center', color: '#64748B' }}>Loading...</div>
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F7F4F0', padding: '40px 20px' }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 32, color: N, marginBottom: 24 }}>
          Agency Support
        </h1>

        {showSuccess && (
          <div style={{ background: '#F0FDF4', border: '1px solid #16A34A', borderRadius: 12, padding: 24, marginBottom: 24 }}>
            <p style={{ fontSize: 16, color: '#15803D', fontWeight: 600, marginBottom: 8 }}>
              Ticket {successNumber} submitted. We'll respond within 5 business days.
            </p>
            <div style={{ display: 'flex', gap: 12 }}>
              <button
                onClick={() => setShowSuccess(false)}
                style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid #E2E8F0', background: 'white', color: N, fontSize: 14, cursor: 'pointer' }}
              >
                Submit another
              </button>
            </div>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
          {/* Submit form */}
          <div style={{ background: 'white', borderRadius: 16, padding: 24, border: '1px solid #E2E8F0' }}>
            <h2 style={{ fontSize: 18, fontWeight: 600, color: N, marginBottom: 20 }}>Submit a ticket</h2>
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: N, marginBottom: 6 }}>
                  Type <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <select
                  value={form.type}
                  onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                  style={{ width: '100%', padding: '11px 14px', borderRadius: 10, border: errors.type ? '1px solid #DC2626' : '1.5px solid #E2E8F0', fontSize: 14, outline: 'none' }}
                >
                  <option value="">Select...</option>
                  {TICKET_TYPES.map(t => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
                {errors.type && <p style={{ fontSize: 12, color: '#DC2626', marginTop: 4 }}>{errors.type}</p>}
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: N, marginBottom: 6 }}>
                  Subject <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <input
                  type="text"
                  value={form.subject}
                  onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
                  style={{ width: '100%', padding: '11px 14px', borderRadius: 10, border: errors.subject ? '1px solid #DC2626' : '1.5px solid #E2E8F0', fontSize: 14, outline: 'none' }}
                  placeholder="Brief description of the issue"
                />
                {errors.subject && <p style={{ fontSize: 12, color: '#DC2626', marginTop: 4 }}>{errors.subject}</p>}
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: N, marginBottom: 6 }}>
                  Description <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <textarea
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  style={{ width: '100%', padding: '11px 14px', borderRadius: 10, border: errors.description ? '1px solid #DC2626' : '1.5px solid #E2E8F0', fontSize: 14, outline: 'none', minHeight: 120, resize: 'vertical' }}
                  placeholder="Please provide details about your issue..."
                />
                {errors.description && <p style={{ fontSize: 12, color: '#DC2626', marginTop: 4 }}>{errors.description}</p>}
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{ width: '100%', padding: '12px 24px', borderRadius: 10, border: 'none', background: loading ? '#E2E8F0' : `linear-gradient(135deg, ${G}, #E8B86D)`, color: loading ? '#94A3B8' : N, fontSize: 14, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer' }}
              >
                {loading ? 'Submitting...' : 'Submit Ticket'}
              </button>
            </form>
          </div>

          {/* Ticket list */}
          <div style={{ background: 'white', borderRadius: 16, padding: 24, border: '1px solid #E2E8F0' }}>
            <h2 style={{ fontSize: 18, fontWeight: 600, color: N, marginBottom: 20 }}>My Tickets</h2>
            {fetching ? (
              <p style={{ color: '#64748B', fontSize: 14 }}>Loading...</p>
            ) : tickets.length === 0 ? (
              <p style={{ color: '#64748B', fontSize: 14 }}>No tickets yet.</p>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #E2E8F0' }}>
                    <th style={{ textAlign: 'left', fontSize: 11, fontWeight: 600, color: '#64748B', paddingBottom: 8, textTransform: 'uppercase' }}>Ticket</th>
                    <th style={{ textAlign: 'left', fontSize: 11, fontWeight: 600, color: '#64748B', paddingBottom: 8, textTransform: 'uppercase' }}>Subject</th>
                    <th style={{ textAlign: 'left', fontSize: 11, fontWeight: 600, color: '#64748B', paddingBottom: 8, textTransform: 'uppercase' }}>Type</th>
                    <th style={{ textAlign: 'left', fontSize: 11, fontWeight: 600, color: '#64748B', paddingBottom: 8, textTransform: 'uppercase' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {tickets.map(ticket => (
                    <tr key={ticket.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <td style={{ padding: '12px 0', fontSize: 13, fontFamily: 'monospace' }}>{ticket.ticket_number}</td>
                      <td style={{ padding: '12px 0', fontSize: 13 }}>{ticket.subject}</td>
                      <td style={{ padding: '12px 0', fontSize: 13, textTransform: 'capitalize' }}>{ticket.type}</td>
                      <td style={{ padding: '12px 0' }}>
                        <span style={{
                          display: 'inline-block',
                          padding: '4px 10px',
                          borderRadius: 12,
                          fontSize: 11,
                          fontWeight: 600,
                          background: STATUS_COLORS[ticket.status] + '20',
                          color: STATUS_COLORS[ticket.status],
                        }}>
                          {ticket.status.replace('_', ' ')}
                        </span>
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