'use client'

import { useState } from 'react'
import { useProfileForm } from '@/lib/context/ProfileFormContext'
import { useProfileSave } from '@/lib/hooks/useProfileSave'
import { Plus, X, ChevronDown, ChevronUp, Briefcase } from 'lucide-react'

const FONT_SANS = "'DM Sans', sans-serif"
const FONT_SERIF = "'DM Serif Display', serif"

type JobEntry = {
  id?: string
  organisation?: string
  employmentType?: string
  title?: string
  startMonth?: string
  startYear?: string
  endMonth?: string
  endYear?: string
  current?: boolean
  clientTypes?: string[]
  duties?: string
  reasonLeaving?: string
  supervisorName?: string
  supervisorContact?: string
  canContact?: boolean
}

const ORG_TYPES = [
  'Home care agency',
  'Retirement / long-term care facility',
  'Hospital',
  'Hospice',
  'Private family (direct hire)',
  'Group home',
  'Disability support organisation',
  'Mental health facility',
  'Paediatric care',
  'Other',
]

const CLIENT_TYPE_OPTIONS = [
  'Elderly (65+)',
  'Adults with disability',
  'Dementia / memory care',
  'Palliative / end-of-life',
  'Post-surgical recovery',
  'Mental health',
  'Acquired brain injury',
  'Paediatric / children',
]

const REASON_LEAVING_OPTIONS = [
  'Contract ended',
  'Sought better opportunity',
  'Relocated',
  'Personal / family reasons',
  'Facility closed',
  'Completed placement',
  'Prefer not to say',
]

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

const YEARS = Array.from({ length: 30 }, (_, i) => String(new Date().getFullYear() - i))

const MEMBERSHIP_OPTIONS = [
  'Personal Support Network (PSN)',
  'Canadian Nurses Association (CNA)',
  'Registered Nurses Association of Ontario (RNAO)',
  'American Nurses Association (ANA)',
  'National Association for Home Care (NAHC)',
  'Home Care Association of America (HCAOA)',
  'Other professional association',
]

const inputStyle: React.CSSProperties = {
  padding: '10px 14px',
  borderRadius: '10px',
  border: '1px solid #E2E8F0',
  fontSize: '13px',
  color: '#0D1B3E',
  width: '100%',
  boxSizing: 'border-box',
  fontFamily: FONT_SANS,
}

const selectStyle: React.CSSProperties = {
  ...inputStyle,
  appearance: 'none',
  backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2394A3B8' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E\")",
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'right 12px center',
  paddingRight: '36px',
}

export default function Step8WorkHistory() {
  const { formData } = useProfileForm()
  const { saveField } = useProfileSave()

  const [jobs, setJobs] = useState<JobEntry[]>(() => {
    const saved = formData.workHistory as JobEntry[] | undefined
    if (Array.isArray(saved) && saved.length > 0) return saved
    return []
  })

  const [expandedJob, setExpandedJob] = useState<number | null>(jobs.length === 0 ? null : 0)

  const addJob = () => {
    const newJob: JobEntry = {
      id: String(Date.now()),
      organisation: '', employmentType: '', title: '',
      startMonth: '', startYear: '', endMonth: '', endYear: '',
      current: false, clientTypes: [], duties: '',
      reasonLeaving: '', supervisorName: '',
      supervisorContact: '', canContact: true,
    }
    const updated = [...jobs, newJob]
    setJobs(updated)
    setExpandedJob(updated.length - 1)
    saveField('workHistory', updated)
  }

  const removeJob = (id: string) => {
    const updated = jobs.filter(j => j.id !== id)
    setJobs(updated)
    saveField('workHistory', updated)
  }

  const updateJob = (id: string, field: keyof JobEntry, value: unknown) => {
    const updated = jobs.map(j => j.id === id ? { ...j, [field]: value } : j)
    setJobs(updated)
    saveField('workHistory', updated)
  }

  const toggleClientType = (jobId: string, type: string) => {
    const job = jobs.find(j => j.id === jobId)
    if (!job) return
    const currentTypes = job.clientTypes || []
    const updated = currentTypes.includes(type)
      ? currentTypes.filter(t => t !== type)
      : [...currentTypes, type]
    updateJob(jobId, 'clientTypes', updated)
  }

  return (
    <div style={{ fontFamily: FONT_SANS, display: 'flex', flexDirection: 'column', gap: 32 }}>
      
      {/* Time estimate */}
      <div style={{ padding: '12px 16px', borderRadius: 10, background: '#F8FAFC', border: '1px solid #E2E8F0', fontSize: 12, color: '#64748B', display: 'flex', alignItems: 'center', gap: 8 }}>
        <Briefcase size={14} color="#94A3B8" />
        This section takes about 10-15 minutes. Your progress saves automatically as you go.
      </div>

      {/* SECTION 1: EMPLOYMENT HISTORY */}
      <div>
        <h3 style={{ fontSize: 15, fontWeight: 800, fontFamily: FONT_SERIF, color: '#0D1B3E', margin: '0 0 4px' }}>Employment history</h3>
        <p style={{ fontSize: 12, color: '#64748B', margin: '0 0 16px' }}>Add up to 5 previous or current employers. Most recent first.</p>

        {jobs.map((job, idx) => {
          const isOpen = expandedJob === idx
          const hasName = !!job.organisation

          return (
            <div key={job.id} style={{ border: '1px solid #E2E8F0', borderRadius: 14, overflow: 'hidden', marginBottom: 10 }}>
              {/* Card header */}
              <div onClick={() => setExpandedJob(isOpen ? null : idx)} style={{ padding: '14px 16px', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Briefcase size={14} color="#94A3B8" />
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#0D1B3E' }}>{hasName ? job.organisation : 'New employer'}</div>
                    {job.title && <div style={{ fontSize: 11, color: '#64748B' }}>{job.title}{job.startYear && ` - ${job.startYear}`}</div>}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {jobs.length > 1 && (
                    <button type="button" onClick={e => { e.stopPropagation(); removeJob(job.id || '') }} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: '#EF4444', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <X size={14} />
                    </button>
                  )}
                  {isOpen ? <ChevronUp size={16} color="#94A3B8" /> : <ChevronDown size={16} color="#94A3B8" />}
                </div>
              </div>

              {/* Expanded fields */}
              {isOpen && (
                <div style={{ padding: '20px 16px', background: '#F8FAFC', display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {/* Org name + type */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div>
                      <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#0D1B3E', marginBottom: 6 }}>Organisation name *</label>
                      <input type="text" value={job.organisation || ''} onChange={e => updateJob(job.id || '', 'organisation', e.target.value)} placeholder="e.g. Sunshine Home Care" maxLength={100} style={inputStyle} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#0D1B3E', marginBottom: 6 }}>Organisation type *</label>
                      <select value={job.employmentType || ''} onChange={e => updateJob(job.id || '', 'employmentType', e.target.value)} style={selectStyle}>
                        <option value="">Select type...</option>
                        {ORG_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                  </div>

                  {/* Job title */}
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#0D1B3E', marginBottom: 6 }}>Your job title *</label>
                    <input type="text" value={job.title || ''} onChange={e => updateJob(job.id || '', 'title', e.target.value)} placeholder="e.g. Personal Support Worker" maxLength={80} style={inputStyle} />
                  </div>

                  {/* Dates */}
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#0D1B3E', marginBottom: 6 }}>Dates of employment *</label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, alignItems: 'center' }}>
                      <select value={job.startMonth || ''} onChange={e => updateJob(job.id || '', 'startMonth', e.target.value)} style={selectStyle}>
                        <option value="">Month</option>
                        {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
                      </select>
                      <select value={job.startYear || ''} onChange={e => updateJob(job.id || '', 'startYear', e.target.value)} style={selectStyle}>
                        <option value="">Year</option>
                        {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                      </select>
                      <select value={job.endMonth || ''} disabled={job.current} onChange={e => updateJob(job.id || '', 'endMonth', e.target.value)} style={{ ...selectStyle, opacity: job.current ? 0.4 : 1 }}>
                        <option value="">Month</option>
                        {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
                      </select>
                      <select value={job.endYear || ''} disabled={job.current} onChange={e => updateJob(job.id || '', 'endYear', e.target.value)} style={{ ...selectStyle, opacity: job.current ? 0.4 : 1 }}>
                        <option value="">Year</option>
                        {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                      </select>
                    </div>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8, cursor: 'pointer', fontSize: 12, color: '#64748B' }}>
                      <input type="checkbox" checked={job.current || false} onChange={e => updateJob(job.id || '', 'current', e.target.checked)} style={{ accentColor: '#C9973A' }} />
                      This is my current role
                    </label>
                  </div>

                  {/* Client types */}
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#0D1B3E', marginBottom: 8 }}>Client types you worked with</label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {CLIENT_TYPE_OPTIONS.map(type => {
                        const selected = (job.clientTypes || []).includes(type)
                        return (
                          <button key={type} type="button" onClick={() => toggleClientType(job.id || '', type)} style={{
                            padding: '6px 12px', borderRadius: 999, fontSize: 11, fontWeight: selected ? 700 : 400, cursor: 'pointer',
                            border: selected ? '2px solid #C9973A' : '1px solid #E2E8F0',
                            background: selected ? '#FDF6EC' : 'white',
                            color: selected ? '#92400E' : '#64748B',
                            fontFamily: FONT_SANS,
                          }}>{type}</button>
                        )
                      })}
                    </div>
                  </div>

                  {/* Duties */}
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#0D1B3E', marginBottom: 6 }}>Key duties and responsibilities</label>
                    <textarea rows={3} maxLength={400} defaultValue={job.duties || ''} onBlur={e => updateJob(job.id || '', 'duties', e.target.value)} placeholder="Briefly describe your main responsibilities..." style={{ ...inputStyle, resize: 'none', lineHeight: 1.6 }} />
                    <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 4, textAlign: 'right' }}>{(job.duties || '').length} / 400</div>
                  </div>

                  {/* Reason for leaving */}
                  {!job.current && (
                    <div>
                      <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#0D1B3E', marginBottom: 6 }}>Reason for leaving</label>
                      <select value={job.reasonLeaving || ''} onChange={e => updateJob(job.id || '', 'reasonLeaving', e.target.value)} style={selectStyle}>
                        <option value="">Select...</option>
                        {REASON_LEAVING_OPTIONS.map(r => <option key={r} value={r}>{r}</option>)}
                      </select>
                    </div>
                  )}

                  {/* Supervisor */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div>
                      <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#0D1B3E', marginBottom: 6 }}>Supervisor name (optional)</label>
                      <input type="text" defaultValue={job.supervisorName || ''} onBlur={e => updateJob(job.id || '', 'supervisorName', e.target.value)} placeholder="First and last name" maxLength={80} style={inputStyle} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#0D1B3E', marginBottom: 6 }}>Supervisor contact (optional)</label>
                      <input type="text" defaultValue={job.supervisorContact || ''} onBlur={e => updateJob(job.id || '', 'supervisorContact', e.target.value)} placeholder="Email or phone" maxLength={80} style={inputStyle} />
                    </div>
                  </div>

                  {/* Can contact */}
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 12, color: '#64748B' }}>
                    <input type="checkbox" checked={job.canContact || false} onChange={e => updateJob(job.id || '', 'canContact', e.target.checked)} style={{ accentColor: '#C9973A' }} />
                    Agency may contact this supervisor as a reference
                  </label>
                </div>
              )}
            </div>
          )
        })}

        {/* Add job button */}
        {jobs.length < 5 && (
          <button type="button" onClick={addJob} style={{ width: '100%', padding: '12px 0', borderRadius: 12, border: '1px solid #C9973A', background: 'white', color: '#C9973A', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: FONT_SANS, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <Plus size={16} />
            Add employer
            <span style={{ fontSize: 11, fontWeight: 400, color: '#94A3B8' }}>({5 - jobs.length} remaining)</span>
          </button>
        )}

        {jobs.length === 0 && (
          <div style={{ padding: '24px', borderRadius: 12, border: '1px dashed #E2E8F0', textAlign: 'center', color: '#94A3B8', fontSize: 13, marginBottom: 12 }}>
            No employment history added yet. Click below to add your first employer.
          </div>
        )}
      </div>

      {/* SECTION 2: VOLUNTEER EXPERIENCE */}
      <div>
        <h3 style={{ fontSize: 15, fontWeight: 800, fontFamily: FONT_SERIF, color: '#0D1B3E', margin: '0 0 4px' }}>Volunteer experience</h3>
        <p style={{ fontSize: 12, color: '#64748B', margin: '0 0 12px' }}>Volunteering in care settings counts as real experience.</p>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', background: 'white', border: '1px solid #E2E8F0', borderRadius: 12, marginBottom: 12 }}>
          <span style={{ fontSize: 13, color: '#0D1B3E' }}>I have volunteer caregiving experience</span>
          <div onClick={() => saveField('volunteerExperience', !formData.volunteerExperience)} style={{ width: 44, height: 24, borderRadius: 999, cursor: 'pointer', background: formData.volunteerExperience ? '#C9973A' : '#E2E8F0', position: 'relative', transition: 'background 0.2s ease', flexShrink: 0 }}>
            <div style={{ position: 'absolute', top: 3, left: formData.volunteerExperience ? 23 : 3, width: 18, height: 18, borderRadius: '50%', background: 'white', boxShadow: '0 1px 3px rgba(0,0,0,0.2)', transition: 'left 0.2s ease' }} />
          </div>
        </div>

        {formData.volunteerExperience && (
          <textarea rows={3} maxLength={300} defaultValue={formData.volunteerDescription || ''} onBlur={e => saveField('volunteerDescription', e.target.value)} placeholder="Describe your volunteer experience briefly..." style={{ ...inputStyle, resize: 'none', lineHeight: 1.6 }} />
        )}
      </div>

      {/* SECTION 3: FAMILY CARE EXPERIENCE */}
      <div>
        <h3 style={{ fontSize: 15, fontWeight: 800, fontFamily: FONT_SERIF, color: '#0D1B3E', margin: '0 0 4px' }}>Family care experience</h3>
        <p style={{ fontSize: 12, color: '#64748B', margin: '0 0 12px' }}>Caring for a family member is valid caregiving experience.</p>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', background: 'white', border: '1px solid #E2E8F0', borderRadius: 12, marginBottom: 12 }}>
          <span style={{ fontSize: 13, color: '#0D1B3E' }}>I have cared for a family member</span>
          <div onClick={() => saveField('familyCareExperience', !formData.familyCareExperience)} style={{ width: 44, height: 24, borderRadius: 999, cursor: 'pointer', background: formData.familyCareExperience ? '#C9973A' : '#E2E8F0', position: 'relative', transition: 'background 0.2s ease', flexShrink: 0 }}>
            <div style={{ position: 'absolute', top: 3, left: formData.familyCareExperience ? 23 : 3, width: 18, height: 18, borderRadius: '50%', background: 'white', boxShadow: '0 1px 3px rgba(0,0,0,0.2)', transition: 'left 0.2s ease' }} />
          </div>
        </div>

        {formData.familyCareExperience && (
          <textarea rows={3} maxLength={300} defaultValue={formData.familyCareDescription || ''} onBlur={e => saveField('familyCareDescription', e.target.value)} placeholder="Briefly describe who you cared for and for how long..." style={{ ...inputStyle, resize: 'none', lineHeight: 1.6 }} />
        )}
      </div>

      {/* SECTION 4: PROFESSIONAL MEMBERSHIPS */}
      <div>
        <h3 style={{ fontSize: 15, fontWeight: 800, fontFamily: FONT_SERIF, color: '#0D1B3E', margin: '0 0 4px' }}>Professional memberships</h3>
        <p style={{ fontSize: 12, color: '#64748B', margin: '0 0 16px' }}>Optional. Select any professional associations you belong to.</p>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {MEMBERSHIP_OPTIONS.map(opt => {
            const current = (formData.professionalMemberships || []) as string[]
            const selected = current.includes(opt)
            return (
              <button key={opt} type="button" onClick={() => {
                const updated = selected ? current.filter(m => m !== opt) : [...current, opt]
                saveField('professionalMemberships', updated)
              }} style={{ padding: '8px 14px', borderRadius: 999, fontSize: 12, fontWeight: selected ? 700 : 400, cursor: 'pointer', border: selected ? '2px solid #C9973A' : '1px solid #E2E8F0', background: selected ? '#FDF6EC' : 'white', color: selected ? '#92400E' : '#64748B', fontFamily: FONT_SANS }}>{opt}</button>
            )
          })}
        </div>
      </div>

    </div>
  )
}