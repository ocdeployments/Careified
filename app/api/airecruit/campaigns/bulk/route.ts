import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { pool } from '@/lib/db'
import { cancelRetries } from '@/lib/airecruit/retry'

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { action, campaign_ids, call_type } = body

    if (!action || !['pause', 'resume', 'cancel', 'status'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action. Must be: pause, resume, cancel, or status' },
        { status: 400 }
      )
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

    // Handle each action
    if (action === 'status') {
      // Get all campaigns with counts
      const { rows: campaigns } = await pool.query(
        `SELECT c.id, c.title, c.status, c."createdAt",
           COALESCE(c."callsTotal", 0) as calls_total,
           COALESCE(c."callsCompleted", 0) as calls_completed,
           COALESCE(c."callsPending", 0) as calls_pending
         FROM "AIRecruitCampaign" c
         WHERE c."agencyId" = $1
         ORDER BY c."createdAt" DESC`,
        [agency.id]
      )

      // Get retry queue counts by type
      const { rows: retryStats } = await pool.query(
        `SELECT call_type, COUNT(*) as count
         FROM call_retry_queue
         WHERE agency_id = $1 AND status = 'pending'
         GROUP BY call_type`,
        [agency.id]
      )

      return NextResponse.json({
        campaigns,
        retry_queue: retryStats,
        timestamp: new Date().toISOString()
      })
    }

    // For pause, resume, cancel - need campaigns table
    // Check if campaigns exist
    const { rows: existingCampaigns } = await pool.query(
      `SELECT id FROM "AIRecruitCampaign" WHERE "agencyId" = $1 LIMIT 1`,
      [agency.id]
    )

    if (existingCampaigns.length === 0) {
      // No campaigns table - return simple response
      if (action === 'cancel' && call_type) {
        // Cancel pending retries for this call type
        await cancelRetries(agency.id, call_type)
        return NextResponse.json({
          action,
          message: `Cancelled pending ${call_type} retries`,
          campaigns_affected: 0
        })
      }

      return NextResponse.json({
        action,
        message: 'No campaigns found',
        campaigns_affected: 0
      })
    }

    // Build query based on action
    let query = ''
    let params: any[] = [agency.id]

    if (campaign_ids && campaign_ids.length > 0) {
      params.push(campaign_ids)
      if (action === 'pause') {
        query = `UPDATE "AIRecruitCampaign"
                 SET status = 'paused', "updatedAt" = NOW()
                 WHERE "agencyId" = $1 AND id = ANY($2) AND status = 'active'`
      } else if (action === 'resume') {
        query = `UPDATE "AIRecruitCampaign"
                 SET status = 'active', "updatedAt" = NOW()
                 WHERE "agencyId" = $1 AND id = ANY($2) AND status = 'paused'`
      } else if (action === 'cancel') {
        query = `UPDATE "AIRecruitCampaign"
                 SET status = 'cancelled', "updatedAt" = NOW()
                 WHERE "agencyId" = $1 AND id = ANY($2)`
      }
    } else if (call_type) {
      if (action === 'pause') {
        query = `UPDATE "AIRecruitCampaign"
                 SET status = 'paused', "updatedAt" = NOW()
                 WHERE "agencyId" = $1 AND status = 'active'`
      } else if (action === 'resume') {
        query = `UPDATE "AIRecruitCampaign"
                 SET status = 'active', "updatedAt" = NOW()
                 WHERE "agencyId" = $1 AND status = 'paused'`
      } else if (action === 'cancel') {
        query = `UPDATE "AIRecruitCampaign"
                 SET status = 'cancelled', "updatedAt" = NOW()
                 WHERE "agencyId" = $1`
      }
    } else {
      return NextResponse.json(
        { error: 'Either campaign_ids or call_type required for this action' },
        { status: 400 }
      )
    }

    const result = await pool.query(query, params)
    const campaigns_affected = result.rowCount || 0

    // If cancel action, also cancel pending retries
    if (action === 'cancel' && call_type) {
      await cancelRetries(agency.id, call_type)
    }

    return NextResponse.json({
      action,
      campaigns_affected,
      message: `${action} completed for ${campaigns_affected} campaign(s)`
    })

  } catch (error) {
    console.error('Bulk campaign API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}