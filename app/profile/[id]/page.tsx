// Careified — Caregiver Public Profile Page (new design)

import { notFound } from 'next/navigation'
import { auth, clerkClient } from '@clerk/nextjs/server'
import { pool } from '@/lib/db'
import CaregiverProfileDemo from '@/components/profile/CaregiverProfileDemo'
import { deriveWorkingStyle } from '@/lib/personality/working-style'

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

async function getContactInfo(caregiverId: string) {
  try {
    const result = await pool.query(
      `SELECT phone, email FROM caregivers WHERE id = $1`,
      [caregiverId]
    )
    return result.rows[0] || null
  } catch { return null }
}

async function checkIsApprovedAgency(): Promise<boolean> {
  try {
    const { userId } = await auth()
    if (!userId) return false

    const client = await clerkClient()
    const user = await client.users.getUser(userId)
    const role = user.publicMetadata?.role as string

    if (role !== 'agency') return false

    const { rows } = await pool.query(
      'SELECT status FROM agencies WHERE clerk_user_id = $1',
      [userId]
    )
    return rows.length > 0 && rows[0].status === 'approved'
  } catch { return false }
}

export default async function CaregiverProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const id = (await params).id
  const caregiver = await getCaregiver(id)
  if (!caregiver) notFound()

  const verifiedReferences = await getVerifiedReferences(id)
  const certifications = await getCertifications(id)
  const ratings = await getPlacementRatings(id)
  const badges = await getBadges(id)

  // Check if viewer is an approved agency
  const isApprovedAgency = await checkIsApprovedAgency()
  const contactInfo = isApprovedAgency ? await getContactInfo(id) : null

  // Map DB snake_case to component props
  const personality = caregiver.personality_profile || {}
  const savedScenarios = personality.scenarios || {}

  // Convert scenario IDs to numbered format for deriveWorkingStyle
  const scenarioIdToNum: Record<string, number> = {
    patience: 1,
    empathy: 2,
    adaptability: 3,
    communication: 4,
    emergency_response: 5,
    problem_solving: 6,
    observation: 7,
  }

  const numberedAnswers: Record<number, 'A' | 'B'> = {} as Record<number, 'A' | 'B'>
  const aStyles = ['natural', 'proactive', 'flexible', 'protocol_first', 'experimental']

  for (const [id, answer] of Object.entries(savedScenarios)) {
    const num = scenarioIdToNum[id]
    const answerObj = answer as { style?: string }
    if (num && answerObj && typeof answerObj === 'object' && answerObj.style) {
      numberedAnswers[num] = aStyles.includes(answerObj.style) ? 'A' : 'B'
    }
  }

  const workingStyleTags = Object.keys(numberedAnswers).length >= 4
    ? deriveWorkingStyle(numberedAnswers)
    : []

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
      workingStyleTags={workingStyleTags}
      workHistory={caregiver.work_history}
      verifiedReferences={verifiedReferences}
      certifications={certifications}
      openQ1={caregiver.open_q1}
      openQ2={caregiver.open_q2}
      openQ3={caregiver.open_q3}
      placementRatings={ratings}
      badges={badges}
      contactPhone={contactInfo?.phone}
      contactEmail={contactInfo?.email}
    />
  )
}
