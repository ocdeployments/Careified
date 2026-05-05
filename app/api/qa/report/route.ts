import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/db'

export const dynamic = 'force-dynamic'

// GET /api/qa/report — returns most recent report with issues + history
export async function GET() {
  try {
    // Get most recent report
    const reportRes = await pool.query(`
      SELECT id, audit_date, audit_by, total_passing, total_failing, total_warnings, commit_hash, report_json
      FROM qa_reports
      ORDER BY id DESC
      LIMIT 1
    `)

    const report = reportRes.rows[0]

    if (!report) {
      return NextResponse.json({ message: 'No reports yet' }, { status: 404 })
    }

    // Get issues for this report
    const issuesRes = await pool.query(`
      SELECT id, severity, category, description, page_affected, status, fixed_in_commit, fixed_at, fixed_by
      FROM qa_issues
      WHERE report_id = $1
      ORDER BY
        CASE severity
          WHEN 'critical' THEN 1
          WHEN 'high' THEN 2
          WHEN 'medium' THEN 3
          WHEN 'warning' THEN 4
          WHEN 'passing' THEN 5
        END
    `, [report.id])

    // Get history (last 10 reports)
    const historyRes = await pool.query(`
      SELECT id, audit_date, audit_by, total_passing, total_failing, total_warnings, commit_hash
      FROM qa_reports
      ORDER BY id DESC
      LIMIT 10
    `)

    // Calculate deltas
    const history = historyRes.rows.map((r, i) => {
      const prev = historyRes.rows[i + 1]
      return {
        ...r,
        delta_passing: prev ? r.total_passing - prev.total_passing : 0,
        delta_failing: prev ? r.total_failing - prev.total_failing : 0,
        delta_warnings: prev ? r.total_warnings - prev.total_warnings : 0,
      }
    })

    return NextResponse.json({
      report: {
        ...report,
        issues: issuesRes.rows,
      },
      history,
    })
  } catch (err: any) {
    console.error('QA GET error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// POST /api/qa/report — create new report with issues
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { audit_by, commit_hash, issues } = body

    // Count by severity
    const counts = { passing: 0, failing: 0, warnings: 0 }
    issues.forEach((i: any) => {
      if (i.severity === 'passing') counts.passing++
      else if (i.severity === 'critical' || i.severity === 'high' || i.severity === 'medium') counts.failing++
      else if (i.severity === 'warning') counts.warnings++
    })

    // Insert report
    const reportRes = await pool.query(`
      INSERT INTO qa_reports (audit_by, commit_hash, total_passing, total_failing, total_warnings, report_json)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id
    `, [audit_by || 'claude', commit_hash || null, counts.passing, counts.failing, counts.warnings, JSON.stringify(issues)])

    const reportId = reportRes.rows[0].id

    // Insert all issues
    for (const issue of issues) {
      await pool.query(`
        INSERT INTO qa_issues (report_id, severity, category, description, page_affected)
        VALUES ($1, $2, $3, $4, $5)
      `, [reportId, issue.severity, issue.category, issue.description, issue.page_affected])
    }

    return NextResponse.json({
      report_id: reportId,
      total_passing: counts.passing,
      total_failing: counts.failing,
      total_warnings: counts.warnings,
    })
  } catch (err: any) {
    console.error('QA POST error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// PATCH /api/qa/report — mark issue as fixed
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json()
    const { issue_id, status, fixed_in_commit } = body

    if (!issue_id || !status) {
      return NextResponse.json({ error: 'Missing issue_id or status' }, { status: 400 })
    }

    await pool.query(`
      UPDATE qa_issues
      SET status = $1, fixed_in_commit = $2, fixed_at = NOW(), fixed_by = 'manual'
      WHERE id = $3
    `, [status, fixed_in_commit || null, issue_id])

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('QA PATCH error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}