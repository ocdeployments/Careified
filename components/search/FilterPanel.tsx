'use client';

import { SearchFilters, SPECIALTY_OPTIONS, CREDENTIAL_OPTIONS, PLACEMENT_TYPE_OPTIONS, US_STATES } from '@/lib/types/search';
import { ChevronDown, ChevronUp, X } from 'lucide-react';
import { useState } from 'react';

interface FilterPanelProps {
 filters: SearchFilters;
 onChange: (filters: SearchFilters) => void;
 resultCount: number;
}

export function FilterPanel({ filters, onChange, resultCount }: FilterPanelProps) {
 
 const [expandedSections, setExpandedSections] = useState({
  specialties: true,
  location: true,
  credentials: false,
  availability: false,
  trust: false,
  experience: false,
 });
 
 const toggleSection = (section: keyof typeof expandedSections) => {
  setExpandedSections(prev => ({
   ...prev,
   [section]: !prev[section]
  }));
 };
 
 const updateFilter = (key: keyof SearchFilters, value: any) => {
  onChange({ ...filters, [key]: value, page: 1 });
 };
 
 const toggleArrayItem = (key: 'specialties' | 'credentials' | 'placementTypes', item: string) => {
  const current = filters[key] || [];
  const updated = current.includes(item)
   ? current.filter(i => i !== item)
   : [...current, item];
  updateFilter(key, updated);
 };
 
 const clearAllFilters = () => {
  onChange({
   specialties: [],
   city: undefined,
   state: undefined,
   radius: undefined,
   credentials: [],
   availabilityStatus: undefined,
   placementTypes: [],
   minTrustScore: undefined,
   requireReference: false,
   requireBackground: false,
   minExperience: undefined,
   maxExperience: undefined,
   sortBy: 'score',
   page: 1,
   limit: 20,
  });
 };
 
 const activeFilterCount = 
  filters.specialties.length +
  filters.credentials.length +
  filters.placementTypes.length +
  (filters.city ? 1 : 0) +
  (filters.state ? 1 : 0) +
  (filters.availabilityStatus ? 1 : 0) +
  (filters.minTrustScore ? 1 : 0) +
  (filters.minExperience ? 1 : 0);
 
 return (
  <div className="w-full bg-white rounded-2xl border border-slate-100 p-4 sticky top-4">
   <div className="flex items-center justify-between mb-4">
    <h3 className="font-bold text-sm text-slate-900">
     Filters
     {activeFilterCount > 0 && (
      <span className="ml-2 text-xs font-normal text-blue-600">
       ({activeFilterCount} active)
      </span>
     )}
    </h3>
    {activeFilterCount > 0 && (
     <button
      onClick={clearAllFilters}
      className="text-xs text-slate-500 hover:text-slate-700 flex items-center gap-1"
     >
      <X className="w-3 h-3" />
      Clear
     </button>
    )}
   </div>
 
   <FilterSection
    title="Specialties"
    isExpanded={expandedSections.specialties}
    onToggle={() => toggleSection('specialties')}
   >
    <div className="space-y-2 max-h-64 overflow-y-auto">
     {SPECIALTY_OPTIONS.map(specialty => (
      <label key={specialty} className="flex items-center gap-2 cursor-pointer">
       <input
        type="checkbox"
        checked={filters.specialties.includes(specialty)}
        onChange={() => toggleArrayItem('specialties', specialty)}
        className="w-4 h-4 rounded border-slate-300 text-blue-600"
       />
       <span className="text-sm text-slate-700">{specialty}</span>
      </label>
     ))}
    </div>
   </FilterSection>
 
   <FilterSection
    title="Location"
    isExpanded={expandedSections.location}
    onToggle={() => toggleSection('location')}
   >
    <div className="space-y-3">
     <div>
      <label className="block text-xs font-medium text-slate-700 mb-1">City</label>
      <input
       type="text"
       value={filters.city || ''}
       onChange={(e) => updateFilter('city', e.target.value || undefined)}
       placeholder="e.g. Austin"
       className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200"
      />
     </div>
 
     <div>
      <label className="block text-xs font-medium text-slate-700 mb-1">State</label>
      <select
       value={filters.state || ''}
       onChange={(e) => updateFilter('state', e.target.value || undefined)}
       className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200"
      >
       <option value="">Any state</option>
       {US_STATES.map(state => (
        <option key={state.code} value={state.code}>{state.name}</option>
       ))}
      </select>
     </div>
 
     <div className="pt-2 border-t border-slate-100">
      <p className="text-xs font-medium text-slate-700 mb-2">Availability</p>
      <div className="space-y-2">
       <label className="flex items-center gap-2 cursor-pointer">
        <input
         type="radio"
         name="availability"
         checked={filters.availabilityStatus === 'available_now'}
         onChange={() => updateFilter('availabilityStatus', 'available_now')}
         className="w-4 h-4 text-blue-600"
        />
        <span className="text-sm text-slate-700">Available now</span>
       </label>
       <label className="flex items-center gap-2 cursor-pointer">
        <input
         type="radio"
         name="availability"
         checked={filters.availabilityStatus === 'open_to_opportunities'}
         onChange={() => updateFilter('availabilityStatus', 'open_to_opportunities')}
         className="w-4 h-4 text-blue-600"
        />
        <span className="text-sm text-slate-700">Open to opportunities</span>
       </label>
       <label className="flex items-center gap-2 cursor-pointer">
        <input
         type="radio"
         name="availability"
         checked={!filters.availabilityStatus}
         onChange={() => updateFilter('availabilityStatus', undefined)}
         className="w-4 h-4 text-blue-600"
        />
        <span className="text-sm text-slate-700">Any</span>
       </label>
      </div>
     </div>
    </div>
   </FilterSection>
 
   <FilterSection
    title="Credentials"
    isExpanded={expandedSections.credentials}
    onToggle={() => toggleSection('credentials')}
   >
    <div className="space-y-2">
     {CREDENTIAL_OPTIONS.map(cred => (
      <label key={cred} className="flex items-center gap-2 cursor-pointer">
       <input
        type="checkbox"
        checked={filters.credentials.includes(cred)}
        onChange={() => toggleArrayItem('credentials', cred)}
        className="w-4 h-4 rounded border-slate-300 text-blue-600"
       />
       <span className="text-sm text-slate-700">{cred}</span>
      </label>
     ))}
    </div>
   </FilterSection>
 
   <FilterSection
    title="Trust & Verification"
    isExpanded={expandedSections.trust}
    onToggle={() => toggleSection('trust')}
   >
    <div className="space-y-3">
     <div>
      <label className="block text-xs font-medium text-slate-700 mb-1">
       Min trust score: {filters.minTrustScore || 0}
      </label>
      <input
       type="range"
       min="0"
       max="5"
       step="0.5"
       value={filters.minTrustScore || 0}
       onChange={(e) => updateFilter('minTrustScore', parseFloat(e.target.value))}
       className="w-full accent-blue-600"
      />
     </div>
    </div>
   </FilterSection>
 
   <FilterSection
    title="Experience"
    isExpanded={expandedSections.experience}
    onToggle={() => toggleSection('experience')}
   >
    <div className="grid grid-cols-2 gap-3">
     <div>
      <label className="block text-xs font-medium text-slate-700 mb-1">Min years</label>
      <select
       value={filters.minExperience || ''}
       onChange={(e) => updateFilter('minExperience', e.target.value ? parseInt(e.target.value) : undefined)}
       className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200"
      >
       <option value="">Any</option>
       <option value="1">1+</option>
       <option value="2">2+</option>
       <option value="3">3+</option>
       <option value="5">5+</option>
       <option value="10">10+</option>
      </select>
     </div>
 
     <div>
      <label className="block text-xs font-medium text-slate-700 mb-1">Max years</label>
      <select
       value={filters.maxExperience || ''}
       onChange={(e) => updateFilter('maxExperience', e.target.value ? parseInt(e.target.value) : undefined)}
       className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200"
      >
       <option value="">Any</option>
       <option value="5">5</option>
       <option value="10">10</option>
       <option value="15">15</option>
       <option value="20">20</option>
      </select>
     </div>
    </div>
   </FilterSection>
 
   <div className="mt-6 pt-4 border-t border-slate-100">
    <p className="text-sm text-slate-600 text-center">
     {resultCount} {resultCount === 1 ? 'caregiver' : 'caregivers'} found
    </p>
   </div>
  </div>
 );
}

function FilterSection({ 
 title, 
 isExpanded, 
 onToggle, 
 children 
}: { 
 title: string; 
 isExpanded: boolean; 
 onToggle: () => void; 
 children: React.ReactNode;
}) {
 return (
  <div className="border-t border-slate-100 pt-4 mt-4">
   <button onClick={onToggle} className="w-full flex items-center justify-between mb-3">
    <span className="text-sm font-bold text-slate-900">{title}</span>
    {isExpanded ? (
     <ChevronUp className="w-4 h-4 text-slate-400" />
    ) : (
     <ChevronDown className="w-4 h-4 text-slate-400" />
    )}
   </button>
   {isExpanded && children}
  </div>
 );
}
