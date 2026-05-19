// Careified — Agency Roster Resume Upload + Parse
// Uses shared lib/resume/parse-resume.ts for full 20-field extraction

import { NextRequest, NextResponse } from 'next/server'
import { auth, clerkClient } from '@clerk/nextjs/server'
import { Pool } from 'pg'
import { parseResume } from '@/lib/resume/parse-resume'
import { sendClaimEmail } from '@/lib/email/send-claim-email'

export const runtime = 'nodejs'
export const maxDuration = 30

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 3,
  idleTimeoutMillis: 10000,
  connectionTimeoutMillis: 10000,
  allowExitOnIdle: true,
})

// Province/state codes by locale (from CSV import)
const CA_PROVINCES = new Set(['ON', 'BC', 'AB', 'QC', 'MB', 'SK', 'NS', 'NB', 'NL', 'PE', 'YT', 'NT', 'NU'])
const US_STATES = new Set([
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA', 'HI', 'ID',
  'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN',
  'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR',
  'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
])

function deriveLocale(provinceState: string | undefined): string {
  if (!provinceState) return 'CA'
  const code = provinceState.toUpperCase().trim()
  if (CA_PROVINCES.has(code) || code === 'CANADA') return 'CA'
  // Treat plain "CA" as US California per spec
  if (US_STATES.has(code) || code === 'USA' || code === 'UNITED STATES') return 'US'
  return 'CA' // Default to CA
}

// Auth check - matches roster/add pattern
async function checkApprovedAgency(): Promise<{ agencyId: string; agencyName: string; clerkUserId: string; locale: string } | null> {
  let userId: string | null | undefined
  try {
    const authResult = await auth()
    userId = authResult.userId
  } catch (e: any) {
    if (e?.message?.includes('NEXT_REDIRECT') || e?.code === 'NEXT_REDIRECT') {
      return null
    }
    return null
  }

  if (!userId) return null

  try {
    const client = await clerkClient()
    const user = await client.users.getUser(userId)
    const role = user.publicMetadata?.role as string

    if (role !== 'agency') return null

    const result = await pool.query(
      "SELECT id, name, locale FROM agencies WHERE clerk_user_id = $1 AND status = 'approved'",
      [userId]
    )

    if (result.rows.length === 0) return null

    return {
      agencyId: result.rows[0].id,
      agencyName: result.rows[0].name,
      clerkUserId: userId,
      locale: result.rows[0].locale || 'CA'
    }
  } catch {
    return null
  }
}

export async function POST(req: NextRequest) {
  const agency = await checkApprovedAgency()
  if (!agency) {
    return NextResponse.json({ error: 'unauthorized', message: 'Only approved agencies can upload resumes' }, { status: 403 })
  }

  try {
    // Parse form data
    const formData = await req.formData()
    const file = formData.get('resume') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file type
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type — PDF, DOC, or DOCX only' }, { status: 400 })
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large — max 5MB' }, { status: 400 })
    }

    // Extract text and parse with shared lib (full 20-field extraction)
    const buffer = Buffer.from(await file.arrayBuffer())
    let parsed: any = {}

    try {
      parsed = await parseResume(buffer, file.type, file.name)
    } catch (err: any) {
      if (err.message === 'LEGACY_DOC_UNSUPPORTED') {
        return NextResponse.json({
          error: 'unsupported_format',
          message: "Old .doc files aren't supported. Please save as .docx or PDF."
        }, { status: 400 })
      }
      if (err.message === 'PDF_PARSE_FAILED' || err.message === 'DOCX_PARSE_FAILED') {
        return NextResponse.json({
          error: 'parse_failed',
          message: "We couldn't read this file. Please enter your details manually."
        }, { status: 422 })
      }
      throw err // Re-throw unexpected errors
    }

    if (Object.keys(parsed).length === 0) {
      return NextResponse.json({ error: 'Could not parse resume — try filling in manually' }, { status: 422 })
    }

    // Extract required fields
    const firstName = parsed.firstName
    const lastName = parsed.lastName
    const email = parsed.email?.toLowerCase()
    const phone = parsed.phone?.replace(/\D/g, '')
    const provinceState = parsed.state

    // Validation
    if (!firstName || firstName.length < 2) {
      return NextResponse.json({ error: 'validation_error', message: 'first_name required (2+ chars)' }, { status: 400 })
    }
    if (!lastName || lastName.length < 2) {
      return NextResponse.json({ error: 'validation_error', message: 'last_name required (2+ chars)' }, { status: 400 })
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'validation_error', message: 'valid email required' }, { status: 400 })
    }
    if (!phone || phone.length !== 10) {
      return NextResponse.json({ error: 'validation_error', message: '10-digit phone required' }, { status: 400 })
    }

    // Check if email already exists
    const existingResult = await pool.query(
      'SELECT id, claim_status, first_name, last_name FROM caregivers WHERE LOWER(email) = $1',
      [email]
    )

    if (existingResult.rows.length > 0) {
      const existing = existingResult.rows[0]
      if (existing.claim_status !== 'agency_built') {
        return NextResponse.json({
          exists: true,
          caregiver: { id: existing.id, first_name: existing.first_name, last_name: existing.last_name }
        }, { status: 409 })
      } else {
        return NextResponse.json({ already_rostered: true }, { status: 409 })
      }
    }

    // Derive locale
    const locale = deriveLocale(provinceState)

    // Map fields for caregiver record
    const caregiverFields: Record<string, unknown> = {
      first_name: firstName,
      last_name: lastName,
      email: email,
      phone: phone,
      claim_status: 'agency_built',
      source_agency_id: agency.agencyId,
      created_by_agency_id: agency.agencyId,
      availability_status: 'available',
      locale: locale,
      years_experience: parsed.yearsExperience || null,
      city: parsed.city || null,
      province_state: provinceState || null,
      bio: parsed.bio || null,
    }

    // Array fields
    if ((parsed.services && parsed.services.length > 0) || parsed.jobTitle) {
      const services = [...(parsed.services || []), parsed.jobTitle].filter(Boolean)
      caregiverFields.services = services
    }
    if (parsed.specializations && parsed.specializations.length > 0) {
      caregiverFields.specializations = parsed.specializations
    }
    if (parsed.languages && parsed.languages.length > 0) {
      caregiverFields.languages = parsed.languages
    }
    if (parsed.credentials && parsed.credentials.length > 0) {
      caregiverFields.credentials = parsed.credentials
    }
    if (parsed.certifications && parsed.certifications.length > 0) {
      caregiverFields.certifications = parsed.certifications
    }
    if (parsed.diagnosisExperience && parsed.diagnosisExperience.length > 0) {
      caregiverFields.diagnosis_experience = parsed.diagnosisExperience
    }
    if (parsed.adlsPerformed && parsed.adlsPerformed.length > 0) {
      caregiverFields.adls_performed = parsed.adlsPerformed
    }

    // Insert caregiver
    const insertResult = await pool.query(
      `INSERT INTO caregivers
       (first_name, last_name, email, phone, claim_status, source_agency_id, created_by_agency_id,
        availability_status, locale, years_experience, city, province_state, bio,
        services, specializations, languages, credentials, certifications, diagnosis_experience, adls_performed)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21)
       RETURNING id`,
      [
        caregiverFields.first_name,
        caregiverFields.last_name,
        caregiverFields.email,
        caregiverFields.phone,
        caregiverFields.claim_status,
        caregiverFields.source_agency_id,
        caregiverFields.created_by_agency_id,
        caregiverFields.availability_status,
        caregiverFields.locale,
        caregiverFields.years_experience,
        caregiverFields.city,
        caregiverFields.province_state,
        caregiverFields.bio,
        caregiverFields.services,
        caregiverFields.specializations,
        caregiverFields.languages,
        caregiverFields.credentials,
        caregiverFields.certifications,
        caregiverFields.diagnosis_experience,
        caregiverFields.adls_performed,
      ]
    )

    const caregiverId = insertResult.rows[0].id

    // Generate claim token
    const tokenResult = await pool.query(
      `INSERT INTO caregiver_claim_tokens (caregiver_id, agency_id, email_sent_to, expires_at, status)
       VALUES ($1, $2, $3, NOW() + INTERVAL '30 days', 'pending')
       RETURNING token`,
      [caregiverId, agency.agencyId, email]
    )

    const token = tokenResult.rows[0].token

    // Send claim email
    const emailResult = await sendClaimEmail({ to: email, firstName: firstName, agencyName: agency.agencyName, token })

    // Audit log
    await pool.query(
      `INSERT INTO audit_log (action, actor_clerk_id, target_id, metadata)
       VALUES ('roster_upload_resume', $1, $2, $3)`,
      [
        agency.clerkUserId,
        caregiverId,
        JSON.stringify({ source: 'resume_upload', agency_id: agency.agencyId, email, email_sent: emailResult.sent })
      ]
    )

    // TODO: Write employers to separate table (caregiver_work_history) - follow-up commit
    if (parsed.employers?.length) {
      console.log('[resume] employers not written:', parsed.employers.length, 'entries')
    }

    // TODO: Write certifications to caregiver_certifications table - follow-up commit
    if (parsed.certifications?.length) {
      console.log('[resume] certifications not written to caregiver_certifications:', parsed.certifications.length, 'entries')
    }

    return NextResponse.json({
      success: true,
      caregiver_id: caregiverId,
      caregiver: caregiverFields,
      claim_token_sent: emailResult.sent,
      email_sent_to: email
    }, { status: 201 })

  } catch (err) {
    console.error('roster-upload error:', err)
    return NextResponse.json({ error: 'Failed to process resume' }, { status: 500 })
  }
}