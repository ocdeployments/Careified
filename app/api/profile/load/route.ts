// Careified — Profile load API
// Called on profile builder mount to hydrate form from DB

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { Pool } from 'pg'

const pool = new Pool({
 connectionString: process.env.DATABASE_URL,
 ssl: { rejectUnauthorized: false },
})

export async function GET(req: NextRequest) {
 try {
 const { userId } = await auth()
 if (!userId) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
 }

 const { rows } = await pool.query(
  `SELECT
   first_name, last_name, preferred_name, job_title,
   date_of_birth, gender, phone, email,
   address, city, state, postal_code,
   languages, language_fluency, work_authorisation,
   emergency_contact, bio, photo_url,
   services, specializations, credentials,
   years_experience, skill_ratings, client_types,
   unwilling_tasks, dietary_cooking,
   availability_status, weekly_grid,
   min_hours_per_week, max_hours_per_week,
   placement_types, holiday_available,
   earliest_start_date, notice_period,
   preferred_age_group, preferred_settings,
   hourly_rate, hourly_rate_max, employment_type,
   travel_radius, has_vehicle, has_drivers_license,
   willing_to_transport, willing_client_vehicle,
   transit_accessible, willing_live_in, willing_overnight,
   open_to_urgent, service_areas,
   education, currently_enrolled,
   background_consent, vulnerable_sector_check,
   criminal_declaration, bonded_insured,
   declaration_accurate, personality_profile,
   work_history, volunteer_experience, volunteer_description,
   family_care_experience, family_care_description,
   professional_memberships,
   open_q1, open_q2, open_q3,
   profile_completion_pct, profile_phase, status
 FROM caregivers
 WHERE user_id = $1
 LIMIT 1`,
  [userId]
 )

 if (rows.length === 0) {
  return NextResponse.json({ exists: false, data: {} })
 }

 const row = rows[0]

 // Map snake_case DB columns to camelCase form fields
 const data = {
  firstName: row.first_name,
  lastName: row.last_name,
  preferredName: row.preferred_name,
  jobTitle: row.job_title,
  dateOfBirth: row.date_of_birth,
  gender: row.gender,
  phone: row.phone,
  email: row.email,
  street: row.address,
  city: row.city,
  state: row.state,
  postalCode: row.postal_code,
  languages: row.languages || [],
  languageFluency: row.language_fluency || {},
  workAuthorisation: row.work_authorisation,
  emergencyContact: row.emergency_contact || {},
  bio: row.bio,
  photoUrl: row.photo_url,
  services: row.services || [],
  specializations: row.specializations || [],
  credentials: row.credentials || [],
  yearsExperience: row.years_experience,
  skillRatings: row.skill_ratings || {},
  clientTypes: row.client_types || [],
  unwillingTasks: row.unwilling_tasks || [],
  dietaryCooking: row.dietary_cooking || [],
  availabilityStatus: row.availability_status,
  weeklyGrid: row.weekly_grid || {},
  minHoursPerWeek: row.min_hours_per_week,
  maxHoursPerWeek: row.max_hours_per_week,
  placementTypes: row.placement_types || [],
  holidayAvailable: row.holiday_available,
  earliestStartDate: row.earliest_start_date,
  noticePeriod: row.notice_period,
  preferredAgeGroup: row.preferred_age_group,
  preferredSettings: row.preferred_settings || [],
  hourlyRateMin: row.hourly_rate,
  hourlyRateMax: row.hourly_rate_max,
  employmentType: row.employment_type,
  travelRadius: row.travel_radius,
  hasVehicle: row.has_vehicle,
  hasDriversLicense: row.has_drivers_license,
  willingToTransport: row.willing_to_transport,
  willingClientVehicle: row.willing_client_vehicle,
  transitAccessible: row.transit_accessible,
  willingLiveIn: row.willing_live_in,
  willingOvernight: row.willing_overnight,
  openToUrgent: row.open_to_urgent,
  serviceAreas: row.service_areas || [],
  education: row.education || {},
  currentlyEnrolled: row.currently_enrolled,
  backgroundConsent: row.background_consent,
  vulnerableSectorCheck: row.vulnerable_sector_check,
  criminalDeclaration: row.criminal_declaration,
  bondedInsured: row.bonded_insured,
  declarationAccurate: row.declaration_accurate,
  personalityProfile: row.personality_profile || {},
  workHistory: row.work_history || [],
  volunteerExperience: row.volunteer_experience,
  volunteerDescription: row.volunteer_description,
  familyCareExperience: row.family_care_experience,
  familyCareDescription: row.family_care_description,
  openQ1: row.open_q1,
  openQ2: row.open_q2,
  openQ3: row.open_q3,
  profileCompletionPct: row.profile_completion_pct,
  profilePhase: row.profile_phase,
 }

 return NextResponse.json({ exists: true, data })
 } catch (err) {
 console.error('profile load error:', err)
 return NextResponse.json({ error: 'Load failed' }, { status: 500 })
 }
}
