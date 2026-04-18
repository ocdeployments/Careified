// Careified — Demo Profile Preview Page

import Link from 'next/link'
import {
 MapPin, Briefcase, Star, Shield, Zap, Home,
 Globe, Car, Clock, CheckCircle, Award, Users, ChevronRight
} from 'lucide-react'

export default function DemoPreview() {
 const demo = {
   first_name: 'Maria',
   last_name: 'Santos',
   preferred_name: 'Maria',
   job_title: 'Certified Personal Support Worker',
   city: 'McKinney',
   state: 'TX',
   bio: 'Compassionate caregiver with 8+ years specializing in dementia care and post-surgical recovery. I believe every client deserves dignity, patience, and personalized attention.',
   specializations: ['Dementia / Alzheimer\'s', 'Post-surgical recovery', 'Mobility assistance'],
   services: ['Personal care', 'Medication reminders', 'Meal preparation', 'Light housekeeping', 'Transportation', 'Companionship'],
   placement_types: ['Permanent placement', 'Live-in care'],
   languages: ['English', 'Spanish'],
   aggregate_score: '4.8',
   rating_count: 15,
   years_experience: 8,
   hourly_rate: 28.00,
   has_vehicle: true,
   availability_status: 'available_now',
   willing_live_in: true,
   photo_url: null,
   profile_completion_pct: 85
 }

 const caregiver = demo
 const displayName = caregiver.preferred_name ? `${caregiver.preferred_name} ${caregiver.last_name}` : `${caregiver.first_name} ${caregiver.last_name}`
 const initials = `${caregiver.first_name?.[0] || ''}${caregiver.last_name?.[0] || ''}`.toUpperCase()

 const availabilityColor = '#16A34A'
 const availabilityLabel = 'Available now'
 const tierColor = '#1E3A8A'
 const tierLabel = 'Professional'

 return (
   <div className="min-h-screen" style={{ backgroundColor: '#F7F4F0' }}>
     {/* Top bar */}
     <div className="bg-[#0D1B3E] px-6 py-3">
       <div className="max-w-6xl mx-auto flex items-center gap-2">
         <Link href="/agency/search" style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', textDecoration: 'none' }}>Search</Link>
         <ChevronRight size={14} color="rgba(255,255,255,0.3)" />
         <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '13px' }}>{displayName}</span>
       </div>
     </div>
     <div style={{ backgroundColor: '#0D1B3E', paddingBottom: '48px' }}>
       <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '32px 24px 0' }}>
         <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
           <div style={{ width: '96px', height: '96px', borderRadius: '50%', background: 'linear-gradient(135deg, #C9973A, #E8B86D)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', fontWeight: 900, color: '#0D1B3E', flexShrink: 0 }}>
             {initials}
           </div>
           <div style={{ flex: 1, minWidth: '200px' }}>
             <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '6px' }}>
               <h1 style={{ fontSize: '24px', fontWeight: 900, color: 'white', margin: 0 }}>{displayName}</h1>
             </div>
             {caregiver.job_title && <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)', margin: '0 0 12px' }}>{caregiver.job_title}</p>}
             <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
               <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'rgba(255,255,255,0.6)' }}><MapPin size={14} /> {caregiver.city}, {caregiver.state}</span>
               <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'rgba(255,255,255,0.6)' }}><Briefcase size={14} /> {caregiver.years_experience} yrs</span>
               <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: availabilityColor, fontWeight: 600 }}><span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: availabilityColor }} />{availabilityLabel}</span>
             </div>
           </div>
           <div style={{ backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '20px', minWidth: '160px', textAlign: 'center' }}>
             <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}><Star size={20} fill="#C9973A" color="#C9973A" /><span style={{ fontSize: '28px', fontWeight: 900, color: 'white' }}>{parseFloat(caregiver.aggregate_score).toFixed(1)}</span></div>
             <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', margin: '0' }}>{caregiver.rating_count} reviews</p>
             <div style={{ fontSize: '11px', fontWeight: 700, color: tierColor, backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: '8px', padding: '4px 10px', marginTop: '8px' }}>{tierLabel}</div>
           </div>
         </div>
         <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '24px' }}>
           {caregiver.willing_live_in && <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '11px', fontWeight: 600, padding: '5px 12px', borderRadius: '999px', backgroundColor: 'rgba(139,92,246,0.15)', color: '#A78BFA' }}><Home size={12} /> Live-in</span>}
           {caregiver.has_vehicle && <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '11px', fontWeight: 600, padding: '5px 12px', borderRadius: '999px', backgroundColor: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.6)' }}><Car size={12} /> Vehicle</span>}
           <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '11px', fontWeight: 600, padding: '5px 12px', borderRadius: '999px', backgroundColor: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.6)' }}><Globe size={12} />{caregiver.languages.slice(0,2).join(',')}</span>
         </div>
       </div>
     </div>
     <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '32px 24px' }}>
       <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '24px' }}>
         <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
           {caregiver.bio && <Section title="About"><p style={{ fontSize: '14px', color: '#475569', lineHeight: 1.7, margin: 0 }}>{caregiver.bio}</p></Section>}
           {(caregiver.specializations || []).length > 0 && <Section title="Specialties"><div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>{(caregiver.specializations || []).map((s: string, i: number) => <span key={i} style={{ fontSize: '12px', fontWeight: 600, padding: '6px 14px', borderRadius: '999px', backgroundColor: '#EFF6FF', color: '#1E3A8A' }}>{s}</span>)}</div></Section>}
           {(caregiver.services || []).length > 0 && <Section title="Services"><div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '8px' }}>{(caregiver.services || []).map((s: string, i: number) => <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#475569' }}><CheckCircle size={14} color="#16A34A" />{s}</div>)}</div></Section>}
         </div>
         <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
           <div style={{ backgroundColor: 'white', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '20px' }}>
             <button style={{ width: '100%', padding: '14px', borderRadius: '12px', fontSize: '14px', fontWeight: 700, color: '#0D1B3E', background: 'linear-gradient(135deg, #C9973A, #E8B86D)', border: 'none', cursor: 'pointer', marginBottom: '10px' }}>Shortlist</button>
             <button style={{ width: '100%', padding: '14px', borderRadius: '12px', fontSize: '14px', fontWeight: 700, color: '#1E3A8A', backgroundColor: '#EFF6FF', border: '1px solid #BFDBFE', cursor: 'pointer' }}>Request Contact</button>
           </div>
           <div style={{ backgroundColor: 'white', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '20px' }}>
             <h4 style={{ fontSize: '13px', fontWeight: 800, color: '#0D1B3E', marginBottom: '14px' }}>Availability</h4>
             <InfoRow icon={<Clock size={14} />} label="Status" value={availabilityLabel} valueColor={availabilityColor} />
             {caregiver.placement_types?.length > 0 && <div style={{ marginTop: '8px' }}><p style={{ fontSize: '11px', color: '#94A3B8', margin: '0 0 6px', fontWeight: 600 }}>Types</p><div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>{(caregiver.placement_types || []).map((t: string, i: number) => <span key={i} style={{ fontSize: '11px', padding: '3px 8px', borderRadius: '6px', backgroundColor: '#F8FAFC' }}>{t}</span>)}</div></div>}
             {caregiver.hourly_rate && <InfoRow icon={<Award size={14} />} label="Rate" value={`$${caregiver.hourly_rate}/hr`} />}
           </div>
           <div style={{ backgroundColor: 'white', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '20px' }}>
             <h4 style={{ fontSize: '13px', fontWeight: 800, color: '#0D1B3E', marginBottom: '14px' }}>Logistics</h4>
             <LogisticItem label="Has vehicle" value={caregiver.has_vehicle} />
             <LogisticItem label="Live-in" value={caregiver.willing_live_in} />
           </div>
           {(caregiver.languages || []).length > 0 && <div style={{ backgroundColor: 'white', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '20px' }}><h4 style={{ fontSize: '13px', fontWeight: 800, color: '#0D1B3E', marginBottom: '12px' }}>Languages</h4><div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>{(caregiver.languages || []).map((l: string, i: number) => <span key={i} style={{ fontSize: '12px', fontWeight: 600, padding: '5px 12px', borderRadius: '999px', backgroundColor: '#F8FAFC' }}>{l}</span>)}</div></div>}
         </div>
       </div>
     </div>
   </div>
 )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) { return <div style={{ backgroundColor: 'white', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '24px' }}><h3 style={{ fontSize: '14px', fontWeight: 800, color: '#0D1B3E', marginBottom: '16px' }}>{title}</h3>{children}</div> }
function InfoRow({ icon, label, value, valueColor }: { icon: React.ReactNode; label: string; value: string; valueColor?: string }) { return (
   <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
     <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#64748B' }}>{icon} {label}</span>
     <span style={{ fontSize: '12px', fontWeight: 600, color: valueColor || '#0D1B3E' }}>{value}</span>
   </div>
 )
}
function LogisticItem({ label, value }: { label: string; value: boolean }) {
   return (
     <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
       <span style={{ fontSize: '12px', color: '#64748B' }}>{label}</span>
       <span style={{ fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '6px', backgroundColor: value ? '#F0FDF4' : '#F8FAFC', color: value ? '#16A34A' : '#94A3B8' }}>{value ? 'Yes' : 'No'}</span>
     </div>
   )
}
