'use client'

import { Suspense } from 'react'
import { Search, Filter, Edit, X, Check } from 'lucide-react'
import { useState, useEffect } from 'react'

interface Caregiver {
  id: string
  first_name: string
  last_name: string
  email: string
  phone: string
  status: string
  is_verified: boolean
  created_at: string
}

export default function AdminCaregiversPage() {
  const [caregivers, setCaregivers] = useState<Caregiver[]>([])
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [editingCaregiver, setEditingCaregiver] = useState<Caregiver | null>(null)

  useEffect(() => {
    fetchCaregivers()
  }, [search, status])

  async function fetchCaregivers() {
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (status) params.set('status', status)
    const res = await fetch(`/api/admin/caregivers?${params}`)
    if (res.ok) {
      const data = await res.json()
      setCaregivers(data)
    }
  }

  return (
    <div>
      <h1 style={{
        fontFamily: "'DM Serif Display', Georgia, serif",
        fontSize: '28px',
        color: '#0D1B3E',
        marginBottom: '8px',
      }}>
        Caregiver Management
      </h1>
      <p style={{ color: '#64748B', marginBottom: '32px' }}>
        Search, filter, and manage caregiver profiles
      </p>

      {/* Search & Filter */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
          <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email..."
            style={{
              width: '100%',
              padding: '12px 12px 12px 44px',
              border: '1px solid #E2E8F0',
              borderRadius: '8px',
              fontSize: '14px',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>
        <div style={{ position: 'relative' }}>
          <Filter size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            style={{
              padding: '12px 12px 12px 44px',
              border: '1px solid #E2E8F0',
              borderRadius: '8px',
              fontSize: '14px',
              outline: 'none',
              background: 'white',
              minWidth: '180px',
            }}
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
        </div>

      {/* Results Table */}
      <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
              <th style={{ textAlign: 'left', padding: '14px 16px', fontSize: '12px', color: '#64748B', textTransform: 'uppercase' }}>Name</th>
              <th style={{ textAlign: 'left', padding: '14px 16px', fontSize: '12px', color: '#64748B', textTransform: 'uppercase' }}>Email</th>
              <th style={{ textAlign: 'left', padding: '14px 16px', fontSize: '12px', color: '#64748B', textTransform: 'uppercase' }}>Phone</th>
              <th style={{ textAlign: 'left', padding: '14px 16px', fontSize: '12px', color: '#64748B', textTransform: 'uppercase' }}>Status</th>
              <th style={{ textAlign: 'left', padding: '14px 16px', fontSize: '12px', color: '#64748B', textTransform: 'uppercase' }}>Verified</th>
              <th style={{ textAlign: 'left', padding: '14px 16px', fontSize: '12px', color: '#64748B', textTransform: 'uppercase' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {caregivers.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: '40px', textAlign: 'center', color: '#94A3B8' }}>
                  No caregivers found
                </td>
              </tr>
            ) : (
              caregivers.map((c: any) => (
                <tr key={c.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                  <td style={{ padding: '14px 16px', fontSize: '14px', color: '#0D1B3E', fontWeight: 500 }}>
                    {c.first_name} {c.last_name}
                  </td>
                  <td style={{ padding: '14px 16px', fontSize: '14px', color: '#64748B' }}>{c.email || '-'}</td>
                  <td style={{ padding: '14px 16px', fontSize: '14px', color: '#64748B' }}>{c.phone || '-'}</td>
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{
                      display: 'inline-block',
                      padding: '4px 10px',
                      borderRadius: '9999px',
                      fontSize: '12px',
                      fontWeight: 500,
                      background: c.status === 'active' ? '#DCFCE7' : c.status === 'pending' ? '#FEF3C7' : '#F1F5F9',
                      color: c.status === 'active' ? '#166534' : c.status === 'pending' ? '#92400E' : '#64748B',
                    }}>
                      {c.status || 'pending'}
                    </span>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    {c.is_verified ? (
                      <span style={{ color: '#10B981', fontSize: '14px' }}>Verified</span>
                    ) : (
                      <span style={{ color: '#94A3B8', fontSize: '14px' }}>Pending</span>
                    )}
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <button
                      type="button"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '8px 12px',
                        background: 'white',
                        border: '1px solid #E2E8F0',
                        borderRadius: '6px',
                        fontSize: '13px',
                        color: '#0D1B3E',
                        cursor: 'pointer',
                      }}
                      onClick={() => setEditingCaregiver(c)}
                    >
                      <Edit size={14} />
                      Edit
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <p style={{ marginTop: '16px', fontSize: '13px', color: '#94A3B8' }}>
        Showing {caregivers.length} caregivers
      </p>

      {/* Edit Modal - Client Component */}
      <EditModal caregiver={editingCaregiver} onClose={() => setEditingCaregiver(null)} />
    </div>
  )
}

function EditModal({ caregiver, onClose }: { caregiver: Caregiver | null; onClose: () => void }) {
  const [saving, setSaving] = useState(false)

  if (!caregiver) return null

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSaving(true)
    const formData = new FormData(e.currentTarget)
    const data = Object.fromEntries(formData)
    const res = await fetch('/api/admin/caregivers', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (res.ok) {
      window.location.reload()
    } else {
      alert('Failed to update caregiver')
      setSaving(false)
    }
  }

  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 99 }}
      onClick={onClose}
    >
      <div style={{ background: 'white', padding: '32px', borderRadius: '16px', width: '100%', maxWidth: '500px', maxHeight: '90vh', overflow: 'auto' }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: '20px', color: '#0D1B3E', margin: 0 }}>Edit Caregiver</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}><X size={20} color="#64748B" /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <input type="hidden" name="id" value={caregiver.id} />
          <div style={{ marginBottom: '16px' }}><label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#0D1B3E', marginBottom: '8px' }}>First Name</label><input type="text" name="first_name" defaultValue={caregiver.first_name} style={{ width: '100%', padding: '12px', border: '1px solid #E2E8F0', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' }} /></div>
          <div style={{ marginBottom: '16px' }}><label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#0D1B3E', marginBottom: '8px' }}>Last Name</label><input type="text" name="last_name" defaultValue={caregiver.last_name} style={{ width: '100%', padding: '12px', border: '1px solid #E2E8F0', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' }} /></div>
          <div style={{ marginBottom: '16px' }}><label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#0D1B3E', marginBottom: '8px' }}>Email</label><input type="email" name="email" defaultValue={caregiver.email} style={{ width: '100%', padding: '12px', border: '1px solid #E2E8F0', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' }} /></div>
          <div style={{ marginBottom: '16px' }}><label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#0D1B3E', marginBottom: '8px' }}>Phone</label><input type="text" name="phone" defaultValue={caregiver.phone} style={{ width: '100%', padding: '12px', border: '1px solid #E2E8F0', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' }} /></div>
          <div style={{ marginBottom: '24px' }}><label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#0D1B3E', marginBottom: '8px' }}>Status</label><select name="status" defaultValue={caregiver.status} style={{ width: '100%', padding: '12px', border: '1px solid #E2E8F0', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box', background: 'white' }}><option value="active">Active</option><option value="pending">Pending</option><option value="inactive">Inactive</option></select></div>
          <div style={{ display: 'flex', gap: '12px' }}><button type="submit" disabled={saving} style={{ flex: 1, padding: '14px', background: '#C9A84C', color: '#0D1B3E', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer' }}>{saving ? 'Saving...' : 'Save Changes'}</button><button type="button" onClick={onClose} style={{ padding: '14px 24px', background: 'white', border: '1px solid #E2E8F0', borderRadius: '8px', fontSize: '14px', color: '#64748B', cursor: 'pointer' }}>Cancel</button></div>
        </form>
      </div>
    </div>
  )
}
