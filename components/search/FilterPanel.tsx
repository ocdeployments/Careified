'use client'

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
} from '@/lib/types/search'
import { ChevronDown, ChevronUp, X, MapPin, Clock, Star, Shield, Car, Heart } from 'lucide-react'
import { useState } from 'react'

interface FilterPanelProps {
  filters: SearchFilters
  onChange: (filters: SearchFilters) => void
  resultCount: number
  onClear?: () => void
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
}

type SectionKey =
  | 'location' | 'availability' | 'specialties' | 'credentials'
  | 'schedule' | 'languages' | 'logistics' | 'compatibility'
  | 'compliance' | 'trust' | 'experience'

export function FilterPanel({ filters, onChange, resultCount, onClear }: FilterPanelProps) {
  const [expanded, setExpanded] = useState<Record<SectionKey, boolean>>({
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
  })

  const toggle = (s: SectionKey) => setExpanded(prev => ({ ...prev, [s]: !prev[s] }))

  const set = (key: keyof SearchFilters, value: unknown) =>
    onChange({ ...filters, [key]: value, page: 1 })

  const toggleArr = (key: keyof SearchFilters, item: string) => {
    const cur = (filters[key] as string[]) || []
    set(key, cur.includes(item) ? cur.filter(x => x !== item) : [...cur, item])
  }

  const hasFilters = (
    (filters.city || filters.state) ||
    (filters.specialties?.length ?? 0) > 0 ||
    (filters.credentials?.length ?? 0) > 0 ||
    (filters.placementTypes?.length ?? 0) > 0 ||
    (filters.languages?.length ?? 0) > 0 ||
    (filters.daysAvailable?.length ?? 0) > 0 ||
    (filters.shiftTypes?.length ?? 0) > 0
  )

  return (
    <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
        <span className="text-[13px] font-bold text-navy uppercase tracking-wider">Filters</span>
        {hasFilters && (
          <button
            onClick={() => { onChange(EMPTY_FILTERS); onClear?.() }}
            className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-red-500 transition-colors focus-visible:ring-2 focus-visible:ring-gold focus-visible:outline-none rounded"
          >
            <X size={11} /> Clear all
          </button>
        )}
      </div>

      <div className="divide-y divide-slate-50">

        {/* ── Location ── */}
        <Section
          label="Location"
          icon={<MapPin size={13} />}
          expanded={expanded.location}
          onToggle={() => toggle('location')}
        >
          <div className="space-y-2">
            <input
              type="text"
              placeholder="City"
              value={filters.city || ''}
              onChange={e => set('city', e.target.value || undefined)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs text-navy placeholder-slate-400 focus-visible:ring-2 focus-visible:ring-gold focus-visible:outline-none"
            />
            <select
              value={filters.state || ''}
              onChange={e => set('state', e.target.value || undefined)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs text-navy bg-white focus-visible:ring-2 focus-visible:ring-gold focus-visible:outline-none"
            >
              <option value="">All states</option>
              {US_STATES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <div className="flex items-center gap-2">
              <input
                type="number"
                placeholder="Radius (mi)"
                value={filters.radiusMiles != null ? String(filters.radiusMiles) : ''}
                onChange={e => set('radiusMiles', e.target.value ? Number(e.target.value) : undefined)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs text-navy placeholder-slate-400 focus-visible:ring-2 focus-visible:ring-gold focus-visible:outline-none"
                min={1}
                max={200}
              />
            </div>
          </div>
        </Section>

        {/* ── Availability ── */}
        <Section
          label="Availability"
          icon={<Clock size={13} />}
          expanded={expanded.availability}
          onToggle={() => toggle('availability')}
        >
          <div className="space-y-1.5">
            {(['available_now', 'available_soon', 'open_to_offers'] as const).map(status => (
              <label key={status} className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={(filters.availabilityStatuses || []).includes(status)}
                  onChange={() => toggleArr('availabilityStatuses', status)}
                  className="w-3.5 h-3.5 rounded border-slate-300 text-gold focus:ring-gold"
                />
                <span className="text-xs text-slate-600 group-hover:text-navy transition-colors capitalize">
                  {status.replace(/_/g, ' ')}
                </span>
              </label>
            ))}
          </div>
        </Section>

        {/* ── Specialties ── */}
        <Section
          label="Specialties"
          icon={<Star size={13} />}
          expanded={expanded.specialties}
          onToggle={() => toggle('specialties')}
        >
          <CheckboxGroup
            options={SPECIALTY_OPTIONS}
            selected={filters.specialties || []}
            onToggle={item => toggleArr('specialties', item)}
          />
        </Section>

        {/* ── Placement Type ── */}
        <Section
          label="Placement Type"
          icon={<Heart size={13} />}
          expanded={expanded.availability}
          onToggle={() => toggle('availability')}
        >
          <CheckboxGroup
            options={PLACEMENT_TYPE_OPTIONS}
            selected={filters.placementTypes || []}
            onToggle={item => toggleArr('placementTypes', item)}
          />
        </Section>

        {/* ── Credentials ── */}
        <Section
          label="Credentials"
          icon={<Shield size={13} />}
          expanded={expanded.credentials}
          onToggle={() => toggle('credentials')}
        >
          <CheckboxGroup
            options={CREDENTIAL_OPTIONS}
            selected={filters.credentials || []}
            onToggle={item => toggleArr('credentials', item)}
          />
        </Section>

        {/* ── Languages ── */}
        <Section
          label="Languages"
          expanded={expanded.languages}
          onToggle={() => toggle('languages')}
        >
          <CheckboxGroup
            options={LANGUAGE_OPTIONS}
            selected={filters.languages || []}
            onToggle={item => toggleArr('languages', item)}
          />
        </Section>

        {/* ── Schedule ── */}
        <Section
          label="Schedule"
          icon={<Clock size={13} />}
          expanded={expanded.schedule}
          onToggle={() => toggle('schedule')}
        >
          <div className="space-y-3">
            <div>
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Days</p>
              <CheckboxGroup
                options={DAYS_OF_WEEK}
                selected={filters.daysAvailable || []}
                onToggle={item => toggleArr('daysAvailable', item)}
              />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Shifts</p>
              <CheckboxGroup
                options={SHIFT_TYPE_OPTIONS}
                selected={filters.shiftTypes || []}
                onToggle={item => toggleArr('shiftTypes', item)}
              />
            </div>
          </div>
        </Section>

        {/* ── Logistics ── */}
        <Section
          label="Logistics"
          icon={<Car size={13} />}
          expanded={expanded.logistics}
          onToggle={() => toggle('logistics')}
        >
          <div className="space-y-1.5">
            <label className="flex items-center gap-2 cursor-pointer group">
              <input
                type="checkbox"
                checked={filters.hasVehicle === true}
                onChange={e => set('hasVehicle', e.target.checked ? true : undefined)}
                className="w-3.5 h-3.5 rounded border-slate-300 text-gold focus:ring-gold"
              />
              <span className="text-xs text-slate-600 group-hover:text-navy transition-colors">Has vehicle</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer group">
              <input
                type="checkbox"
                checked={filters.willingLiveIn === true}
                onChange={e => set('willingLiveIn', e.target.checked ? true : undefined)}
                className="w-3.5 h-3.5 rounded border-slate-300 text-gold focus:ring-gold"
              />
              <span className="text-xs text-slate-600 group-hover:text-navy transition-colors">Willing to live-in</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer group">
              <input
                type="checkbox"
                checked={filters.openToUrgent === true}
                onChange={e => set('openToUrgent', e.target.checked ? true : undefined)}
                className="w-3.5 h-3.5 rounded border-slate-300 text-gold focus:ring-gold"
              />
              <span className="text-xs text-slate-600 group-hover:text-navy transition-colors">Open to urgent placements</span>
            </label>
          </div>
        </Section>

        {/* ── Experience ── */}
        <Section
          label="Experience"
          expanded={expanded.experience}
          onToggle={() => toggle('experience')}
        >
          <div className="space-y-2">
            <div>
              <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide block mb-1">
                Min years
              </label>
              <input
                type="number"
                min={0}
                max={30}
                value={filters.minYearsExperience != null ? String(filters.minYearsExperience) : ''}
                onChange={e => set('minYearsExperience', e.target.value ? Number(e.target.value) : undefined)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs text-navy placeholder-slate-400 focus-visible:ring-2 focus-visible:ring-gold focus-visible:outline-none"
                placeholder="e.g. 2"
              />
            </div>
            <CheckboxGroup
              options={LIFT_EXPERIENCE_OPTIONS}
              selected={filters.liftExperience || []}
              onToggle={item => toggleArr('liftExperience', item)}
              label="Lift experience"
            />
          </div>
        </Section>

      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-slate-100 bg-slate-50">
        <p className="text-[11px] text-slate-400 text-center">
          {resultCount} caregiver{resultCount !== 1 ? 's' : ''} match
        </p>
      </div>
    </div>
  )
}

// ── Reusable sub-components ───────────────────────────────────────────────────

function Section({
  label,
  icon,
  expanded,
  onToggle,
  children,
}: {
  label: string
  icon?: React.ReactNode
  expanded: boolean
  onToggle: () => void
  children: React.ReactNode
}) {
  return (
    <div className="px-4 py-3">
      <button
        onClick={onToggle}
        aria-expanded={expanded}
        className="w-full flex items-center justify-between text-left focus-visible:ring-2 focus-visible:ring-gold focus-visible:outline-none rounded"
      >
        <span className="flex items-center gap-1.5 text-[12px] font-semibold text-navy uppercase tracking-wide">
          {icon}
          {label}
        </span>
        {expanded
          ? <ChevronUp size={13} className="text-slate-400" />
          : <ChevronDown size={13} className="text-slate-400" />
        }
      </button>
      {expanded && <div className="mt-3">{children}</div>}
    </div>
  )
}

function CheckboxGroup({
  options,
  selected,
  onToggle,
  label,
}: {
  options: readonly string[]
  selected: string[]
  onToggle: (item: string) => void
  label?: string
}) {
  return (
    <div>
      {label && (
        <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-1.5">{label}</p>
      )}
      <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
        {options.map(opt => (
          <label key={opt} className="flex items-center gap-2 cursor-pointer group">
            <input
              type="checkbox"
              checked={selected.includes(opt)}
              onChange={() => onToggle(opt)}
              className="w-3.5 h-3.5 rounded border-slate-300 text-gold focus:ring-gold flex-shrink-0"
            />
            <span className="text-xs text-slate-600 group-hover:text-navy transition-colors leading-tight">
              {opt}
            </span>
          </label>
        ))}
      </div>
    </div>
  )
}
