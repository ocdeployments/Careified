import { NextResponse } from 'next/server'
import { auth, clerkClient } from '@clerk/nextjs/server'
import { Pool } from 'pg'

const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } })

const ALLOWED_ROLES = ['PSW', 'HCA', 'DSW', 'Companion', 'LiveIn', 'Other']

// Simple CSV parser - handles quoted fields
function parseCSV(content: string): string[][] {
  const lines = content.trim().split(/\r?\n/)
  return lines.map(line => {
    const result: string[] = []
    let current = ''
    let inQuotes = false

    for (let i = 0; i < line.length; i++) {
      const char = line[i]
      if (char === '"') {
        inQuotes = !inQuotes
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim())
        current = ''
      } else {
        current += char
      }
    }
    result.push(current.trim())
    return result
  })
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function isValidPhone(phone: string): boolean {
  return /^\d{10}$/.test(phone)
}

interface ValidationError {
  row: number
  field: string
  message: string
}

interface ValidRow {
  row: number
  first_name: string
  last_name: string
  email: string
  phone: string
  role: string
  years_experience?: number
  city?: string
  province_state?: string
}

async function checkApprovedAgency(): Promise<{ agencyId: string; agencyName: string; locale: string } | null> {
  try {
    const { userId } = await auth()
    if (!userId) return null

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

async function sendClaimEmail(email: string, claimUrl: string, firstName: string, agencyName: string) {
  if (!process.env.RESEND_API_KEY) {
    console.log('RESEND_API_KEY not set — email skipped')
    return
  }

  try {
    const { Resend } = require('resend')
    const resend = new Resend(process.env.RESEND_API_KEY)

    await resend.emails.send({
      from: 'Careified <noreply@careified.vercel.app>',
      to: email,
      subject: `${agencyName} created a Careified profile for you — claim it now`,
      html: `
        <p>Hi ${firstName},</p>
        <p>${agencyName} added you to Careified — the reputation platform for professional caregivers.</p>
        <p>We've created a basic profile for you with the information we have on file. Claim it now to:</p>
        <ul>
          <li>Add your own details and photo</li>
          <li>Make your credentials visible to agencies</li>
          <li>Build your portable professional reputation</li>
        </ul>
        <p><a href="${claimUrl}">Claim your profile</a></p>
        <p>This link expires in 30 days.</p>
        <p>The Careified Team</p>
      `,
    })
  } catch (err) {
    console.error('Failed to send claim email:', err)
  }
}

export async function POST(request: Request) {
  try {
    const agency = await checkApprovedAgency()
    if (!agency) {
      return NextResponse.json({ error: 'unauthorized', message: 'Only approved agencies can import caregivers' }, { status: 403 })
    }

    const formData = await request.formData()
    const file = formData.get('csv') as File | null

    if (!file) {
      return NextResponse.json({ error: 'validation_error', message: 'No CSV file provided' }, { status: 400 })
    }

    const content = await file.text()

    if (!content.trim()) {
      return NextResponse.json({ error: 'validation_error', message: 'CSV file is empty' }, { status: 400 })
    }

    const rows = parseCSV(content)

    // Validate header row
    if (rows.length < 2) {
      return NextResponse.json({ error: 'validation_error', message: 'CSV must have header row and at least one data row' }, { status: 400 })
    }

    const header = rows[0].map(h => h.toLowerCase().trim())
    const expectedColumns = ['first_name', 'last_name', 'email', 'phone', 'role', 'years_experience', 'city', 'province_state']

    // Check required columns exist
    const missingColumns = expectedColumns.filter(col => !header.includes(col))
    if (missingColumns.length > 0) {
      return NextResponse.json({ error: 'validation_error', message: `Missing columns: ${missingColumns.join(', ')}` }, { status: 400 })
    }

    // Get column indices
    const firstNameIdx = header.indexOf('first_name')
    const lastNameIdx = header.indexOf('last_name')
    const emailIdx = header.indexOf('email')
    const phoneIdx = header.indexOf('phone')
    const roleIdx = header.indexOf('role')
    const yearsExpIdx = header.indexOf('years_experience')
    const cityIdx = header.indexOf('city')
    const provinceIdx = header.indexOf('province_state')

    // Collect all emails to check for duplicates in CSV
    const csvEmails = new Set<string>()

    // Validate and collect rows
    const validRows: ValidRow[] = []
    const errorRows: ValidationError[] = []

    for (let i = 1; i < rows.length; i++) {
      const row = rows[i]
      const rowNum = i + 1

      // Skip empty rows
      if (row.length === 1 && !row[0].trim()) continue

      const first_name = row[firstNameIdx]
      const last_name = row[lastNameIdx]
      const email = row[emailIdx]
      const phone = row[phoneIdx]
      const role = row[roleIdx]
      const years_experience = row[yearsExpIdx] ? parseInt(row[yearsExpIdx]) : undefined
      const city = row[cityIdx]
      const province_state = row[provinceIdx]

      // Validate each field
      const rowErrors: ValidationError[] = []

      if (!first_name || first_name.length < 2 || first_name.length > 50) {
        rowErrors.push({ row: rowNum, field: 'first_name', message: 'required, 2-50 characters' })
      }
      if (!last_name || last_name.length < 2 || last_name.length > 50) {
        rowErrors.push({ row: rowNum, field: 'last_name', message: 'required, 2-50 characters' })
      }
      if (!email || !isValidEmail(email)) {
        rowErrors.push({ row: rowNum, field: 'email', message: 'required, valid format' })
      }
      if (!phone || !isValidPhone(phone)) {
        rowErrors.push({ row: rowNum, field: 'phone', message: 'required, 10 digits' })
      }
      if (!role || !ALLOWED_ROLES.includes(role)) {
        rowErrors.push({ row: rowNum, field: 'role', message: `required, one of: ${ALLOWED_ROLES.join(', ')}` })
      }
      if (years_experience !== undefined && (isNaN(years_experience) || years_experience < 0 || years_experience > 50)) {
        rowErrors.push({ row: rowNum, field: 'years_experience', message: 'must be 0-50' })
      }

      // Check for duplicate email in CSV
      if (email && csvEmails.has(email.toLowerCase())) {
        rowErrors.push({ row: rowNum, field: 'email', message: 'duplicate in CSV' })
      }
      if (email) csvEmails.add(email.toLowerCase())

      if (rowErrors.length > 0) {
        errorRows.push(...rowErrors)
        continue
      }

      validRows.push({
        row: rowNum,
        first_name,
        last_name,
        email,
        phone,
        role,
        years_experience: years_experience || undefined,
        city: city || undefined,
        province_state: province_state || undefined,
      })
    }

    // If no valid rows, return errors
    if (validRows.length === 0) {
      return NextResponse.json({ error: 'validation_error', errors: errorRows }, { status: 400 })
    }

    // Get existing emails to check for duplicates in DB
    const emailsToCheck = validRows.map(r => r.email)
    const existingResult = await pool.query(
      'SELECT LOWER(email) as email, claim_status FROM caregivers WHERE LOWER(email) = ANY($1)',
      [emailsToCheck.map(e => e.toLowerCase())]
    )

    const existingEmails = new Set(existingResult.rows.map(r => r.email))
    const claimedEmails = new Set(
      existingResult.rows
        .filter(r => r.claim_status === 'self_built' || r.claim_status === 'claimed')
        .map(r => r.email)
    )

    // Filter out duplicates from DB
    const filteredValidRows: ValidRow[] = []
    for (const validRow of validRows) {
      if (claimedEmails.has(validRow.email.toLowerCase())) {
        errorRows.push({ row: validRow.row, field: 'email', message: 'A caregiver with this email already exists' })
      } else if (existingEmails.has(validRow.email.toLowerCase())) {
        // Already has agency_built profile, can update/recreate
        filteredValidRows.push(validRow)
      } else {
        filteredValidRows.push(validRow)
      }
    }

    // Create profiles for valid rows
    const createdIds: string[] = []
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

    for (const vRow of filteredValidRows) {
      try {
        // Insert caregiver
        const caregiverResult = await pool.query(
          `INSERT INTO caregivers
           (first_name, last_name, email, phone, claim_status, source_agency_id, availability_status, locale, years_experience, city, province_state)
           VALUES ($1, $2, $3, $4, 'agency_built', $5, 'available', $6, $7, $8, $9)
           RETURNING id`,
          [vRow.first_name, vRow.last_name, vRow.email, vRow.phone, agency.agencyId, agency.locale, vRow.years_experience || null, vRow.city || null, vRow.province_state || null]
        )

        const caregiverId = caregiverResult.rows[0].id

        // Generate claim token
        const tokenResult = await pool.query(
          `INSERT INTO caregiver_claim_tokens (caregiver_id, agency_id, email_sent_to)
           VALUES ($1, $2, $3)
           RETURNING token`,
          [caregiverId, agency.agencyId, vRow.email]
        )

        const token = tokenResult.rows[0].token

        // Send claim email
        const claimUrl = `${appUrl}/claim/${token}`
        await sendClaimEmail(vRow.email, claimUrl, vRow.first_name, agency.agencyName)

        createdIds.push(caregiverId)
      } catch (insertErr) {
        console.error('Error inserting row:', insertErr)
        errorRows.push({ row: vRow.row, field: 'general', message: 'Failed to create profile' })
      }
    }

    // Return partial success
    const status = createdIds.length > 0 && errorRows.length > 0 ? 207 : createdIds.length > 0 ? 201 : 400

    return NextResponse.json({
      created: createdIds.length,
      failed: filteredValidRows.length - createdIds.length + errorRows.filter(e => !validRows.some(v => v.row === e.row)).length,
      created_ids: createdIds,
      errors: errorRows,
    }, { status })
  } catch (err) {
    console.error('Error in /api/roster/import:', err)
    return NextResponse.json({ error: 'internal_error', message: 'Failed to import caregivers' }, { status: 500 })
  } finally {
    pool.end()
  }
}