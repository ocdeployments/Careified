'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Menu, X, ChevronDown } from 'lucide-react';
import { UserButton, useAuth } from '@clerk/nextjs';

const FONT_SERIF = "'Inter', sans-serif";
const FONT_SANS = "'Inter', sans-serif";

function AuthButton() {
 const { isLoaded, userId } = useAuth();
 if (!isLoaded) return null;
 if (userId) {
 return (
 <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
 <Link
 href="/profile/strength"
 style={{
 fontSize: '12px',
 color: 'rgba(255,255,255,0.6)',
 textDecoration: 'none',
 padding: '6px 10px',
 borderRadius: '6px',
 transition: 'all 0.2s',
 fontFamily: FONT_SANS,
 }}
 onMouseEnter={e => e.currentTarget.style.color = 'white'}
 onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.6)'}
 >
 Profile strength
 </Link>
 <UserButton appearance={{
 elements: {
 userButtonAvatarBox: { width: '32px', height: '32px' },
 userButtonTrigger: { padding: '4px' },
 },
 }} />
 </div>
 );
 }
 return (
 <>
 <Link href="/sign-in" style={{
 fontSize: '12px', fontWeight: 500, padding: '7px 14px',
 borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)',
 color: 'rgba(255,255,255,0.6)', textDecoration: 'none',
 transition: 'all 0.2s', fontFamily: FONT_SANS,
 }}>
 Sign in
 </Link>
 <Link href="/sign-up" style={{
 fontSize: '12px', fontWeight: 700, padding: '7px 14px',
 borderRadius: '8px',
 background: 'linear-gradient(135deg, #C9973A, #E8B86D)',
 color: '#0D1B3E', textDecoration: 'none',
 transition: 'all 0.2s', fontFamily: FONT_SANS,
 }}>
 Get started
 </Link>
 </>
 );
}

const panels = {
 agencies: {
 accent: '#2563EB',
 accentLight: 'rgba(37,99,235,0.08)',
 links: [
 { label: 'Search caregivers', desc: 'Filter by specialty, score, availability', href: '/agency/search' },
 { label: 'How it works', desc: 'Verification, scoring, shortlisting', href: '/for-agencies' },
 { label: 'Pricing', desc: 'Plans for every agency size', href: '/for-agencies#pricing' },
 ],
 preview: {
 eyebrow: 'AGENCY DASHBOARD',
 title: 'Find the right caregiver in seconds',
 stat: '15+ verified caregivers live in Texas',
 cta: 'Start hiring',
 href: '/sign-up?role=agency',
 },
 },
 caregivers: {
 accent: '#C9973A',
 accentLight: 'rgba(201,151,58,0.08)',
 links: [
 { label: 'Build your profile', desc: 'Free. 6 steps. Yours forever.', href: '/sign-up?role=caregiver' },
 { label: 'Your ID card', desc: 'Verified credential with QR code', href: '/for-caregivers' },
 { label: 'How scoring works', desc: 'Earn your reputation through real work', href: '/for-caregivers#scoring' },
 ],
 preview: {
 eyebrow: 'CAREGIVER PROFILE',
 title: 'Your reputation follows you everywhere',
 stat: 'Profiles with photos get 5x more views',
 cta: 'Build free profile',
 href: '/sign-up?role=caregiver',
 },
 },
 families: {
 accent: '#B45309',
 accentLight: 'rgba(180,83,9,0.08)',
 links: [
 { label: 'Family portal', desc: 'See who is caring for your loved one', href: '/for-families' },
 { label: 'Shift tracker', desc: 'Know when care starts and ends', href: '/for-families#tracker' },
 { label: 'Care notes feed', desc: 'Daily updates after every visit', href: '/for-families#notes' },
 ],
 preview: {
 eyebrow: 'FAMILY PORTAL',
 title: 'Peace of mind, every single shift',
 stat: '"Maria arrived at 9:04 AM — shift in progress"',
 cta: 'Ask your agency',
 href: '/for-families',
 },
 },
};

type PanelKey = keyof typeof panels;

export default function Navbar() {
 const [mobileOpen, setMobileOpen] = useState(false);
 const [activePanel, setActivePanel] = useState< PanelKey | null>(null);
 const [mounted, setMounted] = useState(false);

 useEffect(() => {
 setMounted(true);
 }, []);

 // Prevent hydration mismatch
 if (!mounted) {
 return (
 <nav style={{ height: '64px', background: '#0D1B3E' }}>
 {/* Static placeholder while loading */}
 </nav>
 );
 }

 const handleMouseEnter = (key: PanelKey) => setActivePanel(key);
 const handleMouseLeave = () => setActivePanel(null);

 return (
 <>
 {/* Google Fonts */}
 <style>{`
 @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap');
 `}</style>

 <nav
 style={{
 position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
 backgroundColor: 'rgba(13,27,62,0.97)',
 backdropFilter: 'blur(20px)',
 borderBottom: '1px solid rgba(255,255,255,0.06)',
 fontFamily: FONT_SANS,
 }}
 onMouseLeave={handleMouseLeave}
 >
 {/* Main bar */}
 <div style={{
 maxWidth: '1280px', margin: '0 auto',
 padding: '0 24px', height: '60px',
 display: 'flex', alignItems: 'center',
 justifyContent: 'space-between',
 }}>
 {/* Logo */}
 <Link href="/" style={{
 display: 'flex', alignItems: 'center',
 gap: '10px', textDecoration: 'none', flexShrink: 0,
 }}>
 <div style={{
 width: '28px', height: '28px', borderRadius: '7px',
 background: 'linear-gradient(135deg, #C9973A, #E8B86D)',
 display: 'flex', alignItems: 'center', justifyContent: 'center',
 }}>
 <svg width="12" height="12" viewBox="0 0 14 14" fill="#0D1B3E">
 <path d="M7 1L13 4V10L7 13L1 10V4L7 1Z" />
 </svg>
 </div>
 <span style={{
 fontSize: '14px', fontWeight: 600, color: 'white',
 letterSpacing: '-0.02em',
 }}>
 Careified
 </span>
 </Link>

 {/* Desktop nav links */}
 <div style={{
 display: 'flex', alignItems: 'center', gap: '2px',
 }}>
 {(['agencies', 'caregivers', 'families'] as PanelKey[]).map((key) => (
 <button
 key={key}
 onMouseEnter={() => handleMouseEnter(key)}
 style={{
 display: 'flex', alignItems: 'center', gap: '4px',
 fontSize: '13px', fontWeight: 500,
 color: activePanel === key ? 'white' : 'rgba(255,255,255,0.5)',
 padding: '8px 12px', borderRadius: '8px',
 background: activePanel === key ? 'rgba(255,255,255,0.06)' : 'transparent',
 border: 'none', cursor: 'pointer',
 transition: 'all 0.15s', fontFamily: FONT_SANS,
 }}
 >
 {key === 'agencies' ? 'For Agencies' : key === 'caregivers' ? 'For Caregivers' : 'For Families'}
 <ChevronDown
 size={12}
 style={{
 opacity: 0.4,
 transform: activePanel === key ? 'rotate(180deg)' : 'rotate(0deg)',
 transition: 'transform 0.2s',
 }}
 />
 </button>
 ))}
 <Link href="/about" style={{
 fontSize: '13px', fontWeight: 500,
 color: 'rgba(255,255,255,0.5)',
 padding: '8px 12px', borderRadius: '8px',
 textDecoration: 'none', transition: 'all 0.15s',
 }}>
 About
 </Link>
 </div>

 {/* Auth + mobile toggle */}
 <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
 <AuthButton />
 <button
 onClick={() => setMobileOpen(!mobileOpen)}
 style={{
 display: 'none',
 background: 'none', border: 'none',
 color: 'white', cursor: 'pointer', padding: '4px',
 }}
 className="mobile-menu-btn"
 >
 {mobileOpen ? <X size={20} /> : <Menu size={20} />}
 </button>
 </div>
 </div>

 {/* Dropdown panel */}
 {activePanel && (
 <div
 onMouseEnter={() => setActivePanel(activePanel)}
 style={{
 position: 'absolute', top: '60px', left: 0, right: 0,
 background: 'rgba(10,20,50,0.98)',
 backdropFilter: 'blur(24px)',
 borderBottom: '1px solid rgba(255,255,255,0.06)',
 borderTop: `2px solid ${panels[activePanel].accent}`,
 }}
 >
 <div style={{
 maxWidth: '1280px', margin: '0 auto',
 padding: '28px 24px',
 display: 'grid',
 gridTemplateColumns: '1fr 1fr',
 gap: '40px',
 }}>
 {/* Left — links */}
 <div>
 <div style={{
 fontSize: '10px', fontWeight: 700,
 letterSpacing: '0.1em', textTransform: 'uppercase',
 color: panels[activePanel].accent,
 marginBottom: '16px',
 }}>
 {activePanel === 'agencies' ? 'For Agencies'
 : activePanel === 'caregivers' ? 'For Caregivers'
 : 'For Families'}
 </div>
 <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
 {panels[activePanel].links.map((link) => (
 <Link
 key={link.href}
 href={link.href}
 onClick={() => setActivePanel(null)}
 style={{
 display: 'flex', flexDirection: 'column',
 padding: '10px 12px', borderRadius: '10px',
 textDecoration: 'none',
 transition: 'background 0.15s',
 background: 'transparent',
 }}
 onMouseEnter={e => (e.currentTarget.style.background = panels[activePanel].accentLight)}
 onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
 >
 <span style={{
 fontSize: '13px', fontWeight: 600, color: 'white',
 marginBottom: '2px',
 }}>
 {link.label}
 </span>
 <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.35)' }}>
 {link.desc}
 </span>
 </Link>
 ))}
 </div>
 </div>

 {/* Right — preview card */}
 <div style={{
 background: panels[activePanel].accentLight,
 border: `1px solid ${panels[activePanel].accent}22`,
 borderRadius: '14px',
 padding: '20px',
 display: 'flex', flexDirection: 'column',
 justifyContent: 'space-between',
 }}>
 <div>
 <div style={{
 fontSize: '9px', fontWeight: 700,
 letterSpacing: '0.1em', textTransform: 'uppercase',
 color: panels[activePanel].accent, marginBottom: '10px',
 }}>
 {panels[activePanel].preview.eyebrow}
 </div>
 <div style={{
 fontFamily: FONT_SERIF,
 fontSize: '18px', color: 'white',
 lineHeight: 1.25, marginBottom: '12px',
 letterSpacing: '-0.01em',
 }}>
 {panels[activePanel].preview.title}
 </div>
 <div style={{
 fontSize: '12px', color: 'rgba(255,255,255,0.4)',
 lineHeight: 1.5, fontStyle: 'italic',
 }}>
 {panels[activePanel].preview.stat}
 </div>
 </div>
 <Link
 href={panels[activePanel].preview.href}
 onClick={() => setActivePanel(null)}
 style={{
 marginTop: '16px',
 display: 'inline-block',
 fontSize: '12px', fontWeight: 700,
 padding: '9px 18px', borderRadius: '8px',
 background: panels[activePanel].accent,
 color: 'white', textDecoration: 'none',
 alignSelf: 'flex-start',
 transition: 'opacity 0.2s',
 }}
 >
 {panels[activePanel].preview.cta} →
 </Link>
 </div>
 </div>
 </div>
 )}

 {/* Mobile drawer */}
 {mobileOpen && (
 <div style={{
 position: 'fixed', inset: 0, top: '60px',
 background: '#0D1B3E', zIndex: 99,
 overflowY: 'auto', padding: '24px',
 }}>
 {/* Agencies */}
 <div style={{
 fontSize: '10px', fontWeight: 700,
 letterSpacing: '0.1em', textTransform: 'uppercase',
 color: '#2563EB', marginBottom: '8px', marginTop: '8px',
 }}>For Agencies</div>
 {panels.agencies.links.map(l => (
 <Link key={l.href} href={l.href}
 onClick={() => setMobileOpen(false)}
 style={{
 display: 'block', padding: '12px 0',
 fontSize: '15px', fontWeight: 500, color: 'white',
 textDecoration: 'none',
 borderBottom: '1px solid rgba(255,255,255,0.06)',
 }}>
 {l.label}
 </Link>
 ))}

 {/* Caregivers */}
 <div style={{
 fontSize: '10px', fontWeight: 700,
 letterSpacing: '0.1em', textTransform: 'uppercase',
 color: '#C9973A', marginBottom: '8px', marginTop: '20px',
 }}>For Caregivers</div>
 {panels.caregivers.links.map(l => (
 <Link key={l.href} href={l.href}
 onClick={() => setMobileOpen(false)}
 style={{
 display: 'block', padding: '12px 0',
 fontSize: '15px', fontWeight: 500, color: 'white',
 textDecoration: 'none',
 borderBottom: '1px solid rgba(255,255,255,0.06)',
 }}>
 {l.label}
 </Link>
 ))}

 {/* Families */}
 <div style={{
 fontSize: '10px', fontWeight: 700,
 letterSpacing: '0.1em', textTransform: 'uppercase',
 color: '#B45309', marginBottom: '8px', marginTop: '20px',
 }}>For Families</div>
 {panels.families.links.map(l => (
 <Link key={l.href} href={l.href}
 onClick={() => setMobileOpen(false)}
 style={{
 display: 'block', padding: '12px 0',
 fontSize: '15px', fontWeight: 500, color: 'white',
 textDecoration: 'none',
 borderBottom: '1px solid rgba(255,255,255,0.06)',
 }}>
 {l.label}
 </Link>
 ))}

 <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
 <Link href="/sign-in"
 onClick={() => setMobileOpen(false)}
 style={{
 display: 'block', textAlign: 'center',
 padding: '14px', borderRadius: '12px',
 border: '1px solid rgba(255,255,255,0.1)',
 color: 'rgba(255,255,255,0.7)',
 textDecoration: 'none', fontSize: '14px', fontWeight: 500,
 }}>
 Sign in
 </Link>
 <Link href="/sign-up"
 onClick={() => setMobileOpen(false)}
 style={{
 display: 'block', textAlign: 'center',
 padding: '14px', borderRadius: '12px',
 background: 'linear-gradient(135deg, #C9973A, #E8B86D)',
 color: '#0D1B3E',
 textDecoration: 'none', fontSize: '14px', fontWeight: 700,
 }}>
 Get started free
 </Link>
 </div>
 </div>
 )}

 {/* Mobile responsive override */}
 <style>{`
 @media (max-width: 768px) {
 .mobile-menu-btn { display: flex !important; }
 }
 `}</style>
 </nav>
 </>
 );
}
