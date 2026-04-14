import { Pool } from 'pg';
import { notFound } from 'next/navigation';
import { Star, MapPin, Briefcase, Shield, CheckCircle, Calendar } from 'lucide-react';
import { PrivateRelationshipPanel } from '@/components/agency/PrivateRelationshipPanel';
import { RatingsDisplay } from '@/components/caregiver/RatingsDisplay';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://careified_user:Careified2024@187.124.227.63:5432/careified'
});

interface ProfilePageProps {
 params: Promise<{ id: string }>;
}

export default async function CaregiverProfilePage({ params }: ProfilePageProps) {
 const { id } = await params;

 // Fetch caregiver data
 const result = await pool.query(`
   SELECT * FROM caregivers WHERE id = $1 AND status = 'approved'
 `, [id]);

 const caregiver = result.rows[0];

 if (!caregiver) {
 notFound();
 }

 const initials = `${caregiver.firstName?.[0] || ''}${caregiver.lastName?.[0] || ''}`.toUpperCase();

 // Get certifications
 const certs = await pool.query(`
   SELECT * FROM caregiver_certifications WHERE "caregiverId" = $1
 `, [id]);

 // Get references
 const refs = await pool.query(`
   SELECT * FROM caregiver_references WHERE "caregiverId" = $1
 `, [id]);

 return (
  <div className="min-h-screen bg-slate-50 py-8 px-4">
   <div className="max-w-7xl mx-auto">

   <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

   {/* LEFT COLUMN - Public Profile */}
   <div className="lg:col-span-2 space-y-6">

   {/* Header Card */}
   <div className="bg-white rounded-2xl border border-slate-100 p-6">
    <div className="flex items-start gap-6">
     <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-2xl flex-shrink-0">
      {caregiver.profilePhotoUrl ? (
       <img src={caregiver.profilePhotoUrl} alt="" className="w-full h-full rounded-full object-cover" />
      ) : (
       initials
      )}
     </div>

     <div className="flex-1">
      <h1 className="text-2xl font-bold text-slate-900 mb-2">
       {caregiver.firstName} {caregiver.lastName}
      </h1>

      <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600 mb-4">
       {caregiver.credentials && caregiver.credentials.length > 0 && (
        <>
         <span className="font-medium text-blue-600">{caregiver.credentials[0]}</span>
         <span className="text-slate-300">•</span>
        </>
       )}
       <span className="flex items-center gap-1"><Briefcase className="w-4 h-4" />{caregiver.yearsExperience} years experience</span>
       <span className="text-slate-300">•</span>
       <span className="flex items-center gap-1"><MapPin className="w-4 h-4" />{caregiver.city}, {caregiver.state}</span>
      </div>

      {caregiver.score && caregiver.score >= 3 && (
       <div className="flex items-center gap-2">
        <div className="flex items-center gap-1">
         {[1, 2, 3, 4, 5].map((star) => (
          <Star key={star} className={`w-5 h-5 ${star <= Math.floor(caregiver.score) ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} />
         ))}
        </div>
        <span className="text-sm font-medium text-slate-900">{Number(caregiver.score).toFixed(1)} Trust Score</span>
       </div>
      )}

      <div className="flex flex-wrap gap-2 mt-4">
       <span className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full bg-green-50 text-green-700 border border-green-200">
        <CheckCircle className="w-3.5 h-3.5" />Admin Approved
       </span>
       {refs.rows.length > 0 && (
        <span className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
         <Shield className="w-3.5 h-3.5" />{refs.rows.length} References
        </span>
       )}
      </div>
     </div>
    </div>
   </div>

   {/* Bio */}
   {caregiver.bio && (
    <div className="bg-white rounded-2xl border border-slate-100 p-6">
     <h2 className="text-lg font-bold text-slate-900 mb-3">About</h2>
     <p className="text-sm text-slate-700 leading-relaxed">{caregiver.bio}</p>
    </div>
   )}

   {/* Specialties */}
   {caregiver.specialties && caregiver.specialties.length > 0 && (
    <div className="bg-white rounded-2xl border border-slate-100 p-6">
     <h2 className="text-lg font-bold text-slate-900 mb-3">Specialties</h2>
     <div className="flex flex-wrap gap-2">
      {caregiver.specialties.map((spec: string, idx: number) => (
       <span key={idx} className="px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 text-sm font-medium border border-blue-100">
        {spec}
       </span>
      ))}
     </div>
    </div>
   )}

   {/* Certifications */}
   {certs.rows.length > 0 && (
    <div className="bg-white rounded-2xl border border-slate-100 p-6">
     <h2 className="text-lg font-bold text-slate-900 mb-3">Certifications</h2>
     <div className="space-y-3">
      {certs.rows.map((cert: any, idx: number) => (
       <div key={idx} className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl">
        <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
         <p className="font-medium text-slate-900 text-sm">{cert.certification}</p>
         <p className="text-xs text-slate-600">{cert.issuingOrg}</p>
        </div>
        <span className="text-xs font-medium px-2 py-1 rounded-full bg-green-100 text-green-700">{cert.status}</span>
       </div>
      ))}
     </div>
    </div>
   )}

   {/* Availability */}
   <div className="bg-white rounded-2xl border border-slate-100 p-6">
    <h2 className="text-lg font-bold text-slate-900 mb-3">Availability</h2>
    <div className="flex items-center gap-3">
     <Calendar className="w-5 h-5 text-slate-400" />
     <div>
      <p className="text-sm font-medium text-slate-900">Status</p>
      <p className="text-sm text-slate-600">
       {caregiver.availability_status === 'available_now' && 'Available now (within 2 weeks)'}
       {caregiver.availability_status === 'open_to_opportunities' && 'Open to opportunities'}
       {(!caregiver.availability_status || caregiver.availability_status === 'not_available') && 'Not currently available'}
      </p>
     </div>
    </div>
   </div>

   {/* Ratings Section */}
   <RatingsDisplay caregiverId={id} />
   </div>

   <div className="lg:col-span-1">
    <PrivateRelationshipPanel caregiverId={id} />
   </div>
   </div>
   </div>
  </div>
 );
}
