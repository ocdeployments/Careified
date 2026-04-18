'use client';

import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
import { Check } from 'lucide-react';
import { motion } from 'framer-motion';

interface CheckboxProps {
  label: string;
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
}

export default function Checkbox({
  label,
  checked,
  onCheckedChange,
  disabled,
}: CheckboxProps) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
      <CheckboxPrimitive.Root
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
        style={{
          width: '20px',
          height: '20px',
          borderRadius: '6px',
          border: checked ? '2px solid #C9973A' : '2px solid #E2E8F0',
          background: checked ? '#C9973A' : '#FFFFFF',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: disabled ? 'not-allowed' : 'pointer',
          transition: 'all 0.2s',
          flexShrink: 0,
          marginTop: '2px',
        }}
      >
        <CheckboxPrimitive.Indicator asChild>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
          >
            <Check size={12} color="#FFFFFF" strokeWidth={3} />
          </motion.div>
        </CheckboxPrimitive.Indicator>
      </CheckboxPrimitive.Root>

      <label
        style={{
          cursor: disabled ? 'not-allowed' : 'pointer',
          color: disabled ? '#94A3B8' : '#0D1B3E',
          fontSize: '13px',
          fontFamily: "'DM Sans', sans-serif",
          lineHeight: 1.5,
        }}
        onClick={() => !disabled && onCheckedChange?.(!checked)}
      >
        {label}
      </label>
    </div>
  );
}