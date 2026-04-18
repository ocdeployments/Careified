'use client'
import { useProfileForm } from '@/lib/context/ProfileFormContext'
import { useProfileSave } from '@/lib/hooks/useProfileSave'
import { AlertCircle } from 'lucide-react'

const FONT_SANS = "'Inter', sans-serif"
const FONT_SERIF = "'Inter', sans-serif"

const AVAILABILITY_STATUSES = [
 { value: 'available_now', label: 'Available now', desc: 'Can start within 2 weeks', dot: '#16A34A' },
 { value: 'open_to_opportunities', label: 'Open to opportunities', desc: 'Employed but open to new roles', dot: '#D97706' },
 { value: 'available_from', label: 'Available from a date', desc: 'Finishing a current placement', dot: '#2563EB' },
 { value: 'not_available', label: 'Not currently available', desc: 'Keeping profile active only', dot: '#94A3B8' },
]

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const SHIFTS = ['Morning', 'Afternoon', 'Evening', 'Overnight']

const PLACEMENT_TYPES = [
 'Permanent placement', 'Regular part-time', 'Casual / relief shifts',
 'Live-in care', 'Overnight care', 'Respite care',
 'Block booking', 'Weekend specialist',
]

const EMPLOYMENT_TYPES = [
 { value: 'full_time', label: 'Full-time' },
 { value: 'part_time', label: 'Part-time' },
 { value: 'casual', label: 'Casual / PRN' },
 { value: 'contract', label: 'Contract' },
 { value: 'any', label: 'Open to any' },
]

const NOTICE_OPTIONS = [
 { value: 'immediately', label: 'Immediately' },
 { value: '1_week', label: '1 week' },
 { value: '2_weeks', label: '2 weeks' },
 { value: '1_month', label: '1 month' },
 { value: 'flexible', label: 'Flexible' },
]

const AGE_GROUPS = [
 'Elderly (65+)', 'Adults (18–64)', 'Paediatric / children',
 'End-of-life / palliative', 'No preference',
]

const CARE_SETTINGS = [
 'Private home', 'Retirement community', 'Assisted living facility',
 'Memory care facility', 'Hospital support', 'Hospice', 'Group home',
]

const HOURS_OPTIONS = [5, 10, 15, 20, 25, 30, 35, 40]

export default function Step3Availability() {
 const { formData } = useProfileForm()
 const { saveField } = useProfileSave()

 const availabilityStatus = formData.availabilityStatus || ''
 const weeklyGrid = formData.weeklyGrid || {}
 const minHours = formData.minHoursPerWeek
 const maxHours = formData.maxHoursPerWeek
 const placementTypes = formData.placementTypes || []
 const employmentType = formData.employmentType
 const hourlyRateMin = formData.hourlyRateMin
 const hourlyRateMax = formData.hourlyRateMax
 const preferredAgeGroup = formData.preferredAgeGroup
 const preferredSettings = formData.preferredSettings || []

 const toggleGridCell = (day: string, shift: string) => {
   const key = day + '_' + shift
   const currentValue = weeklyGrid[key]
   const currentArray: string[] = Array.isArray(currentValue) ? currentValue : []
   const updated = { ...weeklyGrid }
   if (currentArray.includes(shift)) {
     updated[key] = currentArray.filter(s => s !== shift)
   } else {
     updated[key] = [...currentArray, shift]
   }
   saveField('weeklyGrid', updated)
 }

 const isGridCellActive = (day: string, shift: string): boolean => {
   const key = day + '_' + shift
   const cellValue = weeklyGrid[key]
   return Array.isArray(cellValue) && cellValue.includes(shift)
 }

 const togglePlacement = (type: string) => {
   const updated = placementTypes.includes(type)
     ? placementTypes.filter(t => t !== type)
     : [...placementTypes, type]
   saveField('placementTypes', updated)
 }

 const toggleSettings = (setting: string) => {
   const updated = preferredSettings.includes(setting)
     ? preferredSettings.filter(s => s !== setting)
     : [...preferredSettings, setting]
   saveField('preferredSettings', updated)
 }

 const renderToggle = (checked: boolean | undefined, onClick: () => void) => (
   <div onClick={onClick} style={{
     width: 44, height: 24, borderRadius: 999, cursor: 'pointer',
     background: checked ? '#C9973A' : '#E2E8F0', position: 'relative', transition: 'all 0.2s ease'
   }}>
     <div style={{
       width: 18, height: 18, borderRadius: '50%', background: 'white',
       boxShadow: '0 1px 3px rgba(0,0,0,0.2)', position: 'absolute', top: 3,
       transform: checked ? 'translateX(22px)' : 'translateX(2px)', transition: 'all 0.2s ease'
     }} />
   </div>
 )

 return (
   <div style={{ fontFamily: FONT_SANS, display: 'flex', flexDirection: 'column', gap: '32px' }}>

     <div>
       <h3 style={{ fontSize: '15px', fontWeight: 800, fontFamily: FONT_SERIF, color: '#0D1B3E', margin: '0 0 4px' }}>Availability status</h3>
       <p style={{ fontSize: '12px', color: '#64748B', margin: '0 0 16px' }}>When can you start?</p>
       <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '12px' }}>
         {AVAILABILITY_STATUSES.map(s => (
           <label key={s.value} onClick={() => saveField('availabilityStatus', s.value)}
             style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', borderRadius: '12px', cursor: 'pointer',
               border: availabilityStatus === s.value ? '2px solid #C9973A' : '1px solid #E2E8F0',
               background: availabilityStatus === s.value ? '#FDF6EC' : 'white' }}>
             <div style={{ width: 10, height: 10, borderRadius: '50%', background: s.dot, flexShrink: 0 }} />
             <div>
               <div style={{ fontSize: '13px', fontWeight: 700, color: '#0D1B3E' }}>{s.label}</div>
               <div style={{ fontSize: '11px', color: '#64748B' }}>{s.desc}</div>
             </div>
           </label>
         ))}
       </div>

       {availabilityStatus === 'available_from' && (
         <div style={{ marginTop: '16px' }}>
           <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#0D1B3E', marginBottom: '8px' }}>Earliest start date</label>
           <input type="date" onChange={(e) => saveField('earliestStartDate', e.target.value)}
             value={formData.earliestStartDate || ''}
             style={{ padding: '12px', borderRadius: '12px', border: '1px solid #E2E8F0', fontSize: '13px', fontFamily: FONT_SANS }} />
         </div>
       )}

       {availabilityStatus === 'open_to_opportunities' && (
         <div style={{ marginTop: '16px' }}>
           <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#0D1B3E', marginBottom: '8px' }}>Notice period</label>
           <select onChange={(e) => saveField('noticePeriod', e.target.value)} value={formData.noticePeriod || ''}
             style={{ padding: '12px', borderRadius: '12px', border: '1px solid #E2E8F0', fontSize: '13px', fontFamily: FONT_SANS, width: '100%', maxWidth: 300 }}>
             <option value="">Select notice period</option>
             {NOTICE_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
           </select>
         </div>
       )}
     </div>

     <div>
       <h3 style={{ fontSize: '15px', fontWeight: 800, fontFamily: FONT_SERIF, color: '#0D1B3E', margin: '0 0 4px' }}>Weekly availability</h3>
       <p style={{ fontSize: '12px', color: '#64748B', margin: '0 0 16px' }}>Select your available shifts.</p>

       <div style={{ overflowX: 'auto', paddingBottom: '8px' }}>
         <table style={{ borderCollapse: 'collapse', minWidth: 500 }}>
           <thead>
             <tr>
               <th style={{ padding: '8px' }}></th>
               {DAYS.map(day => <th key={day} style={{ padding: '8px', fontSize: '11px', fontWeight: 700, color: '#64748B', textAlign: 'center' }}>{day}</th>)}
             </tr>
           </thead>
           <tbody>
             {SHIFTS.map(shift => (
               <tr key={shift}>
                 <td style={{ padding: '8px', fontSize: '11px', fontWeight: 600, color: '#64748B', whiteSpace: 'nowrap' }}>{shift}</td>
                 {DAYS.map(day => {
                   const isActive = isGridCellActive(day, shift)
                   return (
                     <td key={day + '_' + shift} style={{ padding: '4px', textAlign: 'center' }}>
                       <button type="button" onClick={() => toggleGridCell(day, shift)}
                         style={{
                           width: 36, height: 36, borderRadius: '8px', border: isActive ? 'none' : '1px solid #E2E8F0',
                           background: isActive ? 'linear-gradient(135deg, #C9973A, #E8B86D)' : 'white',
                           color: isActive ? '#0D1B3E' : '#94A3B8', fontWeight: isActive ? 800 : 400, cursor: 'pointer',
                           fontSize: '16px', transition: 'all 0.15s'
                         }}>
                         {isActive ? '✓' : ''}
                       </button>
                     </td>
                   )
                 })}
               </tr>
             ))}
           </tbody>
         </table>
       </div>

       <div style={{ display: 'flex', gap: '24px', marginTop: '20px', flexWrap: 'wrap' }}>
         <div>
           <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#0D1B3E', marginBottom: '8px' }}>Min hours/week</label>
           <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
             {HOURS_OPTIONS.map(h => (
               <button key={h} type="button" onClick={() => saveField('minHoursPerWeek', h)}
                 style={{
                   padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 600,
                   border: minHours === h ? '2px solid #C9973A' : '1px solid #E2E8F0',
                   background: minHours === h ? '#FDF6EC' : 'white',
                   color: minHours === h ? '#92400E' : '#64748B', cursor: 'pointer', fontFamily: FONT_SANS
                 }}>{h}h</button>
             ))}
           </div>
         </div>
         <div>
           <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#0D1B3E', marginBottom: '8px' }}>Max hours/week</label>
           <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
             {HOURS_OPTIONS.map(h => (
               <button key={h} type="button" onClick={() => saveField('maxHoursPerWeek', h)}
                 style={{
                   padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 600,
                   border: maxHours === h ? '2px solid #C9973A' : '1px solid #E2E8F0',
                   background: maxHours === h ? '#FDF6EC' : 'white',
                   color: maxHours === h ? '#92400E' : '#64748B', cursor: 'pointer', fontFamily: FONT_SANS
                 }}>{h}h</button>
             ))}
           </div>
         </div>
       </div>

       <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '16px', padding: '12px 16px', background: '#F8FAFC', borderRadius: '12px' }}>
         <span style={{ fontSize: '13px', color: '#0D1B3E', fontWeight: 500 }}>Available on public holidays</span>
         {renderToggle(formData.holidayAvailable, () => saveField('holidayAvailable', !formData.holidayAvailable))}
       </div>
     </div>

     <div>
       <h3 style={{ fontSize: '15px', fontWeight: 800, fontFamily: FONT_SERIF, color: '#0D1B3E', margin: '0 0 4px' }}>Placement types</h3>
       <p style={{ fontSize: '12px', color: '#64748B', margin: '0 0 14px' }}>What type of placements are you open to?</p>
       <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
         {PLACEMENT_TYPES.map(type => (
           <button key={type} type="button" onClick={() => togglePlacement(type)}
             style={{
               padding: '8px 16px', borderRadius: '999px', fontSize: '12px', fontWeight: 500,
               border: placementTypes.includes(type) ? '2px solid #C9973A' : '1px solid #E2E8F0',
               background: placementTypes.includes(type) ? '#FDF6EC' : 'white',
               color: placementTypes.includes(type) ? '#92400E' : '#64748B', cursor: 'pointer', fontFamily: FONT_SANS
             }}>{type}</button>
         ))}
       </div>
     </div>

     <div>
       <h3 style={{ fontSize: '15px', fontWeight: 800, fontFamily: FONT_SERIF, color: '#0D1B3E', margin: '0 0 4px' }}>Employment type</h3>
       <p style={{ fontSize: '12px', color: '#64748B', margin: '0 0 14px' }}>What type of employment are you seeking?</p>
       <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
         {EMPLOYMENT_TYPES.map(emp => (
           <button key={emp.value} type="button" onClick={() => saveField('employmentType', emp.value)}
             style={{
               padding: '8px 16px', borderRadius: '999px', fontSize: '12px', fontWeight: 500,
               border: employmentType === emp.value ? '2px solid #C9973A' : '1px solid #E2E8F0',
               background: employmentType === emp.value ? '#FDF6EC' : 'white',
               color: employmentType === emp.value ? '#92400E' : '#64748B', cursor: 'pointer', fontFamily: FONT_SANS
             }}>{emp.label}</button>
         ))}
       </div>
     </div>

     <div>
       <h3 style={{ fontSize: '15px', fontWeight: 800, fontFamily: FONT_SERIF, color: '#0D1B3E', margin: '0 0 4px' }}>Hourly rate</h3>
       <p style={{ fontSize: '12px', color: '#64748B', margin: '0 0 14px' }}>Your rate range.</p>
       <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
         <div style={{ position: 'relative' }}>
           <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748B', fontSize: '13px' }}>$</span>
           <input type="number" min="15" max="200" step="1" placeholder="Min"
             value={hourlyRateMin || ''} onBlur={(e) => saveField('hourlyRateMin', parseInt(e.target.value) || null)}
             style={{ padding: '12px 12px 12px 28px', borderRadius: '12px', border: '1px solid #E2E8F0', fontSize: '13px', width: 100, fontFamily: FONT_SANS }} />
         </div>
         <span style={{ color: '#64748B' }}>to</span>
         <div style={{ position: 'relative' }}>
           <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748B', fontSize: '13px' }}>$</span>
           <input type="number" min="15" max="200" step="1" placeholder="Max"
             value={hourlyRateMax || ''} onBlur={(e) => saveField('hourlyRateMax', parseInt(e.target.value) || null)}
             style={{ padding: '12px 12px 12px 28px', borderRadius: '12px', border: '1px solid #E2E8F0', fontSize: '13px', width: 100, fontFamily: FONT_SANS }} />
         </div>
         <span style={{ color: '#64748B', fontSize: '13px' }}>/hr</span>
       </div>
       <p style={{ fontSize: '11px', color: '#94A3B8', marginTop: '8px' }}>Rate is shown to agencies as a range. Exact figure only visible after shortlist.</p>
     </div>

     <div>
       <h3 style={{ fontSize: '15px', fontWeight: 800, fontFamily: FONT_SERIF, color: '#0D1B3E', margin: '0 0 4px' }}>Client preferences</h3>
       
       <div style={{ marginBottom: '20px' }}>
         <p style={{ fontSize: '12px', color: '#64748B', margin: '0 0 10px' }}>Preferred client age group</p>
         <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
           {AGE_GROUPS.map(age => (
             <button key={age} type="button" onClick={() => saveField('preferredAgeGroup', age)}
               style={{
                 padding: '8px 14px', borderRadius: '10px', fontSize: '12px', fontWeight: 500,
                 border: preferredAgeGroup === age ? '2px solid #C9973A' : '1px solid #E2E8F0',
                 background: preferredAgeGroup === age ? '#FDF6EC' : 'white',
                 color: preferredAgeGroup === age ? '#92400E' : '#64748B', cursor: 'pointer', fontFamily: FONT_SANS
               }}>{age}</button>
           ))}
         </div>
       </div>

       <div>
         <p style={{ fontSize: '12px', color: '#64748B', margin: '0 0 10px' }}>Preferred care settings</p>
         <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
           {CARE_SETTINGS.map(setting => (
             <button key={setting} type="button" onClick={() => toggleSettings(setting)}
               style={{
                 padding: '8px 14px', borderRadius: '10px', fontSize: '12px', fontWeight: 500,
                 border: preferredSettings.includes(setting) ? '2px solid #C9973A' : '1px solid #E2E8F0',
                 background: preferredSettings.includes(setting) ? '#FDF6EC' : 'white',
                 color: preferredSettings.includes(setting) ? '#92400E' : '#64748B', cursor: 'pointer', fontFamily: FONT_SANS
               }}>{setting}</button>
           ))}
         </div>
       </div>
     </div>

     {!availabilityStatus && (
       <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', borderRadius: '8px', background: '#FEF3C7' }}>
         <AlertCircle size={14} color="#D97706" />
         <span style={{ fontSize: '12px', color: '#92400E' }}>Select at least an availability status to help agencies find you</span>
       </div>
     )}

   </div>
 )
}
