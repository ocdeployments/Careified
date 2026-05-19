import { NextRequest, NextResponse } from 'next/server'
import { auth, clerkClient } from '@clerk/nextjs/server'
import { Pool } from 'pg'

const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false },
  max: 3,
  idleTimeoutMillis: 10000,
  connectionTimeoutMillis: 10000,
  allowExitOnIdle: true })

// Auth check - admin only
async function checkAdmin(): Promise<{ adminUserId: string } | null> {
  let userId: string | null | undefined
  try {
    const authResult = await auth()
    userId = authResult.userId
  } catch {
    return null
  }

  if (!userId) return null

  try {
    const client = await clerkClient()
    const user = await client.users.getUser(userId)
    const role = user.publicMetadata?.role as string

    if (role !== 'admin') return null

    return { adminUserId: userId }
  } catch {
    return null
  }
}

interface BadgeDefinition {
  name: string
  trigger_condition: string
}

const BADGE_DEFINITIONS: BadgeDefinition[] = [
  { name: 'Consistently Reliable', trigger_condition: '5x would re-engage across 3+ agencies' },
  { name: 'Exceptionally Caring', trigger_condition: 'Top dignity + warmth scores from families' },
  { name: 'Above and Beyond', trigger_condition: '3+ agencies noted initiative' },
  { name: 'Dementia Specialist', trigger_condition: 'Specialty confirmed by 2+ agencies' },
  { name: 'Family Favourite', trigger_condition: 'Top scores from family feedback' },
  { name: 'Trusted Veteran', trigger_condition: '3+ years on platform, consistently high' },
  { name: 'Culturally Aware', trigger_condition: 'Cultural sensitivity noted by multiple sources' },
  { name: 'Quick Response', trigger_condition: 'Consistently high availability update rate' },
  { name: 'Highly Communicative', trigger_condition: 'Top communication scores across agency + family' },
  { name: 'Self-Aware', trigger_condition: 'Personality self-assessment consistently validated' },
  { name: 'Humble Professional', trigger_condition: 'Consistently undersells — agencies always rate higher' },
]

export async function POST(request: NextRequest) {
  try {
    const admin = await checkAdmin()
    if (!admin) {
      return NextResponse.json(
        { error: 'unauthorized', message: 'Admin access required' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { caregiver_id } = body

    if (!caregiver_id) {
      return NextResponse.json(
        { error: 'validation_error', message: 'caregiver_id required' },
        { status: 400 }
      )
    }

    // Get all reviews for this caregiver
    const reviewsResult = await pool.query(
      `SELECT * FROM placement_reviews
       WHERE caregiver_id = $1 AND status = 'approved'`,
      [caregiver_id]
    )

    const reviews = reviewsResult.rows

    // Calculate badge triggers
    const wouldReengageCount = reviews.filter(r => r.would_reengage === true).length
    const agencyCount = new Set(reviews.map(r => r.agency_id)).size
    const initiativeCount = reviews.filter(r => r.initiative === true).length
    const humanQualitiesAvg = getAverageScore(reviews, 'human_qualities_score')
    const communicationAvg = getAverageScore(reviews, 'communication_conduct_score')

    const earnedBadges: string[] = []

    // Check each badge condition
    if (wouldReengageCount >= 5 && agencyCount >= 3) {
      earnedBadges.push('Consistently Reliable')
    }
    if (humanQualitiesAvg >= 4.5 && agencyCount >= 2) {
      earnedBadges.push('Exceptionally Caring')
    }
    if (initiativeCount >= 3) {
      earnedBadges.push('Above and Beyond')
    }
    if (agencyCount >= 2 && reviews.some(r => r.specialty_match >= 4)) {
      earnedBadges.push('Dementia Specialist')
    }
    // Add more badge logic as needed

    // Insert earned badges
    for (const badgeName of earnedBadges) {
      // Check if badge already exists
      const existingBadge = await pool.query(
        `SELECT id FROM caregiver_badges
         WHERE caregiver_id = $1 AND badge_name = $2 AND status = 'earned'`,
        [caregiver_id, badgeName]
      )

      if (existingBadge.rows.length === 0) {
        await pool.query(
          `INSERT INTO caregiver_badges (caregiver_id, badge_name, trigger_condition, status, earned_at)
           VALUES ($1, $2, $3, 'earned', NOW())`,
          [
            caregiver_id,
            badgeName,
            BADGE_DEFINITIONS.find(b => b.name === badgeName)?.trigger_condition || '',
          ]
        )
      }
    }

    return NextResponse.json({
      success: true,
      caregiver_id,
      badges_earned: earnedBadges,
    })
  } catch (err) {
    console.error('Error in POST /api/reviews/badges:', err)
    return NextResponse.json(
      { error: 'internal_error', message: 'Failed to evaluate badges' },
      { status: 500 }
    )
  } finally {
    pool.end()
  }
}

function getAverageScore(reviews: any[], field: string): number {
  const scores = reviews.map(r => r[field]).filter(s => s !== null)
  if (scores.length === 0) return 0
  return scores.reduce((a, b) => a + b, 0) / scores.length
}