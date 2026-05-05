import { pool } from '@/lib/db'

const issues = [
  // CRITICAL
  { severity: 'critical', category: 'security', description: 'middleware.ts missing — all routes unprotected', page_affected: 'all' },
  { severity: 'critical', category: 'security', description: '/admin/* has no auth enforcement — data exposed', page_affected: '/admin/*' },
  // HIGH
  { severity: 'high', category: 'security', description: '/agency/billing unprotected', page_affected: '/agency/billing' },
  { severity: 'high', category: 'security', description: '/agency/clients unprotected', page_affected: '/agency/clients' },
  { severity: 'high', category: 'security', description: '/agency/settings unprotected', page_affected: '/agency/settings' },
  { severity: 'high', category: 'security', description: '/agency/shortlist unprotected', page_affected: '/agency/shortlist' },
  { severity: 'high', category: 'security', description: '/agency/airecruit/new unprotected', page_affected: '/agency/airecruit/new' },
  { severity: 'high', category: 'security', description: 'Vapi webhook has no HMAC signature verification', page_affected: '/api/airecruit/webhook' },
  { severity: 'high', category: 'security', description: 'Reference tokens not UUID — predictable tokens', page_affected: '/api/references/invite' },
  { severity: 'high', category: 'security', description: 'No rate limiting on any API route', page_affected: 'all APIs' },
  { severity: 'high', category: 'security', description: 'SQL injection risk in lib/db.ts lines 56-68', page_affected: 'lib/db.ts' },
  { severity: 'high', category: 'security', description: 'dangerouslySetInnerHTML in admin/caregivers line 217', page_affected: '/admin/caregivers' },
  // MEDIUM
  { severity: 'medium', category: 'security', description: 'SSL cert: rejectUnauthorized: false on Render DB', page_affected: 'lib/db.ts' },
  { severity: 'medium', category: 'flow', description: 'NEXT_PUBLIC_LOCALE missing from Vercel env vars', page_affected: 'all' },
  // WARNINGS
  { severity: 'warning', category: 'flow', description: '/profile/build defaults to step=1 not step=0 on first visit', page_affected: '/profile/build' },
  { severity: 'warning', category: 'flow', description: 'Claim Your Profile CTA does not route through sign-up', page_affected: '/for-caregivers' },
  { severity: 'warning', category: 'env', description: 'NEXT_PUBLIC_CLARITY_ID not confirmed in Vercel', page_affected: 'layout.tsx' },
  { severity: 'warning', category: 'env', description: 'NEXT_PUBLIC_YBUG_ID not confirmed in Vercel', page_affected: 'layout.tsx' },
  { severity: 'warning', category: 'component', description: 'components/id/QRCodeDisplay.tsx import count unverified', page_affected: '/id/[caregiverId]' },
  // PASSING
  { severity: 'passing', category: 'typescript', description: 'TypeScript — 0 errors', page_affected: 'all' },
  { severity: 'passing', category: 'pages', description: '53 pages found — all reachable', page_affected: 'all' },
  { severity: 'passing', category: 'nav', description: 'Navbar caregiver dropdown updated', page_affected: '/navbar' },
  { severity: 'passing', category: 'nav', description: 'Navbar agency dropdown updated', page_affected: '/navbar' },
  { severity: 'passing', category: 'page', description: 'for-caregivers page copy and cards correct', page_affected: '/for-caregivers' },
  { severity: 'passing', category: 'page', description: 'Clarity + Ybug scripts added to layout', page_affected: 'layout.tsx' },
]

async function seedQAReport() {
  // Count by severity
  const counts = { passing: 0, failing: 0, warnings: 0 }
  issues.forEach(i => {
    if (i.severity === 'passing') counts.passing++
    else if (i.severity === 'critical' || i.severity === 'high' || i.severity === 'medium') counts.failing++
    else if (i.severity === 'warning') counts.warnings++
  })

  console.log('Seeding QA report with:', { counts })

  // Insert report
  const reportRes = await pool.query(`
    INSERT INTO qa_reports (audit_by, commit_hash, total_passing, total_failing, total_warnings, report_json)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING id
  `, ['claude', 'initial-seed', counts.passing, counts.failing, counts.warnings, JSON.stringify(issues)])

  const reportId = reportRes.rows[0].id
  console.log('Created report ID:', reportId)

  // Insert all issues
  for (const issue of issues) {
    await pool.query(`
      INSERT INTO qa_issues (report_id, severity, category, description, page_affected)
      VALUES ($1, $2, $3, $4, $5)
    `, [reportId, issue.severity, issue.category, issue.description, issue.page_affected])
  }

  console.log('✅ Seeded', issues.length, 'issues')

  // Verify
  const verify = await pool.query('SELECT COUNT(*) FROM qa_issues WHERE report_id = $1', [reportId])
  console.log('Verified issues in DB:', verify.rows[0].count)

  await pool.end()
}

seedQAReport().catch(err => {
  console.error('Error:', err.message)
  process.exit(1)
})