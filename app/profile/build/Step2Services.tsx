'use client'

import { useState, useEffect } from 'react'
import { saveStep2 } from '@/lib/actions/profile'

const SERVICE_CATEGORIES = [
 { id: 'personal', label: 'Personal Care', services: [
 'Bathing and showering assistance', 'Dressing and grooming assistance',
 'Oral hygiene and dental care', 'Hair care and styling', 'Nail care',
 'Shaving assistance', 'Continence care and incontinence management',
 'Skin care and moisturising', 'Personal hygiene support',
 ]},
 { id: 'mobility', label: 'Mobility and Physical Support', services: [
 'Mobility assistance (walking, standing)', 'Transfer assistance (bed to chair)',
 'Hoyer lift and mechanical lift operation', 'Wheelchair assistance',
 'Walker and cane assistance', 'Fall prevention and safety monitoring',
 'Range of motion exercises', 'Exercise assistance and encouragement',
 'Escort to appointments',
 ]},
 { id: 'nutrition', label: 'Nutrition and Hydration', services: [
 'Meal planning and preparation', 'Therapeutic diet meal prep',
 'Feeding assistance', 'Hydration monitoring', 'Grocery shopping',
 'Kitchen cleaning after meals', 'Special diet management',
 ]},
 { id: 'medication', label: 'Medication Support', services: [
 'Medication reminders', 'Medication pickup from pharmacy',
 'Medication organisation (pill boxes)',
 'Medication administration (where permitted)', 'Monitoring for side effects',
 ]},
 { id: 'household', label: 'Household Support', services: [
 'Light housekeeping', 'Laundry and folding', 'Linen changes',
 'Dishwashing', 'Vacuuming and mopping', 'Bathroom cleaning',
 'Grocery shopping', 'Errands and pickups',
 'Mail and correspondence management', 'Pet care assistance',
 ]},
 { id: 'companionship', label: 'Companionship and Emotional Support', services: [
 'Companionship and conversation', 'Reading aloud', 'Games and activities',
 'Cognitive stimulation activities', 'Music and entertainment',
 'Outdoor walks and fresh air', 'Community outing accompaniment',
 'Hobby support and engagement', 'Video calling family assistance',
 ]},
 { id: 'dementia', label: 'Dementia and Memory Care', services: [
 'Dementia care and support', "Alzheimer's care", 'Memory care activities',
 'Sundowning management', 'Wandering supervision', 'Behavioural support',
 'Reminiscence therapy activities', 'Safe environment monitoring',
 ]},
 { id: 'complex', label: 'Complex and Specialised Care', services: [
 'Post-hospital recovery support', 'Post-surgical care assistance',
 'Stroke recovery support', "Parkinson's care",
 'Palliative and end-of-life support', 'Hospice support care',
 'Respite care', 'Overnight care', 'Live-in care', '24-hour care',
 'Paediatric care support', 'Disability support',
 'Acquired brain injury support', 'Mental health support care',
 'Bariatric care assistance',
 ]},
 { id: 'safety', label: 'Safety and Monitoring', services: [
 'Safety supervision', 'Medication monitoring',
 'Vital signs monitoring (non-clinical)', 'Emergency response awareness',
 'Fall detection monitoring', 'Security check-ins', 'Telephone check-ins',
 ]},
 { id: 'transport', label: 'Transportation and Logistics', services: [
 'Medical appointment transportation', 'Non-emergency medical transportation',
 'Grocery and errand runs', 'Social outing transportation',
 'Prescription pickup', 'Banking and bill payment assistance',
 ]},
 { id: 'technology', label: 'Technology Assistance', services: [
 'Smartphone and tablet assistance', 'Video calling setup (FaceTime, Zoom)',
 'Smart TV operation', 'Computer assistance',
 'Medical alert device setup', 'Smart home device assistance',
 ]},
]

// Credentials that REQUIRE certifications in Step 4
const CREDENTIALS = [
 { id: 'rn', label: 'RN — Registered Nurse', requiredCert: 'Nursing License (RN/LPN)' },
 { id: 'lpn', label: 'LPN / LVN — Licensed Practical Nurse', requiredCert: 'Nursing License (RN/LPN)' },
 { id: 'cna', label: 'CNA — Certified Nursing Assistant', requiredCert: 'Certified Nursing Assistant (CNA)' },
 { id: 'hha', label: 'HHA — Home Health Aide', requiredCert: 'Home Health Aide (HHA)' },
 { id: 'psw', label: 'PSW — Personal Support Worker', requiredCert: 'PCA/PSW Certification' },
 { id: 'ot_assistant', label: 'Occupational Therapy Assistant', requiredCert: 'OTA Certification' },
 { id: 'pt_assistant', label: 'Physiotherapy Assistant', requiredCert: 'PTA Certification' },
 { id: 'social_worker', label: 'Social Worker', requiredCert: 'Social Work License' },
 { id: 'nursing_student', label: 'Nursing Student (supervised practice)', requiredCert: '' },
 { id: 'hospital_support', label: 'Hospital Support Worker', requiredCert: '' },
 { id: 'no_credential', label: 'No formal credential — experienced carer', requiredCert: '' },
 { id: 'other', label: 'Other (specify in certifications)', requiredCert: '' },
]

export default function Step2Services({ initialData, onSave }: { initialData?: any; onSave?: (data: any) => void }) {
 const [services, setServices] = useState<string[]>(initialData?.services || [])
 const [credentials, setCredentials] = useState<string[]>(initialData?.credentials || [])
 const [saving, setSaving] = useState(false)

 // Save credentials to localStorage for Step 4 to read
 useEffect(() => {
   localStorage.setItem('caregiver_credentials', JSON.stringify(credentials))
 }, [credentials])

 const toggleService = (service: string) => {
   const newServices = services.includes(service) ? services.filter(s => s !== service) : [...services, service]
   setServices(newServices)
   setTimeout(async () => {
     setSaving(true)
     await saveStep2({ services: newServices, credentials })
     setSaving(false)
   }, 500)
 }

 const toggleCredential = (credId: string) => {
   const newCreds = credentials.includes(credId) ? credentials.filter(c => c !== credId) : [...credentials, credId]
   setCredentials(newCreds)
   setTimeout(async () => {
     setSaving(true)
     await saveStep2({ services, credentials: newCreds })
     setSaving(false)
   }, 500)
 }

 // Auto-save
 useEffect(() => {
   const timer = setTimeout(async () => {
     if (services.length > 0 || credentials.length > 0) {
       setSaving(true)
       await saveStep2({ services, credentials })
       setSaving(false)
     }
   }, 1000)
   return () => clearTimeout(timer)
 }, [services, credentials])

 return (
   <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
     {/* Services Section */}
     <div>
       <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0D1B3E', marginBottom: '4px' }}>Services you provide</h3>
       <p style={{ fontSize: '12.5px', color: '#64748B', marginBottom: '16px' }}>Select all that apply. Click a category to expand it.</p>
       
       <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
         {SERVICE_CATEGORIES.map((cat) => {
           const selectedCount = cat.services.filter(s => services.includes(s)).length
           return (
             <details key={cat.id} style={{ border: '1px solid #E2E8F0', borderRadius: '12px', overflow: 'hidden' }}>
               <summary style={{ padding: '12px 16px', background: 'white', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', listStyle: 'none' }}>
                 <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                   <span style={{ fontSize: '13px', fontWeight: 700, color: '#0D1B3E' }}>{cat.label}</span>
                   {selectedCount > 0 && (
                     <span style={{ fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '999px', background: '#FDF6EC', color: '#92400E' }}>{selectedCount}</span>
                   )}
                 </div>
                 <span style={{ fontSize: '12px', color: '#94A3B8' }}>▼</span>
               </summary>
               <div style={{ padding: '12px', background: '#F8FAFC', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '8px' }}>
                 {cat.services.map((service) => (
                   <label key={service} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', borderRadius: '8px', cursor: 'pointer', border: '1px solid transparent', background: 'white' }}>
                     <input type="checkbox" checked={services.includes(service)} onChange={() => toggleService(service)} style={{ accentColor: '#C9973A', width: '14px', height: '14px' }} />
                     <span style={{ fontSize: '12px', color: '#0D1B3E' }}>{service}</span>
                   </label>
                 ))}
               </div>
             </details>
           )
         })}
       </div>
     </div>

     {/* Credentials Section - REQUIRED for Step 4 */}
     <div style={{ padding: '20px', background: '#FDF6EC', borderRadius: '16px', border: '1px solid rgba(201, 151, 58, 0.2)' }}>
       <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0D1B3E', marginBottom: '4px' }}>Your Credentials ⭐</h3>
       <p style={{ fontSize: '12.5px', color: '#64748B', marginBottom: '16px' }}>Select your primary credential. Step 4 will require proof of this credential.</p>
       
       <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '10px' }}>
         {CREDENTIALS.map((cred) => (
           <button
             key={cred.id}
             type="button"
             onClick={() => toggleCredential(cred.id)}
             style={{
               padding: '14px 16px',
               borderRadius: '12px',
               fontSize: '12px',
               fontWeight: 600,
               textAlign: 'left',
               border: credentials.includes(cred.id) ? '2px solid #C9973A' : '2px solid #E2E8F0',
               background: credentials.includes(cred.id) ? '#FDF6EC' : 'white',
               color: credentials.includes(cred.id) ? '#92400E' : '#0D1B3E',
               cursor: 'pointer',
             }}
           >
             {credentials.includes(cred.id) && '✓ '} {cred.label}
           </button>
         ))}
       </div>
       
       {credentials.length > 0 && (
         <p style={{ fontSize: '11px', color: '#C9973A', marginTop: '12px' }}>
           ✓ Selected: {credentials.map(c => CREDENTIALS.find(cc => cc.id === c)?.label).join(', ')}
         </p>
       )}
     </div>

     {/* Validation Message */}
     {services.length === 0 && (
       <div style={{ padding: '12px', background: '#FEF3C7', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
         <span style={{ fontSize: '12px', color: '#92400E' }}>⚠️ Please select at least one service you provide</span>
       </div>
     )}

     {saving && <p style={{ fontSize: '11px', color: '#94A3B8' }}>Saving...</p>}
   </div>
 )
}
