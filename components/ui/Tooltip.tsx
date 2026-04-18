'use client';

import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import { HelpCircle } from 'lucide-react';

interface TooltipProps {
  content: string;
  children?: React.ReactNode;
}

export default function Tooltip({ content, children }: TooltipProps) {
  return (
    <TooltipPrimitive.Provider delayDuration={200}>
      <TooltipPrimitive.Root>
        <TooltipPrimitive.Trigger asChild>
          <button
            type="button"
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'help',
              padding: 0,
              display: 'inline-flex',
              alignItems: 'center',
            }}
          >
            {children || <HelpCircle size={16} color="#94A3B8" />}
          </button>
        </TooltipPrimitive.Trigger>

        <TooltipPrimitive.Portal>
          <TooltipPrimitive.Content
            sideOffset={8}
            style={{
              background: '#0D1B3E',
              color: '#FFFFFF',
              padding: '8px 12px',
              borderRadius: '8px',
              fontSize: '12px',
              maxWidth: '240px',
              lineHeight: 1.5,
              boxShadow: '0 4px 12px rgba(13, 27, 62, 0.2)',
              zIndex: 100,
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            {content}
            <TooltipPrimitive.Arrow
              style={{ fill: '#0D1B3E' }}
              width={12}
              height={6}
            />
          </TooltipPrimitive.Content>
        </TooltipPrimitive.Portal>
      </TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
  );
}