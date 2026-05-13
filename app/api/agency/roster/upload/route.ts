// Careified — Agency Roster Resume Upload + Parse
// Uses shared lib/resume/parse-resume.ts for full 20-field extraction

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { Pool } from 'pg'
import { parseResume } from '@/lib/resume/parse-resume'

export const runtime = 'nodejs'
export const maxDuration = 30

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
})

export async function POST(req: NextRequest) {
  // Auth check — requires approved agency
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Verify agency exists and is approved
    const { rows: agencyRows } = await pool.query(
      'SELECT id, name, locale FROM agencies WHERE clerk_user_id = $1',
      [userId]
    )

    if (agencyRows.length === 0) {
      return NextResponse.json({ error: 'Agency not found' }, { status: 404 })
    }

    const agency = agencyRows[0]
    if (agency.status !== 'approved' && agency.status !== 'active') {
      return NextResponse.json({ error: 'Agency not approved' }, { status: 403 })
    }

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
    const parsed = await parseResume(buffer, file.type)

    if (Object.keys(parsed).length === 0) {
      return NextResponse.json({ error: 'Could not parse resume — try filling in manually' }, { status: 422 })
    }

    // Map ParsedResume fields to caregiver record fields
    // Fields that exist on caregivers table
    const caregiverFields: Record<string, unknown> = {}

    if (parsed.firstName) caregiverFields.first_name = parsed.firstName
    if (parsed.lastName) caregiverFields.last_name = parsed.lastName
    if (parsed.email) caregiverFields.email = parsed.email.toLowerCase()
    if (parsed.phone) caregiverFields.phone = parsed.phone.replace(/\D/g, '')
    if (parsed.city) caregiverFields.city = parsed.city
    if (parsed.state) caregiverFields.province_state = parsed.state
    if (parsed.yearsExperience) caregiverFields.years_experience = parsed.yearsExperience

    // Map jobTitle to specializations (array)
    if (parsed.jobTitle) {
      caregiverFields.specializations = [parsed.jobTitle]
    }

    // Map bio to bio field if exists
    if (parsed.bio) caregiverFields.bio = parsed.bio

    // Map services to services (array)
    if (parsed.services && parsed.services.length > 0) {
      caregiverFields.services = parsed.services
    }

    // Map languages to languages (array)
    if (parsed.languages && parsed.languages.length > 0) {
      caregiverFields.languages = parsed.languages
    }

    // Map credentials to credentials (array)
    if (parsed.credentials && parsed.credentials.length > 0) {
      caregiverFields.credentials = parsed.credentials
    }

    // Map certifications to certifications (array)
    if (parsed.certifications && parsed.certifications.length > 0) {
      caregiverFields.certifications = parsed.certifications
    }

    // Map diagnosisExperience to diagnosis_experience (array)
    if (parsed.diagnosisExperience && parsed.diagnosisExperience.length > 0) {
      caregiverFields.diagnosis_experience = parsed.diagnosisExperience
    }

    // Map adlsPerformed to adls_performed (array)
    if (parsed.adlsPerformed && parsed.adlsPerformed.length > 0) {
      caregiverFields.adls_performed = parsed.adlsPerformed
    }

    // TODO: resume_raw column does not exist in caregivers table
    // Fields not on caregivers table (awards, volunteerDescription, linkedinUrl, employers, education):
    // - If needed, add resume_raw JSONB column via migration
    // - For now, log and discard
    if (parsed.awards?.length) {
      console.log('[resume] awards not stored (no resume_raw column):', parsed.awards)
    }
    if (parsed.volunteerDescription) {
      console.log('[resume] volunteerDescription not stored:', parsed.volunteerDescription)
    }
    if (parsed.linkedinUrl) {
      console.log('[resume] linkedinUrl not stored:', parsed.linkedinUrl)
    }
    if (parsed.employers?.length) {
      console.log('[resume] employers not stored (no resume_raw column):', parsed.employers.length, 'entries')
    }
    if (parsed.education?.length) {
      console.log('[resume] education not stored (no resume_raw column):', parsed.education.length, 'entries')
    }

    // Return parsed data for agency review (no DB save yet)
    return NextResponse.json({
      success: true,
      data: caregiverFields,
      agencyId: agency.id,
      agencyName: agency.name,
    })
  } catch (err) {
    console.error('roster-upload error:', err)
    return NextResponse.json({ error: 'Failed to parse resume' }, { status: 500 })
  }
}