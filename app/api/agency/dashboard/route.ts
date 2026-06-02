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

      if (role !== 'agency' && role !== 'admin') {
        return NextResponse.json({ error: 'not_agency' }, { status: 403 })
      }

      const agencyResult = await pool.query(
        "SELECT id::text as id FROM agencies WHERE clerk_user_id = $1 AND status IN ('approved', 'active')",
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
    const response: any = { stats: {}, action_items: [], pipeline: null, recent_activity: [], top_matches: [], expiring_credentials: [], bench_strength: null }

    // Stats queries - single consolidated query
    try {
      const statsResult = await pool.query(`
        SELECT
          (SELECT COUNT(*)::int FROM caregivers WHERE created_by_agency_id = $1::uuid) as total_caregivers,
          (SELECT COUNT(*)::int FROM caregivers WHERE created_by_agency_id = $1::uuid AND availability_status = 'available_now') as available_caregivers,
          (SELECT COUNT(*)::int FROM caregivers WHERE created_by_agency_id = $1::uuid AND claim_status = 'claimed') as roster_claimed,
          (SELECT COUNT(*)::int FROM agency_shortlist WHERE agency_clerk_id = $2) as pipeline_count,
          (SELECT COUNT(*)::int FROM client_needs WHERE agency_id = $1::uuid AND status != 'closed') as total_clients,
          (SELECT COUNT(*)::int FROM client_needs WHERE agency_id = $1::uuid AND matched_caregiver_id IS NULL AND status != 'closed') as unmatched_clients,
          (SELECT COUNT(*)::int FROM agency_shortlist WHERE agency_clerk_id = $2) as shortlisted_count,
          (SELECT COUNT(*)::int FROM caregiver_certifications cc JOIN caregivers c ON c.id = cc.caregiver_id WHERE c.created_by_agency_id = $1::uuid AND cc.expiry_date IS NOT NULL AND cc.expiry_date < NOW() + INTERVAL '60 days' AND cc.expiry_date > NOW()) as expiring_credentials,
          (SELECT COUNT(*)::int FROM "AIRecruitCampaign" WHERE "agencyId" = $1::text) as airecruit_results,
          (SELECT name FROM agencies WHERE id = $1::uuid) as agency_name,
          (SELECT plan_tier FROM agencies WHERE id = $1::uuid) as plan_tier,
          (SELECT subscription_status FROM agencies WHERE id = $1::uuid) as subscription_status,
          (SELECT show_onboarding FROM agencies WHERE id = $1::uuid) as show_onboarding
      `, [agencyId, userId])

      const row = statsResult.rows[0]
      response.stats = {
        total_clients: row.total_clients || 0,
        unmatched_clients: row.unmatched_clients || 0,
        total_caregivers: row.total_caregivers || 0,
        available_caregivers: row.available_caregivers || 0,
        roster_claimed: row.roster_claimed || 0,
        pipeline_count: row.pipeline_count || 0,
        shortlisted_count: row.shortlisted_count || 0,
        airecruit_results: row.airecruit_results || 0,
        expiring_credentials: row.expiring_credentials || 0,
        agency_name: row.agency_name,
        plan_tier: row.plan_tier,
        subscription_status: row.subscription_status,
        show_onboarding: row.show_onboarding === null ? true : row.show_onboarding,
      }
    } catch (e: any) {
      console.error('Stats query failed:', e.message)
    }

    // Unmatched clients
    try {
      const unmatchedResult = await pool.query(`
        SELECT id, client_first_name as first_name, primary_condition as care_level
        FROM client_needs
        WHERE agency_id = $1::uuid
          AND matched_caregiver_id IS NULL
          AND status != 'closed'
        ORDER BY created_at ASC
        LIMIT 10
      `, [agencyId])
      response.unmatched_clients = unmatchedResult.rows
    } catch (e) {
      console.error('Unmatched clients query failed:', e)
      response.unmatched_clients = []
    }

    // Action items
    try {
      const actionItems: any[] = []
      const { unmatched_clients, airecruit_results, total_caregivers, roster_claimed } = response.stats

      // Pending claims (total - claimed = pending)
      const roster_pending = (total_caregivers || 0) - (roster_claimed || 0)
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
        WHERE agency_id = $1::uuid AND status = 'pending' AND expires_at < NOW() + INTERVAL '3 days'
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
      if (unmatched_clients > 0) {
        actionItems.push({
          priority: 'high',
          title: `${unmatched_clients} clients have no matched caregivers`,
          cta_href: '/agency/clients'
        })
      }

      // AIRecruit unreviewed
      if (airecruit_results > 0) {
        actionItems.push({
          priority: 'high',
          title: `${airecruit_results} AIRecruit results ready for review`,
          cta_href: '/agency/airecruit'
        })
      }

      // Incomplete profiles
      const incompleteResult = await pool.query(`
        SELECT COUNT(*) as count FROM caregivers
        WHERE created_by_agency_id = $1::uuid AND (first_name IS NULL OR last_name IS NULL OR city IS NULL)
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
        SELECT action, "newValue", "createdAt" FROM "AuditLog"
        WHERE "adminId" = $1
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
        WHERE created_by_agency_id = $1::uuid
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
        WHERE c.created_by_agency_id = $1::uuid
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

    // Bench strength - compute from caregiver roster
    try {
      const benchResult = await pool.query(`
        SELECT
          COUNT(*) FILTER (WHERE specializations::text ILIKE '%dementia%') as dementia_count,
          COUNT(*) FILTER (WHERE languages::text ILIKE '%french%') as french_count,
          COUNT(*) FILTER (WHERE willing_live_in = true) as livein_count,
          COUNT(*) FILTER (WHERE specializations::text ILIKE '%wound%') as wound_count,
          COUNT(*) FILTER (WHERE availability_status IN ('available_now', 'available')) as available_count,
          COUNT(*) FILTER (WHERE claim_status = 'claimed') as claimed_count
        FROM caregivers
        WHERE created_by_agency_id = $1::uuid
      `, [agencyId])

      const bench = benchResult.rows[0]
      response.bench_strength = {
        dementia: parseInt(bench.dementia_count) || 0,
        french: parseInt(bench.french_count) || 0,
        livein: parseInt(bench.livein_count) || 0,
        wound: parseInt(bench.wound_count) || 0,
        available: parseInt(bench.available_count) || 0,
        claimed: parseInt(bench.claimed_count) || 0,
      }
    } catch (e) {
      console.error('Bench strength query failed:', e)
      response.bench_strength = null
    }

    return NextResponse.json(response, {
      headers: { 'Cache-Control': 'no-store' }
    })
  } catch (error) {
    console.error('Dashboard API error:', error)
    return NextResponse.json(
      { error: 'internal_error', stats: {}, action_items: [], pipeline: null, recent_activity: [], top_matches: [], expiring_credentials: [], bench_strength: null },
      { status: 200 }
    )
  }
}