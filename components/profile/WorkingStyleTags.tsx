'use client'

interface WorkingStyleTagsProps {
  tags: string[]
}

const COLORS = {
  navy: '#0D1B3E',
  gold: '#C9973A',
  goldTint: '#FDF6EC',
}

export default function WorkingStyleTags({ tags }: WorkingStyleTagsProps) {
  if (!tags || tags.length === 0) {
    return null
  }

  return (
    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
      {tags.map(tag => (
        <span
          key={tag}
          style={{
            background: COLORS.goldTint,
            border: `1px solid ${COLORS.gold}`,
            borderRadius: '999px',
            padding: '4px 14px',
            fontSize: '12px',
            fontWeight: 500,
            color: COLORS.navy,
          }}
        >
          {tag}
        </span>
      ))}
    </div>
  )
}