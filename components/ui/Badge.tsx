import { HTMLAttributes, ReactNode } from 'react'

type BadgeVariant = 'gold' | 'success' | 'warning' | 'danger' | 'neutral' | 'navy' | 'info'
type BadgeSize = 'sm' | 'md'

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant
  size?: BadgeSize
  dot?: boolean
  children: ReactNode
}

const V: Record<BadgeVariant, React.CSSProperties> = {
  gold: { background: 'rgba(201,151,58,0.10)', color: '#92400E', border: '1px solid rgba(201,151,58,0.25)' },
  success: { background: 'rgba(22,163,74,0.08)', color: '#15803D', border: '1px solid rgba(22,163,74,0.20)' },
  warning: { background: 'rgba(217,119,6,0.08)', color: '#B45309', border: '1px solid rgba(217,119,6,0.20)' },
  danger: { background: 'rgba(220,38,38,0.08)', color: '#DC2626', border: '1px solid rgba(220,38,38,0.20)' },
  neutral: { background: '#F1F5F9', color: '#64748B', border: '1px solid #E2E8F0' },
  navy: { background: 'rgba(13,27,62,0.06)', color: '#0D1B3E', border: '1px solid rgba(13,27,62,0.12)' },
  info: { background: 'rgba(37,99,235,0.08)', color: '#1D4ED8', border: '1px solid rgba(37,99,235,0.20)' },
}

const S: Record<BadgeSize, React.CSSProperties> = {
  sm: { fontSize: '10px', padding: '2px 8px', gap: '4px' },
  md: { fontSize: '11px', padding: '3px 10px', gap: '5px' },
}

export function Badge({ variant = 'neutral', size = 'md', dot = false, children, style, ...props }: BadgeProps) {
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      borderRadius: '9999px',
      fontFamily: "'DM Sans', sans-serif",
      fontWeight: 600,
      lineHeight: 1,
      whiteSpace: 'nowrap',
      ...V[variant],
      ...S[size],
      ...style,
    }} {...props}>
      {dot && <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: 'currentColor', flexShrink: 0 }} />}
      {children}
    </span>
  )
}

export default Badge