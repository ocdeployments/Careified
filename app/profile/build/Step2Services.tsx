'use client'

import { useState, useCallback } from 'react'
import { ChevronDown, ChevronUp, AlertCircle, Info } from 'lucide-react'
import { useProfileForm } from '@/lib/context/ProfileFormContext'
import { useProfileSave } from '@/lib/hooks/useProfileSave'

const FONT_SANS = "'DM Sans', sans-serif"
const FONT_SERIF = "'DM Serif Display', serif"

// Service categories - NOTE: Grocery shopping removed from Nutrition (lives in Household only)

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
 'Feeding assistance', 'Hydration monitoring',
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
 'Banking and bill payment assistance',
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
 'Behavioural redirection techniques', 'Reminiscence therapy activities',
 'Safe environment monitoring',
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
 { id: 'health', label: 'Health Monitoring', services: [
 'Vital signs monitoring (non-clinical)', 'Blood glucose monitoring awareness',
 'Oxygen equipment management', 'Wound care / post-surgical dressing',
 'Catheter care', 'Ostomy care', 'Safety supervision',
 'Emergency response awareness', 'Fall detection monitoring',
 ]},
 { id: 'transport', label: 'Transportation and Logistics', services: [
 'Medical appointment transportation', 'Non-emergency medical transportation',
 'Social outing transportation', 'Prescription pickup',
 ]},
 { id: 'technology', label: 'Technology Assistance', services: [
 'Smartphone and tablet assistance', 'Video calling setup (FaceTime, Zoom)',
 'Smart TV operation', 'Computer assistance',
 'Medical alert device setup', 'Smart home device assistance',
 ]},
]

const SPECIALIZATIONS = [
 "Dementia / Alzheimer's", "Parkinson's disease", 'Memory care',
 'Palliative / end of life', 'Post-hospital recovery', 'Stroke recovery',
 'Mobility and transfer', 'Medication management', 'Complex personal care',
 'Behavioural support', 'Diabetes management', 'Mental health support',
 'Paediatric care', 'Acquired brain injury', 'Bariatric care',
 'Hospice support', 'Wound care', 'Vital signs monitoring',
 'Catheter and ostomy care', 'Behavioural redirection',
]

const SKILL_LEVELS = [
 { value: 'learning', label: 'Learning', color: '#94A3B8' },
 { value: 'competent', label: 'Competent', color: '#2563EB' },
 { value: 'experienced', label: 'Experienced', color: '#C9973A' },
 { value: 'specialist', label: 'Specialist', color: '#16A34A' },
]

const CLIENT_TYPES = [
 'Elderly (65+)', 'Adults with disability', 'Paediatric / children',
 'Post-surgical recovery', 'End-of-life / palliative', 'Mental health',
 'Acquired brain injury', 'Dementia / memory care',
]

const DIETARY_OPTIONS = [
 'Halal', 'Kosher', 'Vegetarian', 'Vegan', 'Gluten-free',
 'Diabetic diet', 'Low-sodium', 'Low-fat / cardiac', 'Renal diet',
 'Pureed / soft foods', 'Culturally specific meals',
]

const YEARS_OPTIONS = [
 { value: 0, label: 'Less than 1 year' },
 { value: 1, label: '1–2 years' },
 { value: 3, label: '3–5 years' },
 { value: 5, label: '5–10 years' },
 { value: 10, label: '10–20 years' },
 { value: 20, label: '20+ years' },
]

const UNWILLING_TASKS = [
 'Ostomy care', 'Catheter care', 'Wound care / dressing changes',
 'Heavy lifting (bariatric)', 'Aggressive / violent behaviour',
 'Hoarding environments', 'Smoking environments',
 'End-of-life / grief-heavy situations', 'Aggressive family members',
 'High medical complexity', 'Multiple household members',
]

export default function Step2Services() {
 const { formData } = useProfileForm()
 const { saveField } = useProfileSave()

 const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({
 personal: true,
 })

 const services = formData.services || []
 const specializations = formData.specializations || []
 const skillRatings = formData.skillRatings || {}
 const clientTypes = formData.clientTypes || []
 const unwillingTasks = formData.unwillingTasks || []
 const dietaryCooking = formData.dietaryCooking || []
 const yearsExperience = formData.yearsExperience

 const toggleCategory = useCallback((id: string) => {
 setOpenCategories(prev => ({ ...prev, [id]: !prev[id] }))
 }, [])

 const toggleService = useCallback((service: string) => {
 const updated = services.includes(service)
 ? services.filter(s => s !== service)
 : [...services, service]
 saveField('services', updated)
 }, [services, saveField])

 const toggleSpecialization = useCallback((spec: string) => {
 const updated = specializations.includes(spec)
 ? specializations.filter(s => s !== spec)
 : [...specializations, spec]
 saveField('specializations', updated)

 if (specializations.includes(spec)) {
 const newRatings = { ...skillRatings }
 delete newRatings[spec]
 saveField('skillRatings', newRatings)
 }
 }, [specializations, skillRatings, saveField])

 const setSkillRating = useCallback((spec: string, level: string) => {
 saveField('skillRatings', { ...skillRatings, [spec]: level })
 }, [skillRatings, saveField])

 const toggleClientType = useCallback((type: string) => {
 const updated = clientTypes.includes(type)
 ? clientTypes.filter(t => t !== type)
 : [...clientTypes, type]
 saveField('clientTypes', updated)
 }, [clientTypes, saveField])

 const toggleUnwilling = useCallback((task: string) => {
 const updated = unwillingTasks.includes(task)
 ? unwillingTasks.filter(t => t !== task)
 : [...unwillingTasks, task]
 saveField('unwillingTasks', updated)
 }, [unwillingTasks, saveField])

 const toggleDietary = useCallback((option: string) => {
 const updated = dietaryCooking.includes(option)
 ? dietaryCooking.filter(d => d !== option)
 : [...dietaryCooking, option]
 saveField('dietaryCooking', updated)
 }, [dietaryCooking, saveField])

 return (
 <div style={{ fontFamily: FONT_SANS, display: 'flex', flexDirection: 'column', gap: '36px' }}>

 <div>
 <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#0D1B3E', marginBottom: '10px' }}>
 Total years of caregiving experience *
 </label>
 <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
 {YEARS_OPTIONS.map(opt => (
 <button key={opt.value} type="button" onClick={() => saveField('yearsExperience', opt.value)}
 style={{ padding: '8px 16px', borderRadius: '10px', fontSize: '12px', fontWeight: 600,
 border: yearsExperience === opt.value ? '2px solid #C9973A' : '2px solid #E2E8F0',
 background: yearsExperience === opt.value ? '#FDF6EC' : 'white',
 color: yearsExperience === opt.value ? '#92400E' : '#64748B',
 cursor: 'pointer', fontFamily: FONT_SANS }}>
 {opt.label}
 </button>
 ))}
 </div>
 </div>

 <div>
 <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0D1B3E', margin: '0 0 4px', fontFamily: FONT_SERIF }}>
 Services you provide
 </h3>
 <p style={{ fontSize: '12px', color: '#64748B', margin: '0 0 16px' }}>
 Select all that apply. Click a category to expand it.
 {services.length > 0 && <span style={{ color: '#C9973A', fontWeight: 700, marginLeft: '8px' }}>{services.length} selected</span>}
 </p>

 <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
 {SERVICE_CATEGORIES.map(cat => {
 const selectedInCat = cat.services.filter(s => services.includes(s)).length
 const isOpen = !!openCategories[cat.id]

 return (
 <div key={cat.id} style={{ border: '1px solid #E2E8F0', borderRadius: '12px', overflow: 'hidden' }}>
 <button type="button" onClick={() => toggleCategory(cat.id)}
 style={{ width: '100%', padding: '12px 16px', background: selectedInCat > 0 ? '#FAFDF7' : 'white',
 border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontFamily: FONT_SANS }}>
 <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
 <span style={{ fontSize: '13px', fontWeight: 700, color: '#0D1B3E' }}>{cat.label}</span>
 {selectedInCat > 0 && <span style={{ fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '999px', background: '#FDF6EC', color: '#92400E' }}>{selectedInCat} selected</span>}
 </div>
 {isOpen ? <ChevronUp size={16} color="#94A3B8" /> : <ChevronDown size={16} color="#94A3B8" />}
 </button>

 {isOpen && (
 <div style={{ padding: '12px', background: '#F8FAFC', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '6px' }}>
 {cat.services.map(service => (
 <label key={service} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 12px', borderRadius: '8px', cursor: 'pointer',
 border: services.includes(service) ? '1px solid #C9973A' : '1px solid transparent',
 background: services.includes(service) ? '#FDF6EC' : 'white', transition: 'all 0.1s' }}>
 <input type="checkbox" checked={services.includes(service)} onChange={() => toggleService(service)}
 style={{ accentColor: '#C9973A', width: '14px', height: '14px', flexShrink: 0 }} />
 <span style={{ fontSize: '12px', color: services.includes(service) ? '#92400E' : '#0D1B3E', fontWeight: services.includes(service) ? 600 : 400 }}>{service}</span>
 </label>
 ))}
 </div>
 )}
 </div>
 )
 })}
 </div>

 {services.length === 0 && (
 <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', borderRadius: '8px', background: '#FEF3C7', marginTop: '10px' }}>
 <AlertCircle size={14} color="#D97706" />
 <span style={{ fontSize: '12px', color: '#92400E' }}>Select at least one service to continue</span>
 </div>
 )}
 </div>

 <div>
 <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0D1B3E', margin: '0 0 4px', fontFamily: FONT_SERIF }}>Clinical specialties</h3>
 <p style={{ fontSize: '12px', color: '#64748B', margin: '0 0 4px' }}>Areas where you have specific training or experience.</p>
 <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 12px', borderRadius: '8px', background: '#EFF6FF', marginBottom: '16px' }}>
 <Info size={13} color="#2563EB" />
 <span style={{ fontSize: '11px', color: '#1E3A8A' }}>Be honest — agencies compare your claimed specialties against actual performance after placements.</span>
 </div>

 <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
 {SPECIALIZATIONS.map(spec => {
 const selected = specializations.includes(spec)
 const currentRating = skillRatings[spec]

 return (
 <div key={spec} style={{ border: selected ? '1px solid #C9973A' : '1px solid #E2E8F0', borderRadius: '10px', overflow: 'hidden', background: selected ? '#FDF6EC' : 'white', transition: 'all 0.15s' }}>
 <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px' }}>
 <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', flex: 1 }}>
 <input type="checkbox" checked={selected} onChange={() => toggleSpecialization(spec)} style={{ accentColor: '#C9973A', width: '14px', height: '14px', flexShrink: 0 }} />
 <span style={{ fontSize: '13px', fontWeight: selected ? 600 : 400, color: selected ? '#92400E' : '#0D1B3E' }}>{spec}</span>
 </label>

 {selected && (
 <div style={{ display: 'flex', gap: '4px', marginLeft: '12px' }}>
 {SKILL_LEVELS.map(level => (
 <button key={level.value} type="button" onClick={() => setSkillRating(spec, level.value)}
 style={{ padding: '3px 9px', borderRadius: '6px', fontSize: '10px', fontWeight: 700,
 border: currentRating === level.value ? '1.5px solid ' + level.color : '1.5px solid #E2E8F0',
 background: currentRating === level.value ? level.color : 'white',
 color: currentRating === level.value ? 'white' : '#94A3B8', cursor: 'pointer', fontFamily: FONT_SANS, transition: 'all 0.1s' }}>
 {level.label}
 </button>
 ))}
 </div>
 )}
 </div>
 </div>
 )
 })}
 </div>
 </div>

 <div>
 <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0D1B3E', margin: '0 0 4px', fontFamily: FONT_SERIF }}>Client types you have experience with</h3>
 <p style={{ fontSize: '12px', color: '#64748B', margin: '0 0 14px' }}>Select all that apply.</p>
 <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
 {CLIENT_TYPES.map(type => (
 <button key={type} type="button" onClick={() => toggleClientType(type)}
 style={{ padding: '8px 14px', borderRadius: '10px', fontSize: '12px', fontWeight: 500,
 border: clientTypes.includes(type) ? '2px solid #1E3A8A' : '2px solid #E2E8F0',
 background: clientTypes.includes(type) ? '#EFF6FF' : 'white',
 color: clientTypes.includes(type) ? '#1E3A8A' : '#64748B', cursor: 'pointer', fontFamily: FONT_SANS }}>
 {type}
 </button>
 ))}
 </div>
 </div>

 <div>
 <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0D1B3E', margin: '0 0 4px', fontFamily: FONT_SERIF }}>Dietary accommodations you can provide</h3>
 <p style={{ fontSize: '12px', color: '#64748B', margin: '0 0 14px' }}>Which special diets or food preparations can you accommodate?</p>
 <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
 {DIETARY_OPTIONS.map(option => (
 <button key={option} type="button" onClick={() => toggleDietary(option)}
 style={{ padding: '8px 14px', borderRadius: '10px', fontSize: '12px', fontWeight: 500,
 border: dietaryCooking.includes(option) ? '2px solid #C9973A' : '2px solid #E2E8F0',
 background: dietaryCooking.includes(option) ? '#FDF6EC' : 'white',
 color: dietaryCooking.includes(option) ? '#92400E' : '#64748B', cursor: 'pointer', fontFamily: FONT_SANS }}>
 {option}
 </button>
 ))}
 </div>
 </div>

 <div>
 <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0D1B3E', margin: '0 0 4px', fontFamily: FONT_SERIF }}>
 Tasks you prefer not to perform <span style={{ fontSize: '11px', fontWeight: 400, color: '#94A3B8', marginLeft: '8px' }}>optional</span>
 </h3>
 <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', padding: '10px 14px', borderRadius: '8px', background: '#F8FAFC', border: '1px solid #E2E8F0', marginBottom: '14px' }}>
 <Info size={13} color="#64748B" style={{ marginTop: '1px', flexShrink: 0 }} />
 <p style={{ fontSize: '11px', color: '#64748B', margin: 0, lineHeight: 1.5 }}>
 This is used for matching — not elimination. Agencies with clients who need these tasks will simply match with caregivers who are comfortable. Honesty prevents bad placements for everyone.
 </p>
 </div>
 <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
 {UNWILLING_TASKS.map(task => (
 <button key={task} type="button" onClick={() => toggleUnwilling(task)}
 style={{ padding: '7px 13px', borderRadius: '10px', fontSize: '12px', fontWeight: 500,
 border: unwillingTasks.includes(task) ? '2px solid #EF4444' : '2px solid #E2E8F0',
 background: unwillingTasks.includes(task) ? '#FEF2F2' : 'white',
 color: unwillingTasks.includes(task) ? '#DC2626' : '#64748B', cursor: 'pointer', fontFamily: FONT_SANS }}>
 {task}
 </button>
 ))}
 </div>
 </div>

 </div>
 )
}
