import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/db'

export async function GET() {
  try {
    // Get demo agency ID (hardcoded for demo)
    const DEMO_AGENCY_ID = '57e1d648-3ca0-4a95-afb6-93d854690aac'

    // Get AIRecruit results for demo agency
    const result = await pool.query(
      `SELECT cr.candidate_name, cr.overall_score, cr.recommendation, cr.summary, cr.called_at, cc.name as campaign_name
       FROM airecruit_call_results cr
       JOIN airecruit_campaigns cc ON cc.id = cr.campaign_id
       WHERE cc.agency_id = $1
       ORDER BY cr.called_at DESC
       LIMIT 20`,
      [DEMO_AGENCY_ID]
    )

    return NextResponse.json({ results: result.rows })
  } catch (error) {
    console.error('Demo AIRecruit results error:', error)
    return NextResponse.json({ error: 'Failed to fetch results' }, { status: 500 })
  }
}
