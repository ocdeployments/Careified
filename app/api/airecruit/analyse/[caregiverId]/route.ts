import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { pool } from '@/lib/db'
import { analyseProfile } from '@/lib/airecruit/profile-analysis'
import { checkRateLimit, getClientIp } from '@/lib/rateLimit'

// Cache for profile analyses (in-memory for simplicity)
const analysisCache = new Map<string, { data: any; timestamp: number }>()
const CACHE_TTL_MS = 60 * 60 * 1000 // 1 hour

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ caregiverId: string }> }
) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { caregiverId } = await params

    if (!caregiverId) {
      return NextResponse.json({ error: 'Caregiver ID required' }, { status: 400 })
    }

    // Rate limit: 10 per agency per hour
    const clientIp = getClientIp(req)
    if (!checkRateLimit(clientIp, 10)) {
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 })
    }

    // Get agency
    const { rows: agencyRows } = await pool.query(
      `SELECT id, name FROM agencies WHERE clerk_user_id = $1 LIMIT 1`,
      [userId]
    )
    const agency = agencyRows[0]
    if (!agency) {
      return NextResponse.json({ error: 'Agency not found' }, { status: 404 })
    }

    // Check agency is approved
    const { rows: agencyCheck } = await pool.query(
      `SELECT status FROM agencies WHERE id = $1`,
      [agency.id]
    )
    if (agencyCheck[0]?.status !== 'approved') {
      return NextResponse.json(
        { error: 'Your agency account is not approved' },
        { status: 403 }
      )
    }

    // Check ownership - caregiver in roster or shortlist
    const { rows: ownershipRows } = await pool.query(
      `SELECT id FROM caregivers
       WHERE id = $1
       AND (created_by_agency_id = $2 OR source_agency_id = $2)
       UNION
       SELECT caregiver_id FROM agency_shortlist
       WHERE caregiver_id = $1 AND agency_id = $2`,
      [caregiverId, agency.id]
    )
    if (ownershipRows.length === 0) {
      return NextResponse.json(
        { error: 'This caregiver is not in your roster or shortlist' },
        { status: 403 }
      )
    }

    // Check cache
    const cacheKey = `${agency.id}:${caregiverId}`
    const cached = analysisCache.get(cacheKey)
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return NextResponse.json(cached.data)
    }

    // Run analysis
    const analysis = await analyseProfile(caregiverId)

    // Cache result
    analysisCache.set(cacheKey, {
      data: analysis,
      timestamp: Date.now()
    })

    return NextResponse.json(analysis)

  } catch (error) {
    console.error('Profile analyse API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}