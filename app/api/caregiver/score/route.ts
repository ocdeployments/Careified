// Careified — GET Caregiver Trust Score API

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { getCaregiverScore, calculateCaregiverScore, saveScoreSnapshot } from '@/lib/caregiver-trust-score/calculate'

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const caregiverId = searchParams.get('caregiverId')

    if (!caregiverId) {
      return NextResponse.json({ error: 'caregiverId required' }, { status: 400 })
    }

    // Check access: either agency or the caregiver themselves
    // For now, allow any authenticated user to fetch scores (will refine with roles)

    const score = await getCaregiverScore(caregiverId)

    if (!score) {
      return NextResponse.json({
        eligibleForDisplay: false,
        message: 'No score events recorded yet',
        totalScore: null,
        tier: null,
      })
    }

    // If score eligible but no snapshot, calculate and save
    if (score.eligibleForDisplay && score.totalScore !== null) {
      await saveScoreSnapshot(score)
    }

    return NextResponse.json(score)
  } catch (error) {
    console.error('GET score error:', error)
    return NextResponse.json({ error: 'Failed to fetch score' }, { status: 500 })
  }
}