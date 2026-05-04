'use client'
import Link from 'next/link'
import { Users, Plus, MapPin, Clock } from 'lucide-react'
import { DEMO_CLIENTS } from '@/lib/demo'

const STATUS_STYLES: Record<string, { bg: string; color: string; border: string }> = {
  active:   { bg: '#F0FDF4', color: '#16A34A', border: '#BBF7D0' },
  pending:  { bg: '#FEF3C7', color: '#D97706', border: '#FDE68A' },
  matched:  { bg: '#EFF6FF', color: '#2563EB', border: '#BFDBFE' },
  closed:   { bg: '#F1F5F9', color: '#64748B', border: '#E2E8F0' },
}

export default function DemoClientsPage() {
  const clients = DEMO_CLIENTS

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#0D1B3E', fontFamily: 'DM Serif Display, serif', marginBottom: '4px' }}>
            Clients
          </h1>
          <p style={{ fontSize: '14px', color: '#64748B' }}>Manage client intakes and view matches</p>
        </div>
        <Link
          href="/demo/clients/new"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: '#C9973A',
            color: '#0D1B3E',
            padding: '10px 16px',
            borderRadius: '8px',
            fontWeight: '600',
            fontSize: '14px',
            textDecoration: 'none',
          }}
        >
          <Plus size={18} />
          New Client
        </Link>
      </div>

      {/* Clients grid */}
      <div style={{ display: 'grid', gap: '16px' }}>
        {clients.map((client: any) => {
          const statusStyle = STATUS_STYLES[client.status] || STATUS_STYLES.pending
          return (
            <Link
              key={client.id}
              href={`/demo/clients/${client.id}`}
              style={{
                display: 'block',
                backgroundColor: '#fff',
                borderRadius: '16px',
                border: '1px solid #E2E8F0',
                padding: '20px',
                textDecoration: 'none',
                transition: 'all 0.15s',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '10px',
                      backgroundColor: '#FDF6EC',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      <Users size={20} color="#C9973A" />
                    </div>
                    <div>
                      <div style={{ fontSize: '16px', fontWeight: '600', color: '#0D1B3E' }}>
                        {client.clientFirstName}
                      </div>
                      <div style={{ fontSize: '13px', color: '#64748B' }}>{client.primaryCondition}</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '16px', marginTop: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', color: '#64748B' }}>
                      <MapPin size={14} />
                      {client.city}, {client.state}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', color: '#64748B' }}>
                      <Clock size={14} />
                      {client.hoursPerWeek}h/week
                    </div>
                    <div style={{ fontSize: '13px', color: '#64748B' }}>
                      {client.careIntensity} intensity
                    </div>
                  </div>
                </div>

                <div style={{
                  padding: '4px 10px',
                  borderRadius: '999px',
                  fontSize: '12px',
                  fontWeight: '600',
                  backgroundColor: statusStyle.bg,
                  color: statusStyle.color,
                  border: `1px solid ${statusStyle.border}`,
                }}>
                  {client.status === 'active' ? 'Active' : client.status}
                </div>
              </div>
            </Link>
          )
        })}
      </div>

      {/* Demo notice */}
      <div style={{ marginTop: '24px', padding: '16px', backgroundColor: '#FEF3C7', borderRadius: '12px', textAlign: 'center' }}>
        <span style={{ fontSize: '13px', color: '#92400E' }}>
          Showing demo clients. In production, this list would show your agency's clients.
        </span>
      </div>
    </div>
  )
}