import Link from 'next/link';
import { CaregiverSearchResult } from '@/lib/types/search';
import { Star, MapPin, Briefcase, Shield, Zap, Home, Globe } from 'lucide-react';

interface CaregiverCardProps {
 caregiver: CaregiverSearchResult;
}

export function CaregiverCard({ caregiver }: CaregiverCardProps) {

 const displayName = caregiver.preferredName
 ? `${caregiver.preferredName} ${caregiver.lastName}`
 : `${caregiver.firstName} ${caregiver.lastName}`;

 const initials = `${caregiver.firstName[0] || ''}${caregiver.lastName[0] || ''}`.toUpperCase();

 const availabilityStyle =
 caregiver.availabilityStatus === 'available_now'
 ? 'bg-green-100 text-green-700 border-green-200'
 : caregiver.availabilityStatus === 'open_to_opportunities'
 ? 'bg-amber-100 text-amber-700 border-amber-200'
 : 'bg-slate-100 text-slate-600 border-slate-200';

 return (
 <Link href={`/profile/${caregiver.id}`} className="block">
 <div className="bg-white rounded-2xl border border-slate-100 p-5 hover:border-blue-200 hover:shadow-lg transition-all cursor-pointer">

 {/* Header */}
 <div className="flex items-start gap-4 mb-4">
 <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-base flex-shrink-0 overflow-hidden">
 {caregiver.photoUrl
 ? <img src={caregiver.photoUrl} alt="" className="w-full h-full object-cover" />
 : initials}
 </div>

 <div className="flex-1 min-w-0">
 <h3 className="font-bold text-slate-900 text-sm mb-0.5 truncate">{displayName}</h3>

 {caregiver.jobTitle && (
 <p className="text-xs text-slate-500 mb-1 truncate">{caregiver.jobTitle}</p>
 )}

 <div className="flex items-center gap-2 text-xs text-slate-600 flex-wrap">
 {caregiver.credentials[0] && (
 <span className="font-semibold text-blue-700">{caregiver.credentials[0]}</span>
 )}
 <span className="flex items-center gap-0.5">
 <Briefcase className="w-3 h-3" />
 {caregiver.yearsExperience}y
 </span>
 <span className="flex items-center gap-0.5">
 <MapPin className="w-3 h-3" />
 {caregiver.city}, {caregiver.state}
 </span>
 </div>
 </div>

 {/* Score */}
 {caregiver.score >= 3 && (
 <div className="flex items-center gap-1 flex-shrink-0">
 <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
 <span className="text-sm font-bold text-slate-900">{caregiver.score.toFixed(1)}</span>
 </div>
 )}
 </div>

 {/* Availability badge */}
 <div className="mb-3">
 <span className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full border ${availabilityStyle}`}>
 <span className={`w-1.5 h-1.5 rounded-full ${
 caregiver.availabilityStatus === 'available_now' ? 'bg-green-500' :
 caregiver.availabilityStatus === 'open_to_opportunities' ? 'bg-amber-500' :
 'bg-slate-400'
 }`} />
 {caregiver.availabilityLabel}
 </span>
 {caregiver.openToUrgent && (
 <span className="ml-1.5 inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full border bg-orange-50 text-orange-700 border-orange-200">
 <Zap className="w-3 h-3" />
 Urgent
 </span>
 )}
 {caregiver.willingLiveIn && (
 <span className="ml-1.5 inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full border bg-purple-50 text-purple-700 border-purple-200">
 <Home className="w-3 h-3" />
 Live-in
 </span>
 )}
 </div>

 {/* Specialties */}
 {caregiver.specialties.length > 0 && (
 <div className="flex flex-wrap gap-1.5 mb-3">
 {caregiver.specialties.slice(0, 3).map((s, i) => (
 <span key={i} className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
 {s}
 </span>
 ))}
 </div>
 )}

 {/* Languages */}
 {caregiver.languages.length > 0 && (
 <div className="flex items-center gap-1.5 mb-3">
 <Globe className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
 <span className="text-xs text-slate-600">
 {caregiver.languages.slice(0, 3).join(' · ')}
 </span>
 </div>
 )}

 {/* Footer signals */}
 <div className="flex items-center justify-between pt-3 border-t border-slate-50">
 <div className="flex items-center gap-3">
 {caregiver.hasBackgroundCheck && (
 <span className="flex items-center gap-1 text-xs text-emerald-700">
 <Shield className="w-3.5 h-3.5" />
 Verified
 </span>
 )}
 {caregiver.hasReferences && (
 <span className="text-xs text-slate-500">
 {caregiver.certificationCount} cert{caregiver.certificationCount !== 1 ? 's' : ''}
 </span>
 )}
 {caregiver.hourlyRate && (
 <span className="text-xs text-slate-500">
 ${caregiver.hourlyRate}/hr
 </span>
 )}
 </div>
 {caregiver.profileCompletionPct > 0 && (
 <span className="text-xs text-slate-400">
 {Math.round(caregiver.profileCompletionPct)}% complete
 </span>
 )}
 </div>
 </div>
 </Link>
 );
}
