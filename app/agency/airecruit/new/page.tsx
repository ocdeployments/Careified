'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Plus, X, HelpCircle, Upload, ChevronDown, ChevronUp } from 'lucide-react'
import AgencyShell from '@/components/shells/AgencyShell'
import { useWindowSize } from '@/lib/hooks/useWindowSize'

const CARD = { background: 'rgba(255,255,255,0.04)', borderRadius: '16px', padding: '32px', marginBottom: '24px', border: '1px solid rgba(255,255,255,0.08)' }
const INPUT: React.CSSProperties = { width: '100%', padding: '12px 16px', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px', fontSize: '14px', outline: 'none', boxSizing: 'border-box', background: 'rgba(255,255,255,0.06)', color: '#F5F0E8', fontFamily: 'inherit' }
const LABEL: React.CSSProperties = { display: 'block', fontSize: '13px', fontWeight: 600, color: '#F5F0E8', marginBottom: '8px' }
const MUTED = 'rgba(255,255,255,0.55)'

interface Candidate { firstName: string; lastName: string; phone: string; email: string; notes: string }

const SKILL_DEFAULTS: Record<string, { title: string; description: string }> = {
  dementia: { title: 'Recruit: Dementia Care', description: 'Seeking experienced PSW with dementia care specialization for ongoing placement.' },
  palliative: { title: 'Recruit: Palliative Care', description: 'Seeking PSW with palliative care experience for end-of-life support placement.' },
  live_in: { title: 'Recruit: Live-in Care', description: 'Seeking live-in caregiver for full-time residential placement.' },
  french: { title: 'Recruit: French-Speaking', description: 'Seeking bilingual French/English PSW for client requiring French-language care.' },
  overnight: { title: 'Recruit: Overnight Shift', description: 'Seeking PSW available for overnight shifts, 11pm-7am.' },
  complex_care: { title: 'Recruit: Complex Care', description: 'Seeking experienced PSW for complex care needs including medical support.' },
  mobility: { title: 'Recruit: Mobility Support', description: 'Seeking PSW with mobility support and transfer experience.' },
  medication: { title: 'Recruit: Medication Admin', description: 'Seeking PSW qualified for medication administration.' },
}

const DEFAULT_QUESTIONS = [
  'Can you tell me about your experience with dementia or memory care clients?',
  'Are you available for the shift times listed in this role?',
  'Do you have valid first aid certification and a clear background check?',
  'How do you handle a situation where a client becomes agitated or upset?',
  'Are you comfortable with personal care tasks including bathing and toileting?',
]

const QUESTION_LIBRARY = [
  {
    category: 'Motivation & Character',
    questions: [
      'Why did you choose caregiving, and what keeps you going?',
      'What do you think makes someone a great caregiver?',
      "What's the caregiving achievement you're most proud of?",
      'Where do you see your caregiving career in 3–5 years?',
    ],
  },
  {
    category: 'Experience & Background',
    questions: [
      'Describe your previous caregiving experience — client types and conditions.',
      'Which personal care tasks have you performed, and which are you most comfortable with?',
      'Have you worked with dementia or memory care clients? How did you approach it?',
      'What disabilities or chronic conditions have you provided care for?',
      'How much supervision did you have in past roles? Are you comfortable working independently?',
      'What was the hardest part about leaving your last caregiving position?',
    ],
  },
  {
    category: 'Skills & Certifications',
    questions: [
      'Are you CPR and First Aid certified? If not, are you willing to get certified?',
      'Do you have a valid driver\'s license, reliable transportation, and auto insurance?',
      'What certifications do you hold — PSW, HHA, CNA — and what are you working toward?',
      'Can you safely lift and physically assist clients with transfers and repositioning?',
      'Are you comfortable with light housekeeping, meal prep, and special dietary needs?',
    ],
  },
  {
    category: 'Behavioral & Situational',
    questions: [
      'Tell me about a time you handled a difficult or uncooperative client.',
      'What would you do if a client refuses to eat, bathe, or take medication?',
      'How do you manage your emotions when a client declines or passes away?',
      'Tell me about a mistake you made on the job and what you learned from it.',
      'How do you handle a hostile or interfering family member?',
      'If a client told you their family was mistreating them, what would you do?',
      'How do you build rapport with a new client who resists receiving care?',
    ],
  },
  {
    category: 'Logistics & Availability',
    questions: [
      'Are you available for the shift times, including evenings, weekends, or holidays?',
      'Are you comfortable with rotating or overnight shifts if needed?',
      'What are your pay expectations for this role?',
      'Do you have any scheduling constraints, and when can you start?',
    ],
  },
]

const ROLE_TYPES = [
  { value: 'PSW', label: 'Personal Support Worker (PSW)' },
  { value: 'HCA', label: 'Home Care Aide (HCA)' },
  { value: 'Live-in Companion', label: 'Live-in Companion' },
  { value: 'Respite Caregiver', label: 'Respite Caregiver' },
  { value: 'Companion Care', label: 'Companion Care' },
  { value: 'Overnight Caregiver', label: 'Overnight Caregiver' },
  { value: 'Complex Care', label: 'Complex Care' },
  { value: 'other', label: 'Other (specify below)' },
]

const SHIFT_TYPES = ['Days', 'Evenings', 'Overnights', 'Weekends', 'Live-in', 'Flexible']

function generateCampaignCode(): string {
  const num = Math.floor(1000 + Math.random() * 9000)
  return `ARC-${num}`
}

function buildTitle(roleType: string, customRole: string, city: string): string {
  const role = roleType === 'other' ? customRole : roleType
  const month = new Date().toLocaleString('en-CA', { month: 'short', year: 'numeric' })
  const parts = [role, city.trim(), month].filter(Boolean)
  return parts.join(' — ')
}

function buildDescription(roleType: string, customRole: string, shifts: string[], city: string, keyReq: string): string {
  const role = roleType === 'other' ? customRole : roleType
  const shiftText = shifts.length > 0 ? shifts.join(', ').toLowerCase() + ' shifts' : ''
  const locationText = city.trim() ? `in ${city.trim()}, ON` : ''
  const parts = ['We are seeking a', role, locationText ? locationText : '', shiftText ? `for ${shiftText}` : ''].filter(Boolean).join(' ').trim() + '.'
  return keyReq.trim() ? `${parts} ${keyReq.trim()}` : parts
}

export default function NewCampaignPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { isMobile } = useWindowSize()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [title, setTitle] = useState('')
  const [roleDescription, setRoleDescription] = useState('')
  const [questions, setQuestions] = useState<string[]>([...DEFAULT_QUESTIONS])
  const [libraryOpen, setLibraryOpen] = useState(false)
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({})

  function toggleCategory(cat: string) {
    setOpenCategories(prev => ({ ...prev, [cat]: !prev[cat] }))
  }

  function addFromLibrary(q: string) {
    if (questions.filter(x => x.trim() !== '').length >= 6) return
    if (questions.includes(q)) return
    const emptyIdx = questions.findIndex(x => x.trim() === '')
    if (emptyIdx !== -1) {
      const updated = [...questions]
      updated[emptyIdx] = q
      setQuestions(updated)
    } else {
      setQuestions(prev => [...prev, q])
    }
  }

  const selectedCount = questions.filter(q => q.trim() !== '').length
  const [candidates, setCandidates] = useState<Candidate[]>([{ firstName: '', lastName: '', phone: '', email: '', notes: '' }])
  const [consentConfirmed, setConsentConfirmed] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [prefilledSkill, setPrefilledSkill] = useState<string | null>(null)
  const [campaignCode] = useState<string>(() => generateCampaignCode())
  const [roleType, setRoleType] = useState('')
  const [customRole, setCustomRole] = useState('')
  const [selectedShifts, setSelectedShifts] = useState<string[]>([])
  const [city, setCity] = useState('')
  const [keyReq, setKeyReq] = useState('')
  const [titleManuallyEdited, setTitleManuallyEdited] = useState(false)
  const [descManuallyEdited, setDescManuallyEdited] = useState(false)

  function toggleShift(shift: string) {
    setSelectedShifts(prev =>
      prev.includes(shift) ? prev.filter(s => s !== shift) : [...prev, shift]
    )
  }
  const [importedCount, setImportedCount] = useState<number | null>(null)

  // Auto-generate title and description from structured fields
  useEffect(() => {
    if (!roleType) return
    if (!titleManuallyEdited) {
      setTitle(buildTitle(roleType, customRole, city))
    }
    if (!descManuallyEdited) {
      setRoleDescription(buildDescription(roleType, customRole, selectedShifts, city, keyReq))
    }
  }, [roleType, customRole, selectedShifts, city, keyReq, titleManuallyEdited, descManuallyEdited])

  // Pre-fill from ?skill= param
  useEffect(() => {
    const skill = searchParams.get('skill')
    if (skill && SKILL_DEFAULTS[skill]) {
      const defaults = SKILL_DEFAULTS[skill]
      setTitle(defaults.title)
      setRoleDescription(defaults.description)
      setPrefilledSkill(skill)
    }
  }, [searchParams])

  const addQuestion = () => { if (questions.length < 5) setQuestions([...questions, '']) }
  const removeQuestion = (i: number) => { if (questions.length > 1) { const q = [...questions]; q.splice(i, 1); setQuestions(q) } }
  const updateQuestion = (i: number, v: string) => { const q = [...questions]; q[i] = v; setQuestions(q) }
  const resetQuestions = () => { setQuestions([...DEFAULT_QUESTIONS]); setImportedCount(null) }

  const handleCSVUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (event) => {
      const text = event.target?.result as string
      const lines = text.split('\n').filter(l => l.trim())
      // Skip header if it contains "question"
      const startIdx = lines[0]?.toLowerCase().includes('question') ? 1 : 0
      const parsed = lines.slice(startIdx).map(l => {
        // Simple CSV: first column is question
        const parts = l.split(',')
        return parts[0]?.replace(/^"|"$/g, '').trim()
      }).filter(q => q && q.length > 5)
      if (parsed.length > 0) {
        setQuestions(parsed.slice(0, 10))
        setImportedCount(parsed.length)
      }
    }
    reader.readAsText(file)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const addCandidate = () => { if (candidates.length < 20) setCandidates([...candidates, { firstName: '', lastName: '', phone: '', email: '', notes: '' }]) }
  const removeCandidate = (i: number) => setCandidates(candidates.filter((_, idx) => idx !== i))
  const updateCandidate = (i: number, field: keyof Candidate, v: string) => { const u = [...candidates]; u[i] = { ...u[i], [field]: v }; setCandidates(u) }
  const validCandidates = candidates.filter(c => c.firstName.trim() && c.phone.trim())

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError(''); setIsSubmitting(true)
    try {
      const res = await fetch('/api/airecruit/campaigns', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, roleDescription, campaignCode, screeningQuestions: questions.filter(q => q.trim()), candidates: validCandidates.map(c => ({ firstName: c.firstName.trim(), lastName: c.lastName.trim(), phone: c.phone.trim(), email: c.email.trim(), notes: c.notes.trim() })), consentConfirmed }),
      })
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || 'Failed to create campaign') }
      router.push('/agency/airecruit')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create campaign. Please try again.')
    } finally { setIsSubmitting(false) }
  }

  const disabled = isSubmitting || !consentConfirmed || validCandidates.length === 0

  return (
    <AgencyShell title="New Campaign" subtitle="AIRecruit">
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '32px 24px' }}>
        <form onSubmit={handleSubmit}>
          {prefilledSkill && (
            <div style={{ borderLeft: '3px solid #C9973A', paddingLeft: '12px', color: '#C9973A', fontSize: '13px', marginBottom: '16px', background: 'rgba(201,151,58,0.08)', padding: '12px 16px', borderRadius: '0 8px 8px 0' }}>
              Pre-filled from bench strength gap: {SKILL_DEFAULTS[prefilledSkill]?.title || prefilledSkill}
            </div>
          )}
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 380px', gap: isMobile ? '16px' : '32px' }}>

            {/* LEFT COLUMN */}
            <div>
              {/* Campaign Details */}
              <div style={CARD}>
                <h2 style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: '20px', color: '#F5F0E8', marginBottom: '24px' }}>Campaign Details</h2>
                {/* Campaign code */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '20px' }}>
                  <div style={{ background: 'rgba(201,151,58,0.1)', border: '1px solid rgba(201,151,58,0.25)', borderRadius: '6px', padding: '6px 14px', fontSize: '13px', fontWeight: 600, color: '#C9973A', letterSpacing: '0.05em' }}>{campaignCode}</div>
                  <span style={{ fontSize: '12px', color: MUTED }}>Campaign code — shown in results and reports</span>
                </div>

                {/* Role type */}
                <div style={{ marginBottom: '16px' }}>
                  <label style={LABEL}>Role Type *</label>
                  <select
                    value={roleType}
                    onChange={e => { setRoleType(e.target.value); setTitleManuallyEdited(false); setDescManuallyEdited(false) }}
                    required
                    style={{ ...INPUT, cursor: 'pointer' }}
                  >
                    <option value="">Select a role type...</option>
                    {ROLE_TYPES.map(r => (
                      <option key={r.value} value={r.value}>{r.label}</option>
                    ))}
                  </select>
                </div>

                {/* Custom role input */}
                {roleType === 'other' && (
                  <div style={{ marginBottom: '16px' }}>
                    <label style={LABEL}>Role Title *</label>
                    <input
                      type="text"
                      value={customRole}
                      onChange={e => { setCustomRole(e.target.value); setTitleManuallyEdited(false); setDescManuallyEdited(false) }}
                      placeholder="e.g. Wound Care Specialist"
                      required
                      style={INPUT}
                    />
                  </div>
                )}

                {/* City */}
                <div style={{ marginBottom: '16px' }}>
                  <label style={LABEL}>City / Region</label>
                  <input
                    type="text"
                    value={city}
                    onChange={e => { setCity(e.target.value); setTitleManuallyEdited(false); setDescManuallyEdited(false) }}
                    placeholder="e.g. Toronto, Mississauga, Ottawa"
                    style={INPUT}
                  />
                </div>

                {/* Shift types */}
                <div style={{ marginBottom: '16px' }}>
                  <label style={LABEL}>Shift Types</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {SHIFT_TYPES.map(shift => {
                      const active = selectedShifts.includes(shift)
                      return (
                        <button
                          key={shift}
                          type="button"
                          onClick={() => { toggleShift(shift); setTitleManuallyEdited(false); setDescManuallyEdited(false) }}
                          style={{
                            padding: '6px 14px',
                            borderRadius: '99px',
                            border: `1px solid ${active ? '#C9973A' : 'rgba(255,255,255,0.15)'}`,
                            background: active ? 'rgba(201,151,58,0.15)' : 'transparent',
                            color: active ? '#C9973A' : MUTED,
                            fontSize: '13px',
                            fontWeight: active ? 600 : 400,
                            cursor: 'pointer',
                          }}
                        >
                          {shift}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Key requirement */}
                <div style={{ marginBottom: '20px' }}>
                  <label style={LABEL}>Key Requirement <span style={{ color: MUTED, fontWeight: 400 }}>(optional)</span></label>
                  <input
                    type="text"
                    value={keyReq}
                    onChange={e => { setKeyReq(e.target.value); setDescManuallyEdited(false) }}
                    placeholder="e.g. Must have dementia experience, French preferred, Driver's license required"
                    style={INPUT}
                  />
                </div>

                {/* Auto-generated title — editable */}
                <div style={{ marginBottom: '16px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <label style={LABEL}>Campaign Title *</label>
                    {titleManuallyEdited && (
                      <button type="button" onClick={() => { setTitleManuallyEdited(false); setTitle(buildTitle(roleType, customRole, city)) }} style={{ background: 'none', border: 'none', color: '#C9973A', fontSize: '12px', cursor: 'pointer', textDecoration: 'underline' }}>
                        Reset to generated
                      </button>
                    )}
                  </div>
                  <input
                    type="text"
                    value={title}
                    onChange={e => { setTitle(e.target.value); setTitleManuallyEdited(true) }}
                    placeholder="Select role type above to auto-generate"
                    required
                    style={{ ...INPUT, borderColor: titleManuallyEdited ? 'rgba(201,151,58,0.4)' : 'rgba(255,255,255,0.12)' }}
                  />
                  {!titleManuallyEdited && title && (
                    <p style={{ fontSize: '12px', color: MUTED, marginTop: '6px' }}>Auto-generated — edit above to customise</p>
                  )}
                </div>

                {/* Auto-generated description — editable */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <label style={LABEL}>Role Description *</label>
                    {descManuallyEdited && (
                      <button type="button" onClick={() => { setDescManuallyEdited(false); setRoleDescription(buildDescription(roleType, customRole, selectedShifts, city, keyReq)) }} style={{ background: 'none', border: 'none', color: '#C9973A', fontSize: '12px', cursor: 'pointer', textDecoration: 'underline' }}>
                        Reset to generated
                      </button>
                    )}
                  </div>
                  <textarea
                    value={roleDescription}
                    onChange={e => { setRoleDescription(e.target.value); setDescManuallyEdited(true) }}
                    placeholder="Select role type above to auto-generate"
                    required
                    rows={3}
                    style={{ ...INPUT, resize: 'vertical', borderColor: descManuallyEdited ? 'rgba(201,151,58,0.4)' : 'rgba(255,255,255,0.12)' }}
                  />
                  {!descManuallyEdited && roleDescription && (
                    <p style={{ fontSize: '12px', color: MUTED, marginTop: '6px' }}>Auto-generated — edit above to customise</p>
                  )}
                </div>
              </div>

              {/* Screening Questions */}
              <div style={CARD}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <h2 style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: '20px', color: '#F5F0E8', margin: 0 }}>Screening Questions</h2>
                  <button type="button" onClick={resetQuestions} style={{ background: 'none', border: 'none', color: '#C9973A', fontSize: '12px', cursor: 'pointer', textDecoration: 'underline' }}>Reset to defaults</button>
                </div>
                <p style={{ fontSize: '13px', color: MUTED, marginBottom: '24px' }}>Add up to 6 screening questions. The AI agent will ask these in order during the call.</p>
                {questions.map((q, i) => (
                  <div key={i} style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '13px', color: '#C9973A', fontWeight: 600, minWidth: '24px' }}>Q{i + 1}:</span>
                    <input type="text" value={q} onChange={e => updateQuestion(i, e.target.value)}
                      placeholder={i === 0 ? "How many years of caregiving experience do you have?" : i === 1 ? "Are you comfortable with dementia or memory care clients?" : "What shifts are you available for?"}
                      style={INPUT} />
                    {questions.length > 1 && (
                      <button type="button" onClick={() => removeQuestion(i)} style={{ width: '32px', height: '32px', border: 'none', background: 'rgba(255,255,255,0.08)', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <X size={16} color={MUTED} />
                      </button>
                    )}
                  </div>
                ))}
                {questions.length < 6 && (
                  <button type="button" onClick={addQuestion} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 16px', border: '1px solid #C9973A', borderRadius: '9999px', background: 'transparent', color: '#C9973A', fontSize: '13px', fontWeight: 600, cursor: 'pointer', marginTop: '8px' }}>
                    <Plus size={14} /> Add Question
                  </button>
                )}

                {/* CSV Upload */}
                <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                  <input type="file" accept=".csv" ref={fileInputRef} onChange={handleCSVUpload} style={{ display: 'none' }} id="csv-upload" />
                  <label htmlFor="csv-upload" style={{ display: 'block', cursor: 'pointer', background: 'rgba(255,255,255,0.03)', border: '1px dashed rgba(255,255,255,0.2)', borderRadius: '8px', padding: '16px', textAlign: 'center' }}>
                    <Upload size={16} color={MUTED} style={{ marginBottom: '8px' }} />
                    <div style={{ fontSize: '13px', color: MUTED }}>Or upload questions from a spreadsheet (.csv)</div>
                    <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', marginTop: '4px' }}>First column = question text</div>
                  </label>
                  {importedCount !== null && (
                    <div style={{ fontSize: '12px', color: '#22C55E', marginTop: '8px' }}>{importedCount} questions imported</div>
                  )}
                </div>

                {/* Question library */}
                <div style={{ marginTop: '20px' }}>
                  <button
                    type="button"
                    onClick={() => setLibraryOpen(prev => !prev)}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      background: 'rgba(201,151,58,0.06)',
                      border: '1px solid rgba(201,151,58,0.2)',
                      borderRadius: libraryOpen ? '10px 10px 0 0' : '10px',
                      padding: '12px 16px',
                      cursor: 'pointer',
                      color: '#F5F0E8',
                    }}
                  >
                    <span style={{ fontSize: '13px', fontWeight: 500 }}>
                      Question library — 30 suggested questions
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: '12px', color: '#C9973A' }}>
                        {selectedCount}/6 selected
                      </span>
                      {libraryOpen
                        ? <ChevronUp size={16} color="rgba(255,255,255,0.55)" />
                        : <ChevronDown size={16} color="rgba(255,255,255,0.55)" />
                      }
                    </div>
                  </button>

                  {libraryOpen && (
                    <div style={{
                      border: '1px solid rgba(201,151,58,0.2)',
                      borderTop: 'none',
                      borderRadius: '0 0 10px 10px',
                      overflow: 'hidden',
                    }}>
                      {QUESTION_LIBRARY.map(group => (
                        <div key={group.category}>
                          <button
                            type="button"
                            onClick={() => toggleCategory(group.category)}
                            style={{
                              width: '100%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              padding: '10px 16px',
                              background: 'rgba(255,255,255,0.03)',
                              border: 'none',
                              borderBottom: '1px solid rgba(255,255,255,0.06)',
                              cursor: 'pointer',
                              color: '#F5F0E8',
                            }}
                          >
                            <span style={{ fontSize: '12px', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'rgba(255,255,255,0.55)' }}>
                              {group.category}
                            </span>
                            {openCategories[group.category]
                              ? <ChevronUp size={14} color="rgba(255,255,255,0.3)" />
                              : <ChevronDown size={14} color="rgba(255,255,255,0.3)" />
                            }
                          </button>

                          {openCategories[group.category] && (
                            <div>
                              {group.questions.map(q => {
                                const alreadyAdded = questions.includes(q)
                                const atLimit = selectedCount >= 6
                                return (
                                  <div
                                    key={q}
                                    style={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'space-between',
                                      gap: 12,
                                      padding: isMobile ? '10px 12px' : '8px 16px',
                                      borderBottom: '1px solid rgba(255,255,255,0.04)',
                                      background: alreadyAdded ? 'rgba(201,151,58,0.06)' : 'transparent',
                                      minHeight: 44,
                                    }}
                                  >
                                    <span style={{
                                      fontSize: '13px',
                                      color: alreadyAdded ? '#C9973A' : atLimit ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.75)',
                                      lineHeight: 1.4,
                                      flex: 1,
                                    }}>
                                      {q}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => addFromLibrary(q)}
                                      disabled={alreadyAdded || atLimit}
                                      style={{
                                        flexShrink: 0,
                                        width: 28,
                                        height: 28,
                                        borderRadius: '50%',
                                        border: `1px solid ${alreadyAdded ? '#C9973A' : atLimit ? 'rgba(255,255,255,0.1)' : 'rgba(201,151,58,0.4)'}`,
                                        background: alreadyAdded ? 'rgba(201,151,58,0.15)' : 'transparent',
                                        cursor: alreadyAdded || atLimit ? 'default' : 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: alreadyAdded ? '#C9973A' : atLimit ? 'rgba(255,255,255,0.15)' : '#C9973A',
                                        fontSize: 18,
                                        lineHeight: 1,
                                      }}
                                    >
                                      {alreadyAdded ? '✓' : '+'}
                                    </button>
                                  </div>
                                )
                              })}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Candidates */}
              <div style={{ ...CARD, borderRadius: '12px', padding: '20px' }}>
                <h2 style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: '20px', color: '#F5F0E8', marginBottom: '8px' }}>Candidates</h2>
                <p style={{ fontSize: '13px', color: MUTED, marginBottom: '20px' }}>Add candidates to screen. First name and phone are required. You must have prior consent to contact each person.</p>
                <div style={{ display: isMobile ? 'flex' : 'grid', flexDirection: isMobile ? 'column' : undefined, gridTemplateColumns: isMobile ? undefined : '1fr 1fr 1.2fr 1fr 2fr auto', gap: '12px', paddingBottom: '12px', borderBottom: '1px solid rgba(255,255,255,0.08)', marginBottom: '12px' }}>
                  {['First Name *', 'Last Name', 'Phone *', '', 'Email', 'Notes'].map((h, i) => (
                    <span key={i} style={{ fontSize: '11px', fontWeight: 600, color: MUTED, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</span>
                  ))}
                </div>
                {candidates.map((c, i) => (
                  <div key={i} style={{ display: isMobile ? 'flex' : 'grid', flexDirection: isMobile ? 'column' : undefined, gridTemplateColumns: isMobile ? undefined : '1fr 1fr 1.2fr 1fr 2fr auto', gap: '12px', paddingBottom: '12px', borderBottom: '1px solid rgba(255,255,255,0.05)', marginBottom: '12px' }}>
                    <input type="text" value={c.firstName} onChange={e => updateCandidate(i, 'firstName', e.target.value)} placeholder="First name" style={INPUT} />
                    <input type="text" value={c.lastName} onChange={e => updateCandidate(i, 'lastName', e.target.value)} placeholder="Last name" style={INPUT} />
                    <input type="tel" value={c.phone} onChange={e => updateCandidate(i, 'phone', e.target.value)} placeholder="+1 (416) 555-0123" style={INPUT} />
                    <input type="email" value={c.email} onChange={e => updateCandidate(i, 'email', e.target.value)} placeholder="Email" style={INPUT} />
                    <input type="text" value={c.notes} onChange={e => updateCandidate(i, 'notes', e.target.value)} placeholder="Brief background..." style={INPUT} />
                    <button type="button" onClick={() => removeCandidate(i)} disabled={candidates.length === 1} style={{ width: '32px', height: '32px', border: 'none', background: candidates.length === 1 ? 'rgba(255,255,255,0.04)' : 'rgba(226,75,74,0.15)', borderRadius: '6px', cursor: candidates.length === 1 ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: candidates.length === 1 ? 0.4 : 1 }}>
                      <X size={16} color={candidates.length === 1 ? MUTED : '#E24B4A'} />
                    </button>
                  </div>
                ))}
                {candidates.length < 20 && (
                  <button type="button" onClick={addCandidate} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 16px', border: '1px solid #C9973A', borderRadius: '9999px', background: 'transparent', color: '#C9973A', fontSize: '13px', fontWeight: 600, cursor: 'pointer', marginTop: '8px' }}>
                    <Plus size={14} /> Add Candidate
                  </button>
                )}
                <p style={{ fontSize: '12px', color: MUTED, marginTop: '12px' }}>Maximum 20 candidates per campaign</p>
                <p style={{ fontSize: '12px', color: MUTED, fontStyle: 'italic', marginTop: '20px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                  Candidates will receive a call from AIRecruit. You must have obtained prior consent to contact each person via automated calling. By launching this campaign you confirm compliance with all applicable telemarketing regulations including TCPA (US) and CRTC (Canada).
                </p>
              </div>

              {/* Consent */}
              <div style={{ background: 'rgba(201,151,58,0.08)', border: '1px solid rgba(201,151,58,0.25)', borderRadius: '8px', padding: '16px', marginBottom: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <input type="checkbox" id="consent" checked={consentConfirmed} onChange={e => setConsentConfirmed(e.target.checked)} style={{ width: '18px', height: '18px', marginTop: '2px', accentColor: '#C9973A' }} />
                  <label htmlFor="consent" style={{ fontSize: '13px', color: '#F5F0E8', lineHeight: 1.5, cursor: 'pointer' }}>
                    I confirm that all candidates on this list have provided prior consent to be contacted by automated AI calling systems for recruitment purposes, and that I have complied with all applicable Canadian telecommunications regulations including the CRTC Do Not Call List requirements.
                  </label>
                </div>
                <p style={{ fontSize: '12px', color: '#C9973A', marginTop: '8px', marginLeft: '30px' }}>Required — agencies are responsible for ensuring CRTC and PIPEDA compliance for all contacts.</p>
              </div>

              {/* Submit */}
              <button type="submit" disabled={disabled} style={{ width: isMobile ? '100%' : 'auto', padding: '16px 32px', background: disabled ? 'rgba(255,255,255,0.1)' : 'linear-gradient(135deg, #C9973A, #E8B86D)', color: disabled ? MUTED : '#0D1B3E', border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: 600, cursor: disabled ? 'not-allowed' : 'pointer', transition: 'background 0.2s' }}>
                {isSubmitting ? 'Launching...' : 'Launch Campaign'}
              </button>
              {error && <p style={{ color: '#E24B4A', fontSize: '14px', marginTop: '16px', textAlign: 'center' }}>{error}</p>}
            </div>

            {/* RIGHT COLUMN */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '16px', padding: '24px', border: '1px solid rgba(255,255,255,0.08)' }}>
                <h3 style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: '16px', color: '#F5F0E8', marginBottom: '20px' }}>How AIRecruit Works</h3>
                {[{ num: '1', title: 'Select candidates', desc: 'From your Careified shortlist' }, { num: '2', title: 'AIRecruit calls', desc: 'Each candidate automatically' }, { num: '3', title: 'AI interviews', desc: 'Conducts structured screening' }, { num: '4', title: 'You receive results', desc: 'Scores, transcripts, next steps' }].map(step => (
                  <div key={step.num} style={{ display: 'flex', gap: '12px', marginBottom: '16px', alignItems: 'flex-start' }}>
                    <div style={{ width: '24px', height: '24px', background: '#1E3A8A', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700, color: 'white', flexShrink: 0 }}>{step.num}</div>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: '#F5F0E8' }}>{step.title}</div>
                      <div style={{ fontSize: '12px', color: MUTED }}>{step.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '16px', padding: '24px', border: '1px solid rgba(255,255,255,0.08)' }}>
                <h3 style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: '16px', color: '#F5F0E8', marginBottom: '16px' }}>Tips for Better Results</h3>
                <ul style={{ paddingLeft: '16px', margin: 0 }}>
                  {['Keep questions specific to the role', 'Aim for 3-5 questions per campaign', 'Calls are made during business hours only (9am–5pm)', 'Candidates can reschedule if they miss the call'].map((tip, i) => (
                    <li key={i} style={{ fontSize: '13px', color: MUTED, marginBottom: '10px', lineHeight: 1.5 }}>{tip}</li>
                  ))}
                </ul>
              </div>
              <div style={{ background: 'rgba(201,151,58,0.08)', borderRadius: '16px', padding: '24px', border: '1px solid rgba(201,151,58,0.2)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                  <HelpCircle size={20} color="#C9973A" />
                  <h3 style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: '16px', color: '#F5F0E8', margin: 0 }}>Need Help?</h3>
                </div>
                <p style={{ fontSize: '13px', color: MUTED, marginBottom: '16px', lineHeight: 1.5 }}>Contact our support team to help set up your first campaign</p>
                <Link href="/contact" style={{ display: 'inline-block', padding: '10px 20px', background: '#C9973A', color: '#0D1B3E', borderRadius: '9999px', fontSize: '13px', fontWeight: 600, textDecoration: 'none' }}>Contact Support</Link>
              </div>
            </div>

          </div>
        </form>
      </div>
    </AgencyShell>
  )
}