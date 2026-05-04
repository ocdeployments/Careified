import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { pool } from '@/lib/db'

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const r = await pool.query(
    `SELECT * FROM agencies WHERE clerk_user_id = $1`,
    [userId]
  )
  if (!r.rows.length) return NextResponse.json({ error: 'no_agency' }, { status: 404 })
  const a = r.rows[0]

  const sections = [
    {
      id: 'identity',
      label: 'Identity',
      href: '/agency/settings#identity',
      fields: [
        { label: 'Agency name', done: !!a.name },
        { label: 'Display name', done: !!a.display_name },
        { label: 'Tagline', done: !!a.tagline },
        { label: 'Brand colour', done: !!a.brand_color && a.brand_color !== '#0D1B3E' },
        { label: 'Website', done: !!a.website_url },
      ]
    },
    {
      id: 'operations',
      label: 'Operations',
      href: '/agency/settings#operations',
      fields: [
        { label: 'Service areas', done: (a.service_areas || []).length > 0 },
        { label: 'Care types', done: (a.care_types || []).length > 0 },
        { label: 'Province', done: !!a.state },
        { label: 'City', done: !!a.city },
      ]
    },
    {
      id: 'team',
      label: 'Team',
      href: '/agency/settings#team',
      fields: [
        { label: 'Coordinator count', done: !!a.coordinator_count },
        { label: 'Current tools', done: (a.current_tools || []).length > 0 },
      ]
    },
    {
      id: 'compliance',
      label: 'Compliance',
      href: '/agency/settings#compliance',
      fields: [
        { label: 'Business registration', done: !!a.business_registration },
        { label: 'Insurance carrier', done: !!a.insurance_carrier },
        { label: 'Insurance policy', done: !!a.insurance_policy },
        { label: 'Background check provider', done: !!a.background_check_provider },
      ]
    },
  ]

  const totalFields = sections.reduce((a, s) => a + s.fields.length, 0)
  const doneFields = sections.reduce((a, s) => a + s.fields.filter(f => f.done).length, 0)
  const pct = Math.round((doneFields / totalFields) * 100)

  const incomplete = sections
    .map(s => ({
      ...s,
      doneCount: s.fields.filter(f => f.done).length,
      totalCount: s.fields.length,
      missingFields: s.fields.filter(f => !f.done).map(f => f.label),
    }))
    .filter(s => s.doneCount < s.totalCount)

  return NextResponse.json({
    pct,
    doneFields,
    totalFields,
    sections: sections.map(s => ({
      ...s,
      doneCount: s.fields.filter(f => f.done).length,
      totalCount: s.fields.length,
    })),
    incomplete,
    modules: a.modules_enabled || ['core'],
    plan_tier: a.plan_tier || 'starter',
    subscription_status: a.subscription_status || 'trial',
    trial_ends_at: a.trial_ends_at,
  })
}
