'use client'
import { InputHTMLAttributes, ReactNode } from 'react'

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
 label?: ReactNode
 description?: string
 error?: string
}

export function Checkbox({ label, description, error, id, style, ...props }: CheckboxProps) {
 const inputId = id || `cb-${Math.random().toString(36).slice(2)}`
 return (
 <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', ...style as any }}>
 <div style={{ position: 'relative', flexShrink: 0, marginTop: '1px' }}>
 <input
 type="checkbox"
 id={inputId}
 style={{ position: 'absolute', opacity: 0, width: '18px', height: '18px', margin: 0, cursor: 'pointer', zIndex: 1 }}
 {...props}
 />
 <div style={{
 width: '18px', height: '18px', borderRadius: '5px',
 border: `1.5px solid ${props.checked ? '#C9973A' : '#CBD5E1'}`,
 background: props.checked ? 'linear-gradient(135deg,#C9973A,#E8B86D)' : '#FFFFFF',
 display: 'flex', alignItems: 'center', justifyContent: 'center',
 transition: 'all 150ms ease',
 boxShadow: props.checked ? '0 2px 6px rgba(201,151,58,0.25)' : 'none',
 pointerEvents: 'none',
 }}>
 {props.checked && (
 <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
 <path d="M1 4L3.5 6.5L9 1" stroke="#0D1B3E" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
 </svg>
 )}
 </div>
 </div>
 {(label || description) && (
 <label htmlFor={inputId} style={{ cursor: 'pointer', flex: 1 }}>
 {label && (
 <div style={{ fontSize: '13px', fontWeight: 500, color: '#0D1B3E', fontFamily: "'Inter', sans-serif", lineHeight: 1.4 }}>
 {label}
 </div>
 )}
 {description && (
 <div style={{ fontSize: '12px', color: '#64748B', fontFamily: "'Inter', sans-serif", marginTop: '2px', lineHeight: 1.4 }}>
 {description}
 </div>
 )}
 {error && (
 <div style={{ fontSize: '12px', color: '#DC2626', fontFamily: "'Inter', sans-serif", marginTop: '3px' }}>
 {error}
 </div>
 )}
 </label>
 )}
 </div>
 )
}

export default Checkbox