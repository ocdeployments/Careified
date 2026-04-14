'use client'

import { useState, useEffect } from 'react'
import { ChevronRight, AlertCircle } from 'lucide-react'
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

export default function Step2Services({ initialData }: { initialData?: any }) {
 const [services, setServices] = useState<string[]>(initialData?.services || [])
 const [specialties, setSpecialties] = useState<string[]>(initialData?.specializations || [])
 const [credentials, setCredentials] = useState<string[]>(initialData?.credentials || [])
 const [openCategory, setOpenCategory] = useState<string | null>('personal')
 const [saving, setSaving] = useState(false)

 const toggleItem = (list: string[], setList: (val: string[]) => void, item: string) => {
 setList(list.includes(item) ? list.filter(i => i !== item) : [...list, item])
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
 <div className="space-y-8">
 <div>
 <h3 className="text-[15px] font-black text-[#0D1B3E] mb-1">Services you provide</h3>
 <p className="text-[12.5px] text-[#64748B] mb-4">Select all that apply. Click a category to expand it.</p>
 <div className="flex flex-col gap-2">
 {SERVICE_CATEGORIES.map((cat) => {
 const selectedInCat = cat.services.filter(s => services.includes(s)).length
 const isOpen = openCategory === cat.id
 return (
 <div key={cat.id} className="border border-[#E2E8F0] rounded-xl overflow-hidden">
 <button onClick={() => setOpenCategory(isOpen ? null : cat.id)}
 className="w-full flex items-center justify-between px-4 py-3 bg-white hover:bg-[#F8FAFC] text-left">
 <div className="flex items-center gap-3">
 <span className="text-[13px] font-bold text-[#0D1B3E]">{cat.label}</span>
 {selectedInCat > 0 && (
 <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FDF6EC] text-[#92400E]">{selectedInCat}</span>
 )}
 </div>
 <ChevronRight className={`w-4 h-4 text-[#94A3B8] transition-transform ${isOpen ? 'rotate-90' : ''}`} />
 </button>
 {isOpen && (
 <div className="px-4 pb-4 pt-2 bg-[#F8FAFC] grid grid-cols-1 sm:grid-cols-2 gap-2">
 {cat.services.map((service) => (
 <label key={service} className={`flex items-center gap-2.5 p-2.5 rounded-lg cursor-pointer border text-[12px] ${
 services.includes(service) ? 'border-[#C9973A] bg-[#FDF6EC] text-[#92400E]' : 'border-transparent bg-white'
 }`}>
 <input type="checkbox" checked={services.includes(service)} onChange={() => toggleItem(services, setServices, service)} className="accent-[#C9973A] w-3.5 h-3.5" />
 {service}
 </label>
 ))}
 </div>
 )}
 </div>
 )
 })}
 </div>
 </div>

 <div>
 <h3 className="text-[15px] font-black text-[#0D1B3E] mb-1">Clinical specialties</h3>
 <p className="text-[12.5px] text-[#64748B] mb-4">Areas where you have specific training or experience.</p>
 <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
 {SPECIALTIES.map((spec) => (
 <label key={spec} className={`flex items-center gap-2.5 p-3 rounded-xl cursor-pointer border text-[12px] ${
 specialties.includes(spec) ? 'border-[#1E3A8A] bg-[#EFF6FF]' : 'border-[#E2E8F0] bg-white'
 }`}>
 <input type="checkbox" checked={specialties.includes(spec)} onChange={() => toggleItem(specialties, setSpecialties, spec)} className="accent-[#1E3A8A] w-3.5 h-3.5" />
 {spec}
 </label>
 ))}
 </div>
 </div>

 <div>
 <h3 className="text-[15px] font-black text-[#0D1B3E] mb-1">Professional credentials</h3>
 <p className="text-[12.5px] text-[#64748B] mb-4">Select your professional qualification.</p>
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
 {CREDENTIALS.map((cred) => (
 <label key={cred.id} className={`flex items-center gap-2.5 p-3 rounded-xl cursor-pointer border text-[12px] ${
 credentials.includes(cred.id) ? 'border-[#C9973A] bg-[#FDF6EC]' : 'border-[#E2E8F0] bg-white'
 }`}>
 <input type="checkbox" checked={credentials.includes(cred.id)} onChange={() => toggleItem(credentials, setCredentials, cred.id)} className="accent-[#C9973A] w-3.5 h-3.5" />
 {cred.label}
 </label>
 ))}
 </div>
 </div>

 <div className="p-4 rounded-xl bg-[#FDF6EC] border border-[#C9973A]/20 flex items-start gap-3">
 <AlertCircle className="w-4 h-4 text-[#C9973A] shrink-0 mt-0.5" />
 <p className="text-[12px] text-[#92400E]">Be honest about your specialties and credentials. Agencies verify claims.</p>
 </div>

 {saving && <p className="text-[11px] text-[#94A3B8]">Saving...</p>}
 </div>
 )
}
