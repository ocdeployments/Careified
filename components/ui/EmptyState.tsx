import { ReactNode } from 'react'

interface EmptyStateProps {
  icon?: ReactNode
  title: string
  description?: string
  action?: ReactNode
  size?: 'sm' | 'md' | 'lg'
}

export function EmptyState({ icon, title, description, action, size = 'md' }: EmptyStateProps) {
  const pad = size === 'sm' ? '32px 24px' : size === 'lg' ? '80px 40px' : '56px 40px'
  const iconSz = size === 'sm' ? '36px' : size === 'lg' ? '56px' : '44px'
  const titleSz = size === 'sm' ? '14px' : size === 'lg' ? '18px' : '15px'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: pad }}>
      {icon && (
        <div style={{
          width: iconSz,
          height: iconSz,
          borderRadius: '12px',
          background: 'rgba(201,151,58,0.08)',
          border: '1px solid rgba(201,151,58,0.15)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '16px',
          color: '#C9973A',
        }}>{icon}</div>
      )}
      <h3 style={{ margin: 0, fontFamily: "'DM Sans', sans-serif", fontSize: titleSz, fontWeight: 600, color: '#0D1B3E', letterSpacing: '-0.01em' }}>
        {title}
      </h3>
      {description && (
        <p style={{ margin: '6px 0 0', fontFamily: "'DM Sans', sans-serif", fontSize: '13px', color: '#64748B', lineHeight: 1.5, maxWidth: '320px' }}>
          {description}
        </p>
      )}
      {action && <div style={{ marginTop: '20px' }}>{action}</div>}
    </div>
  )
}

export default EmptyState