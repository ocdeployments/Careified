'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Plus, X, HelpCircle } from 'lucide-react'
import AgencyShell from '@/components/shells/AgencyShell'

interface Candidate {
  firstName: string
  lastName: string
  phone: string
  email: string
  notes: string
}

export default function NewCampaignPage() {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [roleDescription, setRoleDescription] = useState('')
  const [questions, setQuestions] = useState<string[]>(['', '', ''])
  const [candidates, setCandidates] = useState<Candidate[]>([
    { firstName: '', lastName: '', phone: '', email: '', notes: '' }
  ])
  const [consentConfirmed, setConsentConfirmed] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const addQuestion = () => {
    if (questions.length < 5) {
      setQuestions([...questions, ''])
    }
  }

  const removeQuestion = (index: number) => {
    if (questions.length > 1) {
      const newQuestions = [...questions]
      newQuestions.splice(index, 1)
      setQuestions(newQuestions)
    }
  }

  const updateQuestion = (index: number, value: string) => {
    const newQuestions = [...questions]
    newQuestions[index] = value
    setQuestions(newQuestions)
  }

  const addCandidate = () => {
    if (candidates.length < 20) {
      setCandidates([...candidates, { firstName: '', lastName: '', phone: '', email: '', notes: '' }])
    }
  }

  const removeCandidate = (index: number) => {
    setCandidates(candidates.filter((_, i) => i !== index))
  }

  const updateCandidate = (index: number, field: keyof Candidate, value: string) => {
    const updated = [...candidates]
    updated[index] = { ...updated[index], [field]: value }
    setCandidates(updated)
  }

  const validCandidates = candidates.filter(c => c.firstName.trim() && c.phone.trim())

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      const screeningQuestions = questions.filter(q => q.trim() !== '')

      const res = await fetch('/api/airecruit/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          roleDescription,
          screeningQuestions,
          candidates: validCandidates.map(c => ({
            firstName: c.firstName.trim(),
            lastName: c.lastName.trim(),
            phone: c.phone.trim(),
            email: c.email.trim(),
            notes: c.notes.trim(),
          })),
          consentConfirmed,
        }),
      })

      if (!res.ok) {
        const errorMessage = await res.json()
        throw new Error(errorMessage.error || 'Failed to create campaign')
      }

      router.push('/agency/airecruit')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create campaign. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AgencyShell title="New Campaign" subtitle="AIRecruit">
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '32px 24px' }}>
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '32px' }}>
            {/* LEFT COLUMN */}
            <div>
              {/* Campaign Details */}
              <div style={{ background: 'white', borderRadius: '16px', padding: '32px', marginBottom: '24px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                <h2 style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: '20px', color: '#0D1B3E', marginBottom: '24px' }}>
                  Campaign Details
                </h2>
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#0D1B3E', marginBottom: '8px' }}>Campaign Title *</label>
                  <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. PSW Screening — Frisco TX — May 2026" required style={{ width: '100%', padding: '12px 16px', border: '1px solid #E2E8F0', borderRadius: '8px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#0D1B3E', marginBottom: '8px' }}>Role Description *</label>
                  <textarea value={roleDescription} onChange={(e) => setRoleDescription(e.target.value)} placeholder="Describe the role, required experience, shift types, client needs..." required rows={4} style={{ width: '100%', padding: '12px 16px', border: '1px solid #E2E8F0', borderRadius: '8px', fontSize: '14px', outline: 'none', resize: 'vertical', boxSizing: 'border-box', fontFamily: 'inherit' }} />
                </div>
              </div>

              {/* Screening Questions */}
              <div style={{ background: 'white', borderRadius: '16px', padding: '32px', marginBottom: '24px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                <h2 style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: '20px', color: '#0D1B3E', marginBottom: '8px' }}>Screening Questions</h2>
                <p style={{ fontSize: '13px', color: '#64748B', marginBottom: '24px' }}>Add up to 5 screening questions. The AI agent will ask these questions in order during the call.</p>
                {questions.map((q, i) => (
                  <div key={i} style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '13px', color: '#C9A84C', fontWeight: 600, minWidth: '24px' }}>Q{i + 1}:</span>
                    <input type="text" value={q} onChange={(e) => updateQuestion(i, e.target.value)} placeholder={i === 0 ? "How many years of caregiving experience do you have?" : i === 1 ? "Are you comfortable with dementia or memory care clients?" : "What shifts are you available for?"} style={{ flex: 1, padding: '10px 14px', border: '1px solid #E2E8F0', borderRadius: '8px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} />
                    {questions.length > 1 && (
                      <button type="button" onClick={() => removeQuestion(i)} style={{ width: '32px', height: '32px', border: 'none', background: '#F1F5F9', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <X size={16} color="#64748B" />
                      </button>
                    )}
                  </div>
                ))}
                {questions.length < 5 && (
                  <button type="button" onClick={addQuestion} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 16px', border: '1px solid #C9A84C', borderRadius: '9999px', background: 'transparent', color: '#C9A84C', fontSize: '13px', fontWeight: 600, cursor: 'pointer', marginTop: '8px' }}>
                    <Plus size={14} /> Add Question
                  </button>
                )}
              </div>

              {/* Candidates */}
              <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #E2E8F0', padding: '20px', marginBottom: '24px' }}>
                <h2 style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: '20px', color: '#0D1B3E', marginBottom: '8px' }}>Candidates</h2>
                <p style={{ fontSize: '13px', color: '#64748B', marginBottom: '20px' }}>Add candidates you would like to screen. First name and phone number are required. You must have prior consent to contact each person.</p>
                
                {/* Header row */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1.2fr 1fr 2fr auto', gap: '12px', paddingBottom: '12px', borderBottom: '1px solid #E2E8F0', marginBottom: '12px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>First Name *</span>
                  <span style={{ fontSize: '11px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Last Name</span>
                  <span style={{ fontSize: '11px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Phone *</span>
                  <span style={{ fontSize: '11px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Email</span>
                  <span style={{ fontSize: '11px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Notes</span>
                  <span></span>
                </div>

                {candidates.map((candidate, i) => (
                  <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1.2fr 1fr 2fr auto', gap: '12px', paddingBottom: '12px', borderBottom: '1px solid #F1F5F9', marginBottom: '12px' }}>
                    <input type="text" value={candidate.firstName} onChange={(e) => updateCandidate(i, 'firstName', e.target.value)} placeholder="First name" style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #E2E8F0', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }} />
                    <input type="text" value={candidate.lastName} onChange={(e) => updateCandidate(i, 'lastName', e.target.value)} placeholder="Last name" style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #E2E8F0', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }} />
                    <input type="tel" value={candidate.phone} onChange={(e) => updateCandidate(i, 'phone', e.target.value)} placeholder="+1 (416) 555-0123" style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #E2E8F0', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }} />
                    <input type="email" value={candidate.email} onChange={(e) => updateCandidate(i, 'email', e.target.value)} placeholder="For Careified invitation" style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #E2E8F0', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }} />
                    <input type="text" value={candidate.notes} onChange={(e) => updateCandidate(i, 'notes', e.target.value)} placeholder="Brief background, experience..." style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #E2E8F0', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }} />
                    <button type="button" onClick={() => removeCandidate(i)} disabled={candidates.length === 1} style={{ width: '32px', height: '32px', border: 'none', background: candidates.length === 1 ? '#F1F5F9' : '#FEE2E2', borderRadius: '6px', cursor: candidates.length === 1 ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: candidates.length === 1 ? 0.5 : 1 }}>
                      <X size={16} color={candidates.length === 1 ? '#94A3B8' : '#DC2626'} />
                    </button>
                  </div>
                ))}

                {candidates.length < 20 && (
                  <button type="button" onClick={addCandidate} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 16px', border: '1px solid #C9A84C', borderRadius: '9999px', background: 'transparent', color: '#C9A84C', fontSize: '13px', fontWeight: 600, cursor: 'pointer', marginTop: '8px' }}>
                    <Plus size={14} /> Add Candidate
                  </button>
                )}
                <p style={{ fontSize: '12px', color: '#94A3B8', marginTop: '12px' }}>Maximum 20 candidates per campaign</p>

                <p style={{ fontSize: '12px', color: '#64748B', fontStyle: 'italic', marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #E2E8F0' }}>
                  Candidates will receive a call from AIRecruit. You must have obtained prior consent to contact each person via automated calling. By launching this campaign you confirm compliance with all applicable telemarketing regulations including TCPA (US) and CRTC (Canada).
                </p>
              </div>

              {/* Consent */}
              <div style={{ background: 'rgba(201,168,76,0.06)', border: '1px solid rgba(201,168,76,0.2)', borderRadius: '8px', padding: '16px', marginBottom: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <input type="checkbox" id="consent" checked={consentConfirmed} onChange={(e) => setConsentConfirmed(e.target.checked)} style={{ width: '18px', height: '18px', marginTop: '2px', accentColor: '#C9A84C' }} />
                  <label htmlFor="consent" style={{ fontSize: '13px', color: '#0D1B3E', lineHeight: 1.5, cursor: 'pointer' }}>
                    I confirm that all candidates on this list have provided prior consent to be contacted by automated AI calling systems for recruitment purposes, and that I have complied with all applicable Canadian telecommunications regulations including the CRTC Do Not Call List requirements.
                  </label>
                </div>
                <p style={{ fontSize: '12px', color: '#C9A84C', marginTop: '8px', marginLeft: '30px' }}>Required — agencies are responsible for ensuring CRTC and PIPEDA compliance for all contacts.</p>
              </div>

              {/* Submit */}
              <button type="submit" disabled={isSubmitting || !consentConfirmed || validCandidates.length === 0} style={{ width: '100%', padding: '16px 32px', background: isSubmitting || !consentConfirmed || validCandidates.length === 0 ? '#94A3B8' : 'linear-gradient(135deg, #C9973A, #E8B86D)', color: 'white', border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: 600, cursor: isSubmitting || !consentConfirmed || validCandidates.length === 0 ? 'not-allowed' : 'pointer', transition: 'background 0.2s' }}>
                {isSubmitting ? 'Launching...' : 'Launch Campaign'}
              </button>
              {error && <p style={{ color: '#DC2626', fontSize: '14px', marginTop: '16px', textAlign: 'center' }}>{error}</p>}
            </div>

            {/* RIGHT COLUMN */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={{ background: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                <h3 style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: '16px', color: '#0D1B3E', marginBottom: '20px' }}>How AIRecruit Works</h3>
                {[{ num: '1', title: 'Select candidates', desc: 'From your Careified shortlist' }, { num: '2', title: 'AIRecruit calls', desc: 'Each candidate automatically' }, { num: '3', title: 'AI interviews', desc: 'Conducts structured screening' }, { num: '4', title: 'You receive results', desc: 'Scores, transcripts, next steps' }].map(step => (
                  <div key={step.num} style={{ display: 'flex', gap: '12px', marginBottom: '16px', alignItems: 'flex-start' }}>
                    <div style={{ width: '24px', height: '24px', background: '#0D1B3E', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700, color: 'white', flexShrink: 0 }}>{step.num}</div>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: '#0D1B3E' }}>{step.title}</div>
                      <div style={{ fontSize: '12px', color: '#64748B' }}>{step.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ background: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                <h3 style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: '16px', color: '#0D1B3E', marginBottom: '16px' }}>Tips for Better Results</h3>
                <ul style={{ paddingLeft: '16px', margin: 0 }}>
                  {['Keep questions specific to the role', 'Aim for 3-5 questions per campaign', 'Calls are made during business hours only (9am-5pm)', 'Candidates can reschedule if they miss the call'].map((tip, i) => (
                    <li key={i} style={{ fontSize: '13px', color: '#64748B', marginBottom: '10px', lineHeight: 1.5 }}>{tip}</li>
                  ))}
                </ul>
              </div>
              <div style={{ background: '#F5F3EE', borderRadius: '16px', padding: '24px', border: '1px solid #E2E8F0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                  <HelpCircle size={20} color="#C9A84C" />
                  <h3 style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: '16px', color: '#0D1B3E', margin: 0 }}>Need Help?</h3>
                </div>
                <p style={{ fontSize: '13px', color: '#64748B', marginBottom: '16px', lineHeight: 1.5 }}>Contact our support team to help set up your first campaign</p>
                <Link href="/contact" style={{ display: 'inline-block', padding: '10px 20px', background: '#C9A84C', color: 'white', borderRadius: '9999px', fontSize: '13px', fontWeight: 600, textDecoration: 'none' }}>Contact Support</Link>
              </div>
            </div>
          </div>
        </form>
      </div>
    </AgencyShell>
  )
}
