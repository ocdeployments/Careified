// Careified — Caregiver Public Profile Page (new design)

import { notFound } from 'next/navigation'
import { Pool } from 'pg'
import CaregiverProfileDemo from '@/components/profile/CaregiverProfileDemo'

const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } })

async function getCaregiver(id: string) {
  try {
    const result = await pool.query(
      `SELECT * FROM caregivers WHERE id = $1 AND status = 'approved'`,
      [id]
    )
    return result.rows[0] || null
  } catch { return null }
}

async function getVerifiedReferences(caregiverId: string) {
  try {
    const result = await pool.query(
      `SELECT reference_name, relationship, would_rehire, reliability_rating,
              professionalism_rating, comment, years_known, completed_at
       FROM reference_verification_requests
       WHERE caregiver_id = $1 AND status = 'completed'
       ORDER BY completed_at DESC`,
      [caregiverId]
    )
    return result.rows
  } catch { return [] }
}

async function getCertifications(caregiverId: string) {
  try {
    const result = await pool.query(
      `SELECT * FROM caregiver_certifications WHERE caregiver_id = $1 ORDER BY issue_date DESC`,
      [caregiverId]
    )
    return result.rows
  } catch { return [] }
}

async function getPlacementRatings(caregiverId: string) {
  try {
    const result = await pool.query(
      `SELECT
        COUNT(*) as review_count,
        AVG(would_re_engage::int) * 100 as rehire_rate,
        AVG(punctuality) as avg_punctuality,
        AVG(reliability) as avg_reliability,
        AVG(warmth) as avg_warmth,
        AVG(dignity) as avg_dignity,
        AVG(patience) as avg_patience,
        AVG(personal_hygiene) as avg_hygiene,
        AVG(specialty_match) as avg_skills,
        AVG(comms_agency) as avg_comms
      FROM placement_reviews
      WHERE caregiver_id = $1 AND status IN ('approved', 'pending')`,
      [caregiverId]
    )
    return result.rows[0] || null
  } catch { return null }
}

async function getBadges(caregiverId: string) {
  try {
    const result = await pool.query(
      `SELECT badges FROM caregivers WHERE id = $1`,
      [caregiverId]
    )
    if (result.rows[0]?.badges) {
      return result.rows[0].badges as Array<{ id: string; label: string; description: string; earned_at: string }>
    }
    return []
  } catch { return [] }
}

export default async function CaregiverProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const id = (await params).id
  const caregiver = await getCaregiver(id)
  if (!caregiver) notFound()

  const verifiedReferences = await getVerifiedReferences(id)
  const certifications = await getCertifications(id)
  const ratings = await getPlacementRatings(id)
  const badges = await getBadges(id)

  // Map DB snake_case to component props
  const personality = caregiver.personality_profile || {}
  const workingStyleScenarios = personality.scenarios || {}

  return (
    <CaregiverProfileDemo
      firstName={caregiver.preferred_name || caregiver.first_name}
      lastName={caregiver.last_name}
      jobTitle={caregiver.job_title}
      credential={(caregiver.credentials || [])[0]}
      city={caregiver.city}
      state={caregiver.state}
      yearsExperience={caregiver.years_experience}
      photoUrl={caregiver.photo_url}
      availabilityStatus={caregiver.availability_status}
      hourlyRateMin={caregiver.hourly_rate}
      hourlyRateMax={caregiver.hourly_rate_max}
      openToUrgent={caregiver.open_to_urgent}
      willingLiveIn={caregiver.willing_live_in}
      hasVehicle={caregiver.has_vehicle}
      languages={caregiver.languages}
      languageFluency={caregiver.language_fluency}
      bio={caregiver.bio}
      profileCompletion={caregiver.profile_completion_pct}
      aggregateScore={caregiver.aggregate_score}
      ratingCount={caregiver.rating_count}
      services={caregiver.services}
      specializations={caregiver.specializations}
      diagnosisExperience={caregiver.diagnosis_experience}
      adlsPerformed={caregiver.adls_performed}
      specializedTechniques={caregiver.specialized_techniques}
      weeklyGrid={caregiver.weekly_grid}
      minHoursPerWeek={caregiver.min_hours_per_week}
      maxHoursPerWeek={caregiver.max_hours_per_week}
      serviceAreas={caregiver.service_areas}
      travelRadius={caregiver.travel_radius}
      hasDriversLicense={caregiver.has_drivers_license}
      willingToTransport={caregiver.willing_to_transport}
      vulnerableSectorCheck={caregiver.vulnerable_sector_check}
      bondedInsured={caregiver.bonded_insured}
      immunisationRecords={caregiver.immunisation_records}
      declarationDate={caregiver.declaration_date}
      criminalDeclaration={caregiver.criminal_declaration}
      rfTerminated={caregiver.rf_terminated}
      rfComplaint={caregiver.rf_complaint}
      rfPhysicalLimitation={caregiver.rf_physical_limitation}
      rfBackground={caregiver.rf_background}
      personalityProfile={caregiver.personality_profile}
      workHistory={caregiver.work_history}
      verifiedReferences={verifiedReferences}
      certifications={certifications}
      openQ1={caregiver.open_q1}
      openQ2={caregiver.open_q2}
      openQ3={caregiver.open_q3}
      placementRatings={ratings}
      badges={badges}
    />
  )
}
