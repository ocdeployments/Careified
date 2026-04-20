// Careified — Caregiver Public Profile Page

import { notFound } from 'next/navigation'
import { Pool } from 'pg'
import * as Accordion from '@radix-ui/react-accordion'
import {
 MapPin, Briefcase, Star, Shield, Zap, Home,
 Globe, Car, Clock, CheckCircle, Award, Heart, Users, ChevronRight
} from 'lucide-react'

const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } })

async function getCaregiver(id: string) {
 try {
 const result = await pool.query(`
 SELECT c.*,
 (SELECT COUNT(*) FROM caregiver_certifications cc WHERE cc.caregiver_id = c.id) as cert_count,
 (SELECT COUNT(*) FROM caregiver_references cr WHERE cr.caregiver_id = c.id) as ref_count
 FROM caregivers c WHERE c.id = $1 AND c.status = 'approved'
 `, [id])
 return result.rows[0] || null
 } catch { return null }
}

async function getCertifications(caregiverId: string) {
 try {
 const result = await pool.query(`SELECT * FROM caregiver_certifications WHERE caregiver_id = $1 ORDER BY issue_date DESC`, [caregiverId])
 return result.rows
 } catch { return [] }
}

async function getReferences(caregiverId: string) {
 try {
 const result = await pool.query(`SELECT * FROM caregiver_references WHERE caregiver_id = $1`, [caregiverId])
 return result.rows
 } catch { return [] }
}

export default async function CaregiverProfilePage({ params }: { params: Promise<{ id: string }> }) {
 const caregiver = await getCaregiver((await params).id)
 if (!caregiver) notFound()
 const certifications = await getCertifications((await params).id)
 const references = await getReferences((await params).id)

 const displayName = caregiver.preferred_name ? `${caregiver.preferred_name} ${caregiver.last_name}` : `${caregiver.first_name} ${caregiver.last_name}`
 const initials = `${caregiver.first_name?.[0] || ''}${caregiver.last_name?.[0] || ''}`.toUpperCase()

 const availabilityColor = caregiver.availability_status === 'available_now' ? '#16A34A' : caregiver.availability_status === 'open_to_opportunities' ? '#D97706' : '#64748B'
 const availabilityLabel = caregiver.availability_status === 'available_now' ? 'Available now' : caregiver.availability_status === 'open_to_opportunities' ? 'Open to opportunities' : caregiver.availability_status === 'available_from' ? 'Available from date' : 'Not available'

 const tierColor = caregiver.profile_completion_pct >= 80 ? '#1E3A8A' : caregiver.profile_completion_pct >= 60 ? '#16A34A' : caregiver.profile_completion_pct >= 40 ? '#64748B' : '#94A3B8'
 const tierLabel = caregiver.profile_completion_pct >= 80 ? 'Professional' : caregiver.profile_completion_pct >= 60 ? 'Profile Complete' : caregiver.profile_completion_pct >= 40 ? 'Basic' : 'Incomplete'

 return (
 <div className="min-h-screen" style={{ backgroundColor: '#F7F4F0' }}>
  {/* Top bar */}
  <div className="bg-[#0D1B3E] px-6 py-3">
   <div className="max-w-6xl mx-auto flex items-center gap-2">
 <a href="/agency/search" style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', textDecoration: 'none' }}>Search</a>
 <ChevronRight size={14} color="rgba(255,255,255,0.3)" />
 <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '13px' }}>{displayName}</span>
 </div>
 </div>
 <div style={{ backgroundColor: '#0D1B3E', paddingBottom: '48px' }}>
 <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '32px 24px 0' }}>
 <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
 <div style={{ width: '96px', height: '96px', borderRadius: '50%', background: 'linear-gradient(135deg, #C9973A, #E8B86D)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', fontWeight: 900, color: '#0D1B3E', flexShrink: 0 }}>
 {caregiver.photo_url ? <img src={caregiver.photo_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : initials}
 </div>
 <div style={{ flex: 1, minWidth: '200px' }}>
 <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '6px' }}>
 <h1 style={{ fontSize: '24px', fontWeight: 900, color: 'white', margin: 0 }}>{displayName}</h1>
 {caregiver.open_to_urgent && <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontWeight: 700, padding: '3px 10px', borderRadius: '999px', backgroundColor: 'rgba(251,146,60,0.15)', color: '#FB923C' }}><Zap size={11} /> Urgent</span>}
 </div>
 {caregiver.job_title && <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)', margin: '0 0 12px' }}>{caregiver.job_title}</p>}
 <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
 <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'rgba(255,255,255,0.6)' }}><MapPin size={14} /> {caregiver.city}, {caregiver.state}</span>
 <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'rgba(255,255,255,0.6)' }}><Briefcase size={14} /> {caregiver.years_experience} yrs</span>
 {caregiver.clients_served_count > 0 && <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'rgba(255,255,255,0.6)' }}><Users size={14} /> {caregiver.clients_served_count} clients</span>}
 <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: availabilityColor, fontWeight: 600 }}><span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: availabilityColor }} />{availabilityLabel}</span>
 </div>
 </div>
 <div style={{ backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '20px', minWidth: '160px', textAlign: 'center' }}>
 {caregiver.aggregate_score > 0 ? (<><div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}><Star size={20} fill="#C9973A" color="#C9973A" /><span style={{ fontSize: '28px', fontWeight: 900, color: 'white' }}>{parseFloat(caregiver.aggregate_score).toFixed(1)}</span></div><p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', margin: '0' }}>{caregiver.rating_count} reviews</p></>) : <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', margin: '0' }}>New</p>}
 <div style={{ fontSize: '11px', fontWeight: 700, color: tierColor, backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: '8px', padding: '4px 10px', marginTop: '8px' }}>{tierLabel}</div>
 </div>
 </div>
 <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '24px' }}>
 {caregiver.willing_live_in && <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '11px', fontWeight: 600, padding: '5px 12px', borderRadius: '999px', backgroundColor: 'rgba(139,92,246,0.15)', color: '#A78BFA' }}><Home size={12} /> Live-in</span>}
 {caregiver.has_vehicle && <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '11px', fontWeight: 600, padding: '5px 12px', borderRadius: '999px', backgroundColor: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.6)' }}><Car size={12} /> Vehicle</span>}
 {(caregiver.languages || []).length > 0 && <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '11px', fontWeight: 600, padding: '5px 12px', borderRadius: '999px', backgroundColor: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.6)' }}><Globe size={12} />{(caregiver.languages || []).slice(0,2).join(',')}</span>}
 </div>
 </div>
 </div>
 <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '32px 24px', display: 'grid', gridTemplateColumns: '1fr 320px', gap: '24px' }}>
 <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
 {caregiver.bio && <Section title="About"><p style={{ fontSize: '14px', color: '#475569', lineHeight: 1.7, margin: 0 }}>{caregiver.bio}</p></Section>}
 {(caregiver.specializations || []).length > 0 && <Section title="Specialties"><div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>{(caregiver.specializations || []).map((s: string, i: number) => <span key={i} style={{ fontSize: '12px', fontWeight: 600, padding: '6px 14px', borderRadius: '999px', backgroundColor: '#EFF6FF', color: '#1E3A8A' }}>{s}</span>)}</div></Section>}
 {(caregiver.services || []).length > 0 && <Section title="Services"><div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '8px' }}>{(caregiver.services || []).map((s: string, i: number) => <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#475569' }}><CheckCircle size={14} color="#16A34A" />{s}</div>)}</div></Section>}
 
 {/* Work History Accordion */}
 {(caregiver.work_history && caregiver.work_history.length > 0) && (
 <Accordion.Root type="multiple" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
 <Accordion.Item value="work-history" style={{ backgroundColor: '#fff', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '24px' }}>
 <Accordion.Trigger style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', fontSize: '18px', fontWeight: 600, color: '#0D1B3E', cursor: 'pointer', border: 'none', background: 'none' }}>
 Work History <ChevronRight size={20} />
 </Accordion.Trigger>
 <Accordion.Content style={{ paddingTop: '16px' }}>
 <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
 {caregiver.work_history.map((job: any, i: number) => (
 <div key={i} style={{ padding: '16px', border: '1px solid #E2E8F0', borderRadius: '12px' }}>
 <div style={{ fontSize: '16px', fontWeight: 600, marginBottom: '4px' }}>{job.job_title || 'Caregiver'}</div>
 <div style={{ fontSize: '14px', color: '#64748B' }}>{job.employer} - {job.start_date ? new Date(job.start_date).toLocaleDateString() : ''} {job.is_current ? '- Present' : job.end_date ? '- ' + new Date(job.end_date).toLocaleDateString() : ''}</div>
 {job.description && <p style={{ fontSize: '14px', color: '#475569', marginTop: '8px' }}>{job.description}</p>}
 </div>
 ))}
 </div>
 </Accordion.Content>
 </Accordion.Item>
 
 {/* References Accordion */}
 {references.length > 0 && (
 <Accordion.Item value="references" style={{ backgroundColor: '#fff', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '24px' }}>
 <Accordion.Trigger style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', fontSize: '18px', fontWeight: 600, color: '#0D1B3E', cursor: 'pointer', border: 'none', background: 'none' }}>
 References ({references.length}) <ChevronRight size={20} />
 </Accordion.Trigger>
 <Accordion.Content style={{ paddingTop: '16px' }}>
 <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
 {references.map((ref: any, i: number) => (
 <div key={i} style={{ padding: '16px', border: '1px solid #E2E8F0', borderRadius: '12px' }}>
 <div style={{ fontSize: '16px', fontWeight: 600 }}>{ref.reference_name}</div>
 <div style={{ fontSize: '14px', color: '#64748B' }}>{ref.relationship} - Known for {ref.years_known} years</div>
 <div style={{ fontSize: '14px', color: '#64748B', marginTop: '8px' }}>Contact available upon request</div>
 </div>
 ))}
 </div>
 </Accordion.Content>
 </Accordion.Item>
 )}
 
 {/* Background & Compliance Accordion */}
 <Accordion.Item value="compliance" style={{ backgroundColor: '#fff', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '24px' }}>
 <Accordion.Trigger style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', fontSize: '18px', fontWeight: 600, color: '#0D1B3E', cursor: 'pointer', border: 'none', background: 'none' }}>
 Background and Compliance <ChevronRight size={20} />
 </Accordion.Trigger>
 <Accordion.Content style={{ paddingTop: '16px' }}>
 <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
 {caregiver.vulnerable_sector_check && (
 <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #E2E8F0' }}>
 <span style={{ fontSize: '14px' }}>Vulnerable Sector Check</span>
 <span style={{ fontSize: '14px', color: '#10B981', fontWeight: 600 }}>✓ Complete</span>
 </div>)}
 {caregiver.driving_record_check && (
 <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #E2E8F0' }}>
 <span style={{ fontSize: '14px' }}>Driving Record Check</span>
 <span style={{ fontSize: '14px', color: '#10B981', fontWeight: 600 }}>✓ Complete</span>
 </div>)}
 {caregiver.bonded_insured !== undefined && (
 <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #E2E8F0' }}>
 <span style={{ fontSize: '14px' }}>Bonded and Insured</span>
 <span style={{ fontSize: '14px', color: '#10B981', fontWeight: 600 }}>{caregiver.bonded_insured ? '✓ Yes' : '-'}</span>
 </div>)}
 {caregiver.tb_clearance_date && (
 <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
 <span style={{ fontSize: '14px' }}>TB Clearance</span>
 <span style={{ fontSize: '14px', color: '#64748B' }}>{new Date(caregiver.tb_clearance_date).toLocaleDateString()}</span>
 </div>)}
 </div>
 </Accordion.Content>
 </Accordion.Item>
 </Accordion.Root>
 )}
 {certifications.length > 0 && <Section title="Certifications"><div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>{certifications.map((cert: any, i: number) => <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', backgroundColor: '#F8FAFC', borderRadius: '12px' }}><div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><Shield size={16} color="#1E3A8A" /><div><p style={{ fontSize: '13px', fontWeight: 700, margin: 0 }}>{cert.certification}</p>{cert.issuing_org && <p style={{ fontSize: '11px', color: '#64748B', margin: '2px 0 0' }}>{cert.issuing_org}</p>}</div></div><span style={{ fontSize: '11px', fontWeight: 700, padding: '3px 8px', borderRadius: '6px', backgroundColor: cert.status === 'active' ? '#F0FDF4' : '#FEF2F2', color: cert.status === 'active' ? '#16A34A' : '#DC2626' }}>{cert.status === 'active' ? 'Active' : 'Expired'}</span></div>)}</div></Section>}
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
 <LogisticItem label="Driver license" value={caregiver.has_drivers_license} />
 <LogisticItem label="Drives client" value={caregiver.willing_to_transport} />
 <LogisticItem label="Live-in" value={caregiver.willing_live_in} />
 {caregiver.travel_radius && <InfoRow icon={<MapPin size={14} />} label="Travel" value={`${caregiver.travel_radius} mi`} />}
 </div>
 {(caregiver.languages || []).length > 0 && <div style={{ backgroundColor: 'white', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '20px' }}><h4 style={{ fontSize: '13px', fontWeight: 800, color: '#0D1B3E', marginBottom: '12px' }}>Languages</h4><div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>{(caregiver.languages || []).map((l: string, i: number) => <span key={i} style={{ fontSize: '12px', fontWeight: 600, padding: '5px 12px', borderRadius: '999px', backgroundColor: '#F8FAFC' }}>{l}</span>)}</div></div>}
 </div>
 
 <ProfileDisclaimer />
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

// Disclaimer footer
const disclaimerStyle: React.CSSProperties = {
 marginTop: 40,
 padding: 20,
 background: '#F7F4F0',
 border: '1px solid #E2E8F0',
 borderRadius: 12,
 fontSize: 12,
 color: '#64748B',
 lineHeight: 1.6,
 fontFamily: "'DM Sans', sans-serif",
}

function ProfileDisclaimer() {
 return (
 <div style={disclaimerStyle}>
 <strong style={{ color: '#0D1B3E' }}>About this profile:&nbsp;</strong>
 Information shown is self-disclosed by the caregiver and presented by Careified
 as submitted. Careified does not recommend, vouch for, or verify any caregiver.
 Any employment or engagement decision is the responsibility of the hiring agency
 or family.
 </div>
 )
}
