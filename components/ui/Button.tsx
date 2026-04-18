'use client'
import { forwardRef, ButtonHTMLAttributes, ReactNode, useState } from 'react'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'
type Size = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  loading?: boolean
  fullWidth?: boolean
  iconLeft?: ReactNode
  iconRight?: ReactNode
  children: ReactNode
}

const V = {
  primary: {
    base: { background: 'linear-gradient(135deg,#C9973A,#E8B86D)', color: '#0D1B3E', border: 'none' },
    hover: { filter: 'brightness(1.06)', transform: 'translateY(-1px)', boxShadow: '0 4px 16px rgba(201,151,58,0.30)' },
    down: { filter: 'brightness(0.96)', transform: 'translateY(0)', boxShadow: 'none' },
  },
  secondary: {
    base: { background: '#FFFFFF', color: '#0D1B3E', border: '1.5px solid #E2E8F0' },
    hover: { borderColor: '#C9973A', background: '#FDF6EC', transform: 'translateY(-1px)' },
    down: { transform: 'translateY(0)', background: '#FDF6EC' },
  },
  ghost: {
    base: { background: 'transparent', color: '#64748B', border: 'none' },
    hover: { background: 'rgba(13,27,62,0.04)', color: '#0D1B3E' },
    down: { background: 'rgba(13,27,62,0.07)' },
  },
  danger: {
    base: { background: 'rgba(220,38,38,0.06)', color: '#DC2626', border: '1.5px solid rgba(220,38,38,0.2)' },
    hover: { background: 'rgba(220,38,38,0.10)', borderColor: 'rgba(220,38,38,0.4)', transform: 'translateY(-1px)' },
    down: { transform: 'translateY(0)' },
  },
} as const

const S = {
  sm: { height: '32px', padding: '0 12px', fontSize: '12px', gap: '5px', icon: '14px' },
  md: { height: '40px', padding: '0 18px', fontSize: '13px', gap: '6px', icon: '15px' },
  lg: { height: '48px', padding: '0 24px', fontSize: '14px', gap: '7px', icon: '16px' },
}

function Spinner({ size }: { size: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none"
    style={{ animation: 'spin 0.7s linear infinite', flexShrink: 0 }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="2" strokeOpacity="0.25"/>
      <path d="M14 8a6 6 0 0 0-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  )
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(({
  variant = 'primary', size = 'md', loading = false, fullWidth = false,
  iconLeft, iconRight, children, disabled, style, ...props
}, ref) => {
  const [hovered, setHovered] = useState(false)
  const [pressed, setPressed] = useState(false)
  const v = V[variant]
  const s = S[size]
  const isDisabled = disabled || loading

  const computedStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: s.gap,
    height: s.height,
    padding: s.padding,
    fontSize: s.fontSize,
    fontFamily: "'DM Sans', sans-serif",
    fontWeight: 600,
    lineHeight: 1,
    borderRadius: '10px',
    cursor: isDisabled ? 'not-allowed' : 'pointer',
    whiteSpace: 'nowrap',
    userSelect: 'none',
    transition: 'all 150ms ease',
    width: fullWidth ? '100%' : undefined,
    opacity: isDisabled ? 0.45 : 1,
    ...v.base,
    ...(hovered && !isDisabled ? v.hover : {}),
    ...(pressed && !isDisabled ? v.down : {}),
    ...style,
  }

  return (
    <button
      ref={ref}
      disabled={isDisabled}
      style={computedStyle}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setPressed(false) }}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      {...props}
    >
      {loading
        ? <Spinner size={s.icon} />
        : iconLeft
        ? <span style={{ display: 'flex', alignItems: 'center', width: s.icon, height: s.icon }}>{iconLeft}</span>
        : null
      }
      <span>{children}</span>
      {!loading && iconRight && (
        <span style={{ display: 'flex', alignItems: 'center', width: s.icon, height: s.icon }}>{iconRight}</span>
      )}
    </button>
  )
})

Button.displayName = 'Button'
export default Button