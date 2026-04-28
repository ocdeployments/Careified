'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Briefcase, Eye, Star, TrendingUp } from 'lucide-react';

export default function ProfileStart() {
  const router = useRouter();

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#F5F3EE',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Main Content */}
      <div style={{ 
        padding: '80px 20px 0',
        position: 'relative',
        zIndex: 1
      }}>
        <div style={{ 
          maxWidth: '1200px', 
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: '1fr',
          gap: '64px',
          alignItems: 'center'
        }}>
          <style jsx>{`
            @media (min-width: 768px) {
              div[style*="grid-template-columns: 1fr"] {
                grid-template-columns: 55fr 45fr !important;
              }
            }
          `}</style>
          
          {/* Left Column - Content */}
          <div>
            {/* Header */}
            <div style={{ textAlign: 'left', marginBottom: '32px' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>📋</div>
              <h1 style={{ fontSize: 'clamp(32px, 4vw, 44px)', fontWeight: 800, color: '#1B2A4A', margin: '0 0 16px', lineHeight: 1.1 }}>
                Own Your Professional Story
              </h1>
              <p style={{ fontSize: '18px', color: '#4A4A4A', margin: 0, lineHeight: 1.6, maxWidth: '520px' }}>
                For the first time, your experience belongs to you—not locked in someone else's files
              </p>
            </div>

            {/* Value Props - 2x2 Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginBottom: '32px' }}>
              {[
                { icon: Briefcase, title: "You Own It", desc: "Not trapped in agency computers. Take it anywhere." },
                { icon: Eye, title: "Be Seen", desc: "Hundreds of agencies searching. Multiple opportunities." },
                { icon: Star, title: "Get Recognized", desc: "Prove your reliability. No more starting from scratch." },
                { icon: TrendingUp, title: "Better Matches", desc: "Specialized skills = better pay. Work you actually want." },
              ].map((item, i) => (
                <div key={i} style={{ 
                  padding: '20px', 
                  backgroundColor: 'white', 
                  borderRadius: '12px', 
                  boxShadow: '0 2px 12px rgba(0,0,0,0.06)'
                }}>
                  <item.icon size={20} color="#C9A84C" style={{ marginBottom: '12px' }} />
                  <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#1B2A4A', margin: '0 0 8px' }}>{item.title}</h3>
                  <p style={{ fontSize: '14px', color: '#6B7280', margin: 0, lineHeight: 1.5 }}>{item.desc}</p>
                </div>
              ))}
            </div>

            {/* CTA */}
            <div style={{ marginBottom: '32px' }}>
              <button
                onClick={() => router.push('/profile/build')}
                style={{
                  background: '#C9A84C',
                  color: 'white',
                  padding: '14px 32px',
                  borderRadius: '9999px',
                  border: 'none',
                  fontSize: '16px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'inline-block',
                  textDecoration: 'none'
                }}
              >
                Build My Profile — Free →
              </button>
              <p style={{ fontSize: '13px', color: '#9CA3AF', margin: '8px 0 0' }}>
                Takes 15 minutes. Lasts your entire career.
              </p>
            </div>
          </div>

          {/* Right Column - Photo */}
          <div style={{ 
            position: 'relative', 
            height: '100%', 
            minHeight: '400px',
            borderRadius: '16px 16px 0 0',
            overflow: 'hidden'
          }}>
            <style jsx>{`
              @media (min-width: 768px) {
                div[style*="minHeight: 400px"] {
                  min-height: 560px !important;
                }
              }
            `}</style>
            <Image
              src="/3Caregivers.jpg"
              alt="Caregivers who use Careified"
              fill
              style={{ objectFit: 'cover', borderRadius: '16px 16px 0 0' }}
            />
          </div>
        </div>
      </div>

      {/* Curved Bottom Wave */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', lineHeight: 0, zIndex: 2 }}>
        <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block', width: '100%' }}>
          <path d="M0,40 C360,80 1080,0 1440,40 L1440,80 L0,80 Z" fill="#1B2A4A"/>
        </svg>
      </div>

      {/* Iframe Preview Section (below the wave) */}
      <div style={{ backgroundColor: '#1B2A4A', padding: '60px 20px', position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)', margin: '0 0 16px', textAlign: 'center', fontWeight: 500 }}>
            ⬇️ Scroll to see your complete professional profile
          </p>
          <div style={{ 
            borderRadius: '16px', 
            overflow: 'hidden', 
            border: '1px solid rgba(255,255,255,0.1)',
            boxShadow: '0 4px 16px rgba(0,0,0,0.2)'
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
      </div>
    </div>
  );
}