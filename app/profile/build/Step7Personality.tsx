'use client'

import { useState } from 'react'
import { useProfileForm } from '@/lib/context/ProfileFormContext'
import { useProfileSave } from '@/lib/hooks/useProfileSave'
import { ChevronRight, ChevronLeft, CheckCircle } from 'lucide-react'

const FONT_SANS = "'DM Sans', sans-serif"
const FONT_SERIF = "'DM Serif Display', serif"

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

export default function Step7Personality() {
  const { formData } = useProfileForm()
  const { saveField } = useProfileSave()

  const [scenarioIndex, setScenarioIndex] = useState(0)
  const [answered, setAnswered] = useState<Set<number>>(new Set())

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
        {answered.size === 7 && (
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
              All 7 scenarios answered — your style profile is saved
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
