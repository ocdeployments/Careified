// Careified — Field-level save API
// Called on blur for individual fields
// Uses Clerk auth to identify user

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { Pool } from 'pg'

const pool = new Pool({
 connectionString: process.env.DATABASE_URL,
 ssl: { rejectUnauthorized: false },
})

// Map form field names to DB column names
const FIELD_MAP: Record<string, string> = {
 firstName: 'first_name',
 lastName: 'last_name',
 preferredName: 'preferred_name',
 jobTitle: 'job_title',
 dateOfBirth: 'date_of_birth',
 gender: 'gender',
 phone: 'phone',
 email: 'email',
 street: 'address',
 city: 'city',
 state: 'state',
 postalCode: 'postal_code',
 languages: 'languages',
 languageFluency: 'language_fluency',
 workAuthorisation: 'work_authorisation',
 emergencyContact: 'emergency_contact',
 bio: 'bio',
 photoUrl: 'photo_url',
 services: 'services',
 specializations: 'specializations',
 yearsExperience: 'years_experience',
 skillRatings: 'skill_ratings',
 clientTypes: 'client_types',
 unwillingTasks: 'unwilling_tasks',
 dietaryCooking: 'dietary_cooking',
 availabilityStatus: 'availability_status',
 availableFromDate: 'available_from_date',
 noticePeriod: 'notice_period',
 weeklyGrid: 'weekly_grid',
 minHoursPerWeek: 'min_hours_per_week',
 maxHoursPerWeek: 'max_hours_per_week',
 holidayAvailable: 'holiday_available',
 earliestStartDate: 'earliest_start_date',
 placementTypes: 'placement_types',
 preferredAgeGroup: 'preferred_age_group',
 preferredSettings: 'preferred_settings',
 hourlyRateMin: 'hourly_rate',
 hourlyRateMax: 'hourly_rate_max',
 employmentType: 'employment_type',
 serviceAreas: 'service_areas',
 travelRadius: 'travel_radius',
 hasDriversLicense: 'has_drivers_license',
 hasVehicle: 'has_vehicle',
 willingToTransport: 'willing_to_transport',
 willingClientVehicle: 'willing_client_vehicle',
 transitAccessible: 'transit_accessible',
 openToUrgent: 'open_to_urgent',
 credentials: 'credentials',
 education: 'education',
 currentlyEnrolled: 'currently_enrolled',
 backgroundConsent: 'background_consent',
 backgroundConsentDate: 'background_consent_date',
 vulnerableSectorCheck: 'vulnerable_sector_check',
 drivingRecordCheck: 'driving_record_check',
 criminalDeclaration: 'criminal_declaration',
 criminalDeclarationDetail: 'criminal_declaration_detail',
 bondedInsured: 'bonded_insured',
 tbClearanceDate: 'tb_clearance_date',
 declarationAccurate: 'declaration_accurate',
 personalityProfile: 'personality_profile',
 workHistory: 'work_history',
 volunteerExperience: 'volunteer_experience',
 volunteerDescription: 'volunteer_description',
 familyCareExperience: 'family_care_experience',
 familyCareDescription: 'family_care_description',
 professionalMemberships: 'professional_memberships',
 openQ1: 'open_q1',
 openQ2: 'open_q2',
 openQ3: 'open_q3',
 willingLiveIn: 'willing_live_in',
 willingOvernight: 'willing_overnight',
}

export async function POST(req: NextRequest) {
 try {
 const { userId } = await auth()
 if (!userId) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
 }

 const { field, value } = await req.json()

 const dbColumn = FIELD_MAP[field]
 if (!dbColumn) {
  return NextResponse.json(
   { error: `Unknown field: ${field}` },
   { status: 400 }
  )
 }

 // Get or create caregiver record for this user
 const { rows: existing } = await pool.query(
  'SELECT id FROM caregivers WHERE user_id = $1 LIMIT 1',
  [userId]
 )

 if (existing.length === 0) {
  // Create caregiver record
  await pool.query(
   `INSERT INTO caregivers (user_id, status, ${dbColumn}, updated_at)
 VALUES ($1, 'incomplete', $2, NOW())`,
   [userId, value]
  )
 } else {
  // Update existing record
  await pool.query(
   `UPDATE caregivers SET ${dbColumn} = $1, updated_at = NOW()
 WHERE user_id = $2`,
   [value, userId]
  )
 }

 return NextResponse.json({ success: true })
 } catch (err) {
 console.error('save-field error:', err)
 return NextResponse.json({ error: 'Save failed' }, { status: 500 })
 }
}
