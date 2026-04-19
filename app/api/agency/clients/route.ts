import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { pool } from '@/lib/db'
import { encryptPHI, encryptPHIJson, decryptPHI, decryptPHIJson } from '@/lib/encryption/phi'
import { recordClientDataConsent, hasCurrentAgencyConsent } from '@/lib/consent/capture'
import { logAudit } from '@/lib/audit/log'

async function getAgencyId(clerkUserId: string): Promise<string | null> {
  const { rows } = await pool.query(
    `SELECT id FROM agencies WHERE clerk_user_id = $1 LIMIT 1`,
    [clerkUserId]
  )
  return rows[0]?.id ?? null
}

// PHI fields (encrypted). Everything else is stored in plaintext.
const PHI_STRING_FIELDS = ['client_first_name', 'primary_condition', 'mobility_level']
const PHI_BOOLEAN_FIELDS = ['medications_complex']
const PHI_JSON_FIELDS = ['secondary_conditions']

const NON_PHI_FIELDS = [
  'client_age', 'services_needed', 'care_intensity', 'placement_type',
  'hours_per_week', 'start_date', 'duration_expected',
  'city', 'state', 'postal_code',
  'pets_present', 'smoking_household', 'home_condition', 'family_dynamics',
  'language_required', 'gender_preference', 'cultural_preference',
  'personality_desired', 'hourly_rate_max',
]

export async function GET(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const agencyId = await getAgencyId(userId)
  if (!agencyId) return NextResponse.json({ error: 'no_agency' }, { status: 403 })

  const { rows } = await pool.query(
    `SELECT
      id,
      client_first_name_encrypted,
      client_age,
      primary_condition_encrypted,
      placement_type, city, state, language_required,
      status, created_at, matched_caregiver_id
    FROM client_needs
    WHERE agency_id = $1
    ORDER BY created_at DESC`,
    [agencyId]
  )

  const clients = rows.map(r => ({
    id: r.id,
    client_first_name: decryptPHI(r.client_first_name_encrypted),
    client_age: r.client_age,
    primary_condition: decryptPHI(r.primary_condition_encrypted),
    placement_type: r.placement_type,
    city: r.city,
    state: r.state,
    language_required: r.language_required,
    status: r.status,
    created_at: r.created_at,
    matched_caregiver_id: r.matched_caregiver_id,
  }))

  logAudit(pool, {
    actorType: 'agency',
    actorId: userId,
    action: 'client_list_view',
    metadata: { count: clients.length },
    ipAddress: req.headers.get('x-forwarded-for') || undefined,
    userAgent: req.headers.get('user-agent') || undefined,
  })

  return NextResponse.json({ clients })
}

export async function POST(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const agencyId = await getAgencyId(userId)
  if (!agencyId) return NextResponse.json({ error: 'no_agency' }, { status: 403 })

  // Require agency platform-model acknowledgment before intake
  const hasPlatformConsent = await hasCurrentAgencyConsent(pool, agencyId, 'agency_platform_role')
  const hasEmployerConsent = await hasCurrentAgencyConsent(pool, agencyId, 'agency_employer_responsibility')

  if (!hasPlatformConsent || !hasEmployerConsent) {
    return NextResponse.json({
      error: 'consent_required',
      required: ['agency_platform_role', 'agency_employer_responsibility'].filter((t) => {
        return (t === 'agency_platform_role' && !hasPlatformConsent)
          || (t === 'agency_employer_responsibility' && !hasEmployerConsent)
      }),
    }, { status: 412 })
  }

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 })
  }

  // The intake form must POST a `client_data_authorization: true` flag indicating
  // the agency has obtained authorization from the client to input this data.
  if (!body.client_data_authorization) {
    return NextResponse.json({
      error: 'client_authorization_required',
      message: 'Agency must confirm client authorization before submitting PHI.',
    }, { status: 400 })
  }

  const ipAddress = req.headers.get('x-forwarded-for') || undefined
  const userAgent = req.headers.get('user-agent') || undefined

  // Build insert
  const cols: string[] = ['agency_id']
  const placeholders: string[] = ['$1']
  const values: unknown[] = [agencyId]
  let idx = 2

  // Encrypted PHI string fields
  for (const f of PHI_STRING_FIELDS) {
    if (body[f] != null && body[f] !== '') {
      cols.push(`${f}_encrypted`)
      placeholders.push(`$${idx++}`)
      values.push(encryptPHI(String(body[f])))
    }
  }
  // Encrypted PHI boolean
  for (const f of PHI_BOOLEAN_FIELDS) {
    if (body[f] != null) {
      cols.push(`${f}_encrypted`)
      placeholders.push(`$${idx++}`)
      values.push(encryptPHI(String(body[f])))
    }
  }
  // Encrypted PHI JSON (arrays)
  for (const f of PHI_JSON_FIELDS) {
    if (body[f] != null && (!Array.isArray(body[f]) || (body[f] as unknown[]).length > 0)) {
      cols.push(`${f}_encrypted`)
      placeholders.push(`$${idx++}`)
      values.push(encryptPHIJson(body[f]))
    }
  }
  // Plaintext non-PHI fields
  for (const f of NON_PHI_FIELDS) {
    if (body[f] != null && body[f] !== '' &&
      !(Array.isArray(body[f]) && (body[f] as unknown[]).length === 0)) {
      cols.push(f)
      placeholders.push(`$${idx++}`)
      values.push(body[f])
    }
  }

  cols.push('encryption_key_version')
  placeholders.push(`$${idx++}`)
  values.push(1)

  const { rows } = await pool.query(
    `INSERT INTO client_needs (${cols.join(',')})
    VALUES (${placeholders.join(',')})
    RETURNING id, status, created_at`,
    values
  )

  const clientNeedsId = rows[0].id as string

  // Record client data consent
  await recordClientDataConsent(
    pool,
    agencyId,
    userId,
    clientNeedsId,
    true,
    ipAddress,
    userAgent
  )

  // Audit
  await logAudit(pool, {
    actorType: 'agency',
    actorId: userId,
    action: 'client_needs_created',
    resourceType: 'client_needs',
    resourceId: clientNeedsId,
    metadata: {
      has_phi: true,
      fields_submitted: Object.keys(body).length,
    },
    ipAddress,
    userAgent,
  })

  return NextResponse.json({
    client: {
      id: clientNeedsId,
      client_first_name: body.client_first_name ?? null,
      status: rows[0].status,
      created_at: rows[0].created_at,
    },
  }, { status: 201 })
}
