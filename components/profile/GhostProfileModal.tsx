'use client';

interface Props {
  onDismiss: () => void;
}

export default function GhostProfileModal({ onDismiss }: Props) {
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(13, 27, 62, 0.95)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '20px',
      overflowY: 'auto'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '24px',
        maxWidth: '600px',
        width: '100%',
        padding: '40px',
        position: 'relative'
      }}>
        {/* Close button */}
        <button
          onClick={onDismiss}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'none',
            border: 'none',
            fontSize: '24px',
            cursor: 'pointer',
            color: '#94A3B8'
          }}
        >
          ✕
        </button>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📋</div>
          <h2 style={{ fontSize: '28px', fontWeight: 800, color: '#0D1B3E', margin: '0 0 12px' }}>
            Own Your Professional Story
          </h2>
          <p style={{ fontSize: '16px', color: '#64748B', margin: 0, lineHeight: 1.6 }}>
            For the first time, your experience belongs to you—not locked in someone else's files
          </p>
        </div>

        {/* Value Props */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginBottom: '32px' }}>
          <div style={{ padding: '20px', backgroundColor: '#F8FAFC', borderRadius: '16px', textAlign: 'center' }}>
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>📁</div>
            <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#0D1B3E', margin: '0 0 4px' }}>You Own It</h3>
            <p style={{ fontSize: '12px', color: '#64748B', margin: 0 }}>Not trapped in agency computers. Take it anywhere.</p>
          </div>
          <div style={{ padding: '20px', backgroundColor: '#F8FAFC', borderRadius: '16px', textAlign: 'center' }}>
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>👀</div>
            <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#0D1B3E', margin: '0 0 4px' }}>Be Seen</h3>
            <p style={{ fontSize: '12px', color: '#64748B', margin: 0 }}>Hundreds of agencies searching. Multiple opportunities.</p>
          </div>
          <div style={{ padding: '20px', backgroundColor: '#F8FAFC', borderRadius: '16px', textAlign: 'center' }}>
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>⭐</div>
            <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#0D1B3E', margin: '0 0 4px' }}>Get Recognized</h3>
            <p style={{ fontSize: '12px', color: '#64748B', margin: 0 }}>Prove your reliability. No more starting from scratch.</p>
          </div>
          <div style={{ padding: '20px', backgroundColor: '#F8FAFC', borderRadius: '16px', textAlign: 'center' }}>
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>💰</div>
            <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#0D1B3E', margin: '0 0 4px' }}>Better Matches</h3>
            <p style={{ fontSize: '12px', color: '#64748B', margin: 0 }}>Specialized skills = better pay. Work you actually want.</p>
          </div>
        </div>

        {/* CTA */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <button
            onClick={onDismiss}
            style={{
              background: 'linear-gradient(135deg, #C9973A, #E8B86D)',
              color: '#0D1B3E',
              padding: '16px 32px',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: 700,
              border: 'none',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            Build My Profile →
          </button>
          <p style={{ fontSize: '13px', color: '#94A3B8', margin: '12px 0 0' }}>
            Takes 15 minutes. Lasts your entire career.
          </p>
        </div>

        {/* Profile Preview Link */}
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: '12px', color: '#94A3B8', margin: '0 0 8px' }}>
            ⬇️ This is what agencies will see
          </p>
          <a
            href="/profile/demo-preview"
            target="_blank"
            style={{
              display: 'inline-block',
              padding: '12px 24px',
              backgroundColor: '#F0F9FF',
              color: '#0369A1',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 500,
              textDecoration: 'none'
            }}
          >
            View Demo Profile →
          </a>
          <p style={{ fontSize: '11px', color: '#CBD5E1', margin: '8px 0 0' }}>
            Scroll to explore a complete profile
          </p>
        </div>
      </div>
    </div>
  );
}
