'use client';

import { useState, useEffect } from 'react';

interface Props {
  form: React.ReactNode;
  preview: React.ReactNode;
}

export default function MobilePreviewToggle({ form, preview }: Props) {
  const [view, setView] = useState<'form' | 'preview'>('form');
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Desktop: show both side by side
  if (!isMobile) {
    return (
      <div style={{ display: 'flex', gap: '24px' }}>
        <div style={{ flex: 1 }}>{form}</div>
        <div style={{ width: '340px', flexShrink: 0 }}>{preview}</div>
      </div>
    );
  }

  // Mobile: show tabs + content
  return (
    <>
      {/* Tab Bar */}
      <div style={{
        display: 'flex',
        borderBottom: '1px solid #E2E8F0',
        backgroundColor: 'white',
        position: 'sticky',
        top: '64px',
        zIndex: 10
      }}>
        <button
          onClick={() => setView('form')}
          style={{
            flex: 1,
            padding: '14px',
            fontSize: '15px',
            fontWeight: view === 'form' ? 600 : 400,
            color: view === 'form' ? '#0D1B3E' : '#64748B',
            borderBottom: view === 'form' ? '3px solid #C9973A' : 'none',
            backgroundColor: 'transparent',
            border: 'none',
            borderTop: 'none',
            borderLeft: 'none',
            borderRight: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px'
          }}
        >
          📝 Form
        </button>
        <button
          onClick={() => setView('preview')}
          style={{
            flex: 1,
            padding: '14px',
            fontSize: '15px',
            fontWeight: view === 'preview' ? 600 : 400,
            color: view === 'preview' ? '#0D1B3E' : '#64748B',
            borderBottom: view === 'preview' ? '3px solid #C9973A' : 'none',
            backgroundColor: 'transparent',
            border: 'none',
            borderTop: 'none',
            borderLeft: 'none',
            borderRight: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px'
          }}
        >
          👁️ Preview
        </button>
      </div>

      {/* Content */}
      <div style={{ padding: '16px' }}>
        {view === 'form' ? form : preview}
      </div>
    </>
  );
}
