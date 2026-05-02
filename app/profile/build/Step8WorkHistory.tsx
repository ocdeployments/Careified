'use client'

import { useState, useCallback } from 'react'
import { useProfileForm } from '@/lib/context/ProfileFormContext'
import { useProfileSave } from '@/lib/hooks/useProfileSave'

// Design system colors
const COLORS = {
  navy: '#0D1B3E',
  gold: '#C9973A',
  red: '#DC2626',
  slate: '#64748B',
  border: '#E2E8F0',
  errorBg: '#FEF2F2',
}

// Constants
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const YEARS = Array.from({ length: 50 }, (_, i) => String(2025 - i))

const CLIENT_TYPES = [
  'Elderly/Seniors', 'Adults with Disabilities', 'Children with Special Needs',
  'Post-surgical', 'Palliative/Hospice', 'Brain Injury', 'Mental Health', 'Bariatric', 'Veterans'
]

const EMPLOYMENT_TYPES = ['Full-time', 'Part-time', 'Casual/On-call', 'Contract', 'Agency placement']

const REASON_LEAVING = [
  'Contract ended', 'Better opportunity', 'Personal reasons',
  'Client passed away', 'Relocated', 'Agency closure', 'Still employed here', 'Prefer not to say'
]

// Styles
const styles = {
  sectionHeader: {
    fontSize: '13px',
    fontWeight: 600,
    color: COLORS.slate,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.08em',
    marginBottom: '16px',
  },
  section: {
    marginBottom: '32px',
  },
  noticeBanner: {
    background: '#F0F9FF',
    border: '1px solid #BAE6FD',
    borderRadius: '8px',
    padding: '12px 16px',
    fontSize: '13px',
    color: '#0369A1',
    marginBottom: '24px',
  },
  employerBlock: {
    background: '#F8FAFC',
    border: '1px solid ' + COLORS.border,
    borderRadius: '12px',
    padding: '20px',
    marginBottom: '16px',
    position: 'relative' as const,
  },
  blockBadge: {
    position: 'absolute' as const,
    top: '16px',
    right: '16px',
    background: '#E2E8F0',
    borderRadius: '20px',
    padding: '2px 10px',
    fontSize: '12px',
    color: COLORS.slate,
  },
  input: {
    width: '100%',
    padding: '10px 14px',
    border: '1px solid ' + COLORS.border,
    borderRadius: '8px',
    fontSize: '15px',
    outline: 'none',
    boxSizing: 'border-box' as const,
  },
  label: {
    fontSize: '14px',
    fontWeight: 500,
    color: '#374151',
    marginBottom: '6px',
    display: 'block',
  },
  checkboxLabel: {
    fontSize: '14px',
    color: '#374151',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  addButton: {
    border: '2px dashed ' + COLORS.gold,
    background: 'transparent',
    color: COLORS.gold,
    borderRadius: '8px',
    padding: '12px',
    width: '100%',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 600,
  },
  tag: {
    background: '#F1F5F9',
    border: '1px solid ' + COLORS.border,
    borderRadius: '20px',
    padding: '4px 12px',
    fontSize: '13px',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    margin: '4px',
  },
}

function generateId() {
  return Math.random().toString(36).substring(2, 9)
}

export default function Step8WorkHistory() {
  const { formData } = useProfileForm()
  const { saveField } = useProfileSave()
  const [focused, setFocused] = useState<string | null>(null)

  const workHistory = formData.workHistory || []
  const volunteerExperience = formData.volunteerExperience
  const volunteerDescription = formData.volunteerDescription
  const familyCareExperience = formData.familyCareExperience
  const familyCareDescription = formData.familyCareDescription
  const professionalMemberships = formData.professionalMemberships || []
  const [newMembership, setNewMembership] = useState('')

  const getInputStyle = (field: string): React.CSSProperties => {
    let s: React.CSSProperties = { ...styles.input }
    if (focused === field) {
      s = { ...s, borderColor: COLORS.gold, boxShadow: '0 0 0 3px rgba(201,151,58,0.15)' }
    }
    return s
  }

  const handleChange = useCallback((field: string, value: any) => {
    saveField(field as any, value)
  }, [saveField])

  const handleBlur = useCallback((field: string, value: any) => {
    saveField(field as any, value)
  }, [saveField])

  const addEmployer = () => {
    if (workHistory.length >= 5) return
    const newEmployer = {
      id: generateId(),
      organisation: '',
      title: '',
      employmentType: '',
      startMonth: '',
      startYear: '',
      endMonth: '',
      endYear: '',
      current: false,
      clientTypes: [],
      duties: '',
      reasonLeaving: '',
      supervisorName: '',
      supervisorContact: '',
      canContact: false,
    }
    saveField('workHistory', [...workHistory, newEmployer])
  }

  const updateEmployer = (index: number, field: string, value: any) => {
    const updated = [...workHistory]
    updated[index] = { ...updated[index], [field]: value }
    saveField('workHistory', updated)
  }

  const removeEmployer = (index: number) => {
    const updated = workHistory.filter((_, i) => i !== index)
    saveField('workHistory', updated)
  }

  const toggleClientType = (index: number, type: string) => {
    const updated = [...workHistory]
    const currentTypes = updated[index].clientTypes || []
    if (currentTypes.includes(type)) {
      updated[index].clientTypes = currentTypes.filter(t => t !== type)
    } else {
      updated[index].clientTypes = [...currentTypes, type]
    }
    saveField('workHistory', updated)
  }

  const addMembership = () => {
    if (!newMembership.trim()) return
    if (!professionalMemberships.includes(newMembership.trim())) {
      saveField('professionalMemberships', [...professionalMemberships, newMembership.trim()])
    }
    setNewMembership('')
  }

  const removeMembership = (member: string) => {
    saveField('professionalMemberships', professionalMemberships.filter(m => m !== member))
  }

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', color: COLORS.navy }}>
      {/* Notice Banner */}
      <div style={styles.noticeBanner}>
        This step takes approximately 15 minutes. All progress saves automatically — you can continue later.
      </div>

      {/* PART 1: Employment History */}
      <div style={styles.section}>
        <div style={styles.sectionHeader}>Previous Caregiving Positions</div>
        
        {workHistory.map((employer: any, index: number) => (
          <div key={employer.id} style={styles.employerBlock}>
            <div style={styles.blockBadge}>Position {index + 1}</div>
            <button
              type="button"
              onClick={() => removeEmployer(index)}
              style={{ position: 'absolute', top: '16px', right: '100px', color: COLORS.red, fontSize: '13px', cursor: 'pointer', background: 'none', border: 'none' }}
            >
              Remove
            </button>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px', marginTop: '8px' }}>
              <div>
                <label style={styles.label}>Employer / Organization</label>
                <input
                  type="text"
                  value={employer.organisation || ''}
                  onChange={e => updateEmployer(index, 'organisation', e.target.value)}
                  onBlur={e => handleBlur('workHistory', workHistory)}
                  style={getInputStyle('org' + index)}
                />
              </div>
              <div>
                <label style={styles.label}>Your Job Title</label>
                <input
                  type="text"
                  value={employer.title || ''}
                  onChange={e => updateEmployer(index, 'title', e.target.value)}
                  onBlur={e => handleBlur('workHistory', workHistory)}
                  style={getInputStyle('title' + index)}
                />
              </div>
              <div>
                <label style={styles.label}>Employment Type</label>
                <select
                  value={employer.employmentType || ''}
                  onChange={e => updateEmployer(index, 'employmentType', e.target.value)}
                  onBlur={e => handleBlur('workHistory', workHistory)}
                  style={getInputStyle('empType' + index)}
                >
                  <option value="">Select...</option>
                  {EMPLOYMENT_TYPES.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '16px', marginTop: '16px' }}>
              <div>
                <label style={styles.label}>Start Month</label>
                <select
                  value={employer.startMonth || ''}
                  onChange={e => updateEmployer(index, 'startMonth', e.target.value)}
                  onBlur={e => handleBlur('workHistory', workHistory)}
                  style={getInputStyle('startM' + index)}
                >
                  <option value="">Select...</option>
                  {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <div>
                <label style={styles.label}>Start Year</label>
                <select
                  value={employer.startYear || ''}
                  onChange={e => updateEmployer(index, 'startYear', e.target.value)}
                  onBlur={e => handleBlur('workHistory', workHistory)}
                  style={getInputStyle('startY' + index)}
                >
                  <option value="">Select...</option>
                  {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
              <div>
                <label style={styles.label}>End Month</label>
                <select
                  value={employer.endMonth || ''}
                  onChange={e => updateEmployer(index, 'endMonth', e.target.value)}
                  onBlur={e => handleBlur('workHistory', workHistory)}
                  disabled={employer.current}
                  style={{ ...getInputStyle('endM' + index), opacity: employer.current ? 0.5 : 1 }}
                >
                  <option value="">Select...</option>
                  {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <div>
                <label style={styles.label}>End Year</label>
                <select
                  value={employer.endYear || ''}
                  onChange={e => updateEmployer(index, 'endYear', e.target.value)}
                  onBlur={e => handleBlur('workHistory', workHistory)}
                  disabled={employer.current}
                  style={{ ...getInputStyle('endY' + index), opacity: employer.current ? 0.5 : 1 }}
                >
                  <option value="">Select...</option>
                  {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
            </div>

            <div style={{ marginTop: '12px' }}>
              <label style={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={employer.current || false}
                  onChange={e => updateEmployer(index, 'current', e.target.checked)}
                  style={{ accentColor: COLORS.gold, width: '16px', height: '16px' }}
                />
                <span style={{ fontSize: '14px', color: COLORS.navy }}>I currently work here</span>
              </label>
            </div>

            <div style={{ marginTop: '16px' }}>
              <label style={styles.label}>Client types you worked with</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px' }}>
                {CLIENT_TYPES.map(type => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => toggleClientType(index, type)}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '16px',
                      fontSize: '12px',
                      border: (employer.clientTypes || []).includes(type) ? '2px solid ' + COLORS.gold : '1px solid ' + COLORS.border,
                      background: (employer.clientTypes || []).includes(type) ? '#FFFBF0' : 'white',
                      color: (employer.clientTypes || []).includes(type) ? '#92400E' : COLORS.slate,
                      cursor: 'pointer',
                    }}
                  >
                    {(employer.clientTypes || []).includes(type) && '✓ '} {type}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ marginTop: '16px' }}>
              <label style={styles.label}>Key responsibilities and duties</label>
              <textarea
                value={employer.duties || ''}
                onChange={e => updateEmployer(index, 'duties', e.target.value)}
                onBlur={e => handleBlur('workHistory', workHistory)}
                maxLength={300}
                rows={3}
                style={{ ...getInputStyle('duties' + index), resize: 'vertical', minHeight: '80px' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '16px', marginTop: '16px' }}>
              <div>
                <label style={styles.label}>Reason for leaving</label>
                <select
                  value={employer.reasonLeaving || ''}
                  onChange={e => updateEmployer(index, 'reasonLeaving', e.target.value)}
                  onBlur={e => handleBlur('workHistory', workHistory)}
                  style={getInputStyle('reason' + index)}
                >
                  <option value="">Select...</option>
                  {REASON_LEAVING.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div>
                <label style={styles.label}>Supervisor name (for reference check)</label>
                <input
                  type="text"
                  value={employer.supervisorName || ''}
                  onChange={e => updateEmployer(index, 'supervisorName', e.target.value)}
                  onBlur={e => handleBlur('workHistory', workHistory)}
                  style={getInputStyle('supName' + index)}
                />
              </div>
              <div>
                <label style={styles.label}>Supervisor phone or email (optional)</label>
                <input
                  type="text"
                  value={employer.supervisorContact || ''}
                  onChange={e => updateEmployer(index, 'supervisorContact', e.target.value)}
                  onBlur={e => handleBlur('workHistory', workHistory)}
                  style={getInputStyle('supContact' + index)}
                />
              </div>
            </div>

            <div style={{ marginTop: '12px' }}>
              <label style={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={employer.canContact || false}
                  onChange={e => updateEmployer(index, 'canContact', e.target.checked)}
                  style={{ accentColor: COLORS.gold, width: '16px', height: '16px' }}
                />
                <span style={{ fontSize: '14px', color: COLORS.navy }}>Agency may contact this supervisor</span>
              </label>
            </div>
          </div>
        ))}

        {workHistory.length < 5 && (
          <button type="button" onClick={addEmployer} style={styles.addButton}>
            + Add Position
          </button>
        )}
      </div>

      {/* PART 2: Volunteer Experience */}
      <div style={styles.section}>
        <div style={styles.sectionHeader}>Volunteer Experience</div>
        
        <label style={styles.checkboxLabel}>
          <input
            type="checkbox"
            checked={volunteerExperience || false}
            onChange={e => handleChange('volunteerExperience', e.target.checked)}
            style={{ accentColor: COLORS.gold, width: '16px', height: '16px' }}
          />
          <span style={{ fontSize: '14px', color: COLORS.navy }}>I have volunteer caregiving experience</span>
        </label>

        {volunteerExperience && (
          <div style={{ marginTop: '16px' }}>
            <label style={styles.label}>Describe your volunteer caregiving experience</label>
            <textarea
              value={volunteerDescription || ''}
              onChange={e => handleChange('volunteerDescription', e.target.value)}
              onBlur={e => handleBlur('volunteerDescription', e.target.value)}
              maxLength={400}
              rows={4}
              placeholder="Organization, role, duration, type of care provided..."
              style={{ ...getInputStyle('volunteerDesc'), resize: 'vertical', minHeight: '100px' }}
            />
          </div>
        )}
      </div>

      {/* PART 3: Family Care Experience */}
      <div style={styles.section}>
        <div style={styles.sectionHeader}>Family Care Experience</div>
        
        <label style={styles.checkboxLabel}>
          <input
            type="checkbox"
            checked={familyCareExperience || false}
            onChange={e => handleChange('familyCareExperience', e.target.checked)}
            style={{ accentColor: COLORS.gold, width: '16px', height: '16px' }}
          />
          <span style={{ fontSize: '14px', color: COLORS.navy }}>I have provided unpaid care for a family member</span>
        </label>

        {familyCareExperience && (
          <div style={{ marginTop: '16px' }}>
            <label style={styles.label}>Describe your family caregiving experience</label>
            <textarea
              value={familyCareDescription || ''}
              onChange={e => handleChange('familyCareDescription', e.target.value)}
              onBlur={e => handleBlur('familyCareDescription', e.target.value)}
              maxLength={400}
              rows={4}
              placeholder="Relationship, duration, type of care, what you learned..."
              style={{ ...getInputStyle('familyDesc'), resize: 'vertical', minHeight: '100px' }}
            />
          </div>
        )}
      </div>

      {/* PART 4: Professional Memberships */}
      <div style={styles.section}>
        <div style={styles.sectionHeader}>Professional Memberships</div>
        
        <div style={{ marginBottom: '12px' }}>
          {professionalMemberships.map(member => (
            <span key={member} style={styles.tag}>
              {member}
              <button
                type="button"
                onClick={() => removeMembership(member)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: COLORS.slate, fontSize: '16px', padding: '0 0 0 4px' }}
              >
                ×
              </button>
            </span>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <input
            type="text"
            value={newMembership}
            onChange={e => setNewMembership(e.target.value)}
            placeholder="e.g. PSW Ontario Network, CNIA, NAHC..."
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addMembership() } }}
            style={{ flex: 1, ...getInputStyle('newMember') }}
          />
          <button
            type="button"
            onClick={addMembership}
            disabled={!newMembership.trim()}
            style={{
              padding: '10px 16px',
              borderRadius: '8px',
              border: 'none',
              background: newMembership.trim() ? COLORS.navy : '#E2E8F0',
              color: newMembership.trim() ? 'white' : '#94A3B8',
              cursor: newMembership.trim() ? 'pointer' : 'not-allowed',
              fontWeight: 600,
            }}
          >
            Add
          </button>
        </div>
      </div>
    </div>
  )
}