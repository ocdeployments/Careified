import { NextRequest, NextResponse } from 'next/server'
import { auth, clerkClient } from '@clerk/nextjs/server'
import { Pool } from 'pg'
import { checkRateLimit, getClientIp } from '@/lib/rateLimit'
import { sendClaimEmail } from '@/lib/email/send-claim-email'

const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } })

// Allowed caregiver roles per spec
const ALLOWED_ROLES = ['PSW', 'HCA', 'DSW', 'Companion', 'LiveIn', 'Other']

// Province/state codes by locale
const CA_PROVINCES = new Set(['ON', 'BC', 'AB', 'QC', 'MB', 'SK', 'NS', 'NB', 'NL', 'PE', 'YT', 'NT', 'NU'])
const US_STATES = new Set([
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA', 'HI', 'ID',
  'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN',
  'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR',
  'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
])

// Input type matching preview response
interface ParsedRow {
  row_number: number
  first_name: string
  last_name: string
  email: string
  phone: string
  role: string
  years_experience?: number
  city?: string
  province_state?: string
  locale: string
}

// Validation helpers
function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function isValidPhone(phone: string): boolean {
  const digits = phone.replace(/\D/g, '')
  return digits.length === 10
}

function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, '')
}

function normalizeEmail(email: string): string {
  return email.toLowerCase().trim()
}

function deriveLocale(provinceState: string | undefined): { locale: string; error?: string } {
  if (!provinceState) {
    return { locale: '', error: 'province_state required to derive locale' }
  }
  const code = provinceState.toUpperCase().trim()
  if (CA_PROVINCES.has(code) || code === 'CANADA') {
    return { locale: 'CA' }
  }
  // Plain "CA" treated as US California per spec
  if (US_STATES.has(code) || code === 'USA' || code === 'UNITED STATES') {
    return { locale: 'US' }
  }
  return { locale: '', error: `unrecognized province/state: ${provinceState}` }
}

// Re-validate a single row server-side
function validateRow(row: ParsedRow): string[] {
  const errors: string[] = []

  if (!row.first_name || row.first_name.length < 2 || row.first_name.length > 50) {
    errors.push('first_name: required, 2-50 characters')
  }
  if (!row.last_name || row.last_name.length < 2 || row.last_name.length > 50) {
    errors.push('last_name: required, 2-50 characters')
  }
  if (!row.email || !isValidEmail(row.email)) {
    errors.push('email: required, valid format')
  }
  if (!row.phone || !isValidPhone(row.phone)) {
    errors.push('phone: required, 10 digits')
  }
  if (!row.role || !ALLOWED_ROLES.includes(row.role)) {
    errors.push(`role: required, one of: ${ALLOWED_ROLES.join(', ')}`)
  }
  if (row.years_experience !== undefined && (row.years_experience < 0 || row.years_experience > 50)) {
    errors.push('years_experience: must be 0-50')
  }
  if (row.city && row.city.length > 100) {
    errors.push('city: max 100 characters')
  }

  const { locale, error } = deriveLocale(row.province_state)
  if (error) {
    errors.push(error)
  }

  return errors
}

// Auth check - matches roster/add pattern
async function checkApprovedAgency(): Promise<{ agencyId: string; agencyName: string; clerkUserId: string } | null> {
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
      "SELECT id, name FROM agencies WHERE clerk_user_id = $1 AND status = 'approved'",
      [userId]
    )

    if (result.rows.length === 0) return null

    return {
      agencyId: result.rows[0].id,
      agencyName: result.rows[0].name,
      clerkUserId: userId
    }
  } catch {
    return null
  }
}

export async function POST(request: NextRequest) {
  const clientIp = getClientIp(request)
  if (!checkRateLimit(clientIp, 10)) {
    return NextResponse.json(
      { error: 'rate_limit_exceeded', message: 'Too many requests. Please try again later.' },
      { status: 429 }
    )
  }

  try {
    const agency = await checkApprovedAgency()
    if (!agency) {
      return NextResponse.json(
        { error: 'unauthorized', message: 'Only approved agencies can confirm imports' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { rows } = body as { rows: ParsedRow[] }

    if (!rows || !Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json(
        { error: 'validation_error', message: 'rows array required' },
        { status: 400 }
      )
    }

    // === SERVER-SIDE REVALIDATION ===
    const invalidRows: { row: ParsedRow, errors: string[] }[] = []
    const csvEmails = new Set<string>()
    const csvPhones = new Set<string>()

    for (const row of rows) {
      const errors = validateRow(row)
      if (errors.length > 0) {
        invalidRows.push({ row, errors })
        continue
      }

      const normalizedEmail = normalizeEmail(row.email)
      const normalizedPhone = normalizePhone(row.phone)

      // Cross-row dedup
      if (normalizedEmail && csvEmails.has(normalizedEmail)) {
        invalidRows.push({ row, errors: ['duplicate email in upload'] })
        continue
      }
      if (normalizedPhone && csvPhones.has(normalizedPhone)) {
        invalidRows.push({ row, errors: ['duplicate phone in upload'] })
        continue
      }

      if (normalizedEmail) csvEmails.add(normalizedEmail)
      if (normalizedPhone) csvPhones.add(normalizedPhone)
    }

    if (invalidRows.length > 0) {
      return NextResponse.json(
        { error: 'validation_error', message: 'Server-side validation failed', invalid_rows: invalidRows },
        { status: 400 }
      )
    }

    // === DB TRANSACTION ===
    const client = await pool.connect()
    try {
      await client.query('BEGIN')

      const createdIds: string[] = []
      const mergePending: { row: ParsedRow, existing_caregiver_id: string, reason: string }[] = []
      const alreadyRostered: { row: ParsedRow, source_agency_id: string, reason: string }[] = []

      for (const row of rows) {
        const normalizedEmail = normalizeEmail(row.email)
        const normalizedPhone = normalizePhone(row.phone)

        // Check if email exists
        const existingResult = await client.query(
          'SELECT id, claim_status, source_agency_id FROM caregivers WHERE LOWER(email) = $1',
          [normalizedEmail]
        )

        if (existingResult.rows.length > 0) {
          const existing = existingResult.rows[0]
          if (existing.claim_status !== 'agency_built') {
            // Merge pending case - self-built or already claimed
            mergePending.push({
              row,
              existing_caregiver_id: existing.id,
              reason: 'email exists with non-agency profile'
            })
            continue
          } else {
            // Already rostered by another agency
            alreadyRostered.push({
              row,
              source_agency_id: existing.source_agency_id,
              reason: 'caregiver already rostered by another agency'
            })
            continue
          }
        }

        // Insert caregiver
        const { locale } = deriveLocale(row.province_state)
        const insertResult = await client.query(
          `INSERT INTO caregivers
           (first_name, last_name, email, phone, specializations, years_experience, city, province_state, locale,
            claim_status, source_agency_id, created_by_agency_id, aggregate_score, availability_status)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'agency_built', $10, $10, NULL, 'available')
           RETURNING id`,
          [
            row.first_name,
            row.last_name,
            normalizedEmail,
            normalizedPhone,
            [row.role],
            row.years_experience || null,
            row.city || null,
            row.province_state || null,
            locale,
            agency.agencyId
          ]
        )

        const caregiverId = insertResult.rows[0].id

        // Insert claim token
        const tokenResult = await client.query(
          `INSERT INTO caregiver_claim_tokens (caregiver_id, agency_id, email_sent_to, expires_at, status)
           VALUES ($1, $2, $3, NOW() + INTERVAL '30 days', 'pending')
           RETURNING token`,
          [caregiverId, agency.agencyId, normalizedEmail]
        )

        const token = tokenResult.rows[0].token

        // Audit log
        await client.query(
          `INSERT INTO audit_log (action, actor_clerk_id, target_id, metadata)
           VALUES ('roster_import', $1, $2, $3)`,
          [
            agency.clerkUserId,
            caregiverId,
            JSON.stringify({ source: 'csv', agency_id: agency.agencyId, email: normalizedEmail })
          ]
        )

        createdIds.push(caregiverId)

        // Send claim email AFTER commit (but we have the token now)
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
        const claimUrl = `${appUrl}/claim/${token}`

        try {
          await sendClaimEmail({ to: normalizedEmail, firstName: row.first_name, agencyName: agency.agencyName, token })
        } catch (emailErr: any) {
          // Log failure but don't rollback
          await client.query(
            `INSERT INTO audit_log (action, actor_clerk_id, target_id, metadata)
             VALUES ('claim_email_failed', $1, $2, $3)`,
            [
              agency.clerkUserId,
              caregiverId,
              JSON.stringify({ email: normalizedEmail, error: emailErr.message })
            ]
          )
        }
      }

      await client.query('COMMIT')

      return NextResponse.json({
        created: createdIds.length,
        caregiver_ids: createdIds,
        merge_pending: mergePending,
        already_rostered: alreadyRostered,
        email_failures: []
      })

    } catch (txErr: any) {
      await client.query('ROLLBACK')
      console.error('Transaction error in /api/roster/import/confirm:', txErr)
      return NextResponse.json(
        { error: 'transaction_error', message: 'Failed to process import' },
        { status: 500 }
      )
    } finally {
      client.release()
    }

  } catch (err) {
    console.error('Error in /api/roster/import/confirm:', err)
    return NextResponse.json(
      { error: 'internal_error', message: 'Failed to confirm import' },
      { status: 500 }
    )
  } finally {
    pool.end()
  }
}