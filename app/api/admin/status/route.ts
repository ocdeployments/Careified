import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { pool } from '@/lib/db'

export async function GET() {
  const { userId } = await auth()
  if (!userId || userId !== process.env.ADMIN_CLERK_USER_ID) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const [caregivers, agencies, clients, refs, tables] = await Promise.all([
    pool.query("SELECT COUNT(*) FROM caregivers WHERE status = 'approved'"),
    pool.query('SELECT COUNT(*) FROM agencies'),
    pool.query('SELECT COUNT(*) FROM client_needs'),
    pool.query("SELECT COUNT(*) FROM reference_verification_requests WHERE status = 'completed'"),
    pool.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name"),
  ])

  const ENV_KEYS = [
    'DATABASE_URL','NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY','CLERK_SECRET_KEY',
    'NEXT_PUBLIC_LOCALE','OPENROUTER_API_KEY','PHI_ENCRYPTION_KEY',
    'VAPI_API_KEY','VAPI_ASSISTANT_ID','ADMIN_CLERK_USER_ID',
  ]

  return NextResponse.json({
    db: {
      caregivers: parseInt(caregivers.rows[0].count),
      agencies: parseInt(agencies.rows[0].count),
      clients: parseInt(clients.rows[0].count),
      verifiedRefs: parseInt(refs.rows[0].count),
      tables: tables.rows.map((r: any) => r.table_name),
    },
    env: ENV_KEYS.map(key => ({
      key,
      set: !!process.env[key],
      isProd: key === 'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY'
        ? (process.env[key] || '').startsWith('pk_live_') : null,
    })),
    git: {
      commit: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) || 'local',
      message: process.env.VERCEL_GIT_COMMIT_MESSAGE || '',
      branch: process.env.VERCEL_GIT_COMMIT_REF || 'main',
    },
    timestamp: new Date().toISOString(),
  })
}
