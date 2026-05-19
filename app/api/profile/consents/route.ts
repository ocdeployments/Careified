import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { Pool } from 'pg'
import { grantConsent, revokeConsent, getCaregiverConsents } from '@/lib/consent/helpers'
import { CONSENT_TYPES, ConsentTypeId } from '@/lib/consent/types'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 3,
  idleTimeoutMillis: 10000,
  connectionTimeoutMillis: 10000,
  allowExitOnIdle: true,
})

async function getCaregiverIdFromClerk(clerkUserId: string): Promise<string | null> {
  const r = await pool.query('SELECT id FROM caregivers WHERE clerk_user_id = $1', [clerkUserId])
  return r.rows[0]?.id || null
}

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const caregiverId = await getCaregiverIdFromClerk(userId)
  if (!caregiverId) return NextResponse.json({ error: 'No caregiver profile' }, { status: 404 })
  const consents = await getCaregiverConsents(caregiverId)
  return NextResponse.json({ consents })
}

export async function POST(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const caregiverId = await getCaregiverIdFromClerk(userId)
  if (!caregiverId) return NextResponse.json({ error: 'No caregiver profile' }, { status: 404 })

  const body = await req.json()
  const { action, consentType, specificTarget, method } = body

  if (!consentType || !(consentType in CONSENT_TYPES)) {
    return NextResponse.json({ error: 'Invalid consent type' }, { status: 400 })
  }

  const ipAddress = req.headers.get('x-forwarded-for')?.split(',')[0] || req.headers.get('x-real-ip') || null
  const userAgent = req.headers.get('user-agent') || null

  try {
    if (action === 'grant') {
      await grantConsent(caregiverId, consentType as ConsentTypeId, {
        ipAddress: ipAddress || undefined,
        userAgent: userAgent || undefined,
        method: method || 'settings_page',
        specificTarget,
      })
      return NextResponse.json({ success: true, action: 'granted' })
    }
    if (action === 'revoke') {
      await revokeConsent(caregiverId, consentType as ConsentTypeId, specificTarget)
      return NextResponse.json({ success: true, action: 'revoked' })
    }
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (err) {
    console.error('Consent API error:', err)
    return NextResponse.json({ error: 'Failed to update consent' }, { status: 500 })
  }
}
