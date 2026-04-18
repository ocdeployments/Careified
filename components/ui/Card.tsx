import { HTMLAttributes, ReactNode } from 'react'

type CardVariant = 'default' | 'flat' | 'gold' | 'navy' | 'ghost'
type CardPadding = 'none' | 'sm' | 'md' | 'lg'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant
  padding?: CardPadding
  hoverable?: boolean
  children: ReactNode
}

const V: Record<CardVariant, React.CSSProperties> = {
  default: { background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '16px', boxShadow: '0 2px 8px rgba(13,27,62,0.06),0 1px 2px rgba(13,27,62,0.04)' },
  flat: { background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '16px', boxShadow: 'none' },
  gold: { background: '#FDF6EC', border: '1px solid rgba(201,151,58,0.25)', borderRadius: '16px', boxShadow: 'none' },
  navy: { background: '#0D1B3E', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', boxShadow: '0 8px 32px rgba(13,27,62,0.20)' },
  ghost: { background: 'transparent', border: '1.5px dashed #E2E8F0', borderRadius: '16px', boxShadow: 'none' },
}

const P: Record<CardPadding, React.CSSProperties> = {
  none: { padding: 0 },
  sm: { padding: '16px' },
  md: { padding: '24px' },
  lg: { padding: '32px' },
}

export function Card({ variant = 'default', padding = 'md', hoverable = false, children, style, onMouseEnter, onMouseLeave, ...props }: CardProps) {
  return (
    <div
      style={{
        ...V[variant],
        ...P[padding],
        transition: 'box-shadow 150ms ease, border-color 150ms ease, transform 150ms ease',
        ...style,
      }}
      onMouseEnter={e => {
        if (hoverable) {
          e.currentTarget.style.boxShadow = '0 4px 16px rgba(13,27,62,0.08)'
          e.currentTarget.style.borderColor = 'rgba(201,151,58,0.30)'
          e.currentTarget.style.transform = 'translateY(-2px)'
        }
        onMouseEnter?.(e)
      }}
      onMouseLeave={e => {
        if (hoverable) {
          e.currentTarget.style.boxShadow = (V[variant].boxShadow as string) || ''
          e.currentTarget.style.borderColor = ''
          e.currentTarget.style.transform = 'translateY(0)'
        }
        onMouseLeave?.(e)
      }}
      {...props}
    >{children}</div>
  )
}

export function CardHeader({ children, style, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div style={{ paddingBottom: '16px', marginBottom: '16px', borderBottom: '1px solid #E2E8F0', ...style }} {...props}>{children}</div>
}

export function CardTitle({ children, style, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return <h3 style={{ margin: 0, fontFamily: "'Inter', sans-serif", fontSize: '15px', fontWeight: 600, color: '#0D1B3E', letterSpacing: '-0.01em', ...style }} {...props}>{children}</h3>
}

export function CardDescription({ children, style, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return <p style={{ margin: '4px 0 0', fontFamily: "'Inter', sans-serif", fontSize: '13px', color: '#64748B', lineHeight: 1.5, ...style }} {...props}>{children}</p>
}

export default Card