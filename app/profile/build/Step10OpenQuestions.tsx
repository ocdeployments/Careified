'use client'

import { useState, useCallback } from 'react'
import { useProfileForm } from '@/lib/context/ProfileFormContext'
import { useProfileSave } from '@/lib/hooks/useProfileSave'

const COLORS = {
  navy: '#0D1B3E',
  gold: '#C9973A',
  red: '#DC2626',
  slate: '#64748B',
  border: '#E2E8F0',
}

const QUESTIONS = [
  {
    id: 'openQ1',
    label: 'Describe a challenging caregiving moment and how you handled it.',
    placeholder: 'Tell agencies about a time you faced a difficult situation...',
    maxLength: 200,
    optional: false,
  },
  {
    id: 'openQ2',
    label: 'How do you ensure client safety and wellbeing on every shift?',
    placeholder: 'Describe your approach to keeping clients safe...',
    maxLength: 200,
    optional: false,
  },
  {
    id: 'openQ3',
    label: "Is there anything else you'd like agencies to know about you?",
    placeholder: 'Anything that makes you stand out as a caregiver...',
    maxLength: 300,
    optional: true,
  },
]

const getTier = (pct: number) => {
  if (pct >= 90) return { label: 'Gold', color: '#92400E', bg: '#FDF6EC', border: '#C9973A' }
  if (pct >= 70) return { label: 'Silver', color: '#374151', bg: '#F8FAFC', border: '#94A3B8' }
  if (pct >= 50) return { label: 'Bronze', color: '#92400E', bg: '#FFF7ED', border: '#F59E0B' }
  return { label: 'Basic', color: COLORS.slate, bg: '#F8FAFC', border: COLORS.border }
}

const styles = {
  sectionHeader: {
    fontSize: '13px',
    fontWeight: 600,
    color: COLORS.slate,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.08em',
    marginBottom: '16px',
  },
  banner: {
    background: '#FFFBF0',
    border: '1px solid ' + COLORS.gold,
    borderRadius: '8px',
    padding: '12px 16px',
    fontSize: '14px',
    color: '#92400E',
    marginBottom: '24px',
  },
  questionCard: {
    background: 'white',
    border: '1px solid ' + COLORS.border,
    borderRadius: '12px',
    padding: '24px',
  },
  questionLabel: {
    fontSize: '18px',
    fontWeight: 600,
    color: COLORS.navy,
    marginBottom: '8px',
    lineHeight: 1.4,
    display: 'block',
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
    textAlign: 'right' as const,
    marginTop: '4px',
  },
  progressBar: {
    height: '4px',
    background: COLORS.border,
    borderRadius: '2px',
    marginBottom: '16px',
  },
}

export default function Step10OpenQuestions() {
  const { formData } = useProfileForm()
  const { saveField } = useProfileSave()
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [isComplete, setIsComplete] = useState(false)

  const answers = [
    formData.openQ1 || '',
    formData.openQ2 || '',
    formData.openQ3 || '',
  ]

  const profileCompletionPct = formData.profileCompletionPct || 0
  const currentQ = QUESTIONS[currentQuestion]
  const currentAnswer = answers[currentQuestion]
  const tier = getTier(profileCompletionPct)
  const progressPercent = ((currentQuestion + 1) / QUESTIONS.length) * 100

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

  const goNext = () => {
    if (currentQuestion < QUESTIONS.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    } else {
      setIsComplete(true)
    }
  }

  const goBack = () => {
    if (currentQuestion > 0) setCurrentQuestion(currentQuestion - 1)
  }

  if (isComplete) {
    const profileId = (formData as any).id
    const caregiverCode = (formData as any).caregiverCode || (formData as any).caregiver_code

    return (
      <div style={{ fontFamily: 'system-ui, sans-serif', color: COLORS.navy }}>
        <div style={{
          background: '#F0FDF4',
          border: '2px solid #16A34A',
          borderRadius: '12px',
          padding: '32px',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#15803D', marginBottom: '12px' }}>
            Your profile is complete
          </div>
          <p style={{ fontSize: '15px', color: '#15803D', marginBottom: '8px' }}>
            Agencies can now discover you.
          </p>

          {/* Tier badge */}
          <div style={{
            display: 'inline-block',
            padding: '6px 20px',
            borderRadius: '20px',
            background: tier.bg,
            border: '1px solid ' + tier.border,
            color: tier.color,
            fontSize: '14px',
            fontWeight: 600,
            marginBottom: '24px',
          }}>
            {tier.label} Profile — {profileCompletionPct}% complete
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => profileId && (window.location.href = `/profile/${profileId}`)}
              disabled={!profileId}
              style={{
                background: COLORS.navy,
                color: 'white',
                padding: '12px 24px',
                borderRadius: '8px',
                fontSize: '15px',
                fontWeight: 600,
                cursor: profileId ? 'pointer' : 'not-allowed',
                border: 'none',
                opacity: profileId ? 1 : 0.5,
              }}
            >
              View My Profile
            </button>
            <button
              type="button"
              onClick={() => caregiverCode && (window.location.href = `/id/${caregiverCode}`)}
              disabled={!caregiverCode}
              style={{
                background: 'white',
                color: COLORS.navy,
                border: '2px solid ' + COLORS.navy,
                padding: '12px 24px',
                borderRadius: '8px',
                fontSize: '15px',
                fontWeight: 600,
                cursor: caregiverCode ? 'pointer' : 'not-allowed',
                opacity: caregiverCode ? 1 : 0.5,
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

      <div style={styles.banner}>
        Caregivers who answer these questions receive 3x more agency views. All answers are optional.
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <span style={{ fontSize: '13px', color: COLORS.slate }}>
          Question {currentQuestion + 1} of {QUESTIONS.length}
        </span>
        {currentQ.optional && (
          <span style={{ fontSize: '12px', color: COLORS.slate }}>Optional</span>
        )}
      </div>

      <div style={styles.progressBar}>
        <div style={{ height: '100%', background: COLORS.gold, width: progressPercent + '%', borderRadius: '2px', transition: 'width 0.3s' }} />
      </div>

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
      </div>

      {/* Single nav row — Back + one primary action */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '24px' }}>
        <button
          type="button"
          onClick={goBack}
          disabled={currentQuestion === 0}
          style={{
            padding: '12px 24px', borderRadius: '8px', fontSize: '15px', fontWeight: 600,
            cursor: currentQuestion === 0 ? 'not-allowed' : 'pointer',
            border: '1px solid ' + COLORS.border,
            background: currentQuestion === 0 ? '#F1F5F9' : 'white',
            color: currentQuestion === 0 ? '#94A3B8' : COLORS.navy,
          }}
        >
          Back
        </button>

        <button
          type="button"
          onClick={goNext}
          style={{
            padding: '12px 24px', borderRadius: '8px', fontSize: '15px', fontWeight: 600,
            cursor: 'pointer', border: 'none',
            background: currentQuestion === QUESTIONS.length - 1 ? COLORS.gold : COLORS.navy,
            color: currentQuestion === QUESTIONS.length - 1 ? COLORS.navy : 'white',
          }}
        >
          {currentQuestion === QUESTIONS.length - 1 ? 'Complete Profile' : 'Next'}
        </button>
      </div>

    </div>
  )
}
