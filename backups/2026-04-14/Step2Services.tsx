'use client'

import { useState, useEffect } from 'react'
import { AlertCircle } from 'lucide-react'
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

const SPECIALTIES = [
 "Dementia / Alzheimer's", "Parkinson's disease", "Memory care",
 "Palliative / end of life", "Post-hospital recovery", "Stroke recovery",
 "Mobility and transfer", "Medication management", "Complex personal care",
 "Behavioural support", "Diabetes management", "Mental health support",
 "Paediatric care", "Acquired brain injury", "Bariatric care",
 "Hospice support", "Wound care awareness",
]

const CREDENTIALS = [
 { id: 'psw', label: 'PSW — Personal Support Worker' },
 { id: 'rn', label: 'RN — Registered Nurse' },
 { id: 'lpn', label: 'LPN / LVN — Licensed Practical Nurse' },
 { id: 'cna', label: 'CNA — Certified Nursing Assistant' },
 { id: 'hha', label: 'HHA — Home Health Aide' },
 { id: 'nursing_student', label: 'Nursing Student (supervised practice)' },
 { id: 'ot_assistant', label: 'Occupational Therapy Assistant' },
 { id: 'pt_assistant', label: 'Physiotherapy Assistant' },
 { id: 'social_worker', label: 'Social Worker' },
 { id: 'hospital_support', label: 'Hospital Support Worker' },
 { id: 'no_credential', label: 'No formal credential — experienced carer' },
 { id: 'other', label: 'Other (specify in certifications)' },
]

export default function Step2Services({ initialData, onSave }: { initialData?: any; onSave?: (data: any) => void }) {
 const [services, setServices] = useState<string[]>(initialData?.services || [])
 const [specialties, setSpecialties] = useState<string[]>(initialData?.specializations || [])
 const [credentials, setCredentials] = useState<string[]>(initialData?.credentials || [])
 const [saving, setSaving] = useState(false)

 const toggleItem = (list: string[], setList: (val: string[]) => void, item: string) => {
   setList(list.includes(item) ? list.filter(i => i !== item) : [...list, item])
   // Save immediately for HTML forms
   setTimeout(async () => {
     setSaving(true)
     await saveStep2({ services: list.includes(item) ? list.filter(i => i !== item) : [...list, item], specializations: specialties, credentials })
     setSaving(false)
   }, 100)
 }

 useEffect(() => {
   const timer = setTimeout(async () => {
     if (services.length > 0 && credentials.length > 0) {
       setSaving(true)
       await saveStep2({ services, specializations: specialties, credentials })
       setSaving(false)
     }
   }, 1000)
   return () => clearTimeout(timer)
 }, [services, specialties, credentials])

 return (
   <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
     {/* Services Section - using HTML details/summary for JS-free toggle */}
     <div>
       <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0D1B3E', marginBottom: '4px' }}>Services you provide</h3>
       <p style={{ fontSize: '12.5px', color: '#64748B', marginBottom: '16px' }}>Select all that apply. Click a category to expand it.</p>
       
       <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
         {SERVICE_CATEGORIES.map((cat) => {
           const selectedCount = cat.services.filter(s => services.includes(s)).length
           return (
             <details key={cat.id} style={{ border: '1px solid #E2E8F0', borderRadius: '12px', overflow: 'hidden' }}>
               <summary style={{ 
                 padding: '12px 16px', 
                 background: 'white', 
                 cursor: 'pointer',
                 display: 'flex', 
                 justifyContent: 'space-between', 
                 alignItems: 'center',
                 listStyle: 'none'
               }}>
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
                   <label key={service} style={{ 
                     display: 'flex', 
                     alignItems: 'center', 
                     gap: '10px', 
                     padding: '10px', 
                     borderRadius: '8px', 
                     cursor: 'pointer',
                     border: services.includes(service) ? '1px solid #C9973A' : '1px solid transparent',
                     background: services.includes(service) ? '#FDF6EC' : 'white',
                   }}>
                     <input 
                       type="checkbox" 
                       checked={services.includes(service)} 
                       onChange={() => toggleItem(services, setServices, service)}
                       style={{ accentColor: '#C9973A', width: '14px', height: '14px' }}
                     />
                     <span style={{ fontSize: '12px', color: services.includes(service) ? '#92400E' : '#0D1B3E' }}>{service}</span>
                   </label>
                 ))}
               </div>
             </details>
           )
         })}
       </div>
     </div>

     {/* Specialties */}
     <div>
       <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0D1B3E', marginBottom: '4px' }}>Clinical specialties</h3>
       <p style={{ fontSize: '12.5px', color: '#64748B', marginBottom: '16px' }}>Areas where you have specific training or experience.</p>
       <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '8px' }}>
         {SPECIALTIES.map((spec) => (
           <label key={spec} style={{ 
             display: 'flex', 
             alignItems: 'center', 
             gap: '10px', 
             padding: '12px', 
             borderRadius: '12px', 
             cursor: 'pointer',
             border: specialties.includes(spec) ? '1px solid #1E3A8A' : '1px solid #E2E8F0',
             background: specialties.includes(spec) ? '#EFF6FF' : 'white',
           }}>
             <input 
               type="checkbox" 
               checked={specialties.includes(spec)} 
               onChange={() => toggleItem(specialties, setSpecialties, spec)}
               style={{ accentColor: '#1E3A8A', width: '14px', height: '14px' }}
             />
             <span style={{ fontSize: '12px', color: '#0D1B3E' }}>{spec}</span>
           </label>
         ))}
       </div>
     </div>

     {/* Credentials */}
     <div>
       <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0D1B3E', marginBottom: '4px' }}>Professional credentials</h3>
       <p style={{ fontSize: '12.5px', color: '#64748B', marginBottom: '16px' }}>Select your professional qualification.</p>
       <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '8px' }}>
         {CREDENTIALS.map((cred) => (
           <label key={cred.id} style={{ 
             display: 'flex', 
             alignItems: 'center', 
             gap: '10px', 
             padding: '12px', 
             borderRadius: '12px', 
             cursor: 'pointer',
             border: credentials.includes(cred.id) ? '1px solid #C9973A' : '1px solid #E2E8F0',
             background: credentials.includes(cred.id) ? '#FDF6EC' : 'white',
           }}>
             <input 
               type="checkbox" 
               checked={credentials.includes(cred.id)} 
               onChange={() => toggleItem(credentials, setCredentials, cred.id)}
               style={{ accentColor: '#C9973A', width: '14px', height: '14px' }}
             />
             <span style={{ fontSize: '12px', color: credentials.includes(cred.id) ? '#92400E' : '#0D1B3E' }}>{cred.label}</span>
           </label>
         ))}
       </div>
     </div>

     {/* Notice */}
     <div style={{ padding: '16px', borderRadius: '12px', background: '#FDF6EC', border: '1px solid rgba(201, 151, 58, 0.2)', display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
       <AlertCircle style={{ width: '16px', height: '16px', color: '#C9973A', flexShrink: 0, marginTop: '2px' }} />
       <p style={{ fontSize: '12px', color: '#92400E', margin: 0 }}>Be honest about your specialties and credentials. Agencies verify claims.</p>
     </div>

     {saving && <p style={{ fontSize: '11px', color: '#94A3B8' }}>Saving...</p>}
   </div>
 )
}
