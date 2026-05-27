// Careified — Field-level save API
// Called on blur for individual fields
// Uses Clerk auth to identify user

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { Pool } from 'pg'

const pool = new Pool({
 connectionString: process.env.DATABASE_URL,
 ssl: process.env.DATABASE_URL?.includes('supabase.com') ? { rejectUnauthorized: true } : { rejectUnauthorized: false },
  max: 3,
  idleTimeoutMillis: 10000,
  connectionTimeoutMillis: 10000,
  allowExitOnIdle: true,
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
 referredBy: 'referred_by',
 diagnosisExperience: 'diagnosis_experience',
 adlsPerformed: 'adls_performed',
 // Disclosure fields (Step 6) - save to both caregivers table and caregiver_disclosures table
 rfTerminated: 'rf_terminated',
 rfTerminatedDetail: 'rf_terminated',
 rfComplaint: 'rf_complaint',
 rfComplaintDetail: 'rf_complaint',
 rfPhysicalLimitation: 'rf_physical_limitation',
 rfPhysicalDetail: 'rf_physical_limitation',
 rfBackground: 'rf_background',
 rfBackgroundDetail: 'rf_background',
}

// Disclosure fields that need to be saved to caregiver_disclosures table (Step 6)
const DISCLOSURE_FIELDS = ['rfTerminated', 'rfTerminatedDetail', 'rfComplaint', 'rfComplaintDetail', 'rfPhysicalLimitation', 'rfPhysicalDetail', 'rfBackground', 'rfBackgroundDetail']

// Map disclosure field to question_key for caregiver_disclosures table
const DISCLOSURE_QUESTION_KEYS: Record<string, string> = {
 rfTerminated: 'dismissed_from_care_role',
 rfTerminatedDetail: 'dismissed_from_care_role',
 rfComplaint: 'regulatory_complaint',
 rfComplaintDetail: 'regulatory_complaint',
 rfPhysicalLimitation: 'physical_limitation',
 rfPhysicalDetail: 'physical_limitation',
 rfBackground: 'background_charge',
 rfBackgroundDetail: 'background_charge',
}

// PostgreSQL text[] array columns - pass JS arrays directly
const ARRAY_COLUMNS = new Set([
 'services', 'specializations', 'credentials', 'languages',
 'placement_types', 'service_areas', 'client_types', 'unwilling_tasks',
 'dietary_cooking', 'preferred_settings', 'professional_memberships',
 'immunisation_records',
 'adls_performed',
])

export async function POST(req: NextRequest) {
 try {
 const { userId } = await auth()
 if (!userId) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
 }

 const { field, value, referredBy } = await req.json()

 const dbColumn = FIELD_MAP[field]

 // Guard against unknown fields
 if (!dbColumn) {
   console.error('UNKNOWN FIELD:', field)
   return NextResponse.json({ error: `Unknown field: ${field}` }, { status: 400 })
 }

 // Serialize values: JS arrays for text[] columns, JSON for jsonb columns
 const serializedValue = (() => {
   if (Array.isArray(value) && ARRAY_COLUMNS.has(dbColumn)) {
     return value  // Pass as JS array — pg driver handles text[] correctly
   }
   if (typeof value === 'object' && value !== null) {
     return JSON.stringify(value)  // jsonb columns
   }
   return value
 })()

 // Don't allow direct saves to referred_by column
 if (dbColumn === 'referred_by') {
  return NextResponse.json({ error: 'Cannot set referred_by directly' }, { status: 400 })
 }

 // Get or create caregiver record for this user
 const { rows: existing } = await pool.query(
  'SELECT id, referred_by FROM caregivers WHERE user_id = $1 LIMIT 1',
  [userId]
 )

 if (existing.length === 0) {
  // Create caregiver record - include referred_by if provided
  if (referredBy) {
   await pool.query(
    `INSERT INTO caregivers (user_id, status, ${dbColumn}, referred_by, updated_at)
  VALUES ($1, 'incomplete', $2, $3, NOW())`,
    [userId, serializedValue, referredBy]
   )
  } else {
   await pool.query(
    `INSERT INTO caregivers (user_id, status, ${dbColumn}, updated_at)
  VALUES ($1, 'incomplete', $2, NOW())`,
    [userId, serializedValue]
   )
  }
 } else {
  // Update existing record - only set referred_by if not already set and provided
  if (referredBy && !existing[0].referred_by) {
   await pool.query(
    `UPDATE caregivers SET ${dbColumn} = $1, referred_by = $2, updated_at = NOW()
  WHERE user_id = $3`,
    [serializedValue, referredBy, userId]
   )
  } else {
   await pool.query(
    `UPDATE caregivers SET ${dbColumn} = $1, updated_at = NOW()
  WHERE user_id = $2`,
    [serializedValue, userId]
   )
  }
 }

 // Step 6: Also save disclosure fields to caregiver_disclosures table
 if (DISCLOSURE_FIELDS.includes(field)) {
   const caregiverId = existing[0]?.id
   if (caregiverId) {
     const questionKey = DISCLOSURE_QUESTION_KEYS[field]
     // Determine the answer value - use 'yes'/'no' for the main field, detail for detail fields
     let answerValue: string
     let detailValue: string | null = null

     if (field.includes('Detail')) {
       // Detail field - get the corresponding yes/no field value
       const baseField = field.replace('Detail', '')
       const detailField = baseField as keyof typeof FIELD_MAP
       // Get current value from caregivers table
       const { rows: caregiverRows } = await pool.query(
         `SELECT ${FIELD_MAP[detailField]} as val FROM caregivers WHERE id = $1`,
         [caregiverId]
       )
       answerValue = caregiverRows[0]?.val === 'yes' ? 'Yes' : 'No'
       detailValue = serializedValue as string || null
     } else {
       // Yes/No field
       answerValue = serializedValue === 'yes' ? 'Yes' : 'No'
     }

     // Upsert into caregiver_disclosures table
     await pool.query(
       `INSERT INTO caregiver_disclosures (caregiver_id, question_key, answer, detail, attested_at)
        VALUES ($1, $2, $3, $4, NOW())
        ON CONFLICT (caregiver_id, question_key)
        DO UPDATE SET answer = $3, detail = $4, attested_at = NOW()`,
       [caregiverId, questionKey, answerValue, detailValue]
     )
   }
 }

 return NextResponse.json({ success: true })
 } catch (err) {
 console.error('save-field error:', err)
 return NextResponse.json({ error: 'Save failed' }, { status: 500 })
 }
}
