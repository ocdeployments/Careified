// app/api/match/rank/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { pool } from '@/lib/db'
import {
  computeMatchScore,
  loadAllApprovedCaregivers,
  persistMatchScore,
  ALIGNMENT_DISCLAIMER,
} from '@/lib/matching'
import type { MatchNeed } from '@/lib/matching'
import { generateGapAnalysis } from '@/lib/matching/gap-analysis'
import { getLocale } from '@/lib/locale/get-locale'
import crypto from 'crypto'

const CACHE_TTL = 5 * 60 * 1000 // 5 minutes
const MAX_CACHE_SIZE = 100

interface CacheEntry {
  data: unknown
  expires: number
}

const responseCache = new Map<string, CacheEntry>()

export async function POST(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const url = new URL(req.url)
  const refresh = url.searchParams.get('refresh') === 'true'

  let body: {
    need: MatchNeed
    clientNeedsId?: string
    minScore?: number
    page?: number
    limit?: number
  }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 })
  }

  const { need, clientNeedsId, minScore = 0, page = 1, limit = 20 } = body

  // Generate cache key from request body (exclude clientNeedsId for caching)
  const cacheKey = crypto.createHash('md5')
    .update(JSON.stringify({ need, minScore, page, limit }))
    .digest('hex')

  // Check cache first (skip if refresh=true)
  if (!refresh && responseCache.has(cacheKey)) {
    const cached = responseCache.get(cacheKey)!
    if (cached.expires > Date.now()) {
      return NextResponse.json(cached.data, {
        headers: { 'X-Cache': 'HIT' }
      })
    }
    responseCache.delete(cacheKey)
  }
  const validLimit = Math.min(Math.max(1, limit), 50)
  const validPage = Math.max(1, page)
  const offset = (validPage - 1) * validLimit
  if (!need || typeof need !== 'object') {
    return NextResponse.json({ error: 'missing_need' }, { status: 400 })
  }

  // Get agency service areas to filter caregiver pool
  // Also enforce locale scoping - agency can only see caregivers in same locale
  const locale = getLocale()
  let agencyServiceAreas: string[] = []
  try {
    const agencyRow = await pool.query(
      'SELECT service_areas, provinces FROM agencies WHERE clerk_user_id = $1 AND locale = $2',
      [userId, locale]
    )
    if (agencyRow.rows[0]?.service_areas?.length) {
      agencyServiceAreas = agencyRow.rows[0].service_areas
    }
  } catch { /* no restriction if lookup fails */ }

  let caregivers
  try {
    const allCaregivers = await loadAllApprovedCaregivers(pool)
    // Filter by agency service areas if set
    caregivers = agencyServiceAreas.length > 0
      ? allCaregivers.filter(cg => {
          if (!cg.city && !cg.state) return true // include if no location set
          return agencyServiceAreas.some(area =>
            cg.city?.toLowerCase().includes(area.toLowerCase()) ||
            area.toLowerCase().includes(cg.city?.toLowerCase() || '')
          )
        })
      : allCaregivers
  } catch (err) {
    console.error('loadAllApprovedCaregivers failed:', err)
    return NextResponse.json({ error: 'db_load_failed', detail: String(err) }, { status: 500 })
  }


  const ranked = caregivers
    .map(cg => {
      try {
        return { caregiver: cg, result: computeMatchScore(cg, need) }
      } catch (err) {
        console.error('computeMatchScore failed for', cg.id, err)
        return null
      }
    })
    .filter((r): r is NonNullable<typeof r> => r !== null)
    .filter(r => {
      const emptyNeed = !need.language_required && !need.gender_preference &&
        !need.placement_type && !need.state && !need.hourly_rate_max
      return emptyNeed || r.result.gates_passed
    })
    .filter(r => (r.result.alignment_score ?? 0) >= minScore)
    .sort((a, b) => (b.result.alignment_score ?? 0) - (a.result.alignment_score ?? 0))

  const totalMatched = ranked.length
  const paginatedResults = ranked.slice(offset, offset + validLimit)
  const hasMore = offset + validLimit < totalMatched

  // Persist results if we have a client_needs_id (not a filter spec)
  if (clientNeedsId) {
    await Promise.all(
      paginatedResults.map(r =>
        persistMatchScore(pool, r.caregiver.id, clientNeedsId, r.result).catch(err => {
          console.error('persistMatchScore failed:', err)
        })
      )
    )
  }

  // Count excluded (gates_failed) for transparency
  const excludedCount = caregivers.length - totalMatched

  const responseData = {
    scope: paginatedResults[0]?.result.scope ?? 'partial_filter_match',
    disclaimer: paginatedResults[0]?.result.disclaimer ?? ALIGNMENT_DISCLAIMER,
    total_caregivers: caregivers.length,
    matched_count: totalMatched,
    excluded_count: excludedCount,
    page: validPage,
    limit: validLimit,
    has_more: hasMore,
    results: paginatedResults.map(r => ({
      caregiver_id: r.caregiver.id,
      first_name: r.caregiver.first_name,
      last_name: r.caregiver.last_name,
      city: r.caregiver.city,
      state: r.caregiver.state,
      specializations: r.caregiver.specializations,
      languages: r.caregiver.languages,
      years_experience: r.caregiver.years_experience,
      hourly_rate: r.caregiver.hourly_rate,
      alignment_score: r.result.alignment_score,
      overall_confidence: r.result.overall_confidence,
      alignment: r.result,
      match: r.result,
      gap_analysis: generateGapAnalysis(r.caregiver as any, need as any),
    })),
  }

  // Store in cache (skip if clientNeedsId was provided - those are unique per client)
  if (!clientNeedsId) {
    if (responseCache.size > MAX_CACHE_SIZE) {
      const firstKey = responseCache.keys().next().value
      if (firstKey) responseCache.delete(firstKey)
    }
    responseCache.set(cacheKey, {
      data: responseData,
      expires: Date.now() + CACHE_TTL
    })
  }

  return NextResponse.json(responseData, {
    headers: { 'X-Cache': 'MISS' }
  })
}

export async function GET() {
  return NextResponse.json(
    { error: 'use_POST', hint: 'POST a JSON body with { need: MatchNeed }' },
    { status: 405 }
  )
}
