'use client'

import { useState, useEffect } from 'react'
import { saveStep3 } from '@/lib/actions/profile'

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

const STATUSES = [
 { value: 'available_now', label: 'Available now', desc: 'Can start within 2 weeks', dot: 'bg-green-500' },
 { value: 'open_to_opportunities', label: 'Open to opportunities', desc: 'Currently employed but open', dot: 'bg-amber-500' },
 { value: 'available_from', label: 'Available from a date', desc: 'Finishing current placement', dot: 'bg-blue-500' },
 { value: 'not_available', label: 'Not currently available', desc: 'Keeping profile active', dot: 'bg-slate-400' },
]

const PLACEMENT_TYPES = [
 'Permanent placement', 'Regular part-time', 'Casual / relief shifts', 'Live-in care',
 'Overnight care', 'Respite care', 'Block booking', 'Weekend specialist',
]

const LANGUAGES = ['English', 'Spanish', 'French', 'Tagalog', 'Mandarin', 'Hindi', 'Arabic', 'Portuguese', 'Other']

const TIME_OPTIONS = (() => {
 const opts = []
 for (let h = 5; h <= 23; h++) {
 ['00', '30'].forEach(m => {
 if (h === 23 && m === '30') return
 opts.push(`${String(h).padStart(2,'0')}:${m}`)
 })
 }
 opts.push('Overnight / next day')
 return opts
})()

export default function Step3Availability({ initialData, onSave }: { initialData?: any; onSave?: (data: any) => void }) {
 const [status, setStatus] = useState(initialData?.availabilityStatus || '')
 const [availableFromDate, setAvailableFromDate] = useState(initialData?.availableFromDate || '')
 const [noticePeriod, setNoticePeriod] = useState(initialData?.noticePeriod || '')
 const [placementTypes, setPlacementTypes] = useState<string[]>(initialData?.placementTypes || [])
 const [selectedDays, setSelectedDays] = useState<string[]>(
 initialData?.weeklyAvailability ? Object.keys(initialData.weeklyAvailability) : []
 )
 const [dayTimes, setDayTimes] = useState<Record<string, any>>(initialData?.weeklyAvailability || {})
 const [willingLiveIn, setWillingLiveIn] = useState(initialData?.willingLiveIn || false)
 const [willingOvernight, setWillingOvernight] = useState(initialData?.willingOvernight || false)
 const [hasVehicle, setHasVehicle] = useState(initialData?.hasVehicle || false)
 const [travelRadius, setTravelRadius] = useState(initialData?.travelRadius || 15)
 const [city, setCity] = useState(initialData?.city || '')
 const [postalCode, setPostalCode] = useState(initialData?.postalCode || '')
 const [clientPreference, setClientPreference] = useState(initialData?.clientPreference || '')
 const [languages, setLanguages] = useState<string[]>(initialData?.additionalLanguages || [])
 const [saving, setSaving] = useState(false)

 const toggleDay = (day: string) => {
 if (selectedDays.includes(day)) {
 setSelectedDays(selectedDays.filter(d => d !== day))
 const newTimes = { ...dayTimes }
 delete newTimes[day]
 setDayTimes(newTimes)
 } else {
 setSelectedDays([...selectedDays, day])
 setDayTimes({ ...dayTimes, [day]: { from: '09:00', to: '17:00', flexible: false } })
 }
 }

 const togglePlacement = (type: string) => {
 setPlacementTypes(placementTypes.includes(type) ? placementTypes.filter(t => t !== type) : [...placementTypes, type])
 }

 const toggleLanguage = (lang: string) => {
 setLanguages(languages.includes(lang) ? languages.filter(l => l !== lang) : [...languages, lang])
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
 weeklyAvailability: dayTimes,
 willingLiveIn,
 willingOvernight,
 hasVehicle,
 travelRadius,
 city,
 postalCode,
 clientPreference,
 additionalLanguages: languages,
 })
 setSaving(false)
 }
 }, 1000)
 return () => clearTimeout(timer)
 }, [status, availableFromDate, noticePeriod, placementTypes, dayTimes, willingLiveIn, willingOvernight, hasVehicle, travelRadius, city, postalCode, clientPreference, languages])

 return (
 <div className="space-y-6">
 <div>
 <h3 className="text-[14px] font-black text-[#0D1B3E] mb-1">Current availability</h3>
 <p className="text-[12px] text-[#64748B] mb-3">Most important signal agencies use when searching.</p>
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
 {STATUSES.map((s) => (
 <label key={s.value} className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer border ${
 status === s.value ? 'border-[#C9973A] bg-[#FDF6EC]' : 'border-[#E2E8F0] bg-white'
 }`}>
 <input type="radio" name="status" value={s.value} checked={status === s.value} onChange={() => setStatus(s.value)} className="accent-[#C9973A]" />
 <div className="flex items-center gap-2">
 <div className={`w-2 h-2 rounded-full ${s.dot}`} />
 <div>
 <p className="text-[12px] font-bold text-[#0D1B3E]">{s.label}</p>
 <p className="text-[11px] text-[#64748B]">{s.desc}</p>
 </div>
 </div>
 </label>
 ))}
 </div>
 {status === 'available_from' && (
 <div className="mt-3">
 <label className="block text-[12px] font-bold text-[#0D1B3E] mb-1.5">Available from date</label>
 <input type="date" value={availableFromDate} onChange={(e) => setAvailableFromDate(e.target.value)} className="px-4 py-2.5 rounded-xl border border-[#E2E8F0] bg-white text-[13px]" />
 </div>
 )}
 {status === 'open_to_opportunities' && (
 <div className="mt-3">
 <label className="block text-[12px] font-bold text-[#0D1B3E] mb-1.5">Notice period</label>
 <select value={noticePeriod} onChange={(e) => setNoticePeriod(e.target.value)} className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-[#E2E8F0] bg-white text-[13px]">
 <option value="">Select...</option>
 <option value="immediately">Immediately</option>
 <option value="1_week">1 week</option>
 <option value="2_weeks">2 weeks</option>
 <option value="1_month">1 month</option>
 <option value="flexible">Flexible</option>
 </select>
 </div>
 )}
 </div>

 <div>
 <h3 className="text-[14px] font-black text-[#0D1B3E] mb-3">Type of placement</h3>
 <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
 {PLACEMENT_TYPES.map((type) => (
 <label key={type} className={`flex items-center gap-2 p-2.5 rounded-lg cursor-pointer border text-[11.5px] ${
 placementTypes.includes(type) ? 'border-[#C9973A] bg-[#FDF6EC] text-[#92400E]' : 'border-[#E2E8F0] bg-white'
 }`}>
 <input type="checkbox" checked={placementTypes.includes(type)} onChange={() => togglePlacement(type)} className="accent-[#C9973A] w-3 h-3" />
 {type}
 </label>
 ))}
 </div>
 </div>

 <div>
 <h3 className="text-[14px] font-black text-[#0D1B3E] mb-3">Days and hours</h3>
 <div className="flex gap-2 flex-wrap mb-4">
 {DAYS.map((day) => (
 <button key={day} type="button" onClick={() => toggleDay(day)} className={`px-3 py-2 rounded-lg text-[12px] font-bold border ${
 selectedDays.includes(day) ? 'border-[#C9973A]' : 'border-[#E2E8F0] bg-white'
 }`} style={selectedDays.includes(day) ? { background: 'linear-gradient(135deg, #C9973A, #E8B86D)', color: '#0D1B3E' } : {}}>
 {day}
 </button>
 ))}
 </div>
 {selectedDays.length > 0 && (
 <div className="flex flex-col gap-2">
 {selectedDays.map((day) => (
 <div key={day} className="flex items-center gap-3 p-3 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] flex-wrap">
 <span className="text-[12px] font-bold text-[#0D1B3E] w-8">{day}</span>
 {!dayTimes[day]?.flexible && (
 <>
 <div className="flex items-center gap-2">
 <span className="text-[11px] text-[#64748B]">From</span>
 <select value={dayTimes[day]?.from || '09:00'} onChange={(e) => setDayTimes({ ...dayTimes, [day]: { ...dayTimes[day], from: e.target.value } })} className="px-2 py-1.5 rounded-lg border border-[#E2E8F0] bg-white text-[12px]">
 {TIME_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
 </select>
 </div>
 <div className="flex items-center gap-2">
 <span className="text-[11px] text-[#64748B]">To</span>
 <select value={dayTimes[day]?.to || '17:00'} onChange={(e) => setDayTimes({ ...dayTimes, [day]: { ...dayTimes[day], to: e.target.value } })} className="px-2 py-1.5 rounded-lg border border-[#E2E8F0] bg-white text-[12px]">
 {TIME_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
 </select>
 </div>
 </>
 )}
 {dayTimes[day]?.flexible && <span className="text-[12px] text-[#C9973A] font-medium">Flexible timing</span>}
 <label className="flex items-center gap-1.5 ml-auto cursor-pointer">
 <input type="checkbox" checked={dayTimes[day]?.flexible || false} onChange={(e) => setDayTimes({ ...dayTimes, [day]: { ...dayTimes[day], flexible: e.target.checked } })} className="accent-[#C9973A] w-3 h-3" />
 <span className="text-[11px] text-[#64748B]">Flexible</span>
 </label>
 </div>
 ))}
 </div>
 )}
 </div>

 <div>
 <h3 className="text-[14px] font-black text-[#0D1B3E] mb-3">Additional preferences</h3>
 <div className="flex flex-col gap-3">
 {[
 { label: 'Available for live-in arrangements', value: willingLiveIn, setter: setWillingLiveIn },
 { label: 'Available for overnight care', value: willingOvernight, setter: setWillingOvernight },
 { label: 'Have own vehicle', value: hasVehicle, setter: setHasVehicle },
 ].map((pref) => (
 <div key={pref.label} className="flex items-center justify-between p-3 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
 <span className="text-[13px] text-[#0D1B3E]">{pref.label}</span>
 <button type="button" onClick={() => pref.setter(!pref.value)} className={`relative w-11 h-6 rounded-full transition-colors ${pref.value ? 'bg-[#C9973A]' : 'bg-[#E2E8F0]'}`}>
 <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${pref.value ? 'translate-x-6' : 'translate-x-1'}`} />
 </button>
 </div>
 ))}
 </div>
 </div>

 <div>
 <h3 className="text-[14px] font-black text-[#0D1B3E] mb-3">Location and travel radius</h3>
 <div className="grid grid-cols-2 gap-3 mb-4">
 <div>
 <label className="block text-[12px] font-bold text-[#0D1B3E] mb-1.5">City *</label>
 <input type="text" value={city} onChange={(e) => setCity(e.target.value)} placeholder="e.g. Frisco" maxLength={50} className="w-full px-4 py-3 rounded-xl border border-[#E2E8F0] bg-white text-[13px]" />
 </div>
 <div>
 <label className="block text-[12px] font-bold text-[#0D1B3E] mb-1.5">ZIP / Postal *</label>
 <input type="text" value={postalCode} onChange={(e) => setPostalCode(e.target.value)} placeholder="e.g. 75034" maxLength={10} className="w-full px-4 py-3 rounded-xl border border-[#E2E8F0] bg-white text-[13px]" />
 </div>
 </div>
 <div>
 <label className="block text-[12px] font-bold text-[#0D1B3E] mb-2">
 Travel radius <span className="text-[#C9973A] ml-2 font-black">{travelRadius} miles</span>
 </label>
 <input type="range" min={5} max={50} step={5} value={travelRadius} onChange={(e) => setTravelRadius(Number(e.target.value))} className="w-full accent-[#C9973A]" />
 <div className="flex justify-between text-[10px] text-[#94A3B8] mt-1">
 <span>5 miles</span>
 <span>50 miles</span>
 </div>
 </div>
 </div>

 <div>
 <label className="block text-[13px] font-bold text-[#0D1B3E] mb-2">Client preference (optional)</label>
 <select value={clientPreference} onChange={(e) => setClientPreference(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-[#E2E8F0] bg-white text-[13px]">
 <option value="">No preference</option>
 <option value="elderly">Elderly (65+)</option>
 <option value="younger_adults">Younger adults</option>
 <option value="paediatric">Paediatric</option>
 <option value="end_of_life">End-of-life</option>
 <option value="single_client">Single client</option>
 <option value="multiple_clients">Multiple clients</option>
 </select>
 </div>

 <div>
 <h3 className="text-[14px] font-black text-[#0D1B3E] mb-3">Languages spoken</h3>
 <div className="flex flex-wrap gap-2">
 {LANGUAGES.map((lang) => (
 <label key={lang} className={`flex items-center gap-2 px-3 py-2 rounded-full cursor-pointer border text-[12px] ${
 languages.includes(lang) ? 'border-[#C9973A] bg-[#FDF6EC] text-[#92400E] font-bold' : 'border-[#E2E8F0] bg-white'
 }`}>
 <input type="checkbox" checked={languages.includes(lang)} onChange={() => toggleLanguage(lang)} className="sr-only" />
 {lang}
 </label>
 ))}
 </div>
 </div>

 {saving && <p className="text-[11px] text-[#94A3B8]">Saving...</p>}
 </div>
 )
}
