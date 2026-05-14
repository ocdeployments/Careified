import { NextRequest, NextResponse } from 'next/server'
import { auth, clerkClient } from '@clerk/nextjs/server'
import { pool } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    // Auth check
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
    }

    let agencyId: string | null = null
    try {
      const client = await clerkClient()
      const user = await client.users.getUser(userId)
      const role = user.publicMetadata?.role as string

      if (role !== 'agency') {
        return NextResponse.json({ error: 'not_agency' }, { status: 403 })
      }

      const agencyResult = await pool.query(
        "SELECT id FROM agencies WHERE clerk_user_id = $1 AND status = 'approved'",
        [userId]
      )

      if (agencyResult.rows.length === 0) {
        return NextResponse.json({ error: 'agency_not_approved' }, { status: 403 })
      }

      agencyId = agencyResult.rows[0].id
    } catch (e: any) {
      if (e?.message?.includes('NEXT_REDIRECT')) {
        return NextResponse.json({ error: 'unauthorized' }, { status: 403 })
      }
      console.error('Auth error:', e)
      return NextResponse.json({ error: 'auth_error' }, { status: 500 })
    }

    // Build response
    const response: any = { stats: {}, action_items: [], pipeline: null, recent_activity: [], top_matches: [], expiring_credentials: [] }

    // Stats queries
    try {
      const statsResult = await pool.query(`
        SELECT
          (SELECT COUNT(*) FROM caregivers WHERE created_by_agency_id = $1) as roster_total,
          (SELECT COUNT(*) FROM caregivers WHERE created_by_agency_id = $1 AND claim_status = 'claimed') as roster_claimed,
          (SELECT COUNT(*) FROM caregivers WHERE created_by_agency_id = $1 AND claim_status = 'agency_built') as roster_pending,
          (SELECT COUNT(*) FROM agency_shortlist WHERE agency_clerk_id = $2) as shortlist_total,
          (SELECT COUNT(*) FROM client_needs WHERE agency_id = $1 AND status != 'closed') as clients_total,
          (SELECT COUNT(*) FROM client_needs WHERE agency_id = $1 AND matched_caregiver_id IS NULL AND status != 'closed') as clients_unmatched,
          (SELECT COUNT(*) FROM airecruit_campaigns WHERE agency_id = $1 AND status = 'active') as airecruit_active
      `, [agencyId, userId])
      response.stats = statsResult.rows[0] || {}
    } catch (e) {
      console.error('Stats query failed:', e)
    }

    // Action items
    try {
      const actionItems: any[] = []
      const { roster_pending, clients_unmatched, airecruit_active } = response.stats

      // Pending claims
      if (roster_pending > 0) {
        actionItems.push({
          priority: 'high',
          title: `${roster_pending} caregivers haven't claimed their profiles`,
          cta_href: '/agency/roster'
        })
      }

      // Expiring tokens
      const expiringTokensResult = await pool.query(`
        SELECT COUNT(*) as count FROM caregiver_claim_tokens
        WHERE agency_id = $1 AND status = 'pending' AND expires_at < NOW() + INTERVAL '3 days'
      `, [agencyId])
      const expiring_tokens = parseInt(expiringTokensResult.rows[0]?.count || '0')
      if (expiring_tokens > 0) {
        actionItems.push({
          priority: 'urgent',
          title: `${expiring_tokens} claim invites expire in 3 days`,
          cta_href: '/agency/roster'
        })
      }

      // Unmatched clients
      if (clients_unmatched > 0) {
        actionItems.push({
          priority: 'high',
          title: `${clients_unmatched} clients have no matched caregivers`,
          cta_href: '/agency/clients'
        })
      }

      // AIRecruit unreviewed
      const unreviewedResult = await pool.query(`
        SELECT COUNT(*) as count FROM airecruit_call_results cr
        JOIN airecruit_campaigns cc ON cc.id = cr.campaign_id
        WHERE cc.agency_id = $1 AND cr.recommendation = 'review'
        AND cr.called_at > NOW() - INTERVAL '48 hours'
      `, [agencyId])
      const unreviewed = parseInt(unreviewedResult.rows[0]?.count || '0')
      if (unreviewed > 0) {
        actionItems.push({
          priority: 'high',
          title: `${unreviewed} AIRecruit results ready for review`,
          cta_href: '/agency/airecruit'
        })
      }

      // Incomplete profiles
      const incompleteResult = await pool.query(`
        SELECT COUNT(*) as count FROM caregivers
        WHERE created_by_agency_id = $1 AND (first_name IS NULL OR last_name IS NULL OR city IS NULL)
      `, [agencyId])
      const incomplete_profiles = parseInt(incompleteResult.rows[0]?.count || '0')
      if (incomplete_profiles > 0) {
        actionItems.push({
          priority: 'normal',
          title: `${incomplete_profiles} caregiver profiles are incomplete`,
          cta_href: '/agency/roster'
        })
      }

      // Sort by priority
      const priorityOrder = { urgent: 0, high: 1, normal: 2 }
      actionItems.sort((a, b) => priorityOrder[a.priority as keyof typeof priorityOrder] - priorityOrder[b.priority as keyof typeof priorityOrder])
      response.action_items = actionItems.slice(0, 8)
    } catch (e) {
      console.error('Action items query failed:', e)
    }

    // Pipeline (using pipeline_status column)
    try {
      const pipelineResult = await pool.query(`
        SELECT pipeline_status, COUNT(*) as count FROM agency_shortlist
        WHERE agency_clerk_id = $1
        GROUP BY pipeline_status
      `, [userId])

      const pipelineMap: Record<string, number> = {}
      pipelineResult.rows.forEach((r: any) => {
        pipelineMap[r.pipeline_status || 'unknown'] = parseInt(r.count)
      })

      response.pipeline = {
        discovered: pipelineMap.discovered || 0,
        contacted: pipelineMap.contacted || 0,
        interviewing: pipelineMap.interviewing || 0,
        placed: pipelineMap.placed || 0,
        inactive: pipelineMap.inactive || 0
      }
    } catch (e) {
      console.error('Pipeline query failed:', e)
      response.pipeline = null
    }

    // Recent activity from AuditLog
    try {
      const activityResult = await pool.query(`
        SELECT action, newValue, createdAt FROM "AuditLog"
        WHERE adminId = $1
        ORDER BY "createdAt" DESC
        LIMIT 10
      `, [userId])

      const actionMap: Record<string, string> = {
        roster_import: 'Roster imported',
        profile_claimed: 'Profile claimed',
        claim_email_queued: 'Invite sent',
        review_submitted: 'Rating submitted',
        shortlist_add: 'Added to shortlist',
        roster_upload_resume: 'Caregiver added via resume'
      }

      response.recent_activity = activityResult.rows.map((r: any) => {
        const baseAction = actionMap[r.action] || r.action
        return {
          action: baseAction,
          timestamp: r.createdAt,
          detail: r.newValue
        }
      })
    } catch (e) {
      console.error('Activity query failed:', e)
      response.recent_activity = []
    }

    // Top matches
    try {
      const matchesResult = await pool.query(`
        SELECT id, first_name, last_name, aggregate_score, photo_url, specializations
        FROM caregivers
        WHERE created_by_agency_id = $1
          AND claim_status = 'claimed'
          AND availability_status IN ('available', 'open_to_work')
        ORDER BY aggregate_score DESC NULLS LAST
        LIMIT 5
      `, [agencyId])

      response.top_matches = matchesResult.rows.map((c: any) => ({
        id: c.id,
        first_name: c.first_name,
        last_name: c.last_name,
        aggregate_score: c.aggregate_score,
        photo_url: c.photo_url,
        role: c.specializations?.[0] || null
      }))
    } catch (e) {
      console.error('Top matches query failed:', e)
      response.top_matches = []
    }

    // Expiring credentials
    try {
      const credsResult = await pool.query(`
        SELECT cc.certification, cc.expiry_date, c.id as caregiver_id, c.first_name, c.last_name
        FROM caregiver_certifications cc
        JOIN caregivers c ON c.id = cc.caregiver_id
        WHERE c.created_by_agency_id = $1
          AND cc.expiry_date IS NOT NULL
          AND cc.expiry_date BETWEEN NOW() AND NOW() + INTERVAL '60 days'
        ORDER BY cc.expiry_date ASC
        LIMIT 10
      `, [agencyId])

      response.expiring_credentials = credsResult.rows.map((cc: any) => ({
        caregiver_id: cc.caregiver_id,
        caregiver_name: `${cc.first_name} ${cc.last_name}`,
        certification: cc.certification,
        expiry_date: cc.expiry_date
      }))
    } catch (e) {
      console.error('Credentials query failed:', e)
      response.expiring_credentials = []
    }

    return NextResponse.json(response, {
      headers: { 'Cache-Control': 'no-store' }
    })
  } catch (error) {
    console.error('Dashboard API error:', error)
    return NextResponse.json(
      { error: 'internal_error', stats: {}, action_items: [], pipeline: null, recent_activity: [], top_matches: [], expiring_credentials: [] },
      { status: 200 }
    )
  }
}