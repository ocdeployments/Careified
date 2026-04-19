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
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
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

        {/* Preview Section */}
        <div style={{ backgroundColor: 'white', borderRadius: '20px', padding: '32px', boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}>
          <p style={{ fontSize: '12px', color: '#94A3B8', margin: '0 0 20px', textAlign: 'center', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            ⬇️ This is what agencies will see
          </p>
          
          {/* Profile Header */}
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '24px', paddingBottom: '24px', borderBottom: '1px solid #E2E8F0' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'linear-gradient(135deg, #C9973A, #E8B86D)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: 900, color: '#0D1B3E', flexShrink: 0 }}>
              MS
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '20px', fontWeight: 700, color: '#0D1B3E' }}>Maria Santos</div>
              <div style={{ fontSize: '14px', color: '#64748B' }}>Certified Personal Support Worker</div>
              <div style={{ fontSize: '12px', color: '#94A3B8', marginTop: '4px' }}>📍 McKinney, TX • 📅 8 years • 🟢 Available now</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: 900, color: '#C9973A' }}>⭐ 4.8</div>
              <div style={{ fontSize: '11px', color: '#94A3B8' }}>22 reviews</div>
            </div>
          </div>

          {/* About */}
          <div style={{ marginBottom: '20px' }}>
            <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#0D1B3E', margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>About</h4>
            <p style={{ fontSize: '14px', color: '#475569', margin: 0, lineHeight: 1.6 }}>
              Compassionate caregiver with 8+ years specializing in dementia care and post-surgical recovery. I believe every client deserves dignity, patience, and personalized attention.
            </p>
          </div>

          {/* Specialties */}
          <div>
            <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#0D1B3E', margin: '0 0 12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Specialties</h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {['Dementia / Alzheimer\'s', 'Post-surgical recovery', 'Mobility assistance'].map((s, i) => (
                <span key={i} style={{ fontSize: '12px', fontWeight: 600, padding: '6px 14px', borderRadius: '999px', backgroundColor: '#EFF6FF', color: '#1E3A8A' }}>
                  {s}
                </span>
              ))}
            </div>
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
