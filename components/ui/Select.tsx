'use client';

import * as SelectPrimitive from '@radix-ui/react-select';
import { ChevronDown, Check } from 'lucide-react';
import { motion } from 'framer-motion';

interface SelectProps {
  label?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  options: { value: string; label: string }[];
  error?: string;
}

export default function Select({
  label,
  value,
  onValueChange,
  placeholder,
  options,
  error,
}: SelectProps) {
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
      <SelectPrimitive.Root value={value} onValueChange={onValueChange}>
        <SelectPrimitive.Trigger
          style={{
            width: '100%',
            padding: '12px 16px',
            borderRadius: '12px',
            border: error ? '2px solid #DC2626' : '1px solid #E2E8F0',
            background: '#FFFFFF',
            fontSize: '13px',
            color: value ? '#0D1B3E' : '#94A3B8',
            outline: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
            transition: 'border 0.2s, box-shadow 0.2s',
            fontFamily: "'Inter', sans-serif",
          }}
        >
          <SelectPrimitive.Value placeholder={placeholder} />
          <SelectPrimitive.Icon>
            <ChevronDown size={16} color="#94A3B8" />
          </SelectPrimitive.Icon>
        </SelectPrimitive.Trigger>

        <SelectPrimitive.Portal>
          <SelectPrimitive.Content
            style={{
              background: '#FFFFFF',
              borderRadius: '12px',
              border: '1px solid #E2E8F0',
              boxShadow: '0 8px 24px rgba(13, 27, 62, 0.12)',
              padding: '8px',
              zIndex: 50,
              minWidth: '200px',
            }}
          >
            <SelectPrimitive.Viewport>
              {options.map((option) => (
                <SelectPrimitive.Item
                  key={option.value}
                  value={option.value}
                  style={{
                    padding: '10px 12px',
                    borderRadius: '8px',
                    fontSize: '13px',
                    color: '#0D1B3E',
                    cursor: 'pointer',
                    outline: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    transition: 'background 0.15s',
                    fontFamily: "'Inter', sans-serif",
                  }}
                >
                  <SelectPrimitive.ItemText>{option.label}</SelectPrimitive.ItemText>
                  <SelectPrimitive.ItemIndicator>
                    <Check size={16} color="#C9973A" />
                  </SelectPrimitive.ItemIndicator>
                </SelectPrimitive.Item>
              ))}
            </SelectPrimitive.Viewport>
          </SelectPrimitive.Content>
        </SelectPrimitive.Portal>
      </SelectPrimitive.Root>

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