// Badge display component for Careified rating system

interface Badge {
  id: string
  badge_name: string
  trigger_condition: string
  status: 'earned' | 'locked'
  earned_at?: string
}

interface BadgeDisplayProps {
  badges: Badge[]
}

const BADGE_INFO: Record<string, { icon: string; description: string }> = {
  'Consistently Reliable': {
    icon: '🏅',
    description: '5x would re-engage across 3+ agencies',
  },
  'Exceptionally Caring': {
    icon: '💝',
    description: 'Top dignity + warmth scores from families',
  },
  'Above and Beyond': {
    icon: '⭐',
    description: '3+ agencies noted initiative',
  },
  'Dementia Specialist': {
    icon: '🧠',
    description: 'Specialty confirmed by 2+ agencies',
  },
  'Family Favourite': {
    icon: '👨‍👩‍👧',
    description: 'Top scores from family feedback',
  },
  'Trusted Veteran': {
    icon: '🎖️',
    description: '3+ years on platform, consistently high',
  },
  'Culturally Aware': {
    icon: '🌍',
    description: 'Cultural sensitivity noted by multiple sources',
  },
  'Quick Response': {
    icon: '⚡',
    description: 'Consistently high availability update rate',
  },
  'Highly Communicative': {
    icon: '💬',
    description: 'Top communication scores across agency + family',
  },
  'Self-Aware': {
    icon: '🔍',
    description: 'Personality self-assessment consistently validated',
  },
  'Humble Professional': {
    icon: '🌱',
    description: 'Consistently undersells — agencies always rate higher',
  },
}

const ALL_BADGES = [
  'Consently Reliable',
  'Exceptionally Caring',
  'Above and Beyond',
  'Dementia Specialist',
  'Family Favourite',
  'Trusted Veteran',
  'Culturally Aware',
  'Quick Response',
  'Highly Communicative',
  'Self-Aware',
  'Humble Professional',
]

export default function BadgeDisplay({ badges }: BadgeDisplayProps) {
  const earnedSet = new Set(badges.filter(b => b.status === 'earned').map(b => b.badge_name))

  // Show all badges (earned + aspirational)
  const displayBadges = ALL_BADGES.map(name => ({
    name,
    info: BADGE_INFO[name] || { icon: '🏅', description: '' },
    isEarned: earnedSet.has(name),
    earnedBadge: badges.find(b => b.badge_name === name && b.status === 'earned'),
  }))

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
      {displayBadges.map(({ name, info, isEarned, earnedBadge }) => (
        <div
          key={name}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 14px',
            borderRadius: '8px',
            border: '2px solid',
            borderColor: isEarned ? '#C9973A' : '#E5E7EB',
            background: isEarned ? 'linear-gradient(135deg, #0D1B3E, #1E3A8A)' : '#F9FAFB',
            color: isEarned ? 'white' : '#9CA3AF',
            cursor: 'default',
            transition: 'all 0.2s',
            position: 'relative',
          }}
          title={info.description}
        >
          <span style={{ fontSize: '18px', filter: isEarned ? 'none' : 'grayscale(100%)', opacity: isEarned ? 1 : 0.5 }}>
            {info.icon}
          </span>
          <span style={{ fontSize: '14px', fontWeight: '600' }}>
            {name}
          </span>
          {!isEarned && (
            <span style={{
              position: 'absolute',
              top: '-8px',
              right: '-8px',
              fontSize: '10px',
              background: '#E5E7EB',
              color: '#666',
              padding: '2px 6px',
              borderRadius: '4px',
            }}>
              Locked
            </span>
          )}
          {isEarned && earnedBadge?.earned_at && (
            <span style={{
              position: 'absolute',
              bottom: '-20px',
              left: '50%',
              transform: 'translateX(-50%)',
              fontSize: '10px',
              color: '#666',
              whiteSpace: 'nowrap',
            }}>
              {new Date(earnedBadge.earned_at).toLocaleDateString()}
            </span>
          )}
        </div>
      ))}
    </div>
  )
}