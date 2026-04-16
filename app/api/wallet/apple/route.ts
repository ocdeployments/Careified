import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { Pool } from 'pg'
import { generateAppleWalletPass } from '@/lib/wallet/apple-wallet'

const pool = new Pool({ connectionString: process.env.DATABASE_URL })

export async function GET(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const caregiverId = req.nextUrl.searchParams.get('caregiverId')
  if (!caregiverId) {
    return NextResponse.json({ error: 'caregiverId required' }, { status: 400 })
  }

  const { rows } = await pool.query(`
    SELECT first_name, last_name, job_title,
    aggregate_score, city, state, country,
    caregiver_code, verify_slug, photo_url
    FROM caregivers WHERE id = $1
  `, [caregiverId])

  if (!rows[0]) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const c = rows[0]
  const result = await generateAppleWalletPass({
    caregiverCode: c.caregiver_code,
    firstName: c.first_name,
    lastName: c.last_name,
    jobTitle: c.job_title,
    aggregateScore: c.aggregate_score,
    city: c.city,
    state: c.state,
    country: c.country || 'US',
    verifySlug: c.verify_slug,
    photoUrl: c.photo_url,
  })

  if (!result.success) {
    return NextResponse.json({
      error: result.error,
      status: 'not_configured',
      message: 'Apple Wallet integration coming soon',
    }, { status: 503 })
  }

  // When certificate is ready, this returns the .pkpass file:
  return new NextResponse('Apple Wallet pass not yet configured', {
    headers: {
      'Content-Type': 'text/plain',
    },
  })
}