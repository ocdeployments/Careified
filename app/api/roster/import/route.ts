import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { clerkClient } from '@clerk/nextjs/server'
import { Pool } from 'pg'
import { parse } from 'csv-parse/sync'

const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } })

// Allowed caregiver roles
const ALLOWED_ROLES = ['PSW', 'HCA', 'DSW', 'Companion', 'LiveIn', 'Other']

// Province/state codes by locale (2-letter codes per spec)
const CA_PROVINCES = new Set(['ON', 'BC', 'AB', 'QC', 'MB', 'SK', 'NS', 'NB', 'NL', 'PE', 'YT', 'NT', 'NU'])
const US_STATES = new Set([
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA', 'HI', 'ID',
  'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN',
  'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR',
  'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
])

// Validation helper functions
function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function isValidPhone(phone: string): boolean {
  // Strip non-digits, require exactly 10 digits
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

  // CA province code OR full name -> CA
  if (CA_PROVINCES.has(code) || code === 'CANADA') {
    return { locale: 'CA' }
  }

  // US state code OR full name -> US
  // Note: Plain "CA" ambiguous (Canada vs California). Per spec, treat as US California.
  if (US_STATES.has(code) || code === 'USA' || code === 'UNITED STATES') {
    return { locale: 'US' }
  }

  return { locale: '', error: `unrecognized province/state: ${provinceState}` }
}

// Types for response
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

interface InvalidRow {
  row_number: number
  errors: string[]
  raw_data: Record<string, string>
}

interface Warning {
  row_number: number
  message: string
}

// Auth check - agency role required
async function checkApprovedAgency(): Promise<{ agencyId: string; agencyName: string; locale: string } | null> {
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
      locale: result.rows[0].locale || 'CA'
    }
  } catch {
    return null
  }
}

export async function POST(request: Request) {
  try {
    const agency = await checkApprovedAgency()
    if (!agency) {
      return NextResponse.json(
        { error: 'unauthorized', message: 'Only approved agencies can import caregivers' },
        { status: 403 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('csv') as File | null

    if (!file) {
      return NextResponse.json(
        { error: 'validation_error', message: 'No CSV file provided' },
        { status: 400 }
      )
    }

    const content = await file.text()

    if (!content.trim()) {
      return NextResponse.json(
        { error: 'validation_error', message: 'CSV file is empty' },
        { status: 400 }
      )
    }

    // Parse CSV using csv-parse
    let records: Record<string, string>[]
    try {
      records = parse(content, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
        relax_column_count: true,
      })
    } catch (parseErr: any) {
      return NextResponse.json(
        { error: 'parse_error', message: `CSV parse error: ${parseErr.message}` },
        { status: 400 }
      )
    }

    if (records.length === 0) {
      return NextResponse.json(
        { error: 'validation_error', message: 'CSV has no data rows' },
        { status: 400 }
      )
    }

    // Validate header columns
    const expectedColumns = ['first_name', 'last_name', 'email', 'phone', 'role', 'years_experience', 'city', 'province_state']
    const headerColumns = Object.keys(records[0]).map(k => k.toLowerCase().trim())
    const missingColumns = expectedColumns.filter(col => !headerColumns.includes(col))
    if (missingColumns.length > 0) {
      return NextResponse.json(
        { error: 'validation_error', message: `Missing columns: ${missingColumns.join(', ')}` },
        { status: 400 }
      )
    }

    // Track cross-row duplicates within CSV
    const csvEmails = new Set<string>()
    const csvPhones = new Set<string>()

    // Parse and validate each row
    const validRows: ParsedRow[] = []
    const invalidRows: InvalidRow[] = []
    const warnings: Warning[] = []

    for (let i = 0; i < records.length; i++) {
      const raw = records[i]
      const rowNumber = i + 2 // +2 because CSV is 1-indexed and header is row 1

      // Extract fields (normalize keys to lowercase)
      const normalized: Record<string, string> = {}
      Object.keys(raw).forEach(key => {
        normalized[key.toLowerCase().trim()] = raw[key]
      })

      const first_name = normalized.first_name || ''
      const last_name = normalized.last_name || ''
      const email = normalized.email || ''
      const phone = normalized.phone || ''
      const role = normalized.role || ''
      const yearsExpRaw = normalized.years_experience || ''
      const city = normalized.city || ''
      const province_state = normalized.province_state || ''

      const errors: string[] = []

      // Validate first_name
      if (!first_name || first_name.length < 2 || first_name.length > 50) {
        errors.push('first_name: required, 2-50 characters')
      }

      // Validate last_name
      if (!last_name || last_name.length < 2 || last_name.length > 50) {
        errors.push('last_name: required, 2-50 characters')
      }

      // Validate email
      if (!email || !isValidEmail(email)) {
        errors.push('email: required, valid format')
      }

      // Validate phone (must be 10 digits)
      if (!phone || !isValidPhone(phone)) {
        errors.push('phone: required, 10 digits')
      }

      // Validate role
      if (!role || !ALLOWED_ROLES.includes(role)) {
        errors.push(`role: required, one of: ${ALLOWED_ROLES.join(', ')}`)
      }

      // Validate years_experience (optional, 0-50)
      let years_experience: number | undefined
      if (yearsExpRaw) {
        const parsed = parseInt(yearsExpRaw)
        if (isNaN(parsed) || parsed < 0 || parsed > 50) {
          errors.push('years_experience: must be 0-50')
        } else {
          years_experience = parsed
        }
      }

      // Validate city (optional, max 100)
      if (city && city.length > 100) {
        errors.push('city: max 100 characters')
      }

      // Derive locale from province_state
      const { locale, error: localeError } = deriveLocale(province_state)
      if (localeError) {
        errors.push(localeError)
      }

      // Cross-row dedup within CSV
      const normalizedEmail = normalizeEmail(email)
      const normalizedPhone = normalizePhone(phone)

      if (normalizedEmail && csvEmails.has(normalizedEmail)) {
        errors.push('duplicate email in upload')
      }
      if (normalizedPhone && csvPhones.has(normalizedPhone)) {
        errors.push('duplicate phone in upload')
      }

      // Track for dedup check
      if (normalizedEmail) csvEmails.add(normalizedEmail)
      if (normalizedPhone) csvPhones.add(normalizedPhone)

      if (errors.length > 0) {
        invalidRows.push({
          row_number: rowNumber,
          errors,
          raw_data: {
            first_name,
            last_name,
            email,
            phone,
            role,
            years_experience: yearsExpRaw,
            city,
            province_state
          }
        })
        continue
      }

      // Valid row
      validRows.push({
        row_number: rowNumber,
        first_name,
        last_name,
        email: normalizedEmail,
        phone: normalizedPhone,
        role,
        years_experience,
        city: city || undefined,
        province_state: province_state || undefined,
        locale
      })
    }

    // System-wide checks (warnings only, don't fail)
    if (validRows.length > 0) {
      const emailsToCheck = validRows.map(r => r.email)
      const phonesToCheck = validRows.map(r => r.phone)

      // Check if emails exist in DB
      if (emailsToCheck.length > 0) {
        const existingResult = await pool.query(
          'SELECT LOWER(email) as email FROM caregivers WHERE LOWER(email) = ANY($1)',
          [emailsToCheck]
        )
        const existingEmails = new Set(existingResult.rows.map(r => r.email))
        validRows.forEach((row, idx) => {
          if (existingEmails.has(row.email)) {
            warnings.push({
              row_number: row.row_number,
              message: 'email exists, caregiver will be prompted to merge on claim'
            })
          }
        })
      }

      // Check if phones exist in DB
      if (phonesToCheck.length > 0) {
        const existingPhonesResult = await pool.query(
          'SELECT phone FROM caregivers WHERE phone = ANY($1)',
          [phonesToCheck]
        )
        const existingPhones = new Set(existingPhonesResult.rows.map(r => r.phone))
        validRows.forEach((row) => {
          if (existingPhones.has(row.phone)) {
            warnings.push({
              row_number: row.row_number,
              message: 'phone exists, caregiver will be prompted to merge on claim'
            })
          }
        })
      }
    }

    // Return preview response (NO writes to DB)
    return NextResponse.json({
      total_rows: records.length,
      valid_rows: validRows,
      invalid_rows: invalidRows,
      warnings,
      message: 'Preview only. No profiles created. Confirm to write to database.'
    })

  } catch (err) {
    console.error('Error in /api/roster/import:', err)
    return NextResponse.json(
      { error: 'internal_error', message: 'Failed to process import preview' },
      { status: 500 }
    )
  } finally {
    pool.end()
  }
}