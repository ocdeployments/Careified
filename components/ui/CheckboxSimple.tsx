'use client'
import { InputHTMLAttributes, ReactNode, useId } from 'react'

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: ReactNode
  description?: string
  error?: string
}

export function Checkbox({ label, description, error, checked, disabled, style, ...props }: CheckboxProps) {
  const id = useId()
  return (
    <label htmlFor={id} style={{
      display: 'flex',
      alignItems: description ? 'flex-start' : 'center',
      gap: '10px',
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.5 : 1,
      userSelect: 'none',
      ...style,
    }}>
      <input id={id} type="checkbox" checked={checked} disabled={disabled}
        style={{ position: 'absolute', opacity: 0, width: 0, height: 0 }} {...props} />
      <span style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '18px',
        height: '18px',
        minWidth: '18px',
        borderRadius: '5px',
        border: checked ? '2px solid #C9973A' : error ? '2px solid #DC2626' : '2px solid #CBD5E1',
        background: checked ? 'linear-gradient(135deg,#C9973A,#E8B86D)' : '#FFFFFF',
        transition: 'all 150ms ease',
        boxShadow: checked ? '0 2px 6px rgba(201,151,58,0.25)' : 'none',
        marginTop: description ? '1px' : '0',
        flexShrink: 0,
      }}>
        {checked && (
          <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
            <path d="M1 4L3.5 6.5L9 1" stroke="#0D1B3E" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
      </span>
      {(label || description) && (
        <span>
          {label && <span style={{
            display: 'block',
            fontFamily: "'Inter', sans-serif",
            fontSize: '13px',
            fontWeight: checked ? 500 : 400,
            color: checked ? '#0D1B3E' : '#475569',
            lineHeight: 1.4,
            transition: 'color 150ms ease',
          }}>{label}</span>}
          {description && <span style={{
            display: 'block',
            fontFamily: "'Inter', sans-serif",
            fontSize: '12px',
            color: '#94A3B8',
            lineHeight: 1.4,
            marginTop: '2px',
          }}>{description}</span>}
        </span>
      )}
    </label>
  )
}

export default Checkbox