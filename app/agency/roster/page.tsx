import Link from 'next/link';
import { Pool } from 'pg';

export const dynamic = 'force-dynamic';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://careified_user:nFvV7KEqXSX9unj8X7BPdGlIZokqWqi6@dpg-d7fd1jflk1mc73dbjdn0-a.oregon-postgres.render.com/careified',
  ssl: { rejectUnauthorized: false }
});

export default async function RosterPage() {
 
 const relationships = await pool.query(`
   SELECT 
    r.id,
    r."startDate",
    r."currentlyEmployed",
    r."totalShifts",
    r."noShowCount",
    c.id as caregiver_id,
    c."firstName",
    c."lastName",
    c."profilePhotoUrl",
    c.credentials,
    c.city,
    c.state
   FROM agency_caregiver_relationships r
   JOIN caregivers c ON c.id = r."caregiverId"
   ORDER BY r."currentlyEmployed" DESC, r."createdAt" DESC
 `);
 
 return (
  <div className="min-h-screen bg-slate-50 py-8 px-4">
   <div className="max-w-7xl mx-auto">
 
    <div className="mb-8">
     <h1 className="text-2xl font-bold text-slate-900 mb-2">Your Roster</h1>
     <p className="text-slate-600">
      {relationships.rows.length} {relationships.rows.length === 1 ? 'caregiver' : 'caregivers'} on your roster
     </p>
    </div>
 
    {relationships.rows.length === 0 ? (
     <div className="text-center py-20">
      <p className="text-slate-600 mb-4">No caregivers on your roster yet</p>
      <Link
       href="/agency/search"
       className="inline-block px-6 py-3 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700"
      >
       Search Caregivers
      </Link>
     </div>
    ) : (
     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {relationships.rows.map((rel) => {
       const initials = `${rel.firstName?.[0] || ''}${rel.lastName?.[0] || ''}`.toUpperCase();
       
       return (
        <div key={rel.id} className="bg-white rounded-2xl border border-slate-100 p-5">
 
         <div className="flex items-start gap-3 mb-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold flex-shrink-0">
           {rel.profilePhotoUrl ? (
            <img src={rel.profilePhotoUrl} alt="" className="w-full h-full rounded-full object-cover" />
           ) : (
            initials
           )}
          </div>
 
          <div className="flex-1 min-w-0">
           <h3 className="font-bold text-slate-900 truncate">{rel.firstName} {rel.lastName}</h3>
           <p className="text-xs text-slate-600">{rel.city}, {rel.state}</p>
          </div>
 
          <div className={`w-2 h-2 rounded-full flex-shrink-0 mt-2 ${rel.currentlyEmployed ? 'bg-green-500' : 'bg-slate-400'}`} />
         </div>
 
         <div className="grid grid-cols-2 gap-2 mb-4">
          <div className="p-2 bg-slate-50 rounded-lg">
           <p className="text-xs text-slate-500">Shifts</p>
           <p className="text-lg font-bold text-slate-900">{rel.totalShifts}</p>
          </div>
          <div className="p-2 bg-slate-50 rounded-lg">
           <p className="text-xs text-slate-500">No-shows</p>
           <p className="text-lg font-bold text-slate-900">{rel.noShowCount}</p>
          </div>
         </div>
 
         <Link
          href={`/agency/profile/${rel.caregiver_id}`}
          className="block w-full text-center py-2 px-4 rounded-xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700"
         >
          View Record
         </Link>
        </div>
       );
      })}
     </div>
    )}
   </div>
  </div>
 );
 }
