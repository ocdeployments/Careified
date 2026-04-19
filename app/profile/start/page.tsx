'use client';

import { useRouter } from 'next/navigation';

export default function ProfileStart() {
  const router = useRouter();

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#F7F4F0',
      padding: '40px 20px'
    }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📋</div>
          <h1 style={{ fontSize: '36px', fontWeight: 800, color: '#0D1B3E', margin: '0 0 16px' }}>
            Own Your Professional Story
          </h1>
          <p style={{ fontSize: '18px', color: '#64748B', margin: 0, lineHeight: 1.6 }}>
            For the first time, your experience belongs to you—not locked in someone else's files
          </p>
        </div>

        {/* Value Props */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px', marginBottom: '48px' }}>
          <div style={{ padding: '24px', backgroundColor: 'white', borderRadius: '16px', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <div style={{ fontSize: '36px', marginBottom: '12px' }}>📁</div>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0D1B3E', margin: '0 0 8px' }}>You Own It</h3>
            <p style={{ fontSize: '14px', color: '#64748B', margin: 0 }}>Not trapped in agency computers. Take it anywhere. Your profile lives with you.</p>
          </div>
          <div style={{ padding: '24px', backgroundColor: 'white', borderRadius: '16px', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <div style={{ fontSize: '36px', marginBottom: '12px' }}>👀</div>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0D1B3E', margin: '0 0 8px' }}>Be Seen</h3>
            <p style={{ fontSize: '14px', color: '#64748B', margin: 0 }}>Hundreds of agencies searching daily. Multiple opportunities, not just one.</p>
          </div>
          <div style={{ padding: '24px', backgroundColor: 'white', borderRadius: '16px', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <div style={{ fontSize: '36px', marginBottom: '12px' }}>⭐</div>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0D1B3E', margin: '0 0 8px' }}>Get Recognized</h3>
            <p style={{ fontSize: '14px', color: '#64748B', margin: 0 }}>Prove your reliability publicly. No more starting from scratch.</p>
          </div>
          <div style={{ padding: '24px', backgroundColor: 'white', borderRadius: '16px', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <div style={{ fontSize: '36px', marginBottom: '12px' }}>💰</div>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0D1B3E', margin: '0 0 8px' }}>Better Matches</h3>
            <p style={{ fontSize: '14px', color: '#64748B', margin: 0 }}>Specialized skills = better pay. Work you actually want.</p>
          </div>
        </div>

        {/* CTA */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <button
            onClick={() => router.push('/profile/build')}
            style={{
              background: 'linear-gradient(135deg, #C9973A, #E8B86D)',
              color: '#0D1B3E',
              padding: '20px 60px',
              borderRadius: '12px',
              border: 'none',
              fontSize: '18px',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 8px 20px rgba(201, 151, 58, 0.4)',
              marginBottom: '12px'
            }}
          >
            Build My Profile — Free →
          </button>
          <p style={{ fontSize: '14px', color: '#94A3B8', margin: 0 }}>
            Takes 15 minutes. Lasts your entire career.
          </p>
        </div>

        {/* Scrollable Iframe Preview */}
        <div style={{ marginBottom: '32px' }}>
          <p style={{ fontSize: '14px', color: '#64748B', margin: '0 0 16px', textAlign: 'center', fontWeight: 500 }}>
            ⬇️ Scroll to see your complete professional profile
          </p>
          <div style={{ 
            borderRadius: '16px', 
            overflow: 'hidden', 
            border: '1px solid #E2E8F0',
            boxShadow: '0 4px 16px rgba(0,0,0,0.06)'
          }}>
            <iframe
              src="/profile/demo-preview"
              style={{
                width: '100%',
                height: '800px',
                border: 'none',
                backgroundColor: '#F7F4F0'
              }}
              title="Profile Preview"
            />
          </div>
        </div>

        {/* Skip Link */}
        <div style={{ textAlign: 'center', marginTop: '32px' }}>
          <button 
            onClick={() => router.push('/profile/build')}
            style={{ background: 'none', border: 'none', color: '#94A3B8', fontSize: '14px', cursor: 'pointer', textDecoration: 'underline' }}
          >
            Skip — I already have a profile
          </button>
        </div>
      </div>
    </div>
  );
}
