'use client'

import { useState } from 'react'
import { useProfileForm } from '@/lib/context/ProfileFormContext'
import { useProfileSave } from '@/lib/hooks/useProfileSave'
import { generateWorkingStyle } from '@/lib/profile-templates'
import { ChevronRight, ChevronLeft, CheckCircle } from 'lucide-react'

const FONT_SANS = "'Inter', sans-serif"
const FONT_SERIF = "'Inter', sans-serif"

const SCENARIOS = [
  {
    index: 0,
    trait: 'patience',
    situation: "A client with dementia asks you the same question for the 17th time in the last hour. Each time they ask, they seem genuinely worried.",
    options: [
      { id: 'A', text: "I answer warmly and freshly each time — I barely register it as repetition. Their worry feels real to me every time.", style: 'natural_acceptance', styleLabel: 'Natural acceptance', score: 4.0 },
      { id: 'B', text: "I answer calmly and reassuringly each time — I'm aware of the repetition but I manage my response professionally.", style: 'effort_patience', styleLabel: 'Disciplined patience', score: 3.0 },
    ],
  },
  {
    index: 1,
    trait: 'empathy',
    situation: "A client's adult daughter visits and says everything is fine, but something feels off — she seems distracted and close to tears.",
    options: [
      { id: 'A', text: "I check in with her directly — I name what I'm sensing and ask if she's okay.", style: 'proactive_naming', styleLabel: 'Proactive presence', score: 4.0 },
      { id: 'B', text: "I stay warm and attentive but don't name it — I watch for more signs and create space for her to open up.", style: 'observant_reserve', styleLabel: 'Observant reserve', score: 3.0 },
    ],
  },
  {
    index: 2,
    trait: 'adaptability',
    situation: "You arrive for a shift and find the care plan has changed significantly — different tasks, different schedule. The agency hasn't called yet.",
    options: [
      { id: 'A', text: "I adapt immediately — I work with the new situation, use my judgment, and follow up with the agency after the shift.", style: 'autonomous_adapter', styleLabel: 'Autonomous adapter', score: 4.0 },
      { id: 'B', text: "I do what I can safely do and call the agency before making changes — I want to confirm before acting.", style: 'protocol_oriented', styleLabel: 'Protocol-oriented', score: 3.0 },
    ],
  },
  {
    index: 3,
    trait: 'communication',
    situation: "At the end of your shift, you notice the client seemed more confused than usual, ate less than normal, and was quieter. Nothing alarming — just different.",
    options: [
      { id: 'A', text: "I call or message the family and agency that evening — even if it turns out to be nothing, I'd rather they know.", style: 'proactive_alerter', styleLabel: 'Proactive communicator', score: 4.0 },
      { id: 'B', text: "I document it thoroughly in my notes and mention it at my next agency contact — I don't want to alarm people unnecessarily.", style: 'documentation_first', styleLabel: 'Documentation-first', score: 3.0 },
    ],
  },
  {
    index: 4,
    trait: 'emotional_regulation',
    situation: "A client's adult son raises his voice at you about a care decision you made. You believe the decision was correct and in the client's best interest.",
    options: [
      { id: 'A', text: "I stay completely calm, let him finish, and explain my reasoning clearly. I can absorb the emotion without it affecting me.", style: 'absorbs_and_continues', styleLabel: 'Steady under pressure', score: 4.0 },
      { id: 'B', text: "I stay professional in the moment, but I need to step away briefly afterward to process — then I'm fully back.", style: 'processes_and_resets', styleLabel: 'Processes and resets', score: 3.0 },
    ],
  },
  {
    index: 5,
    trait: 'problem_solving',
    situation: "A client refuses their medication. You've tried the standard approaches. The medication is important but not immediately life-threatening.",
    options: [
      { id: 'A', text: "I keep trying different approaches — different timing, different framing, distraction, music. I'll find something that works.", style: 'experimental', styleLabel: 'Creative problem-solver', score: 4.0 },
      { id: 'B', text: "I document the refusal carefully, try the standard approaches, and escalate to the agency or family to decide next steps.", style: 'collaborative_escalator', styleLabel: 'Collaborative escalator', score: 3.0 },
    ],
  },
  {
    index: 6,
    trait: 'resilience',
    situation: "A client you have cared for closely for 8 months passes away. A few days later, their family calls to thank you personally.",
    options: [
      { id: 'A', text: "I feel the loss deeply. I may stay in touch with the family for a while — that connection was real and I honour it.", style: 'relational_attachment', styleLabel: 'Deeply relational', score: 4.0 },
      { id: 'B', text: "I allow myself to feel it, then I consciously close the chapter — I need to be emotionally present for my next client.", style: 'boundaried_professional', styleLabel: 'Boundaried professional', score: 3.0 },
    ],
  },
]

const WORKING_STYLES = {
  autonomy: [
    { value: 'independent', label: 'I prefer to work independently' },
    { value: 'collaborative', label: 'I prefer close team collaboration' },
    { value: 'either', label: 'Comfortable with either' },
  ],
  pace: [
    { value: 'steady_routine', label: 'Steady and routine — I thrive on consistency' },
    { value: 'varied_dynamic', label: 'Varied and dynamic — I like variety' },
    { value: 'either', label: 'Adaptable to either' },
  ],
  social_energy: [
    { value: 'energised', label: 'I am energised by client interaction' },
    { value: 'managed', label: 'I manage my energy carefully' },
    { value: 'ambivert', label: 'Depends on the day' },
  ],
  conflict_style: [
    { value: 'direct', label: 'I address conflict directly and promptly' },
    { value: 'collaborative', label: 'I prefer to talk it through calmly' },
    { value: 'avoidant', label: 'I tend to avoid conflict where possible' },
  ],
}

const WORKING_STYLE_LABELS: Record<string, string> = {
  autonomy: 'Work independence',
  pace: 'Work pace',
  social_energy: 'Social energy',
  conflict_style: 'Conflict approach',
}

const ENV_FACTORS = [
  { key: 'dogs', label: 'Homes with dogs' },
  { key: 'cats', label: 'Homes with cats' },
  { key: 'other_pets', label: 'Homes with other pets (birds, reptiles, etc.)' },
  { key: 'smoking_indoor', label: 'Smoking indoors' },
  { key: 'smoking_outdoor', label: 'Smoking outdoors only' },
  { key: 'clutter', label: 'Cluttered living spaces' },
  { key: 'large_family', label: 'Very large or active families' },
  { key: 'hoarding', label: 'Homes with hoarding tendencies' },
  { key: 'substance_use', label: 'Households with substance use present' },
]

const STRENGTH_OPTIONS = [
  'Patience', 'Warmth', 'Reliability', 'Empathy',
  'Attention to detail', 'Physical stamina', 'Emotional resilience',
  'Humour and lightness', 'Cultural sensitivity', 'Communication',
  'Initiative', 'Compassion',
]

const EXCELS_WITH_OPTIONS = [
  'Dementia and memory care', 'Long-term companionship',
  'High medical complexity', 'End-of-life care',
  'Highly independent clients', 'Clients with behavioural challenges',
  'Paediatric care', 'Rehabilitation and recovery',
  'Clients with mobility challenges', 'Mental health support',
]

const CLIENT_PERSONALITY_OPTIONS = [
  'Talkative and social', 'Quiet and reserved',
  'Strong-willed and independent', 'Warm and affectionate',
  'Humorous and playful', 'Anxious or worried',
  'Spiritual or faith-oriented', 'Intellectually curious',
]

const AVOID_OPTIONS = [
  'Aggressive or violent behaviour',
  'Hoarding environments',
  'Smoking households',
  'End-of-life / grief-heavy situations',
  'Multiple simultaneous clients',
  'Very high medical complexity',
  'Extremely isolated rural locations',
  'Aggressive family members',
]

const GROWTH_AREA_OPTIONS = [
  'Advanced dementia care', 'Palliative / end-of-life',
  'Medication administration', 'Cultural competency',
  'Complex medical equipment', 'Mental health support',
  'Paediatric care', 'Bariatric care',
]

export default function Step7Personality() {
  const { formData, updateField } = useProfileForm()
  const { saveField } = useProfileSave()

  const [scenarioIndex, setScenarioIndex] = useState(0)
  const [answered, setAnswered] = useState<Set<number>>(new Set())
  const [workingStyleText, setWorkingStyleText] = useState('')

  // Environment comfort state
  const envComfort = formData.environment_comfort || {}
  const envComplete = ENV_FACTORS.every(f => envComfort[f.key] === 'yes' || envComfort[f.key] === 'no' || envComfort[f.key] === 'prefer_not')

  const handleGenerateWorkingStyle = () => {
    const personality = getPersonality()
    const generated = generateWorkingStyle({
      scenarios: {
        patience: (personality.soft_skills as Record<string, unknown>)?.patience as 'A' | 'B' | undefined,
        empathy: (personality.soft_skills as Record<string, unknown>)?.empathy as 'A' | 'B' | undefined,
        adaptability: (personality.soft_skills as Record<string, unknown>)?.adaptability as 'A' | 'B' | undefined,
        communication: (personality.soft_skills as Record<string, unknown>)?.communication as 'A' | 'B' | undefined,
        emotional_regulation: (personality.soft_skills as Record<string, unknown>)?.emotional_regulation as 'A' | 'B' | undefined,
        problem_solving: (personality.soft_skills as Record<string, unknown>)?.problem_solving as 'A' | 'B' | undefined,
        resilience: (personality.soft_skills as Record<string, unknown>)?.resilience as 'A' | 'B' | undefined
      },
      specializations: formData.specializations || [],
      yearsExperience: formData.yearsExperience || 0,
      jobTitle: formData.jobTitle
    })
    setWorkingStyleText(generated)
    savePersonality({ working_style_summary: generated })
  }

  const getPersonality = () => (formData.personalityProfile || {}) as Record<string, unknown>
  const savePersonality = (updates: Record<string, unknown>) => {
    saveField('personalityProfile', { ...getPersonality(), ...updates })
  }

  const getCurrentAnswer = (scenarioIdx: number) => {
    const trait = SCENARIOS[scenarioIdx].trait
    const softSkills = (getPersonality().soft_skills || {}) as Record<string, unknown>
    return (softSkills[trait] as Record<string, unknown>)?.style as string | undefined
  }

  const handleScenarioAnswer = (scenarioIdx: number, option: typeof SCENARIOS[0]['options'][0]) => {
    const scenario = SCENARIOS[scenarioIdx]
    const softSkills = (getPersonality().soft_skills || {}) as Record<string, unknown>
    savePersonality({
      soft_skills: {
        ...softSkills,
        [scenario.trait]: {
          style: option.style,
          style_label: option.styleLabel,
          self_score: option.score,
          agency_scores: [],
          agency_count: 0,
          validated_score: null,
          display_score: option.score,
        },
      },
    })
    setAnswered(prev => new Set([...prev, scenarioIdx]))
    if (scenarioIdx < 6) {
      setTimeout(() => setScenarioIndex(scenarioIdx + 1), 600)
    }
  }

  const currentScenario = SCENARIOS[scenarioIndex]
  const currentAnswer = getCurrentAnswer(scenarioIndex)

  const getWorkingStyle = () => (getPersonality().working_style || {}) as Record<string, string>
  const getStrengths = () => (getPersonality().strengths || []) as string[]
  const getIdealMatch = () => (getPersonality().ideal_match || {}) as Record<string, string[]>
  const getGrowthAreas = () => (getPersonality().growth_areas || []) as string[]
  const getCarePhilosophy = () => (getPersonality().care_philosophy || {}) as Record<string, string>

  const toggleMulti = (key: string, value: string, current: string[], max: number) => {
    if (current.includes(value)) {
      return current.filter(v => v !== value)
    }
    if (current.length >= max) return current
    return [...current, value]
  }

  return (
    <div style={{ fontFamily: FONT_SANS, display: 'flex', flexDirection: 'column', gap: '40px' }}>
      {/* SECTION 1: SCENARIO QUESTIONS */}
      <div>
        <div style={{ marginBottom: '6px' }}>
          <span style={{ fontSize: '11px', color: '#94A3B8' }}>Question {scenarioIndex + 1} of 7</span>
        </div>
        
        {/* Progress bar */}
        <div style={{ width: '100%', height: '4px', background: '#E2E8F0', borderRadius: '999px', marginBottom: '16px' }}>
          <div style={{ 
            width: `${((scenarioIndex + 1) / 7) * 100}%`, 
            height: '4px', 
            background: 'linear-gradient(90deg, #C9973A, #E8B86D)',
            borderRadius: '999px',
            transition: 'width 0.3s ease'
          }} />
        </div>

        <span style={{ 
          display: 'inline-block', 
          fontSize: '10px', 
          fontWeight: 800,
          letterSpacing: '0.08em', 
          textTransform: 'uppercase',
          background: '#FDF6EC', 
          color: '#92400E',
          padding: '3px 10px', 
          borderRadius: '999px', 
          marginBottom: '16px' 
        }}>
          {currentScenario.trait}
        </span>

        <p style={{ 
          fontSize: '15px', 
          fontFamily: FONT_SERIF, 
          color: '#0D1B3E',
          lineHeight: 1.6, 
          marginBottom: '20px' 
        }}>
          {currentScenario.situation}
        </p>

        {currentScenario.options.map((option) => {
          const isSelected = currentAnswer === option.style
          return (
            <div
              key={option.id}
              onClick={() => handleScenarioAnswer(scenarioIndex, option)}
              style={{
                padding: '16px 20px',
                borderRadius: '14px',
                cursor: 'pointer',
                border: isSelected ? '2px solid #C9973A' : '1px solid #E2E8F0',
                background: isSelected ? '#FDF6EC' : 'white',
                marginBottom: '10px',
                transition: 'all 0.15s ease',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '14px',
              }}
            >
              {isSelected ? (
                <CheckCircle size={16} color="#C9973A" style={{ flexShrink: 0, marginTop: '2px' }} />
              ) : (
                <div style={{ width: 16, height: 16, border: '2px solid #CBD5E1', borderRadius: '50%', flexShrink: 0, marginTop: '2px' }} />
              )}
              <span style={{ 
                fontSize: '13px', 
                lineHeight: 1.6,
                color: isSelected ? '#92400E' : '#475569',
                fontWeight: isSelected ? 600 : 400 
              }}>
                {option.text}
              </span>
            </div>
          )
        })}

        {/* Navigation */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px' }}>
          {scenarioIndex > 0 && (
            <button
              onClick={() => setScenarioIndex(s => s - 1)}
              style={{
                display: 'flex', alignItems: 'center', gap: '4px',
                fontSize: '13px', fontWeight: 500,
                color: '#64748B', background: 'none',
                border: 'none', cursor: 'pointer',
                fontFamily: FONT_SANS,
              }}
            >
              <ChevronLeft size={16} /> Back
            </button>
          )}
          {scenarioIndex < 6 && currentAnswer && (
            <button
              onClick={() => setScenarioIndex(s => s + 1)}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                fontSize: '13px', fontWeight: 600,
                padding: '10px 20px', borderRadius: '8px',
                background: 'linear-gradient(135deg, #C9973A, #E8B86D)',
                color: '#0D1B3E', border: 'none', cursor: 'pointer',
                fontFamily: FONT_SANS, marginLeft: 'auto',
              }}
            >
              Next <ChevronRight size={16} />
            </button>
          )}
        </div>

        {/* Completion banner */}
        {answered.size === 7 && envComplete && (
          <div style={{ 
            background: '#F0FDF4', 
            border: '1px solid #86EFAC',
            borderRadius: '12px', 
            padding: '14px 16px',
            marginTop: '16px',
            display: 'flex', 
            alignItems: 'center', 
            gap: '10px' 
          }}>
            <CheckCircle size={18} color="#16A34A" />
            <span style={{ fontSize: '13px', color: '#15803D', fontWeight: 600 }}>
              All 7 scenarios + environment answered — your style profile is saved
            </span>
          </div>
        )}
      </div>

      {/* SECTION 1B: ENVIRONMENT COMFORT */}
      <div style={{ marginTop: '40px', padding: '24px', backgroundColor: 'white', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
        <h3 style={{ fontSize: '15px', fontWeight: 800, fontFamily: FONT_SERIF, color: '#0D1B3E', margin: '0 0 4px' }}>Environment comfort</h3>
        <p style={{ fontSize: '12px', color: '#64748B', margin: '0 0 20px' }}>Be honest — agencies match based on this. There are no wrong answers.</p>
        
        {ENV_FACTORS.map(factor => (
          <div key={factor.key} style={{ marginBottom: '16px' }}>
            <div style={{ fontSize: '13px', fontWeight: 600, color: '#0D1B3E', marginBottom: '8px' }}>{factor.label}</div>
            <div style={{ display: 'flex', gap: '8px' }}>
              {(['yes', 'no', 'prefer_not'] as const).map(val => {
                const selected = envComfort[factor.key] === val
                return (
                  <button
                    key={val}
                    type="button"
                    onClick={() => {
                      const updated = { ...envComfort, [factor.key]: val }
                      updateField('environment_comfort', updated)
                    }}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '20px',
                      fontSize: '12px',
                      fontWeight: selected ? 700 : 400,
                      cursor: 'pointer',
                      border: selected ? '2px solid #C9973A' : '1px solid #1E3A8A',
                      background: selected ? '#C9973A' : 'white',
                      color: selected ? '#0D1B3E' : '#1E3A8A',
                      fontFamily: FONT_SANS,
                      transition: 'all 0.2s ease',
                    }}
                  >
                    {val === 'yes' ? 'Yes' : val === 'no' ? 'No' : 'Prefer not to say'}
                  </button>
                )
              })}
            </div>
          </div>
        ))}
        <div style={{ fontSize: '12px', fontWeight: 600, marginTop: '16px', color: envComplete ? '#16A34A' : '#C9973A' }}>
          {envComplete ? '✓ All environment factors answered' : `${Object.keys(envComfort).filter(k => envComfort[k]).length} / 9 answered`}
        </div>
      </div>

      {/* SECTION 2: WORKING STYLE */}
      <div style={{ marginTop: '40px' }}>
        <h3 style={{ fontSize: '15px', fontWeight: 800, fontFamily: FONT_SERIF, color: '#0D1B3E', margin: '0 0 4px' }}>Your working style</h3>
        <p style={{ fontSize: '12px', color: '#64748B', margin: '0 0 20px' }}>Select the option that best describes how you naturally work.</p>
        {(Object.keys(WORKING_STYLES) as Array<keyof typeof WORKING_STYLES>).map(groupKey => (
          <div key={groupKey} style={{ marginBottom: '20px' }}>
            <div style={{ fontSize: '12px', fontWeight: 700, color: '#0D1B3E', marginBottom: '8px' }}>{WORKING_STYLE_LABELS[groupKey]}</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {WORKING_STYLES[groupKey].map(opt => {
                const selected = getWorkingStyle()[groupKey] === opt.value
                return (
                  <button key={opt.value} type="button" onClick={() => savePersonality({ working_style: { ...getWorkingStyle(), [groupKey]: opt.value } })} style={{ padding: '8px 14px', borderRadius: '999px', fontSize: '12px', fontWeight: selected ? 700 : 400, cursor: 'pointer', border: selected ? '2px solid #C9973A' : '1px solid #E2E8F0', background: selected ? '#FDF6EC' : 'white', color: selected ? '#92400E' : '#64748B', fontFamily: FONT_SANS }}>{opt.label}</button>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {/* TEMPLATE GENERATION: Working Style Summary */}
      <div style={{ marginTop: '40px', padding: '24px', backgroundColor: '#F8FAFC', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
        <h3 style={{ fontSize: '15px', fontWeight: 800, fontFamily: FONT_SERIF, color: '#0D1B3E', margin: '0 0 4px' }}>Working Style Summary</h3>
        <p style={{ fontSize: '12px', color: '#64748B', margin: '0 0 16px' }}>Describe your approach to care in ~100 words. Click generate to auto-fill from your profile.</p>
        
        {!workingStyleText ? (
          <button
            onClick={handleGenerateWorkingStyle}
            style={{
              backgroundColor: '#F0F9FF',
              color: '#0369A1',
              padding: '12px 20px',
              borderRadius: '8px',
              border: '1px solid #BAE6FD',
              fontSize: '15px',
              fontWeight: 500,
              cursor: 'pointer',
              marginBottom: '12px',
              fontFamily: FONT_SANS
            }}
          >
            ✨ Generate from my profile
          </button>
        ) : null}
        
        <textarea
          value={workingStyleText}
          onChange={(e) => {
            setWorkingStyleText(e.target.value)
            savePersonality({ working_style_summary: e.target.value })
          }}
          placeholder="Click 'Generate' or write your own..."
          style={{
            width: '100%',
            minHeight: '150px',
            padding: '12px',
            fontSize: '16px',
            borderRadius: '8px',
            border: '1px solid #E2E8F0',
            fontFamily: FONT_SANS,
            resize: 'vertical'
          }}
        />
        <div style={{ fontSize: '12px', color: '#64748B', marginTop: '4px' }}>
          {workingStyleText.split(/\s+/).filter(Boolean).length} / 100 words
        </div>
      </div>

      {/* SECTION 3: STRENGTHS */}
      <div style={{ marginTop: '40px' }}>
        <h3 style={{ fontSize: '15px', fontWeight: 800, fontFamily: FONT_SERIF, color: '#0D1B3E', margin: '0 0 4px' }}>Your top 5 strengths</h3>
        <p style={{ fontSize: '12px', color: '#64748B', margin: '0 0 8px' }}>Select exactly 5. These appear on your profile.</p>
        <div style={{ fontSize: '12px', fontWeight: 700, marginBottom: '16px', color: getStrengths().length === 5 ? '#16A34A' : '#C9973A' }}>{getStrengths().length} / 5 selected</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '8px' }}>
          {STRENGTH_OPTIONS.map(strength => {
            const selected = getStrengths().includes(strength)
            const atLimit = getStrengths().length >= 5 && !selected
            return (
              <button key={strength} type="button" disabled={atLimit} onClick={() => { if (atLimit) return; const updated = selected ? getStrengths().filter(s => s !== strength) : [...getStrengths(), strength]; savePersonality({ strengths: updated }) }} style={{ padding: '10px 14px', borderRadius: '10px', fontSize: '12px', fontWeight: selected ? 700 : 400, cursor: atLimit ? 'not-allowed' : 'pointer', border: selected ? '2px solid #C9973A' : '1px solid #E2E8F0', background: selected ? '#FDF6EC' : 'white', color: selected ? '#92400E' : '#475569', opacity: atLimit ? 0.4 : 1, fontFamily: FONT_SANS, textAlign: 'left' }}>{strength}</button>
            )
          })}
        </div>
      </div>

      {/* SECTION 4: IDEAL MATCH */}
      <div style={{ marginTop: '40px' }}>
        <h3 style={{ fontSize: '15px', fontWeight: 800, fontFamily: FONT_SERIF, color: '#0D1B3E', margin: '0 0 4px' }}>Your ideal client match</h3>
        <p style={{ fontSize: '12px', color: '#64748B', margin: '0 0 20px' }}>Helps agencies understand where you do your best work. Be honest - this is a guide, not a filter.</p>
        
        <div style={{ marginBottom: '20px' }}>
          <div style={{ fontSize: '12px', fontWeight: 700, color: '#0D1B3E', marginBottom: '8px' }}>I do my best work with... <span style={{ fontWeight: 400, color: '#94A3B8', marginLeft: '6px' }}>(up to 4)</span></div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {EXCELS_WITH_OPTIONS.map(opt => {
              const current = getIdealMatch().excels_with || []
              const selected = current.includes(opt)
              const atLimit = current.length >= 4 && !selected
              return (
                <button key={opt} type="button" disabled={atLimit} onClick={() => { const updated = toggleMulti('excels_with', opt, current, 4); savePersonality({ ideal_match: { ...getIdealMatch(), excels_with: updated }}) }} style={{ padding: '8px 14px', borderRadius: '999px', fontSize: '12px', fontWeight: selected ? 700 : 400, cursor: atLimit ? 'not-allowed' : 'pointer', border: selected ? '2px solid #C9973A' : '1px solid #E2E8F0', background: selected ? '#FDF6EC' : 'white', color: selected ? '#92400E' : '#64748B', opacity: atLimit ? 0.4 : 1, fontFamily: FONT_SANS }}>{opt}</button>
              )
            })}
          </div>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <div style={{ fontSize: '12px', fontWeight: 700, color: '#0D1B3E', marginBottom: '8px' }}>I connect well with clients who are... <span style={{ fontWeight: 400, color: '#94A3B8', marginLeft: '6px' }}>(up to 3)</span></div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {CLIENT_PERSONALITY_OPTIONS.map(opt => {
              const current = getIdealMatch().client_personalities || []
              const selected = current.includes(opt)
              const atLimit = current.length >= 3 && !selected
              return (
                <button key={opt} type="button" disabled={atLimit} onClick={() => { const updated = toggleMulti('client_personalities', opt, current, 3); savePersonality({ ideal_match: { ...getIdealMatch(), client_personalities: updated }}) }} style={{ padding: '8px 14px', borderRadius: '999px', fontSize: '12px', fontWeight: selected ? 700 : 400, cursor: atLimit ? 'not-allowed' : 'pointer', border: selected ? '2px solid #1E3A8A' : '1px solid #E2E8F0', background: selected ? '#EFF6FF' : 'white', color: selected ? '#1E3A8A' : '#64748B', opacity: atLimit ? 0.4 : 1, fontFamily: FONT_SANS }}>{opt}</button>
              )
            })}
          </div>
        </div>

        <div>
          <div style={{ fontSize: '12px', fontWeight: 700, color: '#0D1B3E', marginBottom: '4px' }}>I work best when avoiding... <span style={{ fontWeight: 400, color: '#94A3B8', marginLeft: '6px' }}>(up to 3)</span></div>
          <div style={{ fontSize: '11px', color: '#94A3B8', marginBottom: '8px' }}>Honest answers here protect you and clients. This is not shown publicly.</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {AVOID_OPTIONS.map(opt => {
              const current = getIdealMatch().avoid_situations || []
              const selected = current.includes(opt)
              const atLimit = current.length >= 3 && !selected
              return (
                <button key={opt} type="button" disabled={atLimit} onClick={() => { const updated = toggleMulti('avoid_situations', opt, current, 3); savePersonality({ ideal_match: { ...getIdealMatch(), avoid_situations: updated }}) }} style={{ padding: '8px 14px', borderRadius: '999px', fontSize: '12px', fontWeight: selected ? 700 : 400, cursor: atLimit ? 'not-allowed' : 'pointer', border: selected ? '2px solid #B45309' : '1px solid #E2E8F0', background: selected ? '#FEF3C7' : 'white', color: selected ? '#92400E' : '#64748B', opacity: atLimit ? 0.4 : 1, fontFamily: FONT_SANS }}>{opt}</button>
              )
            })}
          </div>
        </div>
      </div>

      {/* SECTION 5: GROWTH AREAS */}
      <div style={{ marginTop: '40px' }}>
        <h3 style={{ fontSize: '15px', fontWeight: 800, fontFamily: FONT_SERIF, color: '#0D1B3E', margin: '0 0 4px' }}>Areas for growth</h3>
        <p style={{ fontSize: '12px', color: '#64748B', margin: '0 0 16px' }}>Select up to 3. Agencies appreciate self-awareness.</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {GROWTH_AREA_OPTIONS.map(opt => {
            const current = getGrowthAreas()
            const selected = current.includes(opt)
            const atLimit = current.length >= 3 && !selected
            return (
              <button key={opt} type="button" disabled={atLimit} onClick={() => { if (atLimit) return; const updated = selected ? current.filter(v => v !== opt) : [...current, opt]; savePersonality({ growth_areas: updated }) }} style={{ padding: '8px 14px', borderRadius: '999px', fontSize: '12px', fontWeight: selected ? 700 : 400, cursor: atLimit ? 'not-allowed' : 'pointer', border: selected ? '2px solid #C9973A' : '1px solid #E2E8F0', background: selected ? '#FDF6EC' : 'white', color: selected ? '#92400E' : '#64748B', opacity: atLimit ? 0.4 : 1, fontFamily: FONT_SANS }}>{opt}</button>
            )
          })}
        </div>
      </div>

      {/* SECTION 6: CARE PHILOSOPHY */}
      <div style={{ marginTop: '40px' }}>
        <h3 style={{ fontSize: '15px', fontWeight: 800, fontFamily: FONT_SERIF, color: '#0D1B3E', margin: '0 0 4px' }}>Care philosophy</h3>
        <p style={{ fontSize: '12px', color: '#64748B', margin: '0 0 20px' }}>Optional. These appear on your profile and help agencies understand who you are.</p>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#0D1B3E', marginBottom: '6px' }}>What drew you to caregiving?</label>
          <textarea rows={3} maxLength={300} defaultValue={getCarePhilosophy().motivation || ''} onBlur={e => savePersonality({ care_philosophy: { ...getCarePhilosophy(), motivation: e.target.value } })} placeholder="Share what brought you to this work..." style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #E2E8F0', fontSize: '13px', color: '#0D1B3E', fontFamily: FONT_SANS, resize: 'none', boxSizing: 'border-box', lineHeight: 1.6 }} />
          <div style={{ fontSize: '11px', color: '#94A3B8', marginTop: '4px', textAlign: 'right' }}>{(getCarePhilosophy().motivation || '').length} / 300</div>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#0D1B3E', marginBottom: '6px' }}>What brings you joy in your work?</label>
          <textarea rows={3} maxLength={300} defaultValue={getCarePhilosophy().brings_joy || ''} onBlur={e => savePersonality({ care_philosophy: { ...getCarePhilosophy(), brings_joy: e.target.value } })} placeholder="Describe a moment when you felt you made a real difference..." style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #E2E8F0', fontSize: '13px', color: '#0D1B3E', fontFamily: FONT_SANS, resize: 'none', boxSizing: 'border-box', lineHeight: 1.6 }} />
          <div style={{ fontSize: '11px', color: '#94A3B8', marginTop: '4px', textAlign: 'right' }}>{(getCarePhilosophy().brings_joy || '').length} / 300</div>
        </div>
      </div>
    </div>
  )
}
