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

// Questions config
const QUESTIONS = [
  {
    id: 'open_q1',
    label: 'Describe a challenging caregiving moment and how you handled it.',
    placeholder: 'Tell agencies about a time you faced a difficult situation...',
    maxLength: 200,
  },
  {
    id: 'open_q2',
    label: 'How do you ensure client safety and wellbeing on every shift?',
    placeholder: "Describe your approach to keeping clients safe...",
    maxLength: 200,
  },
  {
    id: 'open_q3',
    label: "Is there anything else you'd like agencies to know about you?",
    placeholder: "Anything that makes you stand out as a caregiver...",
    maxLength: 300,
    note: 'This field is completely optional',
  },
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
  banner: {
    background: '#FFFBF0',
    border: '1px solid #C9973A',
    borderRadius: '8px',
    padding: '12px 16px',
    fontSize: '14px',
    color: '#92400E',
    marginBottom: '24px',
  },
  questionCard: {
    background: 'white',
    border: '1px solid COLORS.border',
    borderRadius: '12px',
    padding: '24px',
  },
  questionLabel: {
    fontSize: '18px',
    fontWeight: 600,
    color: COLORS.navy,
    marginBottom: '8px',
    lineHeight: 1.4,
  },
  textarea: {
    width: '100%',
    minHeight: '120px',
    padding: '12px 16px',
    border: '1px solid ' + COLORS.border,
    borderRadius: '8px',
    fontSize: '15px',
    resize: 'vertical' as const,
    lineHeight: 1.6,
    outline: 'none',
    boxSizing: 'border-box' as const,
  },
  charCount: {
    fontSize: '12px',
    color: '#94A3B8',
    textAlign: 'right' as const,
    marginTop: '4px',
  },
  progressBar: {
    height: '4px',
    background: COLORS.border,
    borderRadius: '2px',
    marginBottom: '16px',
  },
  skipLink: {
    fontSize: '13px',
    color: '#94A3B8',
    cursor: 'pointer',
    textDecoration: 'underline',
    background: 'none',
    border: 'none',
    marginTop: '12px',
  },
  completionCard: {
    background: '#F0FDF4',
    border: '2px solid #16A34A',
    borderRadius: '12px',
    padding: '32px',
    textAlign: 'center' as const,
  },
  completionTitle: {
    fontSize: '24px',
    fontWeight: 700,
    color: '#15803D',
    marginBottom: '16px',
  },
  viewProfileButton: {
    background: COLORS.navy,
    color: 'white',
    padding: '12px 24px',
    borderRadius: '8px',
    fontSize: '15px',
    fontWeight: 600,
    cursor: 'pointer',
    border: 'none',
    marginTop: '16px',
  },
  idCardButton: {
    background: 'white',
    color: COLORS.navy,
    border: '2px solid ' + COLORS.navy,
    padding: '12px 24px',
    borderRadius: '8px',
    fontSize: '15px',
    cursor: 'pointer',
    marginLeft: '12px',
  },
}

export default function Step10OpenQuestions() {
  const { formData } = useProfileForm()
  const { saveField } = useProfileSave()
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [isComplete, setIsComplete] = useState(false)
  const [focused, setFocused] = useState<string | null>(null)

  const openQ1 = formData.openQ1 || ''
  const openQ2 = formData.openQ2 || ''
  const openQ3 = formData.openQ3 || ''
  const profileCompletionPct = formData.profileCompletionPct || 0

  const answers = [openQ1, openQ2, openQ3]
  const currentQ = QUESTIONS[currentQuestion]
  const currentAnswer = answers[currentQuestion]

  const getTier = (pct: number) => {
    if (pct >= 90) return 'Gold'
    if (pct >= 70) return 'Silver'
    if (pct >= 50) return 'Bronze'
    return 'Basic'
  }

  const handleChange = useCallback((field: string, value: string) => {
    saveField(field as any, value)
  }, [saveField])

  const handleBlur = useCallback((field: string, value: string) => {
    saveField(field as any, value)
  }, [saveField])

  const getCharCountColor = (current: number, max: number) => {
    const ratio = current / max
    if (ratio >= 1) return COLORS.red
    if (ratio >= 0.8) return '#D97706'
    return '#94A3B8'
  }

  const handleComplete = () => {
    setIsComplete(true)
  }

  const progressPercent = ((currentQuestion + 1) / QUESTIONS.length) * 100
  const tier = getTier(profileCompletionPct)

  if (isComplete) {
    return (
      <div style={{ fontFamily: 'system-ui, sans-serif', color: COLORS.navy }}>
        <div style={styles.completionCard}>
          <div style={styles.completionTitle}>Your profile is now complete!</div>
          <p style={{ fontSize: '15px', color: '#15803D', marginBottom: '8px' }}>
            Agencies can now discover you.
          </p>
          <p style={{ fontSize: '14px', color: COLORS.slate, marginBottom: '16px' }}>
            Profile tier: <strong>{tier}</strong> ({profileCompletionPct}% complete)
          </p>
          
          <div>
            <button
              type="button"
              style={styles.viewProfileButton}
              onClick={() => {
                const profileId = (formData as any).id || (formData as any).userId
                if (profileId) {
                  window.location.href = `/profile/${profileId}`
                }
              }}
            >
              View My Profile
            </button>
            <button
              type="button"
              style={styles.idCardButton}
              onClick={() => {
                const caregiverCode = (formData as any).caregiver_code
                if (caregiverCode) {
                  window.location.href = `/id/${caregiverCode}`
                }
              }}
            >
              View My ID Card
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', color: COLORS.navy }}>
      {/* Banner */}
      <div style={styles.banner}>
        Caregivers who answer these questions receive 3× more agency views. All answers are optional.
      </div>

      {/* Progress */}
      <div style={{ marginBottom: '16px' }}>
        <span style={{ fontSize: '13px', color: COLORS.slate }}>
          Question {currentQuestion + 1} of {QUESTIONS.length}
        </span>
      </div>
      <div style={styles.progressBar}>
        <div style={{ height: '100%', background: COLORS.gold, width: progressPercent + '%', borderRadius: '2px', transition: 'width 0.3s' }} />
      </div>

      {/* Question Card */}
      <div style={styles.questionCard}>
        <label style={styles.questionLabel}>{currentQ.label}</label>
        
        <textarea
          value={currentAnswer}
          onChange={e => handleChange(currentQ.id, e.target.value)}
          onBlur={e => handleBlur(currentQ.id, e.target.value)}
          placeholder={currentQ.placeholder}
          maxLength={currentQ.maxLength}
          style={styles.textarea}
        />
        
        <div style={{ ...styles.charCount, color: getCharCountColor(currentAnswer.length, currentQ.maxLength) }}>
          {currentAnswer.length} / {currentQ.maxLength}
        </div>

        {currentQ.id === 'open_q3' && (
          <p style={{ fontSize: '12px', color: COLORS.slate, marginTop: '8px' }}>
            {currentQ.note}
          </p>
        )}

        <button
          type="button"
          onClick={() => {
            if (currentQuestion < QUESTIONS.length - 1) {
              setCurrentQuestion(currentQuestion + 1)
            }
          }}
          style={styles.skipLink}
        >
          Skip this question
        </button>
      </div>

      {/* Navigation */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '24px' }}>
        <button
          type="button"
          onClick={() => setCurrentQuestion(currentQuestion - 1)}
          disabled={currentQuestion === 0}
          style={{
            padding: '12px 24px',
            borderRadius: '8px',
            fontSize: '15px',
            fontWeight: 600,
            cursor: currentQuestion === 0 ? 'not-allowed' : 'pointer',
            border: currentQuestion === 0 ? 'none' : '1px solid ' + COLORS.border,
            background: currentQuestion === 0 ? '#F1F5F9' : 'white',
            color: currentQuestion === 0 ? '#94A3B8' : COLORS.navy,
          }}
        >
          Back
        </button>

        {currentQuestion < QUESTIONS.length - 1 ? (
          <button
            type="button"
            onClick={() => setCurrentQuestion(currentQuestion + 1)}
            style={{
              padding: '12px 24px',
              borderRadius: '8px',
              fontSize: '15px',
              fontWeight: 600,
              cursor: 'pointer',
              border: 'none',
              background: COLORS.navy,
              color: 'white',
            }}
          >
            Next
          </button>
        ) : (
          <button
            type="button"
            onClick={handleComplete}
            style={{
              padding: '12px 24px',
              borderRadius: '8px',
              fontSize: '15px',
              fontWeight: 600,
              cursor: 'pointer',
              border: 'none',
              background: COLORS.gold,
              color: COLORS.navy,
            }}
          >
            Complete Profile
          </button>
        )}
      </div>
    </div>
  )
}