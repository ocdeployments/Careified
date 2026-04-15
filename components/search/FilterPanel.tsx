'use client';

import {
 SearchFilters,
 SPECIALTY_OPTIONS,
 CREDENTIAL_OPTIONS,
 PLACEMENT_TYPE_OPTIONS,
 LANGUAGE_OPTIONS,
 DAYS_OF_WEEK,
 SHIFT_TYPE_OPTIONS,
 LIFT_EXPERIENCE_OPTIONS,
 EMPLOYMENT_TYPE_OPTIONS,
 TECHNOLOGY_COMFORT_OPTIONS,
 PET_TOLERANCE_OPTIONS,
 US_STATES,
} from '@/lib/types/search';
import {
 ChevronDown, ChevronUp, X, MapPin, Clock,
 Star, Shield, Car, Heart
} from 'lucide-react';
import { useState } from 'react';

interface FilterPanelProps {
 filters: SearchFilters;
 onChange: (filters: SearchFilters) => void;
 resultCount: number;
}

const EMPTY_FILTERS: SearchFilters = {
 specialties: [],
 credentials: [],
 placementTypes: [],
 languages: [],
 daysAvailable: [],
 shiftTypes: [],
 liftExperience: [],
 sortBy: 'score',
 page: 1,
 limit: 20,
};

export function FilterPanel({ filters, onChange, resultCount }: FilterPanelProps) {

 const [expanded, setExpanded] = useState({
 location: true,
 availability: true,
 specialties: true,
 credentials: false,
 schedule: false,
 languages: false,
 logistics: false,
 compatibility: false,
 compliance: false,
 trust: false,
 experience: false,
 });

 const toggle = (s: keyof typeof expanded) =>
 setExpanded(prev => ({ ...prev, [s]: !prev[s] }));

 const set = (key: keyof SearchFilters, value: any) =>
 onChange({ ...filters, [key]: value, page: 1 });

 const toggleArr = (key: keyof SearchFilters, item: string) => {
 const cur = (filters[key] as string[]) || [];
 set(key, cur.includes(item) ? cur.filter(i => i !== item) : [...cur, item]);
 };

 const activeCount =
 filters.specialties.length +
 filters.credentials.length +
 filters.placementTypes.length +
 (filters.languages?.length || 0) +
 (filters.daysAvailable?.length || 0) +
 (filters.shiftTypes?.length || 0) +
 (filters.liftExperience?.length || 0) +
 (filters.city ? 1 : 0) +
 (filters.state ? 1 : 0) +
 (filters.availabilityStatus ? 1 : 0) +
 (filters.minTrustScore ? 1 : 0) +
 (filters.minExperience ? 1 : 0) +
 (filters.hasVehicle ? 1 : 0) +
 (filters.hasDriversLicense ? 1 : 0) +
 (filters.willingLiveIn ? 1 : 0) +
 (filters.openToUrgent ? 1 : 0) +
 (filters.requireBackground ? 1 : 0) +
 (filters.requireReference ? 1 : 0) +
 (filters.petTolerance && filters.petTolerance !== 'no_preference' ? 1 : 0) +
 (filters.smokerHousehold ? 1 : 0) +
 (filters.employmentType && filters.employmentType !== 'either' ? 1 : 0) +
 (filters.technologyComfort ? 1 : 0);

 return (
 <div className="w-full bg-white rounded-2xl border border-slate-100 p-4 sticky top-4 max-h-[calc(100vh-2rem)] overflow-y-auto">
 <div className="flex items-center justify-between mb-4">
 <h3 className="font-bold text-sm text-slate-900">
 Filters
 {activeCount > 0 && (
 <span className="ml-2 text-xs font-normal text-blue-600">
 ({activeCount} active)
 </span>
 )}
 </h3>
 {activeCount > 0 && (
 <button
 onClick={() => onChange(EMPTY_FILTERS)}
 className="text-xs text-slate-500 hover:text-slate-700 flex items-center gap-1"
 >
 <X className="w-3 h-3" />
 Clear all
 </button>
 )}
 </div>

 <Section title="Location" icon={<MapPin className="w-3.5 h-3.5" />}
 expanded={expanded.location} onToggle={() => toggle('location')}>
 <div className="space-y-3">
 <div>
 <label className="block text-xs font-medium text-slate-700 mb-1">City</label>
 <input
 type="text"
 value={filters.city || ''}
 onChange={e => set('city', e.target.value || undefined)}
 placeholder="e.g. Austin"
 className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200"
 />
 </div>
 <div>
 <label className="block text-xs font-medium text-slate-700 mb-1">State</label>
 <select
 value={filters.state || ''}
 onChange={e => set('state', e.target.value || undefined)}
 className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200"
 >
 <option value="">Any state</option>
 {US_STATES.map(s => (
 <option key={s.value} value={s.value}>{s.label}</option>
 ))}
 </select>
 </div>
 </div>
 </Section>

 <Section title="Availability" icon={<Clock className="w-3.5 h-3.5" />}
 expanded={expanded.availability} onToggle={() => toggle('availability')}>
 <div className="space-y-2">
 {[
 { value: 'available_now', label: 'Available now' },
 { value: 'open_to_opportunities', label: 'Open to opportunities' },
 ].map(opt => (
 <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
 <input
 type="radio"
 name="availabilityStatus"
 checked={filters.availabilityStatus === opt.value}
 onChange={() => set('availabilityStatus', opt.value)}
 className="w-4 h-4 text-blue-600"
 />
 <span className="text-sm text-slate-700">{opt.label}</span>
 </label>
 ))}
 <label className="flex items-center gap-2 cursor-pointer">
 <input
 type="radio"
 name="availabilityStatus"
 checked={!filters.availabilityStatus}
 onChange={() => set('availabilityStatus', undefined)}
 className="w-4 h-4 text-blue-600"
 />
 <span className="text-sm text-slate-700">Any</span>
 </label>
 <div className="pt-2 space-y-2">
 <Toggle
 label="Open to urgent placements"
 checked={!!filters.openToUrgent}
 onChange={v => set('openToUrgent', v || undefined)}
 />
 <Toggle
 label="Available for live-in"
 checked={!!filters.willingLiveIn}
 onChange={v => set('willingLiveIn', v || undefined)}
 />
 </div>
 </div>
 </Section>

 <Section title="Placement type" expanded={true} nested>
 <div className="space-y-2">
 {PLACEMENT_TYPE_OPTIONS.map(opt => (
 <label key={opt} className="flex items-center gap-2 cursor-pointer">
 <input
 type="checkbox"
 checked={filters.placementTypes.includes(opt)}
 onChange={() => toggleArr('placementTypes', opt)}
 className="w-4 h-4 rounded border-slate-300 text-blue-600"
 />
 <span className="text-sm text-slate-700">{opt}</span>
 </label>
 ))}
 </div>
 </Section>

 <Section title="Schedule" expanded={expanded.schedule}
 onToggle={() => toggle('schedule')}>
 <div className="space-y-3">
 <div>
 <p className="text-xs font-medium text-slate-700 mb-2">Days needed</p>
 <div className="flex flex-wrap gap-1.5">
 {DAYS_OF_WEEK.map(day => (
 <button
 key={day}
 type="button"
 onClick={() => toggleArr('daysAvailable', day)}
 className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-all ${
 filters.daysAvailable?.includes(day)
 ? 'bg-blue-600 text-white border-blue-600'
 : 'bg-white text-slate-600 border-slate-200'
 }`}
 >
 {day}
 </button>
 ))}
 </div>
 </div>
 <div>
 <p className="text-xs font-medium text-slate-700 mb-2">Shift times</p>
 <div className="space-y-1.5">
 {SHIFT_TYPE_OPTIONS.map(opt => (
 <label key={opt} className="flex items-center gap-2 cursor-pointer">
 <input
 type="checkbox"
 checked={filters.shiftTypes?.includes(opt) || false}
 onChange={() => toggleArr('shiftTypes', opt)}
 className="w-4 h-4 rounded border-slate-300 text-blue-600"
 />
 <span className="text-sm text-slate-700">{opt}</span>
 </label>
 ))}
 </div>
 </div>
 <div className="grid grid-cols-2 gap-2">
 <div>
 <label className="block text-xs font-medium text-slate-700 mb-1">Min hrs/week</label>
 <select
 value={filters.minHoursPerWeek || ''}
 onChange={e => set('minHoursPerWeek', e.target.value ? parseInt(e.target.value) : undefined)}
 className="w-full px-2 py-2 text-sm rounded-lg border border-slate-200"
 >
 <option value="">Any</option>
 {[8, 16, 20, 24, 32, 40].map(h => (
 <option key={h} value={h}>{h}h</option>
 ))}
 </select>
 </div>
 <div>
 <label className="block text-xs font-medium text-slate-700 mb-1">Max hrs/week</label>
 <select
 value={filters.maxHoursPerWeek || ''}
 onChange={e => set('maxHoursPerWeek', e.target.value ? parseInt(e.target.value) : undefined)}
 className="w-full px-2 py-2 text-sm rounded-lg border border-slate-200"
 >
 <option value="">Any</option>
 {[16, 20, 24, 32, 40].map(h => (
 <option key={h} value={h}>{h}h</option>
 ))}
 </select>
 </div>
 </div>
 <Toggle
 label="Holiday availability"
 checked={!!filters.holidayAvailable}
 onChange={v => set('holidayAvailable', v || undefined)}
 />
 </div>
 </Section>

 <Section title="Specialties" expanded={expanded.specialties}
 onToggle={() => toggle('specialties')}>
 <div className="space-y-2 max-h-56 overflow-y-auto">
 {SPECIALTY_OPTIONS.map(s => (
 <label key={s} className="flex items-center gap-2 cursor-pointer">
 <input
 type="checkbox"
 checked={filters.specialties.includes(s)}
 onChange={() => toggleArr('specialties', s)}
 className="w-4 h-4 rounded border-slate-300 text-blue-600"
 />
 <span className="text-sm text-slate-700">{s}</span>
 </label>
 ))}
 </div>
 </Section>

 <Section title="Credentials" expanded={expanded.credentials}
 onToggle={() => toggle('credentials')}>
 <div className="space-y-2">
 {CREDENTIAL_OPTIONS.map(c => (
 <label key={c} className="flex items-center gap-2 cursor-pointer">
 <input
 type="checkbox"
 checked={filters.credentials.includes(c)}
 onChange={() => toggleArr('credentials', c)}
 className="w-4 h-4 rounded border-slate-300 text-blue-600"
 />
 <span className="text-sm text-slate-700">{c}</span>
 </label>
 ))}
 </div>
 </Section>

 <Section title="Languages" expanded={expanded.languages}
 onToggle={() => toggle('languages')}>
 <div className="flex flex-wrap gap-1.5">
 {LANGUAGE_OPTIONS.map(lang => (
 <button
 key={lang}
 type="button"
 onClick={() => toggleArr('languages', lang)}
 className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-all ${
 filters.languages?.includes(lang)
 ? 'bg-blue-600 text-white border-blue-600'
 : 'bg-white text-slate-600 border-slate-200'
 }`}
 >
 {lang}
 </button>
 ))}
 </div>
 </Section>

 <Section title="Logistics" icon={<Car className="w-3.5 h-3.5" />}
 expanded={expanded.logistics} onToggle={() => toggle('logistics')}>
 <div className="space-y-2">
 <Toggle label="Has own vehicle"
 checked={!!filters.hasVehicle}
 onChange={v => set('hasVehicle', v || undefined)} />
 <Toggle label="Has driver's license"
 checked={!!filters.hasDriversLicense}
 onChange={v => set('hasDriversLicense', v || undefined)} />
 <Toggle label="Willing to drive client"
 checked={!!filters.willingToTransport}
 onChange={v => set('willingToTransport', v || undefined)} />
 <Toggle label="Can use client's vehicle"
 checked={!!filters.willingClientVehicle}
 onChange={v => set('willingClientVehicle', v || undefined)} />
 <Toggle label="Transit accessible"
 checked={!!filters.transitAccessible}
 onChange={v => set('transitAccessible', v || undefined)} />
 <div className="pt-2">
 <p className="text-xs font-medium text-slate-700 mb-2">Lift experience</p>
 <div className="space-y-1.5">
 {LIFT_EXPERIENCE_OPTIONS.map(opt => (
 <label key={opt} className="flex items-center gap-2 cursor-pointer">
 <input
 type="checkbox"
 checked={filters.liftExperience?.includes(opt) || false}
 onChange={() => toggleArr('liftExperience', opt)}
 className="w-4 h-4 rounded border-slate-300 text-blue-600"
 />
 <span className="text-sm text-slate-700">{opt}</span>
 </label>
 ))}
 </div>
 </div>
 </div>
 </Section>

 <Section title="Work environment" icon={<Heart className="w-3.5 h-3.5" />}
 expanded={expanded.compatibility} onToggle={() => toggle('compatibility')}>
 <div className="space-y-3">
 <div>
 <label className="block text-xs font-medium text-slate-700 mb-1">Pets</label>
 <select
 value={filters.petTolerance || ''}
 onChange={e => set('petTolerance', e.target.value || undefined)}
 className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200"
 >
 <option value="">Any</option>
 {PET_TOLERANCE_OPTIONS.map(o => (
 <option key={o.value} value={o.value}>{o.label}</option>
 ))}
 </select>
 </div>
 <Toggle label="Comfortable in smoker's household"
 checked={!!filters.smokerHousehold}
 onChange={v => set('smokerHousehold', v || undefined)} />
 <div>
 <label className="block text-xs font-medium text-slate-700 mb-1">
 Technology comfort
 </label>
 <select
 value={filters.technologyComfort || ''}
 onChange={e => set('technologyComfort', e.target.value || undefined)}
 className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200"
 >
 <option value="">Any</option>
 {TECHNOLOGY_COMFORT_OPTIONS.map(o => (
 <option key={o.value} value={o.value}>{o.label}</option>
 ))}
 </select>
 </div>
 <div>
 <label className="block text-xs font-medium text-slate-700 mb-1">
 Employment type
 </label>
 <select
 value={filters.employmentType || ''}
 onChange={e => set('employmentType', e.target.value || undefined)}
 className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200"
 >
 <option value="">Any</option>
 {EMPLOYMENT_TYPE_OPTIONS.map(o => (
 <option key={o.value} value={o.value}>{o.label}</option>
 ))}
 </select>
 </div>
 </div>
 </Section>

 <Section title="Compliance" icon={<Shield className="w-3.5 h-3.5" />}
 expanded={expanded.compliance} onToggle={() => toggle('compliance')}>
 <div className="space-y-2">
 <Toggle label="Background check required"
 checked={!!filters.requireBackground}
 onChange={v => set('requireBackground', v || undefined)} />
 <Toggle label="References required"
 checked={!!filters.requireReference}
 onChange={v => set('requireReference', v || undefined)} />
 <Toggle label="Medicare / Medicaid certified"
 checked={!!filters.medicareCertified}
 onChange={v => set('medicareCertified', v || undefined)} />
 </div>
 </Section>

 <Section title="Trust & quality" icon={<Star className="w-3.5 h-3.5" />}
 expanded={expanded.trust} onToggle={() => toggle('trust')}>
 <div className="space-y-3">
 <div>
 <label className="block text-xs font-medium text-slate-700 mb-1">
 Min trust score: <span className="text-blue-600 font-bold">{filters.minTrustScore || 0}</span>
 </label>
 <input
 type="range" min="0" max="5" step="0.5"
 value={filters.minTrustScore || 0}
 onChange={e => set('minTrustScore', parseFloat(e.target.value) || undefined)}
 className="w-full accent-blue-600"
 />
 <div className="flex justify-between text-xs text-slate-400 mt-0.5">
 <span>Any</span><span>5.0</span>
 </div>
 </div>
 <div>
 <label className="block text-xs font-medium text-slate-700 mb-1">
 Min profile completion: <span className="text-blue-600 font-bold">{filters.minProfileCompletion || 0}%</span>
 </label>
 <input
 type="range" min="0" max="100" step="10"
 value={filters.minProfileCompletion || 0}
 onChange={e => set('minProfileCompletion', parseInt(e.target.value) || undefined)}
 className="w-full accent-blue-600"
 />
 <div className="flex justify-between text-xs text-slate-400 mt-0.5">
 <span>Any</span><span>100%</span>
 </div>
 </div>
 </div>
 </Section>

 <Section title="Experience" expanded={expanded.experience}
 onToggle={() => toggle('experience')}>
 <div className="grid grid-cols-2 gap-2">
 { {[
 { label: 'Min years', key: 'minExperience' as const },
 { label: 'Max years', key: 'maxExperience' as const },
 ].map(({ label, key }) => (
 <div key={key}>
 <label className="block text-xs font-medium text-slate-700 mb-1">{label}</label>
 <select
 value={filters[key] || ''}
 onChange={e => set(key, e.target.value ? parseInt(e.target.value) : undefined)}
 className="w-full px-2 py-2 text-sm rounded-lg border border-slate-200"
 >
 <option value="">Any</option>
 {[1, 2, 3, 5, 10, 15, 20].map(y => (
 <option key={y} value={y}>{y}+</option>
 ))}
 </select>
 </div>
 ))}
 </div>
 </Section>

 <div className="mt-4 pt-4 border-t border-slate-100 text-center">
 <p className="text-sm font-medium text-slate-700">
 {resultCount.toLocaleString()} {resultCount === 1 ? 'caregiver' : 'caregivers'} found
 </p>
 </div>
 </div>
 );
}

function Section({
 title, icon, expanded, onToggle, children, nested = false
}: {
 title: string;
 icon?: React.ReactNode;
 expanded: boolean;
 onToggle: () => void;
 children: React.ReactNode;
 nested?: boolean;
}) {
 return (
 <div className={`border-t border-slate-100 pt-4 mt-4 ${nested ? 'ml-0' : ''}`}>
 <button onClick={onToggle} className="w-full flex items-center justify-between mb-3">
 <span className="flex items-center gap-1.5 text-sm font-bold text-slate-900">
 {icon}
 {title}
 </span>
 {expanded
 ? <ChevronUp className="w-4 h-4 text-slate-400" />
 : <ChevronDown className="w-4 h-4 text-slate-400" />}
 </button>
 {expanded && children}
 </div>
 );
}

function Toggle({
 label, checked, onChange
}: {
 label: string;
 checked: boolean;
 onChange: (v: boolean) => void;
}) {
 return (
 <label className="flex items-center justify-between cursor-pointer py-0.5">
 <span className="text-sm text-slate-700">{label}</span>
 <button
 type="button"
 onClick={() => onChange(!checked)}
 className={`relative w-9 h-5 rounded-full transition-colors flex-shrink-0 ${
 checked ? 'bg-blue-600' : 'bg-slate-200'
 }`}
 >
 <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
 checked ? 'translate-x-4' : 'translate-x-0.5'
 }`} />
 </button>
 </label>
 );
}
