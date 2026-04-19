// app/api/match/rank/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { pool } from '@/lib/db'
import {
  computeMatchScore,
  loadAllApprovedCaregivers,
  persistMatchScore,
} from '@/lib/matching'
import type { MatchNeed } from '@/lib/matching'

export async function POST(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  let body: {
    need: MatchNeed
    clientNeedsId?: string
    minScore?: number
    limit?: number
  }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 })
  }

  const { need, clientNeedsId, minScore = 0, limit = 50 } = body
  if (!need || typeof need !== 'object') {
    return NextResponse.json({ error: 'missing_need' }, { status: 400 })
  }

  const caregivers = await loadAllApprovedCaregivers(pool)

  const ranked = caregivers
    .map(cg => ({ caregiver: cg, result: computeMatchScore(cg, need) }))
    .filter(r => r.result.gates_passed)
    .filter(r => (r.result.overall_score ?? 0) >= minScore)
    .sort((a, b) => (b.result.overall_score ?? 0) - (a.result.overall_score ?? 0))
    .slice(0, limit)

  // Persist results if we have a client_needs_id (not a filter spec)
  if (clientNeedsId) {
    await Promise.all(
      ranked.map(r =>
        persistMatchScore(pool, r.caregiver.id, clientNeedsId, r.result).catch(err => {
          console.error('persistMatchScore failed:', err)
        })
      )
    )
  }

  // Count excluded (gates_failed) for transparency
  const excludedCount = caregivers.length - ranked.length

  return NextResponse.json({
    scope: ranked[0]?.result.scope ?? 'partial_filter_match',
    total_caregivers: caregivers.length,
    matched_count: ranked.length,
    excluded_count: excludedCount,
    results: ranked.map(r => ({
      caregiver_id: r.caregiver.id,
      first_name: r.caregiver.first_name,
      last_name: r.caregiver.last_name,
      city: r.caregiver.city,
      state: r.caregiver.state,
      specializations: r.caregiver.specializations,
      languages: r.caregiver.languages,
      years_experience: r.caregiver.years_experience,
      hourly_rate: r.caregiver.hourly_rate,
      match: r.result,
    })),
  })
}

export async function GET() {
  return NextResponse.json(
    { error: 'use_POST', hint: 'POST a JSON body with { need: MatchNeed }' },
    { status: 405 }
  )
}
