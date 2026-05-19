// Careified — AIRecruit Profile Analysis Engine
// Analyzes caregiver profiles to generate campaign readiness scores and recommended call sequences

import { Pool } from 'pg'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 3,
  idleTimeoutMillis: 10000,
  connectionTimeoutMillis: 10000,
  allowExitOnIdle: true,
})

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY!

export interface ProfileGap {
  type: 'unverified_reference' | 'unverified_employer' | 'missing_credential' | 'incomplete_work_history' | 'no_references' | 'low_trust_score' | 'missing_photo'
  description: string
  severity: 'high' | 'medium' | 'low'
  action: string
  call_type?: string
}

export interface RecommendedCall {
  call_type: string
  reason: string
  priority: number
  target_name?: string
  target_id?: string
}

export interface RiskFlag {
  type: string
  description: string
  severity: 'high' | 'medium' | 'low'
}

export interface ProfileAnalysis {
  caregiver_id: string
  campaign_readiness: number
  readiness_label: 'ready' | 'needs_work' | 'incomplete'
  strengths: string[]
  gaps: ProfileGap[]
  recommended_calls: RecommendedCall[]
  risk_flags: RiskFlag[]
  ai_summary: string
  generated_at: string
  profile_completeness: number
}

export async function analyseProfile(caregiverId: string): Promise<ProfileAnalysis> {
  // 1. Fetch caregiver profile data
  const caregiverResult = await pool.query(
    `SELECT first_name, last_name, aggregate_score, photo_url, specializations,
            credentials, years_experience, claim_status, profile_status
     FROM caregivers WHERE id = $1`,
    [caregiverId]
  )

  if (caregiverResult.rows.length === 0) {
    throw new Error('Caregiver not found')
  }

  const caregiver = caregiverResult.rows[0]

  // 2. Fetch references
  const referencesResult = await pool.query(
    `SELECT id, name, verified, verification_tier FROM caregiver_references WHERE caregiver_id = $1`,
    [caregiverId]
  )
  const references = referencesResult.rows

  // 3. Fetch certifications
  const certsResult = await pool.query(
    `SELECT id, name, expiry_date FROM caregiver_certifications WHERE caregiver_id = $1`,
    [caregiverId]
  )
  const certifications = certsResult.rows

  // 4. Fetch reference call history
  const refCallsResult = await pool.query(
    `SELECT id, status FROM reference_calls WHERE caregiver_id = $1`,
    [caregiverId]
  )
  const referenceCalls = refCallsResult.rows

  // 5. Fetch employment verifications
  const empVerifResult = await pool.query(
    `SELECT id, employer_name, status FROM employment_verifications WHERE caregiver_id = $1`,
    [caregiverId]
  )
  const employmentVerifications = empVerifResult.rows

  // 6. Fetch communication consents
  const consentsResult = await pool.query(
    `SELECT consent_type, granted FROM caregiver_communication_consents WHERE caregiver_id = $1`,
    [caregiverId]
  )
  const consentsMap = new Map(consentsResult.rows.map(c => [c.consent_type, c.granted]))

  // 7. Calculate profile completeness
  let completenessScore = 0
  if (caregiver.first_name && caregiver.last_name) completenessScore += 10
  if (caregiver.photo_url) completenessScore += 15
  if (caregiver.specializations && caregiver.specializations.length > 0) completenessScore += 15
  if (caregiver.credentials && caregiver.credentials.length > 0) completenessScore += 15
  if (caregiver.years_experience) completenessScore += 10
  if (references.length > 0) completenessScore += 15
  if (referenceCalls.length > 0 || references.some(r => r.verified)) completenessScore += 10
  if (employmentVerifications.length > 0) completenessScore += 10

  const profile_completeness = Math.min(100, completenessScore)

  // 8. Identify gaps
  const gaps: ProfileGap[] = []
  const strengths: string[] = []

  // No references gap
  if (references.length === 0) {
    gaps.push({
      type: 'no_references',
      description: 'No professional references on file',
      severity: 'high',
      action: 'Add professional references to build trust',
      call_type: 'reference_calls'
    })
  } else {
    strengths.push(`${references.length} professional references on file`)

    // Unverified references
    const unverifiedRefs = references.filter(r => !r.verified)
    if (unverifiedRefs.length > 0) {
      gaps.push({
        type: 'unverified_reference',
        description: `${unverifiedRefs.length} reference(s) not yet verified by AI calls`,
        severity: 'medium',
        action: 'Run reference verification calls to confirm references',
        call_type: 'reference_calls'
      })
    } else {
      strengths.push('All references verified')
    }
  }

  // Employment verifications
  if (employmentVerifications.length > 0) {
    strengths.push(`${employmentVerifications.length} employer(s) verified`)
  } else {
    gaps.push({
      type: 'unverified_employer',
      description: 'No employment history verified',
      severity: 'medium',
      action: 'Run past employer verification calls',
      call_type: 'past_employer_calls'
    })
  }

  // Missing credentials
  if (!caregiver.credentials || caregiver.credentials.length === 0) {
    gaps.push({
      type: 'missing_credential',
      description: 'No credentials on file',
      severity: 'high',
      action: 'Add certifications and credentials',
      call_type: 'regulatory_calls'
    })
  }

  // Low trust score
  if (!caregiver.aggregate_score || caregiver.aggregate_score < 50) {
    gaps.push({
      type: 'low_trust_score',
      description: 'Trust score below 50 - limited verification data',
      severity: 'high',
      action: 'Complete reference and employer verifications to boost score'
    })
  } else {
    strengths.push(`Trust score: ${caregiver.aggregate_score}`)
  }

  // Missing photo
  if (!caregiver.photo_url) {
    gaps.push({
      type: 'missing_photo',
      description: 'No profile photo uploaded',
      severity: 'low',
      action: 'Upload a professional profile photo'
    })
  }

  // Incomplete profile
  if (profile_completeness < 50) {
    gaps.push({
      type: 'incomplete_work_history',
      description: `Profile is ${profile_completeness}% complete`,
      severity: 'high',
      action: 'Complete all profile sections'
    })
  }

  // 9. Calculate campaign readiness
  let campaign_readiness = 100

  if (gaps.some(g => g.type === 'no_references' && g.severity === 'high')) campaign_readiness -= 30
  const unverifiedRefGap = gaps.find(g => g.type === 'unverified_reference')
  if (unverifiedRefGap) campaign_readiness -= 15
  const unverifiedEmpGap = gaps.find(g => g.type === 'unverified_employer')
  if (unverifiedEmpGap) campaign_readiness -= 15
  if (gaps.some(g => g.type === 'missing_credential' && g.severity === 'high')) campaign_readiness -= 15
  if (gaps.some(g => g.type === 'low_trust_score')) campaign_readiness -= 20
  if (gaps.some(g => g.type === 'missing_photo')) campaign_readiness -= 5
  if (gaps.some(g => g.type === 'incomplete_work_history')) campaign_readiness -= 10

  campaign_readiness = Math.max(0, campaign_readiness)

  const readiness_label: 'ready' | 'needs_work' | 'incomplete' =
    campaign_readiness >= 70 ? 'ready' :
    campaign_readiness >= 40 ? 'needs_work' : 'incomplete'

  // 10. Build recommended calls based on gaps and consent
  const recommended_calls: RecommendedCall[] = []

  // Check consent for each call type
  const hasReferenceConsent = consentsMap.get('reference_calls') === true
  const hasEmployerConsent = consentsMap.get('past_employer_calls') === true

  // Sort gaps by severity and map to calls
  const sortedGaps = [...gaps].sort((a, b) => {
    const severityOrder = { high: 0, medium: 1, low: 2 }
    return severityOrder[a.severity] - severityOrder[b.severity]
  })

  let priority = 1
  for (const gap of sortedGaps) {
    if (gap.call_type === 'reference_calls' && hasReferenceConsent) {
      recommended_calls.push({
        call_type: 'reference_calls',
        reason: gap.description,
        priority: priority++,
        target_name: references.find(r => !r.verified)?.name
      })
    } else if (gap.call_type === 'past_employer_calls' && hasEmployerConsent) {
      recommended_calls.push({
        call_type: 'past_employer_calls',
        reason: gap.description,
        priority: priority++,
        target_name: 'Past employer verification'
      })
    }
  }

  // 11. Identify risk flags
  const risk_flags: RiskFlag[] = []

  // Short tenure flags
  if (caregiver.years_experience && caregiver.years_experience < 1) {
    risk_flags.push({
      type: 'short_tenure',
      description: 'Less than 1 year of experience',
      severity: 'medium'
    })
  }

  // No verification flags
  if (references.length > 0 && !references.some(r => r.verified)) {
    risk_flags.push({
      type: 'unverified_references',
      description: 'All references are unverified',
      severity: 'medium'
    })
  }

  // 12. Generate LLM summary
  let ai_summary = ''
  if (gaps.length === 0) {
    ai_summary = `${caregiver.first_name}'s profile is well-verified with ${references.length} references and employment history confirmed. Ready for immediate placement consideration.`
  } else {
    try {
      const summaryPrompt = `Generate a 2-3 sentence plain English summary of this caregiver's profile status for an agency. Use non-recommender language: "data indicates", "profile shows", never "we recommend" or "this caregiver is best".

Profile:
- Name: ${caregiver.first_name} ${caregiver.last_name}
- Completeness: ${profile_completeness}%
- Gaps: ${gaps.map(g => g.description).join('; ')}
- Strengths: ${strengths.join('; ')}

Return only the summary, no JSON.`

      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://careified.vercel.app',
          'X-Title': 'Careified',
        },
        body: JSON.stringify({
          model: 'upstage/ring-2.6-1t:free',
          messages: [
            { role: 'system', content: 'You are a helpful assistant that summarizes profile data.' },
            { role: 'user', content: summaryPrompt }
          ],
          temperature: 0.3,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        ai_summary = data.choices?.[0]?.message?.content || `${caregiver.first_name}'s profile shows ${gaps.length} gaps that could be addressed through verification calls.`
      }
    } catch (error) {
      console.error('Profile summary LLM error:', error)
      ai_summary = `${caregiver.first_name}'s profile shows ${gaps.length} gaps that could be addressed through verification calls.`
    }
  }

  return {
    caregiver_id: caregiverId,
    campaign_readiness,
    readiness_label,
    strengths,
    gaps,
    recommended_calls,
    risk_flags,
    ai_summary,
    generated_at: new Date().toISOString(),
    profile_completeness
  }
}