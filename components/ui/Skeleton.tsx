import { HTMLAttributes } from 'react'

interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  width?: string | number
  height?: string | number
  circle?: boolean
}

export function Skeleton({ width, height = '16px', circle = false, style, ...props }: SkeletonProps) {
  return (
    <div style={{
      width: width || '100%',
      height,
      borderRadius: circle ? '50%' : '8px',
      background: 'linear-gradient(90deg,#F1F5F9 25%,#E8EDF4 50%,#F1F5F9 75%)',
      backgroundSize: '800px 100%',
      animation: 'shimmer 1.4s ease-in-out infinite',
      flexShrink: 0,
      ...style,
    }} {...props} />
  )
}

export function SkeletonCard() {
  return (
    <div style={{ background: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '20px 24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
      <Skeleton width={52} height={52} circle />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <Skeleton width="60%" height="15px" />
        <Skeleton width="40%" height="12px" />
      </div>
      <Skeleton width={80} height={32} style={{ borderRadius: '8px' }} />
    </div>
  )
}

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div style={{ background: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', overflow: 'hidden' }}>
      <div style={{ padding: '12px 24px', borderBottom: '1px solid #F1F5F9', display: 'flex', gap: '16px' }}>
        <Skeleton width="20%" height="12px" />
        <Skeleton width="15%" height="12px" />
        <Skeleton width="25%" height="12px" />
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} style={{ padding: '16px 24px', borderBottom: i < rows - 1 ? '1px solid #F8FAFC' : 'none', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Skeleton width={36} height={36} circle />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <Skeleton width="45%" height="13px" />
            <Skeleton width="30%" height="11px" />
          </div>
          <Skeleton width={60} height="20px" style={{ borderRadius: '9999px' }} />
          <Skeleton width={80} height="32px" style={{ borderRadius: '8px' }} />
        </div>
      ))}
    </div>
  )
}

export function SkeletonText({ lines = 3 }: { lines?: number }) {
  const widths = ['100%', '85%', '70%', '90%', '60%']
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} width={widths[i % widths.length]} height="14px" />
      ))}
    </div>
  )
}

export default Skeleton