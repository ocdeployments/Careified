import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { pool } from '@/lib/db'

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const cgRes = await pool.query(
      `SELECT id, first_name, aggregate_score, profile_completion_pct,
              availability_status, is_visible
       FROM caregivers WHERE user_id = $1`,
      [userId]
    )
    if (cgRes.rows.length === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    const cg = cgRes.rows[0]
    const caregiverId = cg.id

    const [activityRes, notifRes] = await Promise.all([
      pool.query(
        `SELECT
           COUNT(*) FILTER (WHERE type = 'profile_viewed' AND created_at > NOW() - INTERVAL '7 days') AS views_7d,
           COUNT(*) FILTER (WHERE type = 'shortlisted' AND created_at > NOW() - INTERVAL '7 days') AS shortlists_7d,
           COUNT(*) FILTER (WHERE type = 'profile_viewed') AS total_views
         FROM notifications WHERE caregiver_id = $1`,
        [caregiverId]
      ),
      pool.query(
        `SELECT id, type, title, message, read_at, created_at
         FROM notifications WHERE caregiver_id = $1
         ORDER BY created_at DESC LIMIT 5`,
        [caregiverId]
      ),
    ])

    const nudges = []
    const pct = cg.profile_completion_pct || 0
    if (pct < 50) nudges.push({ type: 'completion', message: 'Complete Steps 1–3 to go live in search', action_url: '/profile/build', priority: 'high' })
    else if (pct < 68) nudges.push({ type: 'completion', message: 'Add credentials to earn your Verified badge', action_url: '/profile/build', priority: 'medium' })
    else if (pct < 82) nudges.push({ type: 'completion', message: 'Complete compliance and personality steps for Professional tier', action_url: '/profile/build', priority: 'low' })

    const activity = activityRes.rows[0]
    return NextResponse.json({
      caregiver: {
        first_name: cg.first_name,
        aggregate_score: cg.aggregate_score,
        profile_completion_pct: pct,
        availability_status: cg.availability_status,
        is_visible: cg.is_visible ?? true,
      },
      activity: {
        views_7d: parseInt(activity.views_7d) || 0,
        shortlists_7d: parseInt(activity.shortlists_7d) || 0,
        total_views: parseInt(activity.total_views) || 0,
      },
      nudges,
      recent_notifications: notifRes.rows,
    })
  } catch (err) {
    console.error('[caregiver/home]', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
