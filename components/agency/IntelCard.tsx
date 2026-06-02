'use client'

import Link from 'next/link'

interface IntelCardProps {
  value: string | number
  label: string
  trend?: string
  trendColor?: string
  href: string
  color?: string
}

export default function IntelCard({ value, label, trend, trendColor = '#F8FAFC', href, color = '#F8FAFC' }: IntelCardProps) {
  return (
    <Link href={href} style={{
      display: 'block',
      background: 'rgba(255,255,255,0.02)',
      border: '0.5px solid rgba(255,255,255,0.07)',
      borderRadius: 10,
      padding: '12px 14px',
      textDecoration: 'none',
      transition: 'border-color 150ms ease',
    }}
    className="hover-card"
    >
      <div style={{ fontSize: 22, fontWeight: 500, color: color }}>{value}</div>
      <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.55)', marginTop: 2 }}>{label}</div>
      {trend && (
        <div style={{ fontSize: 10, color: trendColor, marginTop: 4 }}>{trend}</div>
      )}
      <style>{`
        .hover-card:hover { border-color: rgba(255,255,255,0.15) !important; cursor: pointer; }
      `}</style>
    </Link>
  )
}