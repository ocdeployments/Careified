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

// Scenario questions with scoring
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
    id: 'emotional_regulation',
    question: "A family member snaps at you unfairly during a stressful moment. How do you respond?",
    options: [
      { id: 'A', text: "I stay calm in the moment and continue — it doesn't linger with me", style: 'absorbs', score: 4.0 },
      { id: 'B', text: "I stay professional in the moment but need time to process after", style: 'processes', score: 3.0 }
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
    id: 'resilience',
    question: "A client you've cared for passes away. How do you typically respond?",
    options: [
      { id: 'A', text: "I form deep bonds — I may stay in touch with the family afterward", style: 'relational', score: 4.0 },
      { id: 'B', text: "I process the loss and consciously close that chapter professionally", style: 'boundaried', score: 3.0 }
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
}

type Step = 'scenarios' | 'style' | 'strengths' | 'environment' | 'philosophy'

export default function Step7Personality() {
  const { formData } = useProfileForm()
  const { saveField } = useProfileSave()
  const [currentStep, setCurrentStep] = useState<Step>('scenarios')
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [scenarios, setScenarios] = useState<Record<string, any>>({})

  const personalityProfile = formData.personalityProfile || {}
  const savedScenarios = personalityProfile.scenarios || {}
  const savedStyle = personalityProfile.style || {}
  const savedStrengths = personalityProfile.strengths || []
  const savedEnvironment = personalityProfile.environment || {}
  const savedPhilosophy = personalityProfile.philosophy || {}

  const handleScenarioAnswer = (scenarioId: string, option: any) => {
    const updated = { ...scenarios, [scenarioId]: { style: option.style, score: option.score } }
    setScenarios(updated)
    saveField('personalityProfile', {
      ...personalityProfile,
      scenarios: updated
    })
    
    if (currentQuestion < SCENARIOS.length - 1) {
      setTimeout(() => setCurrentQuestion(currentQuestion + 1), 300)
    } else {
      setTimeout(() => setCurrentStep('style'), 300)
    }
  }

  const handleStyleChange = (key: string, value: string) => {
    const updated = { ...savedStyle, [key]: value }
    saveField('personalityProfile', {
      ...personalityProfile,
      style: updated
    })
  }

  const toggleStrength = (strength: string) => {
    if (savedStrengths.includes(strength)) {
      saveField('personalityProfile', {
        ...personalityProfile,
        strengths: savedStrengths.filter((s: string) => s !== strength)
      })
    } else if (savedStrengths.length < 5) {
      saveField('personalityProfile', {
        ...personalityProfile,
        strengths: [...savedStrengths, strength]
      })
    }
  }

  const handleEnvironmentChange = (key: string, value: string) => {
    saveField('personalityProfile', {
      ...personalityProfile,
      environment: { ...savedEnvironment, [key]: value }
    })
  }

  const handlePhilosophyChange = (key: string, value: string) => {
    saveField('personalityProfile', {
      ...personalityProfile,
      philosophy: { ...savedPhilosophy, [key]: value }
    })
  }

  const progressPercent = ((currentQuestion + 1) / SCENARIOS.length) * 100
  const currentScenario = SCENARIOS[currentQuestion]
  const selectedAnswer = scenarios[currentScenario?.id] || savedScenarios[currentScenario?.id]

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', color: COLORS.navy }}>
      {/* PART 1: SCENARIO QUESTIONS */}
      {currentStep === 'scenarios' && (
        <div style={styles.section}>
          <div style={styles.sectionHeader}>Working Style Assessment</div>
          <p style={{ fontSize: '13px', color: COLORS.slate, marginBottom: '16px' }}>
            There are no right or wrong answers. Choose the response that feels most natural to you.
          </p>
          
          {/* Progress bar */}
          <div style={styles.progressBar}>
            <div style={{ height: '100%', background: COLORS.gold, width: progressPercent + '%', borderRadius: '2px', transition: 'width 0.3s' }} />
          </div>
          <p style={{ fontSize: '12px', color: COLORS.slate, marginBottom: '16px' }}>
            Question {currentQuestion + 1} of {SCENARIOS.length}
          </p>

          {/* Scenario card */}
          <div style={styles.scenarioCard}>
            <p style={{ fontSize: '15px', fontWeight: 600, color: COLORS.navy, marginBottom: '20px' }}>
              {currentScenario?.question}
            </p>
            
            {currentScenario?.options.map((option: any) => (
              <div
                key={option.id}
                onClick={() => handleScenarioAnswer(currentScenario.id, option)}
                style={{
                  ...styles.answerOption,
                  border: selectedAnswer?.style === option.style ? '2px solid ' + COLORS.gold : '1px solid ' + COLORS.border,
                  background: selectedAnswer?.style === option.style ? '#FFFBF0' : 'white',
                }}
              >
                <span style={{ fontSize: '14px', color: COLORS.navy }}>{option.text}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PART 2: WORKING STYLE */}
      {currentStep === 'style' && (
        <div style={styles.section}>
          <div style={styles.sectionHeader}>Working Style</div>
          
          <div style={{ marginBottom: '20px' }}>
            <label style={styles.label}>I work best when...</label>
            <select
              value={savedStyle.autonomy || ''}
              onChange={e => handleStyleChange('autonomy', e.target.value)}
              style={styles.input}
            >
              <option value="">Select...</option>
              {AUTONOMY_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={styles.label}>My preferred work pace is...</label>
            <select
              value={savedStyle.pace || ''}
              onChange={e => handleStyleChange('pace', e.target.value)}
              style={styles.input}
            >
              <option value="">Select...</option>
              {PACE_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={styles.label}>When it comes to social interaction with clients...</label>
            <select
              value={savedStyle.social_energy || ''}
              onChange={e => handleStyleChange('social_energy', e.target.value)}
              style={styles.input}
            >
              <option value="">Select...</option>
              {SOCIAL_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={styles.label}>When there is a disagreement with a family member or agency...</label>
            <select
              value={savedStyle.conflict || ''}
              onChange={e => handleStyleChange('conflict', e.target.value)}
              style={styles.input}
            >
              <option value="">Select...</option>
              {CONFLICT_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          </div>

          <button
            type="button"
            onClick={() => setCurrentStep('strengths')}
            style={{ padding: '12px 24px', background: COLORS.navy, color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}
          >
            Continue
          </button>
        </div>
      )}

      {/* PART 3: TOP STRENGTHS */}
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
                  key={strength}
                  type="button"
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

          <button
            type="button"
            onClick={() => setCurrentStep('environment')}
            style={{ padding: '12px 24px', background: COLORS.navy, color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}
          >
            Continue
          </button>
        </div>
      )}

      {/* PART 4: WORK ENVIRONMENT */}
      {currentStep === 'environment' && (
        <div style={styles.section}>
          <div style={styles.sectionHeader}>Work Environment</div>

          <div style={{ marginBottom: '20px' }}>
            <label style={styles.label}>Pets</label>
            <select
              value={savedEnvironment.pets || ''}
              onChange={e => handleEnvironmentChange('pets', e.target.value)}
              style={styles.input}
            >
              <option value="">Select...</option>
              {PET_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={styles.label}>Smoking</label>
            <select
              value={savedEnvironment.smoke || ''}
              onChange={e => handleEnvironmentChange('smoke', e.target.value)}
              style={styles.input}
            >
              <option value="">Select...</option>
              {SMOKE_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={styles.label}>Noise level</label>
            <select
              value={savedEnvironment.noise || ''}
              onChange={e => handleEnvironmentChange('noise', e.target.value)}
              style={styles.input}
            >
              <option value="">Select...</option>
              {NOISE_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={styles.label}>Physical demands</label>
            <select
              value={savedEnvironment.physical || ''}
              onChange={e => handleEnvironmentChange('physical', e.target.value)}
              style={styles.input}
            >
              <option value="">Select...</option>
              {PHYSICAL_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          </div>

          <button
            type="button"
            onClick={() => setCurrentStep('philosophy')}
            style={{ padding: '12px 24px', background: COLORS.navy, color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}
          >
            Continue
          </button>
        </div>
      )}

      {/* PART 5: CARE PHILOSOPHY */}
      {currentStep === 'philosophy' && (
        <div style={styles.section}>
          <div style={styles.sectionHeader}>Care Philosophy (Optional)</div>

          <div style={{ marginBottom: '20px' }}>
            <label style={styles.label}>How would you describe your approach to caregiving?</label>
            <textarea
              value={savedPhilosophy.approach || ''}
              onChange={e => handlePhilosophyChange('approach', e.target.value)}
              maxLength={300}
              rows={3}
              style={{ ...styles.input, resize: 'vertical', minHeight: '100px' }}
            />
            <p style={{ fontSize: '11px', color: COLORS.slate, marginTop: '4px' }}>{(savedPhilosophy.approach || '').length}/300 characters</p>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={styles.label}>What drew you to caregiving?</label>
            <textarea
              value={savedPhilosophy.why || ''}
              onChange={e => handlePhilosophyChange('why', e.target.value)}
              maxLength={300}
              rows={3}
              style={{ ...styles.input, resize: 'vertical', minHeight: '100px' }}
            />
            <p style={{ fontSize: '11px', color: COLORS.slate, marginTop: '4px' }}>{(savedPhilosophy.why || '').length}/300 characters</p>
          </div>
        </div>
      )}
    </div>
  )
}