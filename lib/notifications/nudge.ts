// Careified — Profile Completion Nudge Logic
// Analyzes profile completeness and sends targeted notification

import { pool } from '@/lib/db'
import { createNotification, NotificationTemplates } from './create'

interface ProfileAnalysis {
  profileCompleteness: number
  hasPhoto: boolean
  claimStatus: string
  aggregateScore: number | null
}

function analyzeProfile(data: ProfileAnalysis): { nextStep: string; completionPct: number } {
  const { profileCompleteness, hasPhoto } = data

  // If no photo, always prioritize that
  if (!hasPhoto) {
    return { nextStep: 'Add your photo to get started', completionPct: profileCompleteness }
  }

  // Otherwise, determine next step based on completeness
  if (profileCompleteness < 20) {
    return { nextStep: 'Add your name and photo to get started', completionPct: profileCompleteness }
  } else if (profileCompleteness < 35) {
    return { nextStep: 'Add your services and experience', completionPct: profileCompleteness }
  } else if (profileCompleteness < 50) {
    return { nextStep: 'Add your availability to go live in search', completionPct: profileCompleteness }
  } else if (profileCompleteness < 68) {
    return { nextStep: 'Add your credentials to unlock your verified badge', completionPct: profileCompleteness }
  } else if (profileCompleteness < 82) {
    return { nextStep: 'Complete your personality assessment', completionPct: profileCompleteness }
  } else if (profileCompleteness < 95) {
    return { nextStep: 'Add work history and references', completionPct: profileCompleteness }
  } else {
    return { nextStep: 'Share your profile!', completionPct: profileCompleteness }
  }
}

export async function sendProfileNudge(caregiverId: string): Promise<void> {
  // Check if nudge was sent in last 7 days
  const existingNudge = await pool.query(
    `SELECT id FROM caregiver_notifications
     WHERE caregiver_id = $1
     AND type = 'profile_nudge'
     AND created_at > NOW() - INTERVAL '7 days'`,
    [caregiverId]
  )

  if (existingNudge.rows.length > 0) {
    return // Already nudged recently
  }

  // Fetch caregiver profile
  const caregiverResult = await pool.query(
    `SELECT profile_completeness_pct, photo_url, claim_status, aggregate_score
     FROM caregivers WHERE id = $1`,
    [caregiverId]
  )

  if (caregiverResult.rows.length === 0) {
    return
  }

  const data = caregiverResult.rows[0]
  const analysis = analyzeProfile({
    profileCompleteness: data.profile_completeness_pct || 0,
    hasPhoto: !!data.photo_url,
    claimStatus: data.claim_status,
    aggregateScore: data.aggregate_score,
  })

  await createNotification({
    caregiverId,
    type: 'profile_nudge',
    ...NotificationTemplates.profile_nudge(
      Math.round(analysis.completionPct),
      analysis.nextStep
    ),
    metadata: { completion_pct: analysis.completionPct, next_step: analysis.nextStep }
  })
}

export async function nudgeAllIncompleteCaregivers(): Promise<{ nudged: number; skipped: number }> {
  // Find caregivers to nudge
  const caregiversResult = await pool.query(
    `SELECT id FROM caregivers
     WHERE claim_status = 'claimed'
     AND profile_completeness_pct < 95
     AND id NOT IN (
       SELECT caregiver_id FROM caregiver_notifications
       WHERE type = 'profile_nudge'
       AND created_at > NOW() - INTERVAL '7 days'
     )
     LIMIT 50`
  )

  let nudged = 0
  let skipped = 0

  for (const row of caregiversResult.rows) {
    try {
      await sendProfileNudge(row.id)
      nudged++
    } catch {
      skipped++
    }
  }

  return { nudged, skipped }
}