// Careified — POST Trigger Profile Nudges
// Admin-only: nudge all incomplete caregivers or specific one

import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { nudgeAllIncompleteCaregivers, sendProfileNudge } from '@/lib/notifications/nudge'

export const dynamic = 'force-dynamic'

async function checkIsAdmin(): Promise<boolean> {
  try {
    const { userId } = await auth()
    if (!userId) return false

    const adminId = process.env.ADMIN_CLERK_USER_ID
    return userId === adminId
  } catch {
    return false
  }
}

export async function POST(req: NextRequest) {
  const isAdmin = await checkIsAdmin()
  if (!isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { caregiver_id: caregiverId } = body

    if (caregiverId) {
      // Nudge specific caregiver
      await sendProfileNudge(caregiverId)
      return NextResponse.json({ nudged: 1, skipped: 0 })
    } else {
      // Nudge all incomplete caregivers
      const result = await nudgeAllIncompleteCaregivers()
      return NextResponse.json(result)
    }
  } catch (error) {
    console.error('Nudge API error:', error)
    return NextResponse.json({ error: 'Nudge failed' }, { status: 500 })
  }
}