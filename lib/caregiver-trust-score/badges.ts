// Careified — Badge Engine
// Computes earned badges from placement reviews

export interface PlacementReview {
  id: string
  agency_id: string
  caregiver_id: string
  client_id: string
  engagement_start: Date | string | null
  engagement_end: Date | string | null
  would_re_engage: boolean | null

  // Category 2: Human Qualities
  warmth: number | null
  dignity: number | null

  // Category 3: Hygiene
  client_hygiene: number | null
  emotional_presence: number | null

  // Category 4: Skills
  specialty_match: number | null

  // Category 5: Communication
  cultural_sensitivity: number | null

  // Category 6: Beyond the Call
  initiative: boolean | null

  // Meta
  status: string
  created_at: Date | string
}

export interface Badge {
  id: string
  label: string
  description: string
  earned_at: string
}

const BADGE_DEFINITIONS = {
  consistently_reliable: {
    label: 'Consistently Reliable',
    description: 'Would be re-hired by 5+ agencies across multiple placements',
  },
  exceptionally_caring: {
    label: 'Exceptionally Caring',
    description: 'Rated 4.5+ average on dignity and warmth across 3+ reviews',
  },
  above_and_beyond: {
    label: 'Above and Beyond',
    description: 'Demonstrated initiative in 3+ placements',
  },
  dementia_specialist: {
    label: 'Dementia Specialist',
    description: 'Received 4+ specialty match ratings in 2+ dementia-related placements',
  },
  family_favourite: {
    label: 'Family Favourite',
    description: 'Rated 4.5+ average on emotional presence and client hygiene',
  },
  trusted_veteran: {
    label: 'Trusted Veteran',
    description: '3+ years experience with 4.0+ average trust score',
  },
  culturally_aware: {
    label: 'Culturally Aware',
    description: 'Rated 4+ on cultural sensitivity across 3+ reviews',
  },
  self_aware: {
    label: 'Self-Aware',
    description: 'Personality honesty score verified honest across 3+ agencies',
  },
  humble_professional: {
    label: 'Humble Professional',
    description: 'Demonstrated honesty and self-reflection in personality assessment',
  },
} as const

export function computeBadges(
  reviews: PlacementReview[],
  caregiverSpecializations: string[] = [],
  caregiverTenureYears: number = 0,
  aggregateScore: number = 0,
  personalityHonestyScore: { status?: string; badge_earned?: string } = {}
): Badge[] {
  const badges: Badge[] = []
  const now = new Date().toISOString()

  if (reviews.length === 0) return badges

  // "Consistently Reliable" — would_re_engage=true on 5+ reviews across 3+ agencies
  const reliableReviews = reviews.filter(r => r.would_re_engage === true)
  const reliableAgencies = new Set(
    reliableReviews.map(r => r.agency_id)
  )
  if (reliableReviews.length >= 5 && reliableAgencies.size >= 3) {
    badges.push({
      id: 'consistently_reliable',
      label: BADGE_DEFINITIONS.consistently_reliable.label,
      description: BADGE_DEFINITIONS.consistently_reliable.description,
      earned_at: now,
    })
  }

  // "Exceptionally Caring" — avg(dignity + warmth) >= 4.5 across 3+ reviews
  const caringReviews = reviews.filter(r => r.dignity && r.warmth)
  if (caringReviews.length >= 3) {
    const avgCaring = caringReviews.reduce((sum, r) => {
      return sum + ((r.dignity || 0) + (r.warmth || 0)) / 2
    }, 0) / caringReviews.length
    if (avgCaring >= 4.5) {
      badges.push({
        id: 'exceptionally_caring',
        label: BADGE_DEFINITIONS.exceptionally_caring.label,
        description: BADGE_DEFINITIONS.exceptionally_caring.description,
        earned_at: now,
      })
    }
  }

  // "Above and Beyond" — initiative=true on 3+ reviews
  const initiativeCount = reviews.filter(r => r.initiative === true).length
  if (initiativeCount >= 3) {
    badges.push({
      id: 'above_and_beyond',
      label: BADGE_DEFINITIONS.above_and_beyond.label,
      description: BADGE_DEFINITIONS.above_and_beyond.description,
      earned_at: now,
    })
  }

  // "Dementia Specialist" — specialty_match >= 4 on 2+ reviews + check caregiver specializations
  const dementiaKeywords = ['dementia', 'alzheimer', 'memory care', 'cognitive']
  const hasDementiaSpecialty = caregiverSpecializations.some(s =>
    dementiaKeywords.some(k => s.toLowerCase().includes(k))
  )
  if (hasDementiaSpecialty) {
    const dementiaReviews = reviews.filter(r => r.specialty_match && r.specialty_match >= 4)
    if (dementiaReviews.length >= 2) {
      badges.push({
        id: 'dementia_specialist',
        label: BADGE_DEFINITIONS.dementia_specialist.label,
        description: BADGE_DEFINITIONS.dementia_specialist.description,
        earned_at: now,
      })
    }
  }

  // "Family Favourite" — avg(emotional_presence + client_hygiene) >= 4.5 from 3+ reviews
  const familyReviews = reviews.filter(r => r.emotional_presence && r.client_hygiene)
  if (familyReviews.length >= 3) {
    const avgFamily = familyReviews.reduce((sum, r) => {
      return sum + ((r.emotional_presence || 0) + (r.client_hygiene || 0)) / 2
    }, 0) / familyReviews.length
    if (avgFamily >= 4.5) {
      badges.push({
        id: 'family_favourite',
        label: BADGE_DEFINITIONS.family_favourite.label,
        description: BADGE_DEFINITIONS.family_favourite.description,
        earned_at: now,
      })
    }
  }

  // "Trusted Veteran" — tenure >= 3 years + avg aggregate_score >= 4.0
  if (caregiverTenureYears >= 3 && aggregateScore >= 4.0) {
    badges.push({
      id: 'trusted_veteran',
      label: BADGE_DEFINITIONS.trusted_veteran.label,
      description: BADGE_DEFINITIONS.trusted_veteran.description,
      earned_at: now,
    })
  }

  // "Culturally Aware" — cultural_sensitivity >= 4 noted on 3+ reviews
  const culturalReviews = reviews.filter(r => r.cultural_sensitivity && r.cultural_sensitivity >= 4)
  if (culturalReviews.length >= 3) {
    badges.push({
      id: 'culturally_aware',
      label: BADGE_DEFINITIONS.culturally_aware.label,
      description: BADGE_DEFINITIONS.culturally_aware.description,
      earned_at: now,
    })
  }

  // "Self-Aware" — personality honesty_score.status = 'honest' + agency_count >= 3
  if (personalityHonestyScore.status === 'honest') {
    const agencyCount = new Set(reviews.map(r => r.agency_id)).size
    if (agencyCount >= 3) {
      badges.push({
        id: 'self_aware',
        label: BADGE_DEFINITIONS.self_aware.label,
        description: BADGE_DEFINITIONS.self_aware.description,
        earned_at: now,
      })
    }
  }

  // "Humble Professional" — honesty_score.badge_earned = 'humble_professional'
  if (personalityHonestyScore.badge_earned === 'humble_professional') {
    badges.push({
      id: 'humble_professional',
      label: BADGE_DEFINITIONS.humble_professional.label,
      description: BADGE_DEFINITIONS.humble_professional.description,
      earned_at: now,
    })
  }

  return badges
}