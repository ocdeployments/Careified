import Link from 'next/link';
import { CaregiverSearchResult } from '@/lib/types/search';
import { Star, MapPin, Briefcase, Shield, Zap, Home, Globe, Car } from 'lucide-react';

interface CaregiverCardProps {
 caregiver: CaregiverSearchResult;
}

export function CaregiverCard({ caregiver }: CaregiverCardProps) {

 const displayName = caregiver.preferredName
 ? `${caregiver.preferredName} ${caregiver.lastName}`
 : `${caregiver.firstName} ${caregiver.lastName}`;

 const initials = `${caregiver.firstName?.[0] || ''}${caregiver.lastName?.[0] || ''}`.toUpperCase();

 const availBg =
 caregiver.availabilityStatus === 'available_now' ? '#F0FDF4' :
 caregiver.availabilityStatus === 'open_to_opportunities' ? '#FFFBEB' :
 '#F8FAFC';

 const availColor =
 caregiver.availabilityStatus === 'available_now' ? '#16A34A' :
 caregiver.availabilityStatus === 'open_to_opportunities' ? '#D97706' :
 '#64748B';

 const availDot =
 caregiver.availabilityStatus === 'available_now' ? '#16A34A' :
 caregiver.availabilityStatus === 'open_to_opportunities' ? '#D97706' :
 '#94A3B8';

 return (
 <Link href={`/profile/${caregiver.id}`} style={{ textDecoration: 'none', display: 'block' }}>
 <div style={{
 backgroundColor: 'white',
 borderRadius: '16px',
 border: '1px solid #E2E8F0',
 padding: '20px',
 cursor: 'pointer',
 transition: 'all 0.2s',
 height: '100%',
 }}
 onMouseEnter={e => {
 (e.currentTarget as HTMLDivElement).style.borderColor = '#C9973A';
 (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 20px rgba(201,151,58,0.15)';
 (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)';
 }}
 onMouseLeave={e => {
 (e.currentTarget as HTMLDivElement).style.borderColor = '#E2E8F0';
 (e.currentTarget as HTMLDivElement).style.boxShadow = 'none';
 (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
 }}
 >
 {/* Header */}
 <div style={{ display: 'flex', gap: '12px', marginBottom: '14px' }}>
 <div style={{
 width: '52px', height: '52px', borderRadius: '50%',
 background: 'linear-gradient(135deg, #C9973A, #E8B86D)',
 display: 'flex', alignItems: 'center', justifyContent: 'center',
 fontSize: '16px', fontWeight: 900, color: '#0D1B3E',
 flexShrink: 0, overflow: 'hidden'
 }}>
 {caregiver.photoUrl
 ? <img src={caregiver.photoUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
 : initials}
 </div>

 <div style={{ flex: 1, minWidth: 0 }}>
 <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
 <div style={{ minWidth: 0 }}>
 <h3 style={{ fontSize: '14px', fontWeight: 800, color: '#0D1B3E', margin: '0 0 2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
 {displayName}
 </h3>
 {caregiver.jobTitle && (
 <p style={{ fontSize: '11px', color: '#64748B', margin: '0 0 4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
 {caregiver.jobTitle}
 </p>
 )}
 <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
 {caregiver.credentials[0] && (
 <span style={{ fontSize: '11px', fontWeight: 700, color: '#1E3A8A', backgroundColor: '#EFF6FF', padding: '2px 8px', borderRadius: '6px' }}>
 {caregiver.credentials[0]}
 </span>
 )}
 <span style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '11px', color: '#64748B' }}>
 <Briefcase size={11} /> {caregiver.yearsExperience}y
 </span>
 <span style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '11px', color: '#64748B' }}>
 <MapPin size={11} /> {caregiver.city}
 </span>
 </div>
 </div>

 {caregiver.score >= 3 && (
 <div style={{ display: 'flex', alignItems: 'center', gap: '3px', flexShrink: 0 }}>
 <Star size={14} fill="#C9973A" color="#C9973A" />
 <span style={{ fontSize: '13px', fontWeight: 800, color: '#0D1B3E' }}>
 {caregiver.score.toFixed(1)}
 </span>
 </div>
 )}
 </div>
 </div>
 </div>

 {/* Availability */}
 <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '12px' }}>
 <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '11px', fontWeight: 600, padding: '4px 10px', borderRadius: '999px', backgroundColor: availBg, color: availColor }}>
 <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: availDot }} />
 {caregiver.availabilityLabel}
 </span>
 {caregiver.openToUrgent && (
 <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontWeight: 600, padding: '4px 10px', borderRadius: '999px', backgroundColor: '#FFF7ED', color: '#C2410C' }}>
 <Zap size={10} /> Urgent
 </span>
 )}
 {caregiver.willingLiveIn && (
 <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontWeight: 600, padding: '4px 10px', borderRadius: '999px', backgroundColor: '#F5F3FF', color: '#7C3AED' }}>
 <Home size={10} /> Live-in
 </span>
 )}
 </div>

 {/* Specialties */}
 {caregiver.specialties.length > 0 && (
 <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginBottom: '10px' }}>
 {caregiver.specialties.slice(0, 3).map((s, i) => (
 <span key={i} style={{ fontSize: '11px', padding: '3px 10px', borderRadius: '6px', backgroundColor: '#F8FAFC', color: '#475569', border: '1px solid #E2E8F0' }}>
 {s}
 </span>
 ))}
 </div>
 )}

 {/* Languages */}
 {caregiver.languages.length > 0 && (
 <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '12px' }}>
 <Globe size={12} color="#94A3B8" />
 <span style={{ fontSize: '11px', color: '#64748B' }}>
 {caregiver.languages.slice(0, 3).join(' · ')}
 </span>
 </div>
 )}

 {/* Footer */}
 <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '12px', borderTop: '1px solid #F1F5F9' }}>
 <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
 {caregiver.hasBackgroundCheck && (
 <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#16A34A', fontWeight: 600 }}>
 <Shield size={12} /> Verified
 </span>
 )}
 {caregiver.hasVehicle && (
 <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#64748B' }}>
 <Car size={12} /> Vehicle
 </span>
 )}
 {caregiver.hourlyRate && (
 <span style={{ fontSize: '11px', color: '#64748B' }}>
 ${caregiver.hourlyRate}/hr
 </span>
 )}
 </div>
 <span style={{ fontSize: '11px', fontWeight: 700, padding: '3px 8px', borderRadius: '6px', backgroundColor: caregiver.profileCompletionPct >= 80 ? '#EFF6FF' : caregiver.profileCompletionPct >= 60 ? '#F0FDF4' : '#F8FAFC', color: caregiver.profileCompletionPct >= 80 ? '#1E3A8A' : caregiver.profileCompletionPct >= 60 ? '#16A34A' : '#94A3B8' }}>
 {caregiver.profileCompletionPct >= 80 ? 'Professional' : caregiver.profileCompletionPct >= 60 ? 'Verified' : caregiver.profileCompletionPct >= 40 ? 'Basic' : 'Incomplete'}
 </span>
 </div>
 </div>
 </Link>
 );
}
