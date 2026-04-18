'use client';

import { motion } from 'framer-motion';
import { forwardRef, InputHTMLAttributes } from 'react';

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onFocus' | 'onBlur'> {
  label?: string;
  error?: string;
  showCheck?: boolean;
  onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, showCheck, style, onFocus, onBlur, ...props }, ref) => {
    return (
      <div style={{ width: '100%' }}>
        {label && (
          <label
            style={{
              display: 'block',
              marginBottom: '8px',
              fontSize: '12px',
              fontWeight: 600,
              color: '#64748B',
              fontFamily: "'Inter', sans-serif",
            }}
          >
            {label}
          </label>
        )}
        <div style={{ position: 'relative' }}>
          <input
            ref={ref}
            {...props}
            style={{
              width: '100%',
              padding: '12px 16px',
              borderRadius: '12px',
              border: error ? '2px solid #DC2626' : '1px solid #E2E8F0',
              background: '#FFFFFF',
              fontSize: '13px',
              color: '#0D1B3E',
              outline: 'none',
              transition: 'border 0.2s, box-shadow 0.2s',
              fontFamily: "'Inter', sans-serif",
              boxShadow: error
                ? '0 0 0 3px rgba(220, 38, 38, 0.1)'
                : 'none',
              ...style,
            }}
            onFocus={(e) => {
              e.target.style.border = '2px solid #C9973A';
              e.target.style.boxShadow = '0 0 0 3px rgba(201, 151, 58, 0.1)';
              onFocus?.(e);
            }}
            onBlur={(e) => {
              e.target.style.border = error ? '2px solid #DC2626' : '1px solid #E2E8F0';
              e.target.style.boxShadow = error ? '0 0 0 3px rgba(220, 38, 38, 0.1)' : 'none';
              onBlur?.(e);
            }}
          />
          {showCheck && props.value && !error && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              style={{
                position: 'absolute',
                right: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                background: '#16A34A',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <svg width="12" height="9" viewBox="0 0 12 9" fill="none">
                <path
                  d="M1 4.5L4.5 8L11 1"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </motion.div>
          )}
        </div>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              marginTop: '4px',
              fontSize: '12px',
              color: '#DC2626',
              fontFamily: "'Inter', sans-serif",
            }}
          >
            {error}
          </motion.p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;