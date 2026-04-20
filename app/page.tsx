import Link from 'next/link';

export default function Home() {
 const fontSerif = "'Inter', sans-serif";
 const fontSans = "'Inter', sans-serif";

 return (
 <>
 <style>{`
 @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap');
 `}</style>

 <div style={{ fontFamily: fontSans, background: '#F7F4F0', paddingTop: '60px' }}>

 {/* Header with sign-in */}
 <div style={{ position: 'absolute', top: 0, left: 0, right: 0, padding: '16px 24px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
 <Link href="/sign-in" style={{ fontSize: '13px', fontWeight: 500, color: 'rgba(255,255,255,0.7)', textDecoration: 'none' }}>Sign in</Link>
 </div>

 {/* HERO */}
 <section style={{ background: '#0D1B3E', padding: '80px 24px 72px', position: 'relative', overflow: 'hidden' }}>
 <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', backgroundImage: 'linear-gradient(rgba(201,151,58,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(201,151,58,0.04) 1px, transparent 1px)', backgroundSize: '48px 48px' }} />

 <div style={{ maxWidth: '960px', margin: '0 auto', position: 'relative', zIndex: 2 }}>
 <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(201,151,58,0.1)', border: '1px solid rgba(201,151,58,0.2)', borderRadius: '100px', padding: '5px 14px', marginBottom: '28px' }}>
 <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#C9973A' }} />
 <span style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#C9973A', fontFamily: fontSans }}>Caregiving&apos;s trust layer</span>
 </div>

 <h1 style={{ fontFamily: fontSerif, fontSize: '58px', lineHeight: 1.0, letterSpacing: '-0.02em', color: 'white', marginBottom: '6px' }}>Verified reputations.</h1>
 <h1 style={{ fontFamily: fontSerif, fontSize: '58px', lineHeight: 1.0, letterSpacing: '-0.02em', color: '#C9973A', fontStyle: 'italic', marginBottom: '24px' }}>Built on real work.</h1>

 <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.75)', lineHeight: 1.7, maxWidth: '480px', marginBottom: '48px', fontWeight: 300 }}>
 The platform where caregivers earn credibility and agencies hire with confidence.
 </p>

 <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', maxWidth: '700px' }}>
 <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', padding: '20px', position: 'relative', overflow: 'hidden' }}>
 <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(90deg, #1E3A8A, #2563EB)' }} />
 <div style={{ fontSize: '13px', fontWeight: 600, color: 'white', marginBottom: '4px' }}>For Agencies</div>
 <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.65)', lineHeight: 1.5, marginBottom: '14px' }}>Search verified profiles.</div>
 <Link href="/sign-up?role=agency" style={{ fontSize: '11px', fontWeight: 700, color: '#60A5FA', textDecoration: 'none' }}>Start hiring →</Link>
 </div>

 <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', padding: '20px', position: 'relative', overflow: 'hidden' }}>
 <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(90deg, #C9973A, #E8B86D)' }} />
 <div style={{ fontSize: '13px', fontWeight: 600, color: 'white', marginBottom: '4px' }}>For Caregivers</div>
 <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.65)', lineHeight: 1.5, marginBottom: '14px' }}>Free. Always. Build once.</div>
 <Link href="/sign-up?role=caregiver" style={{ fontSize: '11px', fontWeight: 700, color: '#C9973A', textDecoration: 'none' }}>Build free profile →</Link>
 </div>

 <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', padding: '20px', position: 'relative', overflow: 'hidden' }}>
 <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(90deg, #B45309, #C97706)' }} />
 <div style={{ fontSize: '13px', fontWeight: 600, color: 'white', marginBottom: '4px' }}>For Families</div>
 <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.65)', lineHeight: 1.5, marginBottom: '14px' }}>Know who is caring.</div>
 <Link href="/for-families" style={{ fontSize: '11px', fontWeight: 700, color: '#F59E0B', textDecoration: 'none' }}>Learn more →</Link>
 </div>
 </div>
 </div>
 </section>

 {/* STATS */}
 <section style={{ background: '#080F1E', padding: '20px 24px' }}>
 <div style={{ maxWidth: '960px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)' }}>
 {[{n:'75%',l:'Annual turnover',s:'2025'},{n:'4 in 5',l:'Leave 100 days',s:'2024'},{n:'9.7M',l:'Jobs by 2034',s:'PHI'},{n:'15+',l:'Live in TX',s:'Now'}].map((s,i)=>(<div key={i} style={{padding:'12px'}}><div style={{fontFamily:fontSerif,fontSize:'22px',color:'white'}}>{s.n}</div><div style={{fontSize:'11px',color:'rgba(255,255,255,0.65)',marginTop:'4px'}}>{s.l}</div></div>))}
 </div>
 </section>

 {/* HOW IT WORKS */}
 <section style={{ padding: '80px 24px', background: '#F7F4F0' }}>
 <div style={{ maxWidth: '960px', margin: '0 auto' }}>
 <h2 style={{ fontFamily: fontSerif, fontSize: '38px', color: '#0D1B3E', marginBottom: '40px' }}>A reputation system<br/>caregiving has never had</h2>
 <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
 {[{t:'Build your profile',d:'7 steps. Your complete record.'},{t:'Get placed',d:'Agencies search by score.'},{t:'Earn your score',d:'Badges no one can take away.'}].map((s,i)=>(<div key={i} style={{background:'white',borderRadius:'16px',padding:'28px'}}><div style={{fontFamily:fontSerif,fontSize:'44px',color:'#C9973A18'}}>0{i+1}</div><div style={{fontSize:'15px',fontWeight:600,color:'#0D1B3E',marginBottom:'8px'}}>{s.t}</div><div style={{fontSize:'13px',color:'#64748B'}}>{s.d}</div></div>))}
 </div>
 </div>
 </section>

 {/* CTA */}
 <section style={{ padding: '80px 24px', textAlign: 'center', background: 'linear-gradient(135deg, #0D1B3E 0%, #1E3A8A 100%)' }}>
 <h2 style={{ fontFamily: fontSerif, fontSize: '44px', color: 'white', marginBottom: '12px' }}>The information problem<br/>in caregiving ends here</h2>
 <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.70)', marginBottom: '36px' }}>75% annual turnover. Every hire starts blind. Not anymore.</p>
 <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
 <Link href="/sign-up?role=agency" style={{ fontSize: '13px', fontWeight: 700, padding: '13px 28px', borderRadius: '10px', background: 'linear-gradient(135deg, #C9973A, #E8B86D)', color: '#0D1B3E', textDecoration: 'none' }}>I&apos;m an agency</Link>
 <Link href="/sign-up?role=caregiver" style={{ fontSize: '13px', fontWeight: 500, padding: '13px 28px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.7)', textDecoration: 'none' }}>I&apos;m a caregiver — it&apos;s free</Link>
 </div>
 </section>

 {/* FOOTER */}
 <footer style={{ background: '#080F1E', padding: '48px 24px 32px' }}>
 <div style={{ maxWidth: '960px', margin: '0 auto' }}>
 <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
 <div style={{ width: '24px', height: '24px', borderRadius: '6px', background: 'linear-gradient(135deg, #C9973A, #E8B86D)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
 <span style={{ fontWeight: 800, color: '#0D1B3E', fontSize: '12px' }}>C</span>
 </div>
 <span style={{ fontSize: '13px', fontWeight: 600, color: 'white' }}>Careified</span>
 </div>
 <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.55)', maxWidth: '200px' }}>Verified reputations for the caregiving profession. Texas-first.</p>
 </div>
 </footer>

 </div>
 </>
 );
}
