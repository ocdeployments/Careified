'use client'

import { useState } from 'react'
import { useProfileForm } from '@/lib/context/ProfileFormContext'
import { useProfileSave } from '@/lib/hooks/useProfileSave'

const COLORS = {
  navy: '#0D1B3E',
  gold: '#C9973A',
  red: '#DC2626',
  slate: '#64748B',
  border: '#E2E8F0',
}

const SCENARIOS = [
  {
    id: 'patience',
    question: "A client with dementia asks you the same question for the fifth time in an hour. What feels most natural?",
    options: [
      { id: 'A', text: "I answer fresh each time — it genuinely doesn't wear on me", style: 'natural', score: 4.0 },
      { id: 'B', text: "I stay calm and professional, though I'm aware of the repetition", style: 'effort', score: 3.0 }
    ]
  },
  {
    id: 'empathy',
    question: "You sense that a client's family member is upset about something but hasn't said anything. What do you do?",
    options: [
      { id: 'A', text: "I check in directly — I'd rather name it than let it linger", style: 'proactive', score: 4.0 },
      { id: 'B', text: "I stay observant and give space — I act if I become more certain", style: 'observant', score: 3.0 }
    ]
  },
  {
    id: 'adaptability',
    question: "Halfway through your shift, the care plan changes significantly. Your reaction?",
    options: [
      { id: 'A', text: "I adapt immediately and work with the new information", style: 'flexible', score: 4.0 },
      { id: 'B', text: "I prefer to confirm with the agency before changing my approach", style: 'protocol', score: 3.0 }
    ]
  },
  {
    id: 'communication',
    question: "At the end of your shift you notice something concerning about the client's condition. What do you do?",
    options: [
      { id: 'A', text: "I call or message the agency or family the same evening", style: 'proactive', score: 4.0 },
      { id: 'B', text: "I document it thoroughly and report at the next scheduled contact", style: 'documentation', score: 3.0 }
    ]
  },
  {
    id: 'emergency_response',
    question: "You are alone with a client who suddenly becomes unresponsive. What is your first action?",
    options: [
      { id: 'A', text: "Call 911 immediately — every second counts", style: 'protocol_first', score: 4.0 },
      { id: 'B', text: "Try to rouse them first, then call if they don't respond", style: 'assess_first', score: 3.0 }
    ]
  },
  {
    id: 'problem_solving',
    question: "A client refuses their medication. What is your approach?",
    options: [
      { id: 'A', text: "I try different approaches — timing, explanation, distraction — until something works", style: 'experimental', score: 4.0 },
      { id: 'B', text: "I document the refusal and involve the agency or family right away", style: 'collaborative', score: 3.0 }
    ]
  },
  {
    id: 'observation',
    question: "You notice a client seems more withdrawn than usual and hasn't finished meals for two days. What do you do?",
    options: [
      { id: 'A', text: "I document it and report to the agency or family the same day", style: 'proactive', score: 4.0 },
      { id: 'B', text: "I monitor for another day to see if it continues before acting", style: 'observant', score: 3.0 }
    ]
  }
]

const STRENGTH_OPTIONS = [
  'Patience', 'Empathy', 'Reliability', 'Attention to detail',
  'Physical stamina', 'Emotional resilience', 'Communication',
  'Problem solving', 'Cultural sensitivity', 'Adaptability',
  'Medical knowledge', 'Companionship'
]

const AUTONOMY_OPTIONS = [
  "I have clear instructions and check in regularly",
  "I have a care plan but make day-to-day decisions independently",
  "I am given full autonomy and trusted to manage the shift"
]

const PACE_OPTIONS = [
  "Steady and routine — I thrive on consistency",
  "Varied — I like a mix of routine and new situations",
  "Fast-paced — I handle multiple priorities well"
]

const SOCIAL_OPTIONS = [
  "I am energised by conversation and engagement",
  "I balance interaction with quiet companionable presence",
  "I respect when clients prefer minimal interaction"
]

const CONFLICT_OPTIONS = [
  "I address it directly and immediately",
  "I take time to reflect before responding",
  "I defer to agency guidance in all cases"
]

const PET_OPTIONS = ['No pets', 'Dogs OK', 'Cats OK', 'All pets OK', 'Allergic to pets']
const SMOKE_OPTIONS = ['Non-smoking only', 'Occasional smoke OK', 'Smoking household OK']
const NOISE_OPTIONS = ['Quiet environment preferred', 'Moderate noise OK', 'High activity OK']
const PHYSICAL_OPTIONS = ['Light duties only', 'Moderate physical demands', 'Heavy lifting OK (50+ lbs)']

const styles = {
  sectionHeader: {
    fontSize: '13px',
    fontWeight: 600,
    color: COLORS.slate,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.08em',
    marginBottom: '16px',
  },
  section: { marginBottom: '32px' },
  scenarioCard: {
    background: 'white',
    border: '1px solid ' + COLORS.border,
    borderRadius: '12px',
    padding: '24px',
    marginBottom: '16px',
  },
  answerOption: {
    background: 'white',
    border: '1px solid ' + COLORS.border,
    borderRadius: '8px',
    padding: '16px',
    cursor: 'pointer',
    marginBottom: '8px',
    width: '100%',
    textAlign: 'left' as const,
  },
  progressBar: {
    height: '4px',
    background: COLORS.border,
    borderRadius: '2px',
    marginBottom: '24px',
  },
  strengthChip: {
    background: '#F1F5F9',
    border: '1px solid ' + COLORS.border,
    borderRadius: '20px',
    padding: '6px 14px',
    cursor: 'pointer',
    fontSize: '13px',
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
  continueBtn: {
    padding: '12px 24px',
    background: COLORS.navy,
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 600,
    fontSize: '14px',
  },
  continueBtnDisabled: {
    padding: '12px 24px',
    background: '#E2E8F0',
    color: '#94A3B8',
    border: 'none',
    borderRadius: '8px',
    cursor: 'not-allowed',
    fontWeight: 600,
    fontSize: '14px',
  },
  warningText: {
    fontSize: '12px',
    color: COLORS.red,
    marginTop: '8px',
  },
}

type Step = 'scenarios' | 'style' | 'strengths' | 'environment' | 'philosophy'

export default function Step7Personality() {
  const { formData } = useProfileForm()
  const { saveField } = useProfileSave()
  const [currentStep, setCurrentStep] = useState<Step>('scenarios')
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [scenarios, setScenarios] = useState<Record<string, { style: string; score: number }>>({})
  const [showIncompleteWarning, setShowIncompleteWarning] = useState(false)

  const personalityProfile = formData.personalityProfile || {}
  const savedScenarios = personalityProfile.scenarios || {}
  const savedStyle = personalityProfile.style || {}
  const savedStrengths = personalityProfile.strengths || []
  const savedEnvironment = personalityProfile.environment || {}
  const savedPhilosophy = personalityProfile.philosophy || {}

  // Merge in-progress answers with saved
  const allAnswers = { ...savedScenarios, ...scenarios }
  const answeredCount = SCENARIOS.filter(s => allAnswers[s.id]).length
  const allScenariosComplete = answeredCount === SCENARIOS.length

  const handleScenarioAnswer = (scenarioId: string, option: { style: string; score: number }) => {
    const updated = { ...scenarios, [scenarioId]: { style: option.style, score: option.score } }
    setScenarios(updated)
    setShowIncompleteWarning(false)
    saveField('personalityProfile', { ...personalityProfile, scenarios: { ...savedScenarios, ...updated } })

    if (currentQuestion < SCENARIOS.length - 1) {
      setTimeout(() => setCurrentQuestion(currentQuestion + 1), 300)
    }
  }

  const handleAdvanceFromScenarios = () => {
    if (!allScenariosComplete) {
      setShowIncompleteWarning(true)
      // Jump to first unanswered
      const firstUnanswered = SCENARIOS.findIndex(s => !allAnswers[s.id])
      if (firstUnanswered !== -1) setCurrentQuestion(firstUnanswered)
      return
    }
    setCurrentStep('style')
  }

  const handleStyleChange = (key: string, value: string) => {
    saveField('personalityProfile', { ...personalityProfile, style: { ...savedStyle, [key]: value } })
  }

  const toggleStrength = (strength: string) => {
    if (savedStrengths.includes(strength)) {
      saveField('personalityProfile', { ...personalityProfile, strengths: savedStrengths.filter((s: string) => s !== strength) })
    } else if (savedStrengths.length < 5) {
      saveField('personalityProfile', { ...personalityProfile, strengths: [...savedStrengths, strength] })
    }
  }

  const handleEnvironmentChange = (key: string, value: string) => {
    saveField('personalityProfile', { ...personalityProfile, environment: { ...savedEnvironment, [key]: value } })
  }

  const handlePhilosophyChange = (key: string, value: string) => {
    saveField('personalityProfile', { ...personalityProfile, philosophy: { ...savedPhilosophy, [key]: value } })
  }

  const currentScenario = SCENARIOS[currentQuestion]
  const selectedAnswer = allAnswers[currentScenario?.id]
  const progressPercent = (answeredCount / SCENARIOS.length) * 100

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', color: COLORS.navy }}>

      {/* PART 1: SCENARIOS */}
      {currentStep === 'scenarios' && (
        <div style={styles.section}>
          <div style={styles.sectionHeader}>Working Style Assessment</div>
          <p style={{ fontSize: '13px', color: COLORS.slate, marginBottom: '16px' }}>
            There are no right or wrong answers. Choose the response that feels most natural to you.
          </p>

          <div style={styles.progressBar}>
            <div style={{ height: '100%', background: COLORS.gold, width: progressPercent + '%', borderRadius: '2px', transition: 'width 0.3s' }} />
          </div>
          <p style={{ fontSize: '12px', color: COLORS.slate, marginBottom: '16px' }}>
            {answeredCount} of {SCENARIOS.length} answered
          </p>

          {/* Question navigation pills */}
          <div style={{ display: 'flex', gap: '6px', marginBottom: '20px', flexWrap: 'wrap' }}>
            {SCENARIOS.map((s, i) => {
              const answered = !!allAnswers[s.id]
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setCurrentQuestion(i)}
                  style={{
                    width: '28px', height: '28px', borderRadius: '50%',
                    border: currentQuestion === i ? '2px solid ' + COLORS.gold : '1px solid ' + COLORS.border,
                    background: answered ? COLORS.gold : (currentQuestion === i ? '#FDF6EC' : 'white'),
                    color: answered ? COLORS.navy : (currentQuestion === i ? COLORS.navy : COLORS.slate),
                    fontSize: '11px', fontWeight: 600, cursor: 'pointer',
                  }}
                >
                  {i + 1}
                </button>
              )
            })}
          </div>

          <div style={styles.scenarioCard}>
            <p style={{ fontSize: '15px', fontWeight: 600, color: COLORS.navy, marginBottom: '20px' }}>
              {currentScenario?.question}
            </p>
            {currentScenario?.options.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => handleScenarioAnswer(currentScenario.id, option)}
                style={{
                  ...styles.answerOption,
                  border: selectedAnswer?.style === option.style ? '2px solid ' + COLORS.gold : '1px solid ' + COLORS.border,
                  background: selectedAnswer?.style === option.style ? '#FFFBF0' : 'white',
                }}
              >
                <span style={{ fontSize: '14px', color: COLORS.navy }}>{option.text}</span>
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={handleAdvanceFromScenarios}
            style={allScenariosComplete ? styles.continueBtn : styles.continueBtnDisabled}
          >
            Continue
          </button>
          {showIncompleteWarning && (
            <p style={styles.warningText}>
              Please answer all {SCENARIOS.length} questions before continuing. Unanswered questions are highlighted above.
            </p>
          )}
        </div>
      )}

      {/* PART 2: WORKING STYLE */}
      {currentStep === 'style' && (
        <div style={styles.section}>
          <div style={styles.sectionHeader}>Working Style</div>

          {[
            { key: 'autonomy', label: 'I work best when...', options: AUTONOMY_OPTIONS },
            { key: 'pace', label: 'My preferred work pace is...', options: PACE_OPTIONS },
            { key: 'social_energy', label: 'When it comes to social interaction with clients...', options: SOCIAL_OPTIONS },
            { key: 'conflict', label: 'When there is a disagreement with a family member or agency...', options: CONFLICT_OPTIONS },
          ].map(({ key, label, options }) => (
            <div key={key} style={{ marginBottom: '20px' }}>
              <label style={styles.label}>{label}</label>
              <select
                value={savedStyle[key] || ''}
                onChange={e => handleStyleChange(key, e.target.value)}
                style={styles.input}
              >
                <option value="">Select...</option>
                {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>
          ))}

          <button type="button" onClick={() => setCurrentStep('strengths')} style={styles.continueBtn}>
            Continue
          </button>
        </div>
      )}

      {/* PART 3: STRENGTHS */}
      {currentStep === 'strengths' && (
        <div style={styles.section}>
          <div style={styles.sectionHeader}>Top Strengths</div>
          <p style={{ fontSize: '13px', color: COLORS.slate, marginBottom: '16px' }}>
            Select your top 5 strengths ({savedStrengths.length}/5 selected)
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '24px' }}>
            {STRENGTH_OPTIONS.map(strength => {
              const isSelected = savedStrengths.includes(strength)
              const isDisabled = !isSelected && savedStrengths.length >= 5
              return (
                <button
                  key={strength} type="button"
                  onClick={() => toggleStrength(strength)}
                  disabled={isDisabled}
                  style={{
                    ...styles.strengthChip,
                    background: isSelected ? '#FFFBF0' : '#F1F5F9',
                    border: isSelected ? '2px solid ' + COLORS.gold : '1px solid ' + COLORS.border,
                    color: isSelected ? '#92400E' : COLORS.navy,
                    opacity: isDisabled ? 0.5 : 1,
                    cursor: isDisabled ? 'not-allowed' : 'pointer',
                  }}
                >
                  {strength}
                </button>
              )
            })}
          </div>
          <button type="button" onClick={() => setCurrentStep('environment')} style={styles.continueBtn}>
            Continue
          </button>
        </div>
      )}

      {/* PART 4: ENVIRONMENT */}
      {currentStep === 'environment' && (
        <div style={styles.section}>
          <div style={styles.sectionHeader}>Work Environment</div>
          {[
            { key: 'pets', label: 'Pets', options: PET_OPTIONS },
            { key: 'smoke', label: 'Smoking', options: SMOKE_OPTIONS },
            { key: 'noise', label: 'Noise level', options: NOISE_OPTIONS },
            { key: 'physical', label: 'Physical demands', options: PHYSICAL_OPTIONS },
          ].map(({ key, label, options }) => (
            <div key={key} style={{ marginBottom: '20px' }}>
              <label style={styles.label}>{label}</label>
              <select
                value={savedEnvironment[key] || ''}
                onChange={e => handleEnvironmentChange(key, e.target.value)}
                style={styles.input}
              >
                <option value="">Select...</option>
                {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>
          ))}
          <button type="button" onClick={() => setCurrentStep('philosophy')} style={styles.continueBtn}>
            Continue
          </button>
        </div>
      )}

      {/* PART 5: PHILOSOPHY */}
      {currentStep === 'philosophy' && (
        <div style={styles.section}>
          <div style={styles.sectionHeader}>Care Philosophy (Optional)</div>
          {[
            { key: 'approach', label: 'How would you describe your approach to caregiving?' },
            { key: 'why', label: 'What drew you to caregiving?' },
          ].map(({ key, label }) => (
            <div key={key} style={{ marginBottom: '20px' }}>
              <label style={styles.label}>{label}</label>
              <textarea
                value={savedPhilosophy[key] || ''}
                onChange={e => handlePhilosophyChange(key, e.target.value)}
                maxLength={300}
                rows={3}
                style={{ ...styles.input, resize: 'vertical', minHeight: '100px' }}
              />
              <p style={{ fontSize: '11px', color: COLORS.slate, marginTop: '4px' }}>
                {(savedPhilosophy[key] || '').length}/300
              </p>
            </div>
          ))}
        </div>
      )}

    </div>
  )
}
