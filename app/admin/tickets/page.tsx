'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'

const N = '#0D1B3E'

const STATUS_COLORS: Record<string, string> = {
  open: '#EF4444',
  in_progress: '#F59E0B',
  pending_user: '#3B82F6',
  resolved: '#16A34A',
  closed: '#6B7280',
}

const PRIORITY_COLORS: Record<string, string> = {
  urgent: '#DC2626',
  high: '#F59E0B',
  medium: '#3B82F6',
  low: '#6B7280',
}

export default function AdminTicketsPage() {
  const { user, isLoaded } = useUser()
  const router = useRouter()
  const [tickets, setTickets] = useState<any[]>([])
  const [fetching, setFetching] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('')

  useEffect(() => {
    if (isLoaded && user) {
      if (process.env.NEXT_PUBLIC_ADMIN_CLERK_USER_ID !== user.id) {
        router.push('/admin')
      }
    }
  }, [isLoaded, user, router])

  useEffect(() => {
    if (user && process.env.NEXT_PUBLIC_ADMIN_CLERK_USER_ID === user.id) {
      fetchTickets()
    }
  }, [user, statusFilter, typeFilter])

  async function fetchTickets() {
    const params = new URLSearchParams()
    if (statusFilter) params.set('status', statusFilter)
    if (typeFilter) params.set('type', typeFilter)

    const url = `/api/tickets/list${params.toString() ? '?' + params.toString() : ''}`
    const res = await fetch(url)
    const data = await res.json()
    if (data.tickets) setTickets(data.tickets)
    setFetching(false)
  }

  const stats = {
    open: tickets.filter(t => t.status === 'open').length,
    in_progress: tickets.filter(t => t.status === 'in_progress').length,
    pending: tickets.filter(t => t.status === 'pending_user').length,
    resolved: tickets.filter(t => t.status === 'resolved').length,
  }

  if (!isLoaded) {
    return <div style={{ padding: 40, textAlign: 'center', color: '#64748B' }}>Loading...</div>
  }

  if (process.env.NEXT_PUBLIC_ADMIN_CLERK_USER_ID !== user?.id) {
    return null
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F7F4F0', padding: '40px 20px' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 32, color: N, marginBottom: 24 }}>
          Support Queue
        </h1>

        {/* Filters */}
        <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            style={{ padding: '8px 12px', borderRadius: 8, border: '1.5px solid #E2E8F0', fontSize: 14 }}
          >
            <option value="">All Status</option>
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="pending_user">Pending User</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
          <select
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}
            style={{ padding: '8px 12px', borderRadius: 8, border: '1.5px solid #E2E8F0', fontSize: 14 }}
          >
            <option value="">All Types</option>
            <option value="billing">Billing</option>
            <option value="verification">Verification</option>
            <option value="platform">Platform</option>
            <option value="data_rights">Data Rights</option>
            <option value="dispute">Dispute</option>
            <option value="feature">Feature</option>
            <option value="general">General</option>
          </select>
        </div>

        {/* Summary */}
        <div style={{ display: 'flex', gap: 24, marginBottom: 24 }}>
          <div style={{ background: '#FEF2F2', padding: '12px 20px', borderRadius: 8, border: '1px solid #FECACA' }}>
            <div style={{ fontSize: 24, fontWeight: 700, color: '#DC2626' }}>{stats.open}</div>
            <div style={{ fontSize: 12, color: '#991B1B' }}>Open</div>
          </div>
          <div style={{ background: '#FFFBEB', padding: '12px 20px', borderRadius: 8, border: '1px solid #FDE68A' }}>
            <div style={{ fontSize: 24, fontWeight: 700, color: '#D97706' }}>{stats.in_progress}</div>
            <div style={{ fontSize: 12, color: '#92400E' }}>In Progress</div>
          </div>
          <div style={{ background: '#EFF6FF', padding: '12px 20px', borderRadius: 8, border: '1px solid #BFDBFE' }}>
            <div style={{ fontSize: 24, fontWeight: 700, color: '#2563EB' }}>{stats.pending}</div>
            <div style={{ fontSize: 12, color: '#1E40AF' }}>Pending</div>
          </div>
          <div style={{ background: '#F0FDF4', padding: '12px 20px', borderRadius: 8, border: '1px solid #BBF7D0' }}>
            <div style={{ fontSize: 24, fontWeight: 700, color: '#16A34A' }}>{stats.resolved}</div>
            <div style={{ fontSize: 12, color: '#166534' }}>Resolved</div>
          </div>
        </div>

        {/* Table */}
        <div style={{ background: 'white', borderRadius: 16, padding: 24, border: '1px solid #E2E8F0' }}>
          {fetching ? (
            <p style={{ color: '#64748B' }}>Loading...</p>
          ) : tickets.length === 0 ? (
            <p style={{ color: '#64748B' }}>No tickets found.</p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #E2E8F0' }}>
                  <th style={{ textAlign: 'left', fontSize: 11, fontWeight: 600, color: '#64748B', paddingBottom: 12, textTransform: 'uppercase' }}>Ticket #</th>
                  <th style={{ textAlign: 'left', fontSize: 11, fontWeight: 600, color: '#64748B', paddingBottom: 12, textTransform: 'uppercase' }}>Submitter</th>
                  <th style={{ textAlign: 'left', fontSize: 11, fontWeight: 600, color: '#64748B', paddingBottom: 12, textTransform: 'uppercase' }}>Subject</th>
                  <th style={{ textAlign: 'left', fontSize: 11, fontWeight: 600, color: '#64748B', paddingBottom: 12, textTransform: 'uppercase' }}>Type</th>
                  <th style={{ textAlign: 'left', fontSize: 11, fontWeight: 600, color: '#64748B', paddingBottom: 12, textTransform: 'uppercase' }}>Priority</th>
                  <th style={{ textAlign: 'left', fontSize: 11, fontWeight: 600, color: '#64748B', paddingBottom: 12, textTransform: 'uppercase' }}>Status</th>
                  <th style={{ textAlign: 'left', fontSize: 11, fontWeight: 600, color: '#64748B', paddingBottom: 12, textTransform: 'uppercase' }}>SLA Due</th>
                  <th style={{ textAlign: 'left', fontSize: 11, fontWeight: 600, color: '#64748B', paddingBottom: 12, textTransform: 'uppercase' }}>Created</th>
                </tr>
              </thead>
              <tbody>
                {tickets.map(ticket => {
                  const isOverdue = ticket.sla_due_at && new Date(ticket.sla_due_at) < new Date()
                  return (
                    <tr key={ticket.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <td style={{ padding: '12px 0', fontSize: 13, fontFamily: 'monospace' }}>{ticket.ticket_number}</td>
                      <td style={{ padding: '12px 0', fontSize: 13, textTransform: 'capitalize' }}>{ticket.submitter_type}</td>
                      <td style={{ padding: '12px 0', fontSize: 13 }}>{ticket.subject}</td>
                      <td style={{ padding: '12px 0', fontSize: 13, textTransform: 'capitalize' }}>{ticket.type.replace('_', ' ')}</td>
                      <td style={{ padding: '12px 0' }}>
                        <span style={{
                          display: 'inline-block',
                          padding: '4px 10px',
                          borderRadius: 12,
                          fontSize: 11,
                          fontWeight: 600,
                          background: PRIORITY_COLORS[ticket.priority] + '20',
                          color: PRIORITY_COLORS[ticket.priority],
                        }}>
                          {ticket.priority}
                        </span>
                      </td>
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
                      <td style={{ padding: '12px 0', fontSize: 13, color: isOverdue ? '#DC2626' : '#64748B' }}>
                        {ticket.sla_due_at ? new Date(ticket.sla_due_at).toLocaleDateString() : '—'}
                      </td>
                      <td style={{ padding: '12px 0', fontSize: 13, color: '#64748B' }}>
                        {new Date(ticket.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}