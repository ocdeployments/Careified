// Careified — Step-level save API
// Called when caregiver clicks Next on each step
// Saves all fields for that step in one transaction

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { Pool } from 'pg'

const pool = new Pool({
 connectionString: process.env.DATABASE_URL,
 ssl: { rejectUnauthorized: false },
})

// Step completion thresholds for profile_completion_pct
const STEP_COMPLETION: Record<number, number> = {
 1: 20,
 2: 35,
 3: 50, // Goes live at Basic after step 3
 4: 58,
 5: 68, // Verified badge after step 5
 6: 74,
 7: 82, // Professional after step 7
 8: 87,
 9: 92,
 10: 95,
}

export async function POST(req: NextRequest) {
 try {
 const { userId } = await auth()
 if (!userId) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
 }

 const { step, data } = await req.json()

 // Build SET clause from data object
 // Only include fields that are not undefined
 const setClauses: string[] = []
 const values: any[] = []
 let paramIndex = 1

 // Map camelCase keys to snake_case DB columns
 const fieldMap: Record<string, string> = {
  firstName: 'first_name',
  lastName: 'last_name',
  preferredName: 'preferred_name',
  jobTitle: 'job_title',
  dateOfBirth: 'date_of_birth',
  gender: 'gender',
  phone: 'phone',
  city: 'city',
  state: 'state',
  postalCode: 'postal_code',
  street: 'address',
  languages: 'languages',
  languageFluency: 'language_fluency',
  workAuthorisation: 'work_authorisation',
  emergencyContact: 'emergency_contact',
  bio: 'bio',
  photoUrl: 'photo_url',
  services: 'services',
  specializations: 'specializations',
  credentials: 'credentials',
  yearsExperience: 'years_experience',
  skillRatings: 'skill_ratings',
  clientTypes: 'client_types',
  unwillingTasks: 'unwilling_tasks',
  dietaryCooking: 'dietary_cooking',
  availabilityStatus: 'availability_status',
  weeklyGrid: 'weekly_grid',
  minHoursPerWeek: 'min_hours_per_week',
  maxHoursPerWeek: 'max_hours_per_week',
  placementTypes: 'placement_types',
  holidayAvailable: 'holiday_available',
  earliestStartDate: 'earliest_start_date',
  noticePeriod: 'notice_period',
  preferredAgeGroup: 'preferred_age_group',
  preferredSettings: 'preferred_settings',
  hourlyRateMin: 'hourly_rate',
  hourlyRateMax: 'hourly_rate_max',
  employmentType: 'employment_type',
  travelRadius: 'travel_radius',
  hasVehicle: 'has_vehicle',
  hasDriversLicense: 'has_drivers_license',
  willingToTransport: 'willing_to_transport',
  willingClientVehicle: 'willing_client_vehicle',
  transitAccessible: 'transit_accessible',
  willingLiveIn: 'willing_live_in',
  willingOvernight: 'willing_overnight',
  openToUrgent: 'open_to_urgent',
  education: 'education',
  currentlyEnrolled: 'currently_enrolled',
  backgroundConsent: 'background_consent',
  backgroundConsentDate: 'background_consent_date',
  vulnerableSectorCheck: 'vulnerable_sector_check',
  criminalDeclaration: 'criminal_declaration',
  criminalDeclarationDetail: 'criminal_declaration_detail',
  bondedInsured: 'bonded_insured',
  declarationAccurate: 'declaration_accurate',
  personalityProfile: 'personality_profile',
  workHistory: 'work_history',
  volunteerExperience: 'volunteer_experience',
  volunteerDescription: 'volunteer_description',
  familyCareExperience: 'family_care_experience',
  familyCareDescription: 'family_care_description',
  openQ1: 'open_q1',
  openQ2: 'open_q2',
  openQ3: 'open_q3',
 }

 for (const [key, val] of Object.entries(data)) {
  if (val === undefined) continue
  const col = fieldMap[key]
  if (!col) continue
  setClauses.push(`${col} = $${paramIndex++}`)
  values.push(val)
 }

 // Always update completion and phase
 const completionPct = STEP_COMPLETION[step] || 0
 setClauses.push(`profile_completion_pct = GREATEST(profile_completion_pct, $${paramIndex++})`)
 values.push(completionPct)
 setClauses.push(`profile_phase = GREATEST(profile_phase, $${paramIndex++})`)
 values.push(step)
 setClauses.push(`updated_at = NOW()`)

 if (setClauses.length === 0) {
  return NextResponse.json({ success: true, message: 'Nothing to save' })
 }

 // Upsert
 const { rows: existing } = await pool.query(
  'SELECT id FROM caregivers WHERE user_id = $1 LIMIT 1',
  [userId]
 )

 if (existing.length === 0) {
  await pool.query(
   `INSERT INTO caregivers (user_id, status, profile_completion_pct, profile_phase, updated_at)
 VALUES ($1, 'incomplete', $2, $3, NOW())`,
   [userId, completionPct, step]
  )
  // Then update with all fields
  if (setClauses.length > 2) {
   const updateValues = [...values, userId]
   await pool.query(
    `UPDATE caregivers SET ${setClauses.join(', ')} WHERE user_id = $${paramIndex}`,
    updateValues
   )
  }
 } else {
  const updateValues = [...values, userId]
  await pool.query(
   `UPDATE caregivers SET ${setClauses.join(', ')} WHERE user_id = $${paramIndex}`,
   updateValues
  )
 }

 // After step 3 — set status to 'approved' so profile goes live
 if (step >= 3) {
  await pool.query(
   `UPDATE caregivers SET status = CASE
 WHEN status = 'incomplete' THEN 'approved'
 ELSE status
 END WHERE user_id = $1`,
   [userId]
  )
 }

 // Run enrichment asynchronously (non-blocking)
 // This updates best_fit_profile and profile_strength_score
 // We don't await — the save response goes back immediately
 const caregiverIdResult = await pool.query(
  'SELECT id FROM caregivers WHERE user_id = $1 LIMIT 1',
  [userId]
 )
 if (caregiverIdResult.rows.length > 0) {
  const caregiverId = caregiverIdResult.rows[0].id
  // Import and call enrichment - fire and forget
  import('@/lib/enrichment').then(({ enrichAndPersist }) => {
   enrichAndPersist(pool, caregiverId).catch(err => {
    console.error('Enrichment failed (non-fatal):', err)
   })
  }).catch(() => {
   // Enrichment import failed - non-fatal
  })
 }

 return NextResponse.json({
  success: true,
  completionPct,
  goesLive: step === 3,
 })
 } catch (err) {
 console.error('save-step error:', err)
 return NextResponse.json({ error: 'Save failed' }, { status: 500 })
 }
}
