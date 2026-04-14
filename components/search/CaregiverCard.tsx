import { CaregiverSearchResult } from '@/lib/types/search';
import { Star, MapPin, Briefcase, Shield, Award } from 'lucide-react';

interface CaregiverCardProps {
 caregiver: CaregiverSearchResult;
}

export function CaregiverCard({ caregiver }: CaregiverCardProps) {
 
 const initials = `${caregiver.firstName[0] || ''}${caregiver.lastName[0] || ''}`.toUpperCase();
 
 const availabilityBadgeColor = caregiver.availabilityStatus === 'available_now'
  ? 'bg-green-100 text-green-700 border-green-200'
  : caregiver.availabilityStatus === 'open_to_opportunities'
  ? 'bg-amber-100 text-amber-700 border-amber-200'
  : 'bg-slate-100 text-slate-600 border-slate-200';
 
 return (
  <div className="bg-white rounded-2xl border border-slate-100 p-5 hover:border-blue-200 hover:shadow-lg transition-all">
   <div className="flex items-start gap-4 mb-4">
    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
     {caregiver.photoUrl ? (
      <img src={caregiver.photoUrl} alt="" className="w-full h-full rounded-full object-cover" />
     ) : (
      initials
     )}
    </div>
 
    <div className="flex-1 min-w-0">
     <h3 className="font-bold text-slate-900 text-base mb-1 truncate">
      {caregiver.firstName} {caregiver.lastName}
     </h3>
 
     <div className="flex items-center gap-2 text-sm text-slate-600 mb-2">
      {caregiver.credentials.length > 0 && (
       <>
        <span className="font-medium">{caregiver.credentials[0]}</span>
        <span className="text-slate-300">•</span>
       </>
      )}
      <span className="flex items-center gap-1">
       <Briefcase className="w-3.5 h-3.5" />
       {caregiver.yearsExperience}y exp
      </span>
     </div>
 
     <div className="flex items-center gap-2">
      {caregiver.score >= 3 && (
       <div className="flex items-center gap-1 text-sm">
        <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
        <span className="font-medium text-slate-900">{caregiver.score.toFixed(1)}</span>
       </div>
      )}
 
      <span className="text-slate-300">•</span>
 
      <div className="flex items-center gap-1 text-sm text-slate-600">
       <MapPin className="w-3.5 h-3.5" />
       {caregiver.city}, {caregiver.state}
      </div>
     </div>
    </div>
   </div>
 
   {caregiver.specialties.length > 0 && (
    <div className="mb-4">
     <div className="flex flex-wrap gap-1.5">
      {caregiver.specialties.map((specialty, idx) => (
       <span key={idx} className="text-xs px-2 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
        {specialty}
       </span>
      ))}
     </div>
    </div>
   )}
 
   <div className="mb-4">
    <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border ${availabilityBadgeColor}`}>
     <div className={`w-1.5 h-1.5 rounded-full ${caregiver.availabilityStatus === 'available_now' ? 'bg-green-600' : caregiver.availabilityStatus === 'open_to_opportunities' ? 'bg-amber-600' : 'bg-slate-400'}`} />
     {caregiver.availabilityLabel}
    </span>
   </div>
 
   <div className="flex items-center gap-3 mb-4 text-xs text-slate-600">
    {caregiver.hasReferences && (
     <div className="flex items-center gap-1">
      <Shield className="w-3.5 h-3.5 text-green-600" />
      <span>References</span>
     </div>
    )}
    {caregiver.hasBackgroundCheck && (
     <div className="flex items-center gap-1">
      <Shield className="w-3.5 h-3.5 text-green-600" />
      <span>Background check</span>
     </div>
    )}
    {caregiver.certificationCount > 0 && (
     <div className="flex items-center gap-1">
      <Award className="w-3.5 h-3.5 text-blue-600" />
      <span>{caregiver.certificationCount} certs</span>
     </div>
    )}
   </div>
 
   <button className="w-full py-2.5 px-4 rounded-xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 transition-colors">
    View Profile
   </button>
  </div>
 );
}
