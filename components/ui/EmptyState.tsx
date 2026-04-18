'use client'
import { ReactNode } from 'react'
import Link from 'next/link'

interface EmptyStateProps {
 icon: ReactNode
 title: string
 description?: string
 cta?: { label: string; href?: string; onClick?: () => void }
 ctaSecondary?: { label: string; href?: string; onClick?: () => void }
}

export function EmptyState({ icon, title, description, cta, ctaSecondary }: EmptyStateProps) {
 return (
 <div style={{ background: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '80px 40px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
 <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: 'rgba(201,151,58,0.08)', border: '1px solid rgba(201,151,58,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px', color: '#C9973A' }}>
 {icon}
 </div>
 <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: '#0D1B3E', fontFamily: "'Inter', sans-serif", letterSpacing: '-0.01em' }}>
 {title}
 </h3>
 {description && (
 <p style={{ margin: '8px 0 0', fontSize: '13px', color: '#64748B', fontFamily: "'Inter', sans-serif", lineHeight: 1.6, maxWidth: '320px' }}>
 {description}
 </p>
 )}
 {(cta || ctaSecondary) && (
 <div style={{ display: 'flex', gap: '10px', marginTop: '24px', flexWrap: 'wrap', justifyContent: 'center' }}>
 {cta && (
 cta.href
 ? <Link href={cta.href} style={{ display: 'inline-flex', alignItems: 'center', padding: '10px 20px', borderRadius: '10px', background: 'linear-gradient(135deg,#C9973A,#E8B86D)', color: '#0D1B3E', textDecoration: 'none', fontSize: '13px', fontWeight: 600, fontFamily: "'Inter', sans-serif" }}>
 {cta.label}
 </Link>
 : <button onClick={cta.onClick} style={{ display: 'inline-flex', alignItems: 'center', padding: '10px 20px', borderRadius: '10px', background: 'linear-gradient(135deg,#C9973A,#E8B86D)', color: '#0D1B3E', border: 'none', fontSize: '13px', fontWeight: 600, fontFamily: "'Inter', sans-serif", cursor: 'pointer' }}>
 {cta.label}
 </button>
 )}
 {ctaSecondary && (
 ctaSecondary.href
 ? <Link href={ctaSecondary.href} style={{ display: 'inline-flex', alignItems: 'center', padding: '10px 20px', borderRadius: '10px', border: '1.5px solid #E2E8F0', background: '#FFFFFF', color: '#0D1B3E', textDecoration: 'none', fontSize: '13px', fontWeight: 600, fontFamily: "'Inter', sans-serif" }}>
 {ctaSecondary.label}
 </Link>
 : <button onClick={ctaSecondary.onClick} style={{ display: 'inline-flex', alignItems: 'center', padding: '10px 20px', borderRadius: '10px', border: '1.5px solid #E2E8F0', background: '#FFFFFF', color: '#0D1B3E', fontSize: '13px', fontWeight: 600, fontFamily: "'Inter', sans-serif", cursor: 'pointer' }}>
 {ctaSecondary.label}
 </button>
 )}
 </div>
 )}
 </div>
 )
}

export default EmptyState