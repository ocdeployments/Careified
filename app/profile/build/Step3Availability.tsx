'use client'

import { useState, useEffect } from 'react'
import { saveStep3 } from '@/lib/actions/profile'

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

const STATUSES = [
 { value: 'available_now', label: 'Available now', desc: 'Can start within 2 weeks' },
 { value: 'open_to_opportunities', label: 'Open to opportunities', desc: 'Currently employed but open' },
 { value: 'available_from', label: 'Available from a date', desc: 'Finishing current placement' },
 { value: 'not_available', label: 'Not currently available', desc: 'Keeping profile active' },
]

const PLACEMENT_TYPES = [
 'Permanent placement', 'Regular part-time', 'Casual / relief shifts', 'Live-in care',
 'Overnight care', 'Respite care', 'Block booking', 'Weekend specialist',
]

const LANGUAGES = ['English', 'Spanish', 'French', 'Tagalog', 'Mandarin', 'Hindi', 'Arabic', 'Portuguese', 'Other']

export default function Step3Availability({ initialData, onSave }: { initialData?: any; onSave?: (data: any) => void }) {
 const [status, setStatus] = useState(initialData?.availabilityStatus || '')
 const [availableFromDate, setAvailableFromDate] = useState(initialData?.availableFromDate || '')
 const [noticePeriod, setNoticePeriod] = useState(initialData?.noticePeriod || '')
 const [placementTypes, setPlacementTypes] = useState<string[]>(initialData?.placementTypes || [])
 const [willingLiveIn, setWillingLiveIn] = useState(initialData?.willingLiveIn || false)
 const [willingOvernight, setWillingOvernight] = useState(initialData?.willingOvernight || false)
 const [hasVehicle, setHasVehicle] = useState(initialData?.hasVehicle || false)
 const [travelRadius, setTravelRadius] = useState(initialData?.travelRadius || 15)
 const [city, setCity] = useState(initialData?.city || '')
 const [postalCode, setPostalCode] = useState(initialData?.postalCode || '')
 const [languages, setLanguages] = useState<string[]>(initialData?.additionalLanguages || [])
 const [saving, setSaving] = useState(false)

 const togglePlacement = (type: string) => {
   setPlacementTypes(placementTypes.includes(type) ? placementTypes.filter(t => t !== type) : [...placementTypes, type])
   setTimeout(async () => {
     setSaving(true)
     await saveStep3({
       availabilityStatus: status,
       availableFromDate,
       noticePeriod,
       placementTypes: placementTypes.includes(type) ? placementTypes.filter(t => t !== type) : [...placementTypes, type],
       weeklyAvailability: {},
       willingLiveIn,
       willingOvernight,
       hasVehicle,
       travelRadius,
       city,
       postalCode,
       additionalLanguages: languages,
     })
     setSaving(false)
   }, 500)
 }

 const toggleLanguage = (lang: string) => {
   setLanguages(languages.includes(lang) ? languages.filter(l => l !== lang) : [...languages, lang])
   setTimeout(async () => {
     setSaving(true)
     await saveStep3({
       availabilityStatus: status,
       availableFromDate,
       noticePeriod,
       placementTypes,
       weeklyAvailability: {},
       willingLiveIn,
       willingOvernight,
       hasVehicle,
       travelRadius,
       city,
       postalCode,
       additionalLanguages: languages.includes(lang) ? languages.filter(l => l !== lang) : [...languages, lang],
     })
     setSaving(false)
   }, 500)
 }

 useEffect(() => {
   const timer = setTimeout(async () => {
     if (status && city && postalCode) {
       setSaving(true)
       await saveStep3({
         availabilityStatus: status,
         availableFromDate,
         noticePeriod,
         placementTypes,
         weeklyAvailability: {},
         willingLiveIn,
         willingOvernight,
         hasVehicle,
         travelRadius,
         city,
         postalCode,
         additionalLanguages: languages,
       })
       setSaving(false)
     }
   }, 1000)
   return () => clearTimeout(timer)
 }, [status, availableFromDate, noticePeriod, placementTypes, willingLiveIn, willingOvernight, hasVehicle, travelRadius, city, postalCode, languages])

 return (
   <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
     {/* Availability Status */}
     <div>
       <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0D1B3E', marginBottom: '4px' }}>Availability status</h3>
       <p style={{ fontSize: '12.5px', color: '#64748B', marginBottom: '16px' }}>How soon can you start?</p>
       <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '12px' }}>
         {STATUSES.map((s) => (
           <label key={s.value} style={{ 
             display: 'flex', 
             alignItems: 'center', 
             gap: '12px', 
             padding: '16px', 
             borderRadius: '12px', 
             cursor: 'pointer',
             border: status === s.value ? '2px solid #C9973A' : '2px solid #E2E8F0',
             background: status === s.value ? '#FDF6EC' : 'white',
           }}>
             <input 
               type="radio" 
               name="status"
               checked={status === s.value} 
               onChange={() => setStatus(s.value)}
               style={{ accentColor: '#C9973A', width: '16px', height: '16px' }}
             />
             <div>
               <div style={{ fontSize: '13px', fontWeight: 700, color: '#0D1B3E' }}>{s.label}</div>
               <div style={{ fontSize: '11px', color: '#64748B' }}>{s.desc}</div>
             </div>
           </label>
         ))}
       </div>
     </div>

     {/* Location */}
     <div>
       <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0D1B3E', marginBottom: '4px' }}>Location</h3>
       <p style={{ fontSize: '12.5px', color: '#64748B', marginBottom: '16px' }}>Where are you based?</p>
       <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '12px' }}>
         <div>
           <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#0D1B3E', marginBottom: '8px' }}>City *</label>
           <input 
             type="text" 
             value={city}
             onChange={(e) => setCity(e.target.value)}
             placeholder="Frisco"
             style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #E2E8F0', fontSize: '13px' }}
           />
         </div>
         <div>
           <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#0D1B3E', marginBottom: '8px' }}>ZIP Code *</label>
           <input 
             type="text" 
             value={postalCode}
             onChange={(e) => setPostalCode(e.target.value)}
             placeholder="75034"
             style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #E2E8F0', fontSize: '13px' }}
           />
         </div>
       </div>
     </div>

     {/* Placement Types */}
     <div>
       <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0D1B3E', marginBottom: '4px' }}>Placement types</h3>
       <p style={{ fontSize: '12.5px', color: '#64748B', marginBottom: '16px' }}>What type of placements are you open to?</p>
       <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
         {PLACEMENT_TYPES.map((type) => (
           <button
             key={type}
             type="button"
             onClick={() => togglePlacement(type)}
             style={{
               padding: '8px 16px',
               borderRadius: '999px',
               fontSize: '12px',
               fontWeight: 500,
               border: placementTypes.includes(type) ? '2px solid #C9973A' : '2px solid #E2E8F0',
               background: placementTypes.includes(type) ? '#FDF6EC' : 'white',
              color: placementTypes.includes(type) ? '#92400E' : '#64748B',
               cursor: 'pointer',
             }}
           >
             {type}
           </button>
         ))}
       </div>
     </div>

     {/* Additional Languages */}
     <div>
       <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0D1B3E', marginBottom: '4px' }}>Additional languages</h3>
       <p style={{ fontSize: '12.5px', color: '#64748B', marginBottom: '16px' }}>Any other languages you speak?</p>
       <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
         {LANGUAGES.map((lang) => (
           <button
             key={lang}
             type="button"
             onClick={() => toggleLanguage(lang)}
             style={{
               padding: '8px 16px',
               borderRadius: '999px',
               fontSize: '12px',
               fontWeight: 500,
               border: languages.includes(lang) ? '2px solid #C9973A' : '2px solid #E2E8F0',
               background: languages.includes(lang) ? '#FDF6EC' : 'white',
               color: languages.includes(lang) ? '#92400E' : '#64748B',
               cursor: 'pointer',
             }}
           >
             {lang}
           </button>
         ))}
       </div>
     </div>

     {/* Transportation */}
     <div>
       <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0D1B3E', marginBottom: '4px' }}>Transportation</h3>
       <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
         <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
           <input 
             type="checkbox" 
             checked={hasVehicle} 
             onChange={(e) => setHasVehicle(e.target.checked)}
             style={{ accentColor: '#C9973A', width: '16px', height: '16px' }}
           />
           <span style={{ fontSize: '13px', color: '#0D1B3E' }}>Has vehicle</span>
         </label>
         <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
           <input 
             type="checkbox" 
             checked={willingOvernight} 
             onChange={(e) => setWillingOvernight(e.target.checked)}
             style={{ accentColor: '#C9973A', width: '16px', height: '16px' }}
           />
           <span style={{ fontSize: '13px', color: '#0D1B3E' }}>Willing to do overnight shifts</span>
         </label>
         <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
           <input 
             type="checkbox" 
             checked={willingLiveIn} 
             onChange={(e) => setWillingLiveIn(e.target.checked)}
             style={{ accentColor: '#C9973A', width: '16px', height: '16px' }}
           />
           <span style={{ fontSize: '13px', color: '#0D1B3E' }}>Willing for live-in care</span>
         </label>
       </div>
     </div>

     {saving && <p style={{ fontSize: '11px', color: '#94A3B8' }}>Saving...</p>}
   </div>
 )
}
