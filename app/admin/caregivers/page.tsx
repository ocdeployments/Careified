// Force dynamic rendering to avoid build-time DB queries
export const dynamic = 'force-dynamic'

import { pool } from '@/lib/db'
import { Suspense } from 'react'
import { Search, Filter, Edit, X, Check } from 'lucide-react'

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

async function getCaregivers(search = '', status = '') {
  let query = 'SELECT id, first_name, last_name, email, phone, status, is_verified, created_at FROM caregivers'
  const params: string[] = []
  const conditions: string[] = []

  if (search) {
    conditions.push(`(LOWER(first_name) LIKE LOWER($1) OR LOWER(last_name) LIKE LOWER($1) OR LOWER(email) LIKE LOWER($1))`)
    params.push(`%${search}%`)
  }

  if (status && status !== 'all') {
    conditions.push(`status = $${params.length + 1}`)
    params.push(status)
  }

  if (conditions.length > 0) {
    query += ' WHERE ' + conditions.join(' AND ')
  }

  query += ' ORDER BY created_at DESC LIMIT 100'

  const { rows } = await pool.query(query, params)
  return rows
}

export default async function AdminCaregiversPage({
  searchParams,
}: {
  searchParams: { search?: string; status?: string }
}) {
  const search = searchParams.search || ''
  const status = searchParams.status || ''
  const caregivers = await getCaregivers(search, status)

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
      <form style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
          <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
          <input
            type="text"
            name="search"
            defaultValue={search}
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
            name="status"
            defaultValue={status}
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
        <button
          type="submit"
          style={{
            padding: '12px 24px',
            background: '#0D1B3E',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Search
        </button>
      </form>

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
                      data-caregiver={JSON.stringify(c)}
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
                      onClick={(e) => {
                        const data = JSON.parse(e.currentTarget.dataset.caregiver || '{}')
                        window.dispatchEvent(new CustomEvent('openEditModal', { detail: data }))
                      }}
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
      <EditModal />
    </div>
  )
}

function EditModal() {
  return (
    <script dangerouslySetInnerHTML={{
      __html: `
        document.addEventListener('DOMContentLoaded', function() {
          let modal = null
          
          window.addEventListener('openEditModal', function(e) {
            const c = e.detail
            if (!modal) {
              modal = document.createElement('div')
              modal.id = 'edit-modal'
              modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:9999'
              document.body.appendChild(modal)
            }
            modal.innerHTML = '<div style="background:white;padding:32px;border-radius:16px;width:100%;max-width:500px;max-height:90vh;overflow:auto">' +
              '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:24px">' +
                '<h2 style="font-family:DM Serif Display,serif;font-size:20px;color:#0D1B3E;margin:0">Edit Caregiver</h2>' +
                '<button id="close-modal" style="background:none;border:none;cursor:pointer;padding:4px"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#64748B" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg></button>' +
              '</div>' +
              '<form id="edit-form">' +
                '<input type="hidden" name="id" value="' + c.id + '">' +
                '<div style="margin-bottom:16px">' +
                  '<label style="display:block;font-size:13px;font-weight:600;color:#0D1B3E;margin-bottom:8px">First Name</label>' +
                  '<input type="text" name="first_name" value="' + (c.first_name || '') + '" style="width:100%;padding:12px;border:1px solid #E2E8F0;border-radius:8px;font-size:14px;box-sizing:border-box">' +
                '</div>' +
                '<div style="margin-bottom:16px">' +
                  '<label style="display:block;font-size:13px;font-weight:600;color:#0D1B3E;margin-bottom:8px">Last Name</label>' +
                  '<input type="text" name="last_name" value="' + (c.last_name || '') + '" style="width:100%;padding:12px;border:1px solid #E2E8F0;border-radius:8px;font-size:14px;box-sizing:border-box">' +
                '</div>' +
                '<div style="margin-bottom:16px">' +
                  '<label style="display:block;font-size:13px;font-weight:600;color:#0D1B3E;margin-bottom:8px">Email</label>' +
                  '<input type="email" name="email" value="' + (c.email || '') + '" style="width:100%;padding:12px;border:1px solid #E2E8F0;border-radius:8px;font-size:14px;box-sizing:border-box">' +
                '</div>' +
                '<div style="margin-bottom:16px">' +
                  '<label style="display:block;font-size:13px;font-weight:600;color:#0D1B3E;margin-bottom:8px">Phone</label>' +
                  '<input type="text" name="phone" value="' + (c.phone || '') + '" style="width:100%;padding:12px;border:1px solid #E2E8F0;border-radius:8px;font-size:14px;box-sizing:border-box">' +
                '</div>' +
                '<div style="margin-bottom:24px">' +
                  '<label style="display:block;font-size:13px;font-weight:600;color:#0D1B3E;margin-bottom:8px">Status</label>' +
                  '<select name="status" style="width:100%;padding:12px;border:1px solid #E2E8F0;border-radius:8px;font-size:14px;box-sizing:border-box;background:white">' +
                    '<option value="active"' + (c.status === 'active' ? ' selected' : '') + '>Active</option>' +
                    '<option value="pending"' + (c.status === 'pending' ? ' selected' : '') + '>Pending</option>' +
                    '<option value="inactive"' + (c.status === 'inactive' ? ' selected' : '') + '>Inactive</option>' +
                  '</select>' +
                '</div>' +
                '<div style="display:flex;gap:12px">' +
                  '<button type="submit" style="flex:1;padding:14px;background:#C9A84C;color:#0D1B3E;border:none;border-radius:8px;font-size:14px;font-weight:600;cursor:pointer">Save Changes</button>' +
                  '<button type="button" id="cancel-modal" style="padding:14px 24px;background:white;border:1px solid #E2E8F0;border-radius:8px;font-size:14px;color:#64748B;cursor:pointer">Cancel</button>' +
                '</div>' +
              '</form>' +
            '</div>'
            modal.style.display = 'flex'
            
            document.getElementById('close-modal').onclick = function() { modal.style.display = 'none' }
            document.getElementById('cancel-modal').onclick = function() { modal.style.display = 'none' }
            modal.onclick = function(e) { if (e.target === modal) modal.style.display = 'none' }
            
            document.getElementById('edit-form').onsubmit = async function(e) {
              e.preventDefault()
              const formData = new FormData(e.target)
              const data = Object.fromEntries(formData)
              
              const res = await fetch('/api/admin/caregivers', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
              })
              
              if (res.ok) {
                modal.style.display = 'none'
                location.reload()
              } else {
                alert('Failed to update caregiver')
              }
            }
          })
        })
      `
    }} />
  )
}
