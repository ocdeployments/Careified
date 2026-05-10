'use client'

import { useState, useRef } from 'react'
import { Upload, Users, FileText, Plus, RefreshCw, Eye, Trash2, Loader2 } from 'lucide-react'

interface Caregiver {
  id: string
  first_name: string
  last_name: string
  email: string
  phone?: string
  city?: string
  job_title?: string
  years_experience?: number
  profile_status: string
  created_at: string
  claim_token_expires_at?: string
}

interface Agency {
  id: string
  name: string
}

interface RosterClientProps {
  agencyId: string
  agencyName: string
  caregivers: Caregiver[]
  totalCount: number
}

const N = '#0D1B3E'
const G = '#C9973A'
const S = "'DM Sans', sans-serif"

const STATUS_BADGES: Record<string, { bg: string; color: string; label: string }> = {
  stub: { bg: '#F1F5F9', color: '#64748B', label: 'Stub' },
  invited: { bg: '#DBEAFE', color: '#1D4ED8', label: 'Invited' },
  incomplete: { bg: '#FEF3C7', color: '#D97706', label: 'Incomplete' },
  complete: { bg: '#DCFCE7', color: '#16A34A', label: 'Complete' },
  active: { bg: '#FDF6EC', color: '#C9973A', label: 'Active' },
}

export default function RosterClient({ agencyId, agencyName, caregivers, totalCount }: RosterClientProps) {
  const [roster, setRoster] = useState<Caregiver[]>(caregivers)
  const [showManualForm, setShowManualForm] = useState(false)
  const [uploadedData, setUploadedData] = useState<any>(null)
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  const [viewMode, setViewMode] = useState<'upload' | 'manual'>('upload')
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Manual form state
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    jobTitle: '',
    city: '',
    yearsExperience: '',
  })

  // Editable parsed data
  const [editData, setEditData] = useState<any>({})

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    setError('')
    setSuccess('')

    try {
      const formData = new FormData()
      formData.append('resume', file)

      const res = await fetch('/api/agency/roster/upload', {
        method: 'POST',
        body: formData,
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Upload failed')
      }

      setUploadedData(data.data)
      setEditData({
        firstName: data.data.firstName || '',
        lastName: data.data.lastName || '',
        email: data.data.email || '',
        phone: data.data.phone || '',
        city: data.data.city || '',
        yearsExperience: data.data.yearsExperience?.toString() || '',
        jobTitle: data.data.jobTitle || '',
      })
    } catch (err: any) {
      setError(err.message)
    } finally {
      setUploading(false)
    }
  }

  const handleCreateAndInvite = async () => {
    setSaving(true)
    setError('')
    setSuccess('')

    try {
      // Create stub caregiver
      const createRes = await fetch('/api/agency/roster/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: editData.firstName,
          lastName: editData.lastName,
          email: editData.email,
          phone: editData.phone,
          city: editData.city,
          yearsExperience: editData.yearsExperience ? parseInt(editData.yearsExperience) : null,
          jobTitle: editData.jobTitle,
        }),
      })

      const createData = await createRes.json()
      if (!createRes.ok) throw new Error(createData.error || 'Failed to create')

      // Send invite
      const inviteRes = await fetch('/api/agency/roster/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ caregiverId: createData.caregiverId }),
      })

      const inviteData = await inviteRes.json()
      if (!inviteRes.ok) throw new Error(inviteData.error || 'Failed to send invite')

      setSuccess(`${editData.firstName} ${editData.lastName} added. Invitation sent to ${editData.email}`)
      
      // Refresh roster
      window.location.reload()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleManualSubmit = async () => {
    if (!formData.firstName || !formData.lastName || !formData.email) {
      setError('First name, last name, and email are required')
      return
    }

    setSaving(true)
    setError('')
    setSuccess('')

    try {
      const createRes = await fetch('/api/agency/roster/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          jobTitle: formData.jobTitle,
          city: formData.city,
          yearsExperience: formData.yearsExperience ? parseInt(formData.yearsExperience) : null,
        }),
      })

      const createData = await createRes.json()
      if (!createRes.ok) throw new Error(createData.error || 'Failed to create')

      const inviteRes = await fetch('/api/agency/roster/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ caregiverId: createData.caregiverId }),
      })

      if (!inviteRes.ok) throw new Error('Failed to send invite')

      setSuccess(`${formData.firstName} ${formData.lastName} added. Invitation sent to ${formData.email}`)
      setFormData({ firstName: '', lastName: '', email: '', phone: '', jobTitle: '', city: '', yearsExperience: '' })
      setShowManualForm(false)
      
      // Refresh roster
      window.location.reload()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleResendInvite = async (caregiverId: string) => {
    try {
      const res = await fetch('/api/agency/roster/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ caregiverId }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      
      setSuccess('Invitation resent')
      window.location.reload()
    } catch (err: any) {
      setError(err.message)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F7F4F0', fontFamily: S, padding: '32px 24px' }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 32, color: N, marginBottom: 8 }}>
            Agency Roster
          </h1>
          <p style={{ fontSize: 15, color: '#64748B' }}>
            Add your caregivers to Careified. Upload their resume and we&apos;ll fill in the details automatically.
          </p>
        </div>

        {/* Success/Error */}
        {success && (
          <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 8, padding: '12px 16px', marginBottom: 16, color: '#16A34A', fontSize: 14 }}>
            {success}
          </div>
        )}
        {error && (
          <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 8, padding: '12px 16px', marginBottom: 16, color: '#DC2626', fontSize: 14 }}>
            {error}
          </div>
        )}

        {/* SECTION 1: Add caregiver */}
        <div style={{ background: 'white', borderRadius: 16, border: '1px solid #E2E8F0', padding: 24, marginBottom: 24 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: N, marginBottom: 20 }}>Add caregiver</h2>

          {/* Mode toggle */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
            <button
              onClick={() => { setViewMode('upload'); setShowManualForm(false) }}
              style={{
                padding: '8px 16px',
                borderRadius: 8,
                border: 'none',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                background: viewMode === 'upload' ? G : '#F1F5F9',
                color: viewMode === 'upload' ? N : '#64748B',
              }}
            >
              <Upload size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />
              Upload resume
            </button>
            <button
              onClick={() => { setViewMode('manual'); setShowManualForm(true) }}
              style={{
                padding: '8px 16px',
                borderRadius: 8,
                border: 'none',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                background: viewMode === 'manual' ? G : '#F1F5F9',
                color: viewMode === 'manual' ? N : '#64748B',
              }}
            >
              <Plus size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />
              Add manually
            </button>
          </div>

          {/* Upload mode */}
          {viewMode === 'upload' && !uploadedData && (
            <div
              onClick={() => fileInputRef.current?.click()}
              style={{
                border: '2px dashed #E2E8F0',
                borderRadius: 12,
                padding: '40px 24px',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >
              <FileText size={32} style={{ color: '#94A3B8', marginBottom: 12 }} />
              <p style={{ fontSize: 14, color: '#64748B', marginBottom: 4 }}>
                Drag and drop resume here, or click to browse
              </p>
              <p style={{ fontSize: 12, color: '#94A3B8' }}>
                PDF, DOC, DOCX — max 5MB
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleFileUpload}
                style={{ display: 'none' }}
              />
              {uploading && (
                <div style={{ marginTop: 16 }}>
                  <Loader2 size={20} style={{ color: G, animation: 'spin 1s linear infinite' }} />
                  <p style={{ fontSize: 12, color: '#64748B', marginTop: 8 }}>Parsing resume...</p>
                </div>
              )}
            </div>
          )}

          {/* Review form */}
          {uploadedData && (
            <div>
              <p style={{ fontSize: 13, color: '#64748B', marginBottom: 16 }}>
                Review and edit the extracted information:
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                {[
                  { key: 'firstName', label: 'First name' },
                  { key: 'lastName', label: 'Last name' },
                  { key: 'email', label: 'Email' },
                  { key: 'phone', label: 'Phone' },
                  { key: 'city', label: 'City' },
                  { key: 'yearsExperience', label: 'Years experience', type: 'number' },
                  { key: 'jobTitle', label: 'Role' },
                ].map(field => (
                  <div key={field.key}>
                    <label style={{ fontSize: 12, color: '#64748B', display: 'block', marginBottom: 4 }}>
                      {field.label}
                    </label>
                    <input
                      type={field.type || 'text'}
                      value={editData[field.key] || ''}
                      onChange={(e) => setEditData({ ...editData, [field.key]: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: 8,
                        border: '1px solid #E2E8F0',
                        fontSize: 14,
                        fontFamily: S,
                      }}
                    />
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 20, display: 'flex', gap: 12 }}>
                <button
                  onClick={handleCreateAndInvite}
                  disabled={saving}
                  style={{
                    padding: '12px 24px',
                    background: saving ? '#94A3B8' : `linear-gradient(135deg, ${G}, #E8B86D)`,
                    color: N,
                    border: 'none',
                    borderRadius: 8,
                    fontSize: 14,
                    fontWeight: 700,
                    cursor: saving ? 'not-allowed' : 'pointer',
                  }}
                >
                  {saving ? 'Processing...' : 'Add to roster and invite caregiver'}
                </button>
                <button
                  onClick={() => { setUploadedData(null); setEditData({}) }}
                  style={{
                    padding: '12px 24px',
                    background: 'transparent',
                    color: '#64748B',
                    border: '1px solid #E2E8F0',
                    borderRadius: 8,
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Manual form */}
          {showManualForm && (
            <div>
              <p style={{ fontSize: 13, color: '#64748B', marginBottom: 16 }}>
                Enter caregiver details manually:
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                {[
                  { key: 'firstName', label: 'First name *' },
                  { key: 'lastName', label: 'Last name *' },
                  { key: 'email', label: 'Email *' },
                  { key: 'phone', label: 'Phone' },
                  { key: 'jobTitle', label: 'Role' },
                  { key: 'city', label: 'City' },
                ].map(field => (
                  <div key={field.key}>
                    <label style={{ fontSize: 12, color: '#64748B', display: 'block', marginBottom: 4 }}>
                      {field.label}
                    </label>
                    <input
                      type="text"
                      value={formData[field.key as keyof typeof formData]}
                      onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: 8,
                        border: '1px solid #E2E8F0',
                        fontSize: 14,
                        fontFamily: S,
                      }}
                    />
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 20 }}>
                <button
                  onClick={handleManualSubmit}
                  disabled={saving}
                  style={{
                    padding: '12px 24px',
                    background: saving ? '#94A3B8' : `linear-gradient(135deg, ${G}, #E8B86D)`,
                    color: N,
                    border: 'none',
                    borderRadius: 8,
                    fontSize: 14,
                    fontWeight: 700,
                    cursor: saving ? 'not-allowed' : 'pointer',
                  }}
                >
                  {saving ? 'Processing...' : 'Add to roster and invite caregiver'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* SECTION 2: Current roster */}
        <div style={{ background: 'white', borderRadius: 16, border: '1px solid #E2E8F0', overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #F1F5F9' }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: N }}>Current roster</h2>
          </div>

          {roster.length === 0 ? (
            <div style={{ padding: '40px 24px', textAlign: 'center' }}>
              <Users size={32} style={{ color: '#94A3B8', marginBottom: 12 }} />
              <p style={{ fontSize: 14, color: '#64748B', marginBottom: 8 }}>Your roster is empty</p>
              <p style={{ fontSize: 13, color: '#94A3B8' }}>Add your first caregiver to get started.</p>
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#F8FAFC' }}>
                  <th style={{ textAlign: 'left', padding: '12px 20px', fontSize: 11, color: '#64748B', textTransform: 'uppercase', letterSpacing: 0.5 }}>Name</th>
                  <th style={{ textAlign: 'left', padding: '12px 20px', fontSize: 11, color: '#64748B', textTransform: 'uppercase', letterSpacing: 0.5 }}>Role</th>
                  <th style={{ textAlign: 'left', padding: '12px 20px', fontSize: 11, color: '#64748B', textTransform: 'uppercase', letterSpacing: 0.5 }}>Status</th>
                  <th style={{ textAlign: 'left', padding: '12px 20px', fontSize: 11, color: '#64748B', textTransform: 'uppercase', letterSpacing: 0.5 }}>Invited</th>
                  <th style={{ textAlign: 'right', padding: '12px 20px', fontSize: 11, color: '#64748B', textTransform: 'uppercase', letterSpacing: 0.5 }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {roster.map(caregiver => {
                  const status = STATUS_BADGES[caregiver.profile_status] || STATUS_BADGES.stub
                  return (
                    <tr key={caregiver.id} style={{ borderTop: '1px solid #F1F5F9' }}>
                      <td style={{ padding: '14px 20px' }}>
                        <div style={{ fontSize: 14, fontWeight: 600, color: N }}>
                          {caregiver.first_name} {caregiver.last_name}
                        </div>
                        <div style={{ fontSize: 12, color: '#94A3B8' }}>{caregiver.email}</div>
                      </td>
                      <td style={{ padding: '14px 20px', fontSize: 13, color: '#64748B' }}>
                        {caregiver.job_title || '—'}
                      </td>
                      <td style={{ padding: '14px 20px' }}>
                        <span style={{
                          display: 'inline-block',
                          padding: '4px 10px',
                          borderRadius: 999,
                          fontSize: 11,
                          fontWeight: 700,
                          background: status.bg,
                          color: status.color,
                        }}>
                          {status.label}
                        </span>
                      </td>
                      <td style={{ padding: '14px 20px', fontSize: 12, color: '#64748B' }}>
                        {caregiver.created_at ? new Date(caregiver.created_at).toLocaleDateString() : '—'}
                      </td>
                      <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                        {(caregiver.profile_status === 'invited' || caregiver.profile_status === 'incomplete') && (
                          <button
                            onClick={() => handleResendInvite(caregiver.id)}
                            style={{
                              padding: '6px 12px',
                              background: 'transparent',
                              border: '1px solid #E2E8F0',
                              borderRadius: 6,
                              fontSize: 12,
                              color: '#64748B',
                              cursor: 'pointer',
                              marginRight: 8,
                            }}
                          >
                            <RefreshCw size={12} style={{ marginRight: 4, verticalAlign: 'middle' }} />
                            Resend
                          </button>
                        )}
                        {(caregiver.profile_status === 'complete' || caregiver.profile_status === 'active') && (
                          <a
                            href={`/profile/${caregiver.id}`}
                            target="_blank"
                            style={{
                              padding: '6px 12px',
                              background: 'transparent',
                              border: '1px solid #E2E8F0',
                              borderRadius: 6,
                              fontSize: 12,
                              color: '#64748B',
                              textDecoration: 'none',
                              cursor: 'pointer',
                            }}
                          >
                            <Eye size={12} style={{ marginRight: 4, verticalAlign: 'middle' }} />
                            View
                          </a>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <style jsx global>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
