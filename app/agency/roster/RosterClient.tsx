'use client'

import { useState, useRef } from 'react'
import { Upload, Users, RefreshCw, Trash2, Eye, Check, Clock, AlertCircle, X } from 'lucide-react'

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

export default function RosterClient({ agencyId, agencyName, caregivers: initialCaregivers, totalCount }: RosterClientProps) {
  const [caregivers, setCaregivers] = useState(initialCaregivers)
  const [uploadMode, setUploadMode] = useState<'upload' | 'manual' | null>(null)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [parsing, setParsing] = useState(false)
  const [parsedData, setParsedData] = useState<any>(null)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    jobTitle: '',
  })
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      setError('File too large — max 5MB')
      return
    }

    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    if (!allowedTypes.includes(file.type)) {
      setError('Invalid file type — PDF, DOC, or DOCX only')
      return
    }

    setUploadedFile(file)
    setParsing(true)
    setError(null)

    try {
      const formDataObj = new FormData()
      formDataObj.append('resume', file)

      const res = await fetch('/api/agency/roster/upload', {
        method: 'POST',
        body: formDataObj,
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Failed to parse resume')
      }

      setParsedData(data.data || data)
    } catch (err: any) {
      setError(err.message)
      setUploadedFile(null)
    } finally {
      setParsing(false)
    }
  }

  const handleCreate = async () => {
    const data = parsedData || formData
    setSaving(true)
    setError(null)

    try {
      const res = await fetch('/api/agency/roster/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: data.firstName || data.first_name,
          lastName: data.lastName || data.last_name,
          email: data.email,
          phone: data.phone,
          city: data.city,
          yearsExperience: data.yearsExperience || data.years_experience,
          jobTitle: data.jobTitle || data.job_title,
        }),
      })

      const result = await res.json()
      if (!res.ok) {
        throw new Error(result.error || 'Failed to create caregiver')
      }

      // Auto-invite after create
      await fetch('/api/agency/roster/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ caregiverId: result.caregiverId }),
      })

      const firstName = data.firstName || data.first_name || result.firstName
      setSuccess(`${firstName} added. Invitation sent to ${result.email}`)

      // Reset form
      setUploadedFile(null)
      setParsedData(null)
      setFormData({ firstName: '', lastName: '', email: '', phone: '', jobTitle: '' })
      setUploadMode(null)

      // Refresh page to show new caregiver
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

      if (res.ok) {
        setSuccess('Invitation resent')
        setTimeout(() => setSuccess(null), 3000)
      }
    } catch {
      setError('Failed to resend invitation')
    }
  }

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { bg: string, color: string, label: string }> = {
      stub: { bg: '#E2E8F0', color: '#4A5568', label: 'Stub' },
      invited: { bg: '#DBEAFE', color: '#1E40AF', label: 'Invited' },
      incomplete: { bg: '#FEF3C7', color: '#92400E', label: 'Incomplete' },
      complete: { bg: '#D1FAE5', color: '#065F46', label: 'Complete' },
      active: { bg: '#FDE68A', color: '#92400E', label: 'Active' },
    }
    const b = badges[status] || badges.stub
    return (
      <span style={{
        background: b.bg,
        color: b.color,
        padding: '4px 10px',
        borderRadius: 12,
        fontSize: 12,
        fontWeight: 600
      }}>
        {b.label}
      </span>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      {success && (
        <div style={{
          background: '#D1FAE5',
          color: '#065F46',
          padding: '16px 20px',
          borderRadius: 8,
          display: 'flex',
          alignItems: 'center',
          gap: 12
        }}>
          <Check size={20} />
          {success}
        </div>
      )}

      {error && (
        <div style={{
          background: '#FEE2E2',
          color: '#991B1B',
          padding: '16px 20px',
          borderRadius: 8,
          display: 'flex',
          alignItems: 'center',
          gap: 12
        }}>
          <AlertCircle size={20} />
          {error}
          <button onClick={() => setError(null)} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>
      )}

      <div style={{ background: 'white', borderRadius: 16, padding: 32, border: '1px solid #E2E8F0' }}>
        <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 24, color: N, margin: '0 0 24px' }}>
          Add caregiver
        </h2>

        {!uploadMode ? (
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            <div
              onClick={() => fileInputRef.current?.click()}
              style={{
                flex: 1,
                minWidth: 280,
                border: '2px dashed #E2E8F0',
                borderRadius: 12,
                padding: 40,
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'border-color 0.2s, background 0.2s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = G; e.currentTarget.style.background = '#FDF6EC' }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#E2E8F0'; e.currentTarget.style.background = 'white' }}
            >
              <Upload size={40} color={G} style={{ marginBottom: 16 }} />
              <p style={{ fontSize: 16, fontWeight: 600, color: N, margin: '0 0 8px' }}>
                Upload resume
              </p>
              <p style={{ fontSize: 14, color: '#718096', margin: 0 }}>
                PDF, DOC, DOCX — max 5MB
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleFileUpload}
                style={{ display: 'none' }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', color: '#CBD5E0', fontSize: 14 }}>
              or
            </div>

            <div
              onClick={() => setUploadMode('manual')}
              style={{
                flex: 1,
                minWidth: 280,
                border: '2px solid #E2E8F0',
                borderRadius: 12,
                padding: 40,
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'border-color 0.2s',
              }}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = G}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = '#E2E8F0'}
            >
              <Users size={40} color={N} style={{ marginBottom: 16 }} />
              <p style={{ fontSize: 16, fontWeight: 600, color: N, margin: '0 0 8px' }}>
                Add manually
              </p>
              <p style={{ fontSize: 14, color: '#718096', margin: 0 }}>
                No resume? Enter details manually
              </p>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {parsing && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: '#718096' }}>
                <RefreshCw size={20} className="animate-spin" />
                Parsing resume...
              </div>
            )}

            {parsedData && !parsing && (
              <div style={{ background: '#FDF6EC', borderRadius: 12, padding: 24, border: '1px solid #E8B86D' }}>
                <p style={{ fontSize: 14, fontWeight: 600, color: N, margin: '0 0 16px' }}>
                  Review parsed data (edit if needed):
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
                  {['firstName', 'lastName', 'email', 'phone', 'city', 'jobTitle', 'yearsExperience'].map(field => (
                    <div key={field}>
                      <label style={{ display: 'block', fontSize: 12, color: '#718096', marginBottom: 4, textTransform: 'capitalize' }}>
                        {field.replace(/([A-Z])/g, ' $1').trim()}
                      </label>
                      <input
                        type="text"
                        value={parsedData[field] || ''}
                        onChange={(e) => setParsedData({ ...parsedData, [field]: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          border: '1px solid #E2E8F0',
                          borderRadius: 8,
                          fontSize: 14,
                          fontFamily: S,
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {uploadMode === 'manual' && !parsedData && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
                {['firstName', 'lastName', 'email', 'phone', 'jobTitle'].map(field => (
                  <div key={field}>
                    <label style={{ display: 'block', fontSize: 12, color: '#718096', marginBottom: 4, textTransform: 'capitalize' }}>
                      {field.replace(/([A-Z])/g, ' $1').trim()} *
                    </label>
                    <input
                      type={field === 'email' ? 'email' : 'text'}
                      value={formData[field as keyof typeof formData]}
                      onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
                      required={field === 'firstName' || field === 'lastName' || field === 'email'}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        border: '1px solid #E2E8F0',
                        borderRadius: 8,
                        fontSize: 14,
                        fontFamily: S,
                      }}
                    />
                  </div>
                ))}
              </div>
            )}

            <div style={{ display: 'flex', gap: 12 }}>
              <button
                onClick={handleCreate}
                disabled={saving || (uploadMode === 'manual' && !formData.email)}
                style={{
                  padding: '14px 28px',
                  background: saving ? '#CBD5E0' : `linear-gradient(135deg, ${G}, #E8B86D})`,
                  color: N,
                  fontWeight: 600,
                  border: 'none',
                  borderRadius: 8,
                  cursor: saving ? 'not-allowed' : 'pointer',
                  fontSize: 16,
                }}
              >
                {saving ? 'Adding...' : 'Add to roster and invite caregiver'}
              </button>
              <button
                onClick={() => { setUploadMode(null); setUploadedFile(null); setParsedData(null); setFormData({ firstName: '', lastName: '', email: '', phone: '', jobTitle: '' }) }}
                style={{
                  padding: '14px 28px',
                  background: 'transparent',
                  color: '#718096',
                  fontWeight: 600,
                  border: '1px solid #E2E8F0',
                  borderRadius: 8,
                  cursor: 'pointer',
                  fontSize: 16,
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      <div style={{ background: 'white', borderRadius: 16, padding: 32, border: '1px solid #E2E8F0' }}>
        <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 24, color: N, margin: '0 0 24px' }}>
          Current roster ({totalCount})
        </h2>

        {caregivers.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 24px' }}>
            <Users size={48} color="#CBD5E0" style={{ marginBottom: 16 }} />
            <p style={{ fontSize: 16, color: '#718096', margin: '0 0 16px' }}>
              Your roster is empty. Add your first caregiver to get started.
            </p>
            <button
              onClick={() => setUploadMode('upload')}
              style={{
                padding: '12px 24px',
                background: `linear-gradient(135deg, ${G}, #E8B86D})`,
                color: N,
                fontWeight: 600,
                border: 'none',
                borderRadius: 8,
                cursor: 'pointer',
                fontSize: 16,
              }}
            >
              Add caregiver →
            </button>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #E2E8F0' }}>
                <th style={{ textAlign: 'left', padding: '12px 16px', fontSize: 12, color: '#718096', textTransform: 'uppercase' }}>Name</th>
                <th style={{ textAlign: 'left', padding: '12px 16px', fontSize: 12, color: '#718096', textTransform: 'uppercase' }}>Role</th>
                <th style={{ textAlign: 'left', padding: '12px 16px', fontSize: 12, color: '#718096', textTransform: 'uppercase' }}>Status</th>
                <th style={{ textAlign: 'left', padding: '12px 16px', fontSize: 12, color: '#718096', textTransform: 'uppercase' }}>Added</th>
                <th style={{ textAlign: 'right', padding: '12px 16px', fontSize: 12, color: '#718096', textTransform: 'uppercase' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {caregivers.map((cg) => (
                <tr key={cg.id} style={{ borderBottom: '1px solid #E2E8F0' }}>
                  <td style={{ padding: '16px' }}>
                    <div style={{ fontWeight: 600, color: N }}>
                      {cg.first_name} {cg.last_name}
                    </div>
                    <div style={{ fontSize: 13, color: '#718096' }}>
                      {cg.email}
                    </div>
                  </td>
                  <td style={{ padding: '16px', color: '#4A5568' }}>
                    {cg.job_title || '—'}
                  </td>
                  <td style={{ padding: '16px' }}>
                    {getStatusBadge(cg.profile_status)}
                  </td>
                  <td style={{ padding: '16px', color: '#718096', fontSize: 14 }}>
                    {new Date(cg.created_at).toLocaleDateString()}
                  </td>
                  <td style={{ padding: '16px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                      {(cg.profile_status === 'invited' || cg.profile_status === 'incomplete') && (
                        <button
                          onClick={() => handleResendInvite(cg.id)}
                          title="Resend invite"
                          style={{
                            padding: 8,
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: '#718096',
                          }}
                        >
                          <RefreshCw size={18} />
                        </button>
                      )}
                      {(cg.profile_status === 'complete' || cg.profile_status === 'active') && (
                        <a
                          href={`/profile/${cg.id}`}
                          target="_blank"
                          title="View profile"
                          style={{
                            padding: 8,
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: '#718096',
                            textDecoration: 'none',
                          }}
                        >
                          <Eye size={18} />
                        </a>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
