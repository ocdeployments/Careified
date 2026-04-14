'use client'

import { useState, useEffect } from 'react'
import { saveStep3 } from '@/lib/actions/profile'

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

const SPECIALTIES = [
 "Dementia / Alzheimer's", "Parkinson's disease", "Memory care",
 "Palliative / end of life", "Post-hospital recovery", "Stroke recovery",
 "Mobility and transfer", "Medication management", "Complex personal care",
 "Behavioural support", "Diabetes management", "Mental health support",
 "Paediatric care", "Acquired brain injury", "Bariatric care",
 "Hospice support", "Wound care awareness",
]

// US ZIP to City lookup (free API)
async function lookupZIP(zip: string): Promise<{city: string, state: string} | null> {
  try {
    const cleanZip = zip.replace(/\D/g, '').substring(0, 5)
    if (cleanZip.length < 5) return null
    
    const res = await fetch(`https://api.zippopotam.us/us/${cleanZip}`)
    if (!res.ok) return null
    
    const data = await res.json()
    if (data.places && data.places[0]) {
      return {
        city: data.places[0]['place name'],
        state: data.places[0]['state abbreviation']
      }
    }
    return null
  } catch {
    return null
  }
}

export default function Step3Availability({ initialData, onSave }: { initialData?: any; onSave?: (data: any) => void }) {
 const [status, setStatus] = useState(initialData?.availabilityStatus || '')
 const [specialties, setSpecialties] = useState<string[]>(initialData?.specializations || [])
 const [placementTypes, setPlacementTypes] = useState<string[]>(initialData?.placementTypes || [])
 const [willingLiveIn, setWillingLiveIn] = useState(initialData?.willingLiveIn || false)
 const [willingOvernight, setWillingOvernight] = useState(initialData?.willingOvernight || false)
 const [hasVehicle, setHasVehicle] = useState(initialData?.hasVehicle || false)
 const [city, setCity] = useState(initialData?.city || '')
 const [state, setState] = useState(initialData?.state || '')
 const [zipCode, setZipCode] = useState(initialData?.postalCode || '')
 const [address, setAddress] = useState(initialData?.address || '')
 const [languages, setLanguages] = useState<string[]>(initialData?.additionalLanguages || [])
 const [saving, setSaving] = useState(false)
 const [lookingUp, setLookingUp] = useState(false)

 const saveData = async (updates: Partial<any>) => {
   setSaving(true)
   await saveStep3({
     availabilityStatus: status,
     placementTypes,
     weeklyAvailability: {},
     willingLiveIn,
     willingOvernight,
     hasVehicle,
     travelRadius: 15,
     city,
     state,
     postalCode: zipCode,
     address,
     additionalLanguages: languages,
     specializations: specialties,
     ...updates,
   })
   setSaving(false)
 }

 const handleZipChange = async (zip: string) => {
   setZipCode(zip)
   
   // Auto-lookup city when ZIP is 5+ digits
   if (zip.replace(/\D/g, '').length >= 5) {
     setLookingUp(true)
     const result = await lookupZIP(zip)
     if (result) {
       setCity(result.city)
       setState(result.state)
       // Save immediately
       await saveData({ postalCode: zip, city: result.city, state: result.state })
     }
     setLookingUp(false)
   }
 }

 const handleCityChange = async (newCity: string) => {
   setCity(newCity)
   
   // If city is entered and no ZIP, we can't auto-fill without an API
   // But we can still save
   if (newCity.length >= 2 && zipCode) {
     await saveData({ city: newCity })
   } else if (newCity.length >= 2) {
     // Save without ZIP - user can fill ZIP later
   }
 }

 const toggleSpecialty = (spec: string) => {
   const newSpecialties = specialties.includes(spec) 
     ? specialties.filter(s => s !== spec)
     : [...specialties, spec]
   setSpecialties(newSpecialties)
   saveData({ specializations: newSpecialties })
 }

 const togglePlacement = (type: string) => {
   const newTypes = placementTypes.includes(type)
     ? placementTypes.filter(t => t !== type)
     : [...placementTypes, type]
   setPlacementTypes(newTypes)
   saveData({ placementTypes: newTypes })
 }

 const toggleLanguage = (lang: string) => {
   const newLangs = languages.includes(lang)
     ? languages.filter(l => l !== lang)
     : [...languages, lang]
   setLanguages(newLangs)
   saveData({ additionalLanguages: newLangs })
 }

 return (
   <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
     {/* Clinical Specialties */}
     <div>
       <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0D1B3E', marginBottom: '4px' }}>Clinical Specialties ⭐</h3>
       <p style={{ fontSize: '12.5px', color: '#64748B', marginBottom: '16px' }}>Select areas where you have specific training or experience.</p>
       <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '8px' }}>
         {SPECIALTIES.map((spec) => (
           <button
             key={spec}
             type="button"
             onClick={() => toggleSpecialty(spec)}
             style={{
               padding: '10px 14px',
               borderRadius: '10px',
               fontSize: '12px',
               fontWeight: 500,
               border: specialties.includes(spec) ? '2px solid #C9973A' : '2px solid #E2E8F0',
               background: specialties.includes(spec) ? '#FDF6EC' : 'white',
               color: specialties.includes(spec) ? '#92400E' : '#0D1B3E',
               cursor: 'pointer',
               textAlign: 'left',
             }}
           >
            {specialties.includes(spec) && '✓ '} {spec}
           </button>
         ))}
       </div>
     </div>

     {/* Availability Status */}
     <div>
       <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0D1B3E', marginBottom: '4px' }}>Availability status</h3>
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
               onChange={() => { setStatus(s.value); saveData({ availabilityStatus: s.value }) }}
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

     {/* Location - Auto-lookup */}
     <div>
       <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0D1B3E', marginBottom: '4px' }}>Location 📍</h3>
       <p style={{ fontSize: '12.5px', color: '#64748B', marginBottom: '16px' }}>Enter your ZIP code - we'll auto-fill city and state!</p>
       
       <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '12px' }}>
         <div>
           <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#0D1B3E', marginBottom: '8px' }}>
             ZIP Code * {lookingUp && <span style={{ color: '#C9973A' }}>🔄 Looking up...</span>}
           </label>
           <input 
             type="text" 
             value={zipCode}
             onChange={(e) => handleZipChange(e.target.value)}
             placeholder="75034"
             maxLength={5}
             style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #E2E8F0', fontSize: '13px' }}
           />
         </div>
         <div>
           <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#0D1B3E', marginBottom: '8px' }}>City *</label>
           <input 
             type="text" 
             value={city}
             onChange={(e) => handleCityChange(e.target.value)}
             placeholder="Frisco"
             style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #E2E8F0', fontSize: '13px' }}
           />
         </div>
         <div>
           <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#0D1B3E', marginBottom: '8px' }}>State</label>
           <input 
             type="text" 
             value={state}
             onChange={(e) => { setState(e.target.value); saveData({ state: e.target.value }) }}
             placeholder="TX"
             maxLength={2}
             style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #E2E8F0', fontSize: '13px' }}
           />
         </div>
         <div style={{ gridColumn: '1 / -1' }}>
           <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#0D1B3E', marginBottom: '8px' }}>Street Address (optional)</label>
           <input 
             type="text" 
             value={address}
             onChange={(e) => { setAddress(e.target.value); saveData({ address: e.target.value }) }}
             placeholder="123 Main St, Apt 4"
             style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #E2E8F0', fontSize: '13px' }}
           />
         </div>
       </div>
     </div>

     {/* Placement Types */}
     <div>
       <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0D1B3E', marginBottom: '4px' }}>Placement types</h3>
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

     {/* Languages */}
     <div>
       <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0D1B3E', marginBottom: '4px' }}>Additional languages</h3>
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
             onChange={(e) => { setHasVehicle(e.target.checked); saveData({ hasVehicle: e.target.checked }) }}
             style={{ accentColor: '#C9973A', width: '16px', height: '16px' }}
           />
           <span style={{ fontSize: '13px', color: '#0D1B3E' }}>Has vehicle</span>
         </label>
         <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
           <input 
             type="checkbox" 
             checked={willingOvernight} 
             onChange={(e) => { setWillingOvernight(e.target.checked); saveData({ willingOvernight: e.target.checked }) }}
             style={{ accentColor: '#C9973A', width: '16px', height: '16px' }}
           />
           <span style={{ fontSize: '13px', color: '#0D1B3E' }}>Willing overnight shifts</span>
         </label>
         <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
           <input 
             type="checkbox" 
             checked={willingLiveIn} 
             onChange={(e) => { setWillingLiveIn(e.target.checked); saveData({ willingLiveIn: e.target.checked }) }}
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
