'use client'

import { useState } from 'react'
import {
  Shield,
  Star,
  MapPin,
  Briefcase,
  CheckCircle,
  Clock,
  Car,
  Globe,
  Award,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  User,
} from 'lucide-react'
import ProfilePhoto from './ProfilePhoto'
import ContactCard from './ContactCard'

// ──────────────────────────────────────────────────────────────────────────────
// Careified — Caregiver Profile (Agency-facing hiring scorecard)
// Single self-contained component. Inline styles only. No Tailwind.
// All demo data is hard-coded for Maria Santos (PSW, Toronto).
// ──────────────────────────────────────────────────────────────────────────────

type TierLevel = 1 | 2 | 3 | 4

const tierMeta: Record<TierLevel, { label: string; bg: string; color: string; border: string }> = {
  1: { label: 'System verified', bg: 'rgba(22,163,74,0.08)',  color: '#15803D', border: 'rgba(22,163,74,0.25)' },
  2: { label: 'Document on file', bg: 'rgba(37,99,235,0.08)', color: '#1D4ED8', border: 'rgba(37,99,235,0.25)' },
  3: { label: 'Reference confirmed', bg: 'rgba(201,151,58,0.10)', color: '#92400E', border: 'rgba(201,151,58,0.30)' },
  4: { label: 'Self-reported', bg: '#F1F5F9', color: '#64748B', border: '#E2E8F0' },
}

const SERIF = "'DM Serif Display', Georgia, serif"
const SANS = "'DM Sans', system-ui, -apple-system, sans-serif"

// Reusable token shortcuts
const C = {
  navy: '#0D1B3E',
  navyTint: '#1a2a4a',
  gold: '#C9973A',
  goldWarm: '#E8B86D',
  goldTint: '#FDF6EC',
  royal: '#1E3A8A',
  royalBlue: '#2563EB',
  cream: '#F7F4F0',
  white: '#FFFFFF',
  border: '#E2E8F0',
  borderSoft: '#F1F5F9',
  fg1: '#0D1B3E',
  fg3: '#475569',
  fg4: '#64748B',
  fg5: '#94A3B8',
  bgSubtle: '#F8FAFC',
  success: '#16A34A',
  successBg: '#F0FDF4',
  successBorder: '#BBF7D0',
  successDeep: '#15803D',
  urgent: '#FB923C',
  urgentBg: 'rgba(251,146,60,0.15)',
  livein: '#A78BFA',
  liveinBg: 'rgba(139,92,246,0.15)',
}

// ──────────────────────────────────────────────────────────────────────────────
// Demo data (Maria Santos)
// ──────────────────────────────────────────────────────────────────────────────

const caregiver = {
  firstName: 'Maria',
  lastName: 'Santos',
  jobTitle: 'Personal Support Worker',
  credential: 'PSW',
  city: 'Toronto',
  state: 'ON',
  yearsExperience: 8,
  availability: 'Available now',
  rateMin: 24,
  rateMax: 28,
  trustScore: 4.8,
  reviewCount: 12,
  reviewsTier: 'Elite',
  profileCompletion: 94,
  openToUrgent: true,
  willingLiveIn: true,
  hasVehicle: true,
  avgTenureMonths: 14,
  availableFrom: 'Immediately',
  rateOvernight: 32,
  rateLiveIn: 220,
  rateHoliday: 36,
  languages: [
    { name: 'English', level: 'Native' },
    { name: 'Portuguese', level: 'Fluent' },
  ],
}

const verification: { label: string; tier: TierLevel; meta?: string }[] = [
  { label: 'Vulnerable Sector Check', tier: 1, meta: 'Verified Mar 14, 2026' },
  { label: 'PSW registration (HCSWO)', tier: 1, meta: 'Reg #PSW-184293 · Active' },
  { label: 'Government ID', tier: 1, meta: 'Identity match confirmed' },
  { label: 'CPR / First Aid certificate', tier: 2, meta: 'Issued by Red Cross · Expires Aug 2026' },
  { label: 'Work history', tier: 2, meta: '3 roles · Documents on file' },
  { label: 'Professional references', tier: 3, meta: '3 of 3 confirmed by phone' },
  { label: 'Availability & rate', tier: 4, meta: 'Self-disclosed by caregiver' },
]

const overallConfidence = 86 // out of 100

const scorecard: { label: string; pct: number; reason: string }[] = [
  { label: 'Clinical fit',      pct: 92, reason: 'Strong dementia and palliative experience matches typical agency rosters.' },
  { label: 'Risk profile',      pct: 95, reason: 'No disclosures, current VSC, current immunisations, references confirmed.' },
  { label: 'Personality fit',   pct: 84, reason: 'Patient, protocol-first communicator. Best paired with structured family contexts.' },
  { label: 'Logistics fit',     pct: 78, reason: 'Vehicle and live-in capable. 25 km radius covers most GTA west and central placements.' },
  { label: 'Mutual fit',        pct: 88, reason: 'Open to overnight and respite. Rate band aligns with mid-market private-pay.' },
]

const aiSummary =
  'Eight years of consistent home-care experience with documented dementia and palliative depth. References confirm reliability and proactive escalation, with a working style oriented to documentation over real-time alerting.'

const verifyInCall = [
  'Comfort with two-person transfer when client is bariatric',
  'Schedule flexibility around school pickup hours (3–5 pm)',
  'Most recent placement reason for ending — confirm against reference',
]

const diagnoses: { condition: string; years: number; tier: TierLevel }[] = [
  { condition: 'Dementia / Alzheimer\u2019s', years: 6, tier: 2 },
  { condition: 'Palliative & end-of-life care', years: 4, tier: 2 },
  { condition: 'Parkinson\u2019s', years: 3, tier: 3 },
  { condition: 'Stroke recovery', years: 3, tier: 4 },
  { condition: 'Type 2 diabetes', years: 5, tier: 4 },
  { condition: 'Mobility impairment', years: 7, tier: 2 },
]

type Frequency = 'Every shift' | 'Daily' | 'Occasional'
const adls: { label: string; frequency: Frequency }[] = [
  { label: 'Personal hygiene & bathing', frequency: 'Every shift' },
  { label: 'Toileting & incontinence care', frequency: 'Every shift' },
  { label: 'Mobility transfers', frequency: 'Every shift' },
  { label: 'Medication reminders', frequency: 'Daily' },
  { label: 'Meal preparation', frequency: 'Daily' },
  { label: 'Light housekeeping', frequency: 'Daily' },
  { label: 'Companionship & cognitive activities', frequency: 'Daily' },
  { label: 'Wound dressing changes', frequency: 'Occasional' },
]

const techniques = [
  'Two-person mechanical lift',
  'Hoyer transfer',
  'Range-of-motion exercises',
  'Catheter & ostomy care',
  'Repositioning protocols',
  'Pain-scale documentation',
]

const equipment = [
  'Hoyer lift',
  'Sit-to-stand lift',
  'Hospital bed',
  'Wheelchair (manual & power)',
  'Glucometer',
  'Nebulizer',
  'Bedside commode',
]

const references: {
  name: string
  relationship: string
  reliability: number
  professionalism: number
  comment: string
  verifiedDate: string
}[] = [
  {
    name: 'Helen W., daughter of former client',
    relationship: 'Family member · 22 months working together',
    reliability: 5,
    professionalism: 5,
    comment:
      'Maria handled my mother\u2019s late-stage Alzheimer\u2019s with extraordinary patience. She arrived early, kept clean documentation, and treated us like family without ever blurring the line.',
    verifiedDate: 'Verified Feb 09, 2026',
  },
  {
    name: 'Diane K., RN, Oakridge Home Care',
    relationship: 'Direct supervisor · 3 years',
    reliability: 5,
    professionalism: 5,
    comment:
      'Reliable to the minute, never missed a shift, and her end-of-shift notes were the best on my roster. I would put her in any complex case in a heartbeat.',
    verifiedDate: 'Verified Jan 28, 2026',
  },
  {
    name: 'Frank P., son of former client',
    relationship: 'Family member · 14 months',
    reliability: 5,
    professionalism: 5,
    comment:
      'My father trusted Maria within a week, which never happens. She managed his diabetes routine flawlessly and called us proactively when something seemed off.',
    verifiedDate: 'Verified Jan 22, 2026',
  },
]

const workingStyle = [
  { label: 'Patience',           value: 'Natural' },
  { label: 'Communication',      value: 'Documentation-first' },
  { label: 'Adaptability',       value: 'Protocol-oriented' },
  { label: 'Emergency response', value: 'Protocol-first' },
  { label: 'Resilience',         value: 'Boundaried professional' },
]

const strengths = [
  'Dementia rapport',
  'End-of-shift documentation',
  'Family communication',
  'Punctuality',
  'Calm under pressure',
]

const environmentPrefs: { label: string; value: string; ok: boolean }[] = [
  { label: 'Pets',     value: 'Comfortable with dogs and cats', ok: true },
  { label: 'Smoking',  value: 'Non-smoking household preferred', ok: true },
  { label: 'Noise',    value: 'Comfortable in busy multigenerational homes', ok: true },
  { label: 'Physical', value: 'Able to assist clients up to ~95 kg', ok: true },
]

const workHistory: {
  employer: string
  title: string
  dates: string
  duties: string
  tier: TierLevel
  technique: string
}[] = [
  {
    employer: 'Oakridge Home Care, Toronto',
    title: 'Senior Personal Support Worker',
    dates: 'Mar 2022 – Present',
    duties:
      'Lead PSW on a roster of 4 complex-needs clients. Mentored 2 incoming PSWs, ran handover briefings, and owned medication reminder logs.',
    tier: 2,
    technique: 'Two-person mechanical lift',
  },
  {
    employer: 'BrightPath Senior Living, Mississauga',
    title: 'Personal Support Worker',
    dates: 'Aug 2018 – Feb 2022',
    duties:
      'Memory-care unit. Daily ADL support, behaviour de-escalation, and family liaison for residents in moderate to severe dementia.',
    tier: 2,
    technique: 'Hoyer transfer',
  },
  {
    employer: 'Private engagement (family-direct)',
    title: 'Live-in PSW',
    dates: 'Jan 2017 – Jul 2018',
    duties:
      'Live-in palliative support for a single client over the final 18 months of life. Coordinated with palliative MD weekly.',
    tier: 3,
    technique: 'Repositioning protocols',
  },
]

const credentials: {
  label: string
  status: 'Verified' | 'Current' | 'Active'
  meta: string
  tier: TierLevel
}[] = [
  { label: 'PSW registration (HCSWO)',   status: 'Active',   meta: 'Reg #PSW-184293 · Renewed Jan 2026',         tier: 1 },
  { label: 'CPR / First Aid (Red Cross)',status: 'Current',  meta: 'Issued Aug 2024 · Expires Aug 2026',         tier: 2 },
  { label: 'Vulnerable Sector Check',    status: 'Verified', meta: 'Toronto Police Service · Mar 14, 2026',     tier: 1 },
  { label: 'Government photo ID',        status: 'Verified', meta: 'Identity match confirmed by Careified',     tier: 1 },
]

const immunisations = [
  'Tuberculosis (TB) — clear, Apr 2026',
  'COVID-19 — primary series + 1 booster',
  'Influenza — current season',
  'Hepatitis B — series complete',
  'MMR — documented',
]

const declarationDate = 'Mar 22, 2026'

// Weekly grid: 7 days × 4 blocks (Morning, Afternoon, Evening, Overnight)
const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const blocks = ['Morning', 'Afternoon', 'Evening', 'Overnight']
// 1 = available, 0 = not, 2 = preferred (full gold)
const weeklyGrid: number[][] = [
  // M  T  W  Th F  S  Su
  [ 1, 1, 1, 1, 1, 0, 0 ], // Morning
  [ 2, 2, 2, 2, 2, 1, 0 ], // Afternoon
  [ 1, 1, 1, 1, 0, 1, 1 ], // Evening
  [ 0, 1, 0, 1, 0, 1, 1 ], // Overnight
]

const serviceAreas = ['Toronto — Downtown', 'Toronto — West End', 'Etobicoke', 'Mississauga (East)', 'York']
const travelRadius = 25 // km
const minHours = 24
const maxHours = 44

const redFlags: { question: string; answer: 'No' | 'Yes'; explanation?: string }[] = [
  { question: 'Have you ever been the subject of a complaint to a regulatory body?', answer: 'No' },
  { question: 'Has your right to provide care ever been suspended or revoked?', answer: 'No' },
  { question: 'Are there pending criminal charges against you?', answer: 'No' },
  { question: 'Have you been dismissed from a care role in the last 5 years?', answer: 'No' },
]

const openQuestions = [
  {
    q: 'Tell us about a challenging caregiving moment and how you handled it.',
    a:
      'A client with late-stage dementia became combative during evening hygiene. I stopped the routine, sat with her until she settled, and we tried again 30 minutes later with calmer pacing. I documented the trigger, called the family that night, and we adjusted the care plan to move bathing to morning. The behaviour stopped escalating within a week.',
  },
  {
    q: 'How do you approach documentation and end-of-shift handover?',
    a:
      'I keep a structured shift log on the agency portal — vitals if applicable, ADL completion with any deviations, mood and appetite notes, and any family contact. I treat the log as the next caregiver\u2019s briefing, so I write the way I\u2019d want to be briefed. If anything changed materially, I message the agency before I leave the property.',
  },
]

// ──────────────────────────────────────────────────────────────────────────────
// Atoms
// ──────────────────────────────────────────────────────────────────────────────

function TierChip({ tier, size = 'sm' }: { tier: TierLevel; size?: 'sm' | 'md' }) {
  const m = tierMeta[tier]
  const isSm = size === 'sm'
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        fontSize: isSm ? 10 : 11,
        fontWeight: 700,
        padding: isSm ? '2px 8px' : '3px 10px',
        borderRadius: 9999,
        background: m.bg,
        color: m.color,
        border: `1px solid ${m.border}`,
        fontFamily: SANS,
        whiteSpace: 'nowrap',
        letterSpacing: '0.02em',
      }}
    >
      <Shield size={isSm ? 9 : 10} />
      Tier {tier} · {m.label}
    </span>
  )
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontFamily: SANS,
        fontSize: 11,
        fontWeight: 700,
        color: C.fg5,
        textTransform: 'uppercase',
        letterSpacing: '0.07em',
      }}
    >
      {children}
    </div>
  )
}

function Section({ title, children, id }: { title: string; children: React.ReactNode; id?: string }) {
  return (
    <section
      id={id}
      style={{
        background: C.white,
        borderRadius: 16,
        border: `1px solid ${C.border}`,
        boxShadow: '0 2px 8px rgba(13,27,62,0.06), 0 1px 2px rgba(13,27,62,0.04)',
        padding: 24,
      }}
    >
      <h2
        style={{
          margin: 0,
          marginBottom: 18,
          paddingLeft: 12,
          borderLeft: `3px solid ${C.gold}`,
          fontFamily: SERIF,
          fontWeight: 400,
          fontSize: '1.25rem',
          letterSpacing: '-0.005em',
          color: C.fg1,
        }}
      >
        {title}
      </h2>
      {children}
    </section>
  )
}

function Bar({ pct, height = 8, gold = false }: { pct: number; height?: number; gold?: boolean }) {
  return (
    <div
      style={{
        height,
        background: '#E2E8F0',
        borderRadius: 999,
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          width: `${Math.max(0, Math.min(100, pct))}%`,
          height: '100%',
          borderRadius: 999,
          background: gold
            ? 'linear-gradient(90deg, #C9973A, #E8B86D)'
            : pct >= 80 ? C.successDeep : pct >= 60 ? C.gold : pct >= 40 ? '#EA580C' : '#DC2626',
          transition: 'width 400ms cubic-bezier(0.4,0,0.2,1)',
        }}
      />
    </div>
  )
}

function RatingDim({ label, value }: { label: string; value: number | null }) {
  const val = value || 0
  const color = val >= 4 ? C.successDeep : val >= 3 ? C.gold : val >= 2 ? '#EA580C' : '#DC2626'
  return (
    <div style={{ background: C.bgSubtle, borderRadius: 10, padding: 12, textAlign: 'center' }}>
      <div style={{ fontSize: 20, fontWeight: 700, color }}>{val.toFixed(1)}</div>
      <div style={{ fontSize: 10, color: C.fg4, marginTop: 2 }}>{label}</div>
    </div>
  )
}

function Stars({ n }: { n: number }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 2 }}>
      {[1, 2, 3, 4, 5].map(i => (
        <Star
          key={i}
          size={13}
          fill={i <= n ? C.gold : 'none'}
          color={i <= n ? C.gold : C.fg5}
          strokeWidth={1.75}
        />
      ))}
    </span>
  )
}

// ──────────────────────────────────────────────────────────────────────────────
// Component
// ──────────────────────────────────────────────────────────────────────────────


export interface CaregiverProfileProps {
  // Identity
  firstName: string
  lastName: string
  preferredName?: string
  jobTitle?: string
  credential?: string
  city?: string
  state?: string
  yearsExperience?: number
  photoUrl?: string
  availabilityStatus?: string
  hourlyRateMin?: number
  hourlyRateMax?: number
  openToUrgent?: boolean
  willingLiveIn?: boolean
  hasVehicle?: boolean
  languages?: string[]
  languageFluency?: Record<string, string>
  bio?: string
  profileCompletion?: number
  aggregateScore?: number
  ratingCount?: number
  // Clinical
  services?: string[]
  specializations?: string[]
  diagnosisExperience?: Record<string, string>
  adlsPerformed?: Record<string, string>
  specializedTechniques?: string[]
  // Availability
  weeklyGrid?: Record<string, boolean>
  minHoursPerWeek?: number
  maxHoursPerWeek?: number
  serviceAreas?: string[]
  travelRadius?: number
  hasDriversLicense?: boolean
  willingToTransport?: boolean
  // Compliance
  vulnerableSectorCheck?: boolean
  bondedInsured?: boolean
  immunisationRecords?: Record<string, boolean>
  declarationDate?: string
  criminalDeclaration?: boolean
  // Red flags
  rfTerminated?: string
  rfComplaint?: string
  rfPhysicalLimitation?: string
  rfBackground?: string
  // Personality
  personalityProfile?: Record<string, any>
  workingStyleTags?: string[]
  // Work history
  workHistory?: Array<Record<string, any>>
  // References (verified)
  verifiedReferences?: Array<{
    reference_name: string
    relationship: string
    would_rehire: string
    reliability_rating: number
    professionalism_rating: number
    comment?: string
    completed_at: string
  }>
  // Certifications
  certifications?: Array<Record<string, any>>
  // Open questions
  openQ1?: string
  openQ2?: string
  openQ3?: string
  // Placement ratings
  placementRatings?: {
    review_count: string
    rehire_rate: number
    avg_punctuality: number
    avg_reliability: number
    avg_warmth: number
    avg_dignity: number
    avg_patience: number
    avg_hygiene: number
    avg_skills: number
    avg_comms: number
  }
  badges?: Array<{
    id: string
    label: string
    description: string
    earned_at: string
  }>
  // Contact info (only shown to approved agencies)
  contactPhone?: string | null
  contactEmail?: string | null
}

export default function CaregiverProfileDemo(props: CaregiverProfileProps = {} as CaregiverProfileProps) {
  // Merge real data with demo fallbacks
  const dm = props


  const [openWorkHistory, setOpenWorkHistory] = useState(true)
  const [openRoles, setOpenRoles] = useState<Record<number, boolean>>({ 0: true, 1: false, 2: false })
  const [openCredentials, setOpenCredentials] = useState(true)
  const [openOpenQs, setOpenOpenQs] = useState(true)

  const initials = `${caregiver.firstName[0]}${caregiver.lastName[0]}`
  const fullName = `${dm.firstName || caregiver.firstName} ${dm.lastName || caregiver.lastName}`

  return (
    <div
      style={{
        minHeight: '100vh',
        background: C.cream,
        fontFamily: SANS,
        color: C.fg1,
      }}
    >
      {/* Top breadcrumb bar */}
      <div style={{ background: C.navy, padding: '12px 24px' }}>
        <div
          style={{
            maxWidth: 1100,
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            fontSize: 13,
            color: 'rgba(255,255,255,0.55)',
          }}
        >
          <span>Search</span>
          <span style={{ color: 'rgba(255,255,255,0.3)' }}>›</span>
          <span style={{ color: 'rgba(255,255,255,0.85)' }}>{fullName}</span>
        </div>
      </div>

      {/* ────── 1. HERO ─────────────────────────────────────────────────── */}
      <header
        style={{
          background: C.navy,
          position: 'relative',
          overflow: 'hidden',
          padding: '80px 24px 72px',
        }}
      >
        {/* Grain */}
        <div
          aria-hidden
          style={{
            position: 'absolute',
            inset: 0,
            opacity: 0.04,
            pointerEvents: 'none',
            backgroundImage:
              'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\'/%3E%3C/svg%3E")',
          }}
        />
        {/* Gold radial glow */}
        <div
          aria-hidden
          style={{
            position: 'absolute',
            top: -80,
            left: -80,
            width: 320,
            height: 480,
            background: 'radial-gradient(circle, rgba(201,151,58,0.12) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />

        <div
          style={{
            position: 'relative',
            maxWidth: 1100,
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: 'minmax(0,1fr) auto',
            gap: 32,
            alignItems: 'flex-start',
          }}
        >
          {/* Left: identity */}
          <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start', flexWrap: 'wrap' }}>
            <img
              src="/maria-santos-demo.png"
              alt="Maria Santos"
              style={{
                width: '130px',
                height: '130px',
                borderRadius: '50%',
                objectFit: 'cover',
                objectPosition: 'center top',
                border: '3px solid #C9973A',
                display: 'block',
              }}
            />

            <div style={{ flex: 1, minWidth: 240 }}>
              {/* Name + tier */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                <h1
                  style={{
                    fontFamily: SERIF,
                    fontWeight: 400,
                    fontSize: 'clamp(1.75rem, 3.4vw, 2.4rem)',
                    color: '#F5F0E8',
                    letterSpacing: '-0.01em',
                    margin: 0,
                    lineHeight: 1.1,
                  }}
                >
                  {fullName}
                </h1>
                <span
                  style={{
                    fontFamily: SANS,
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                    color: C.navy,
                    background: 'linear-gradient(135deg, #C9973A, #E8B86D)',
                    padding: '4px 10px',
                    borderRadius: 6,
                  }}
                >
                  {caregiver.reviewsTier} tier
                </span>
              </div>

              {/* Credential italic */}
              <div
                style={{
                  fontFamily: SERIF,
                  fontStyle: 'italic',
                  color: C.gold,
                  fontSize: '1rem',
                  margin: '4px 0 12px',
                }}
              >
                {dm.credential || caregiver.credential} — {dm.jobTitle || caregiver.jobTitle}
              </div>

              {/* Meta row */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, marginBottom: 14 }}>
                <Meta icon={<MapPin size={13} />}>{dm.city || caregiver.city}, {dm.state || caregiver.state}</Meta>
                <Meta icon={<Briefcase size={13} />}>{dm.yearsExperience ?? caregiver.yearsExperience} yrs experience</Meta>
                <Meta icon={<Clock size={13} />}>Avg placement: 14 months</Meta>
                <Meta icon={<Award size={13} />}>Available immediately</Meta>
              </div>

              {/* Chips */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                <HeroChip
                  color={C.success}
                  bg={'rgba(22,163,74,0.18)'}
                  icon={<Clock size={11} />}
                  label={dm.availabilityStatus === 'available_now' ? 'Available now' : dm.availabilityStatus === 'open_to_opportunities' ? 'Open to opportunities' : caregiver.availability}
                  dot
                />
                {caregiver.openToUrgent && (
                  <HeroChip color={C.urgent} bg={C.urgentBg} icon={<AlertCircle size={11} />} label="Open to urgent placements" />
                )}
                {caregiver.willingLiveIn && (
                  <HeroChip color={C.livein} bg={C.liveinBg} icon={<User size={11} />} label="Live-in capable" />
                )}

              </div>
            </div>
          </div>

          {/* Right: trust score + CTAs */}
          <aside
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
              minWidth: 240,
            }}
          >
            {/* Trust score card */}
            <div
              style={{
                background: 'rgba(255,255,255,0.06)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                border: '1px solid rgba(201,151,58,0.30)',
                borderRadius: 14,
                padding: '14px 18px',
                textAlign: 'center',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <Star size={22} fill={C.gold} color={C.gold} />
                <span style={{ fontFamily: SERIF, fontSize: 32, color: '#F5F0E8', lineHeight: 1 }}>
                  {caregiver.trustScore.toFixed(1)}
                </span>
                <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>/ 5</span>
              </div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)', marginTop: 4 }}>
                {dm.ratingCount || caregiver.reviewCount} verified reviews · Profile {dm.profileCompletion || caregiver.profileCompletion}% complete
              </div>
            </div>

            {/* CTAs */}
            <button
              type="button"
              style={{
                background: 'linear-gradient(135deg, #C9973A, #E8B86D)',
                color: C.navy,
                border: 'none',
                borderRadius: 10,
                padding: '12px 20px',
                fontFamily: SANS,
                fontSize: 14,
                fontWeight: 700,
                letterSpacing: '0.02em',
                cursor: 'pointer',
                boxShadow: '0 4px 16px rgba(201,151,58,0.35)',
              }}
            >
              Add to shortlist
            </button>
            <button
              type="button"
              style={{
                background: 'transparent',
                color: '#F5F0E8',
                border: '1.5px solid rgba(201,151,58,0.55)',
                borderRadius: 10,
                padding: '12px 20px',
                fontFamily: SANS,
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Request contact
            </button>
          </aside>
        </div>
      </header>

      {/* ────── BODY ─────────────────────────────────────────────────────── */}
      <main
        style={{
          maxWidth: 1100,
          margin: '0 auto',
          padding: '28px 24px 48px',
          display: 'flex',
          flexDirection: 'column',
          gap: 20,
        }}
      >
        {/* 2. VERIFICATION STATUS */}
        {/* SUMMARY BANNER */}
        <div style={{ background: '#0D1B3E', borderRadius: 12, padding: '14px 20px', marginBottom: 0 }}>
          <p style={{ margin: 0, fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 700, color: '#F5F0E8', lineHeight: 1.5 }}>
            8-year PSW with verified dementia and palliative depth &mdash; 3 confirmed references, current VSC, available immediately. Average placement tenure: 14 months.
          </p>
        </div>
        {/* 2. DISCLOSURE — moved to top for agency triage */}
        <Section title="Disclosure">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {redFlags.map((r, i) => {
              const isYes = r.answer === 'Yes'
              return (
                <div
                  key={i}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr auto',
                    gap: 12,
                    alignItems: 'center',
                    padding: '12px 14px',
                    background: isYes ? '#FEF2F2' : C.successBg,
                    border: `1px solid ${isYes ? 'rgba(220,38,38,0.20)' : C.successBorder}`,
                    borderRadius: 10,
                  }}
                >
                  <div style={{ fontSize: 13, color: C.fg1 }}>
                    {r.question}
                    {isYes && r.explanation && (
                      <div style={{ fontSize: 12, color: C.fg3, marginTop: 4 }}>{r.explanation}</div>
                    )}
                  </div>
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 5,
                      fontSize: 12,
                      fontWeight: 700,
                      padding: '4px 12px',
                      borderRadius: 999,
                      background: isYes ? '#DC2626' : C.success,
                      color: 'white',
                      letterSpacing: '0.02em',
                    }}
                  >
                    {isYes ? <AlertCircle size={12} /> : <CheckCircle size={12} />}
                    {r.answer}
                  </span>
                </div>
              )
            })}
          </div>
        </Section>

        {/* 3. VERIFICATION STATUS */}
        <Section title="Verification status">
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 240px', gap: 24 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {verification.map((v, i) => (
                <div
                  key={i}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr auto',
                    alignItems: 'center',
                    gap: 12,
                    padding: '10px 14px',
                    background: C.bgSubtle,
                    border: `1px solid ${C.borderSoft}`,
                    borderRadius: 12,
                  }}
                >
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: C.fg1 }}>{v.label}</div>
                    {v.meta && <div style={{ fontSize: 12, color: C.fg4, marginTop: 2 }}>{v.meta}</div>}
                  </div>
                  <TierChip tier={v.tier} />
                </div>
              ))}
            </div>

            {/* Confidence aside */}
            <div
              style={{
                background: C.goldTint,
                border: '1px solid rgba(201,151,58,0.25)',
                borderRadius: 12,
                padding: 16,
                alignSelf: 'start',
              }}
            >
              <Eyebrow>Overall confidence</Eyebrow>
              <div
                style={{
                  fontFamily: SERIF,
                  fontSize: 36,
                  color: C.fg1,
                  margin: '4px 0 8px',
                  lineHeight: 1,
                }}
              >
                {overallConfidence}
                <span style={{ fontSize: 16, color: C.fg4 }}> /100</span>
              </div>
              <Bar pct={overallConfidence} height={6} gold />
              <p style={{ fontSize: 12, color: C.fg3, lineHeight: 1.55, marginTop: 10, marginBottom: 0 }}>
                Weighted across system, document, reference, and self-reported claims. Careified does not assess
                quality — only the strength of evidence behind each claim.
              </p>
            </div>
          </div>
        </Section>

        {/* CONTACT INFO */}
        {(dm.contactPhone || dm.contactEmail) && (
          <ContactCard phone={dm.contactPhone} email={dm.contactEmail} />
        )}

        {/* 5. AGENCY RATINGS (from placement reviews) */}
        {dm.placementRatings && parseInt(dm.placementRatings.review_count || '0') > 0 && (
          <Section title="Agency ratings">
            <div style={{ display: 'grid', gap: 16 }}>
              {/* Rehire rate */}
              <div style={{ background: C.bgSubtle, borderRadius: 12, padding: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: C.fg1 }}>Re-hire rate</span>
                  <span style={{ fontSize: 18, fontWeight: 700, color: C.gold }}>
                    {Math.round(dm.placementRatings.rehire_rate)}%
                  </span>
                </div>
                <Bar pct={dm.placementRatings.rehire_rate} height={8} gold />
                <div style={{ fontSize: 11, color: C.fg4, marginTop: 8 }}>
                  Based on {dm.placementRatings.review_count} placement{dm.placementRatings.review_count !== '1' ? 's' : ''}
                </div>
              </div>

              {/* Rating dimensions grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                <RatingDim label="Punctuality" value={dm.placementRatings.avg_punctuality} />
                <RatingDim label="Reliability" value={dm.placementRatings.avg_reliability} />
                <RatingDim label="Warmth" value={dm.placementRatings.avg_warmth} />
                <RatingDim label="Dignity" value={dm.placementRatings.avg_dignity} />
                <RatingDim label="Patience" value={dm.placementRatings.avg_patience} />
                <RatingDim label="Hygiene" value={dm.placementRatings.avg_hygiene} />
                <RatingDim label="Skills" value={dm.placementRatings.avg_skills} />
                <RatingDim label="Communication" value={dm.placementRatings.avg_comms} />
              </div>
            </div>
          </Section>
        )}

        {/* 6. BADGES */}
        {dm.badges && dm.badges.length > 0 && (
          <Section title="Badges">
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
              {dm.badges.map((badge) => (
                <div
                  key={badge.id}
                  title={badge.description}
                  style={{
                    background: 'linear-gradient(135deg, #C9973A, #E8B86D)',
                    color: C.navy,
                    padding: '8px 16px',
                    borderRadius: 20,
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: 'help',
                  }}
                >
                  {badge.label}
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* 4. CLINICAL EXPERIENCE */}
        <Section title="Clinical experience">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
            <div>
              <Eyebrow>Diagnosis experience</Eyebrow>
              <div
                style={{
                  marginTop: 10,
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                  gap: 8,
                }}
              >
                {diagnoses.map((d, i) => (
                  <div
                    key={i}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 10,
                      padding: '10px 14px',
                      background: C.bgSubtle,
                      border: `1px solid ${C.borderSoft}`,
                      borderRadius: 10,
                    }}
                  >
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: C.fg1 }}>{d.condition}</div>
                      <div style={{ fontSize: 11, color: C.fg4, marginTop: 2 }}>{d.years} yr{d.years !== 1 ? 's' : ''}</div>
                    </div>
                    <TierChip tier={d.tier} />
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Eyebrow>ADLs performed</Eyebrow>
              <div
                style={{
                  marginTop: 10,
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                  gap: 6,
                }}
              >
                {adls.map((a, i) => (
                  <div
                    key={i}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 10,
                      padding: '8px 4px',
                    }}
                  >
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 13, color: C.fg3 }}>
                      <CheckCircle size={14} color={C.success} />
                      {a.label}
                    </span>
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        color: a.frequency === 'Every shift' ? C.fg1 : a.frequency === 'Daily' ? C.fg3 : C.fg5,
                      }}
                    >
                      {a.frequency}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 22 }}>
              <div>
                <Eyebrow>Specialized techniques</Eyebrow>
                <ChipRow items={techniques} variant="navy" />
              </div>
              <div>
                <Eyebrow>Equipment trained on</Eyebrow>
                <ChipRow items={equipment} variant="royal" />
              </div>
            </div>
          </div>
        </Section>

        {/* 5. VERIFIED REFERENCES */}
        <Section title="Verified references">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(310px, 1fr))', gap: 14 }}>
            {references.map((r, i) => (
              <div
                key={i}
                style={{
                  background: C.successBg,
                  border: `1px solid ${C.successBorder}`,
                  borderRadius: 12,
                  padding: 16,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 10,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: C.fg1, lineHeight: 1.3 }}>{r.name}</div>
                    <div style={{ fontSize: 12, color: C.fg4, marginTop: 2 }}>{r.relationship}</div>
                  </div>
                  <CheckCircle size={20} color={C.success} fill="white" />
                </div>

                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    alignSelf: 'flex-start',
                    gap: 6,
                    fontSize: 11,
                    fontWeight: 700,
                    padding: '3px 10px',
                    borderRadius: 999,
                    background: C.success,
                    color: 'white',
                  }}
                >
                  <CheckCircle size={11} /> Would rehire — without hesitation
                </div>

                <div style={{ display: 'flex', gap: 16, fontSize: 12, color: C.fg3 }}>
                  <div>
                    <div style={{ fontSize: 10, color: C.fg5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Reliability</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                      <Stars n={r.reliability} />
                      <span style={{ fontWeight: 700, color: C.fg1 }}>{r.reliability}/5</span>
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 10, color: C.fg5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Professionalism</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                      <Stars n={r.professionalism} />
                      <span style={{ fontWeight: 700, color: C.fg1 }}>{r.professionalism}/5</span>
                    </div>
                  </div>
                </div>

                <p
                  style={{
                    fontFamily: SERIF,
                    fontStyle: 'italic',
                    fontSize: 13,
                    color: C.fg3,
                    lineHeight: 1.6,
                    margin: 0,
                  }}
                >
                  &ldquo;{r.comment}&rdquo;
                </p>

                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: C.successDeep, fontWeight: 600, marginTop: 'auto' }}>
                  <Shield size={11} /> {r.verifiedDate}
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* 6. AVAILABILITY & LOGISTICS */}
        <Section title="Availability & logistics">
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 280px', gap: 24 }}>
            {/* Weekly grid */}
            <div>
              <Eyebrow>Weekly availability</Eyebrow>
              <div
                style={{
                  marginTop: 10,
                  display: 'grid',
                  gridTemplateColumns: '90px repeat(7, 1fr)',
                  gap: 4,
                }}
              >
                <div />
                {days.map(d => (
                  <div
                    key={d}
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      textAlign: 'center',
                      color: C.fg4,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                    }}
                  >
                    {d}
                  </div>
                ))}
                {blocks.map((b, bi) => (
                  <ReactFragmentRow key={b}>
                    <div
                      style={{
                        fontSize: 11,
                        fontWeight: 600,
                        color: C.fg3,
                        display: 'flex',
                        alignItems: 'center',
                        paddingRight: 6,
                      }}
                    >
                      {b}
                    </div>
                    {weeklyGrid[bi].map((cell, ci) => (
                      <div
                        key={ci}
                        title={`${b} — ${days[ci]} — ${cell === 2 ? 'Preferred' : cell === 1 ? 'Available' : 'Unavailable'}`}
                        style={{
                          aspectRatio: '1.4 / 1',
                          borderRadius: 6,
                          border: `1px solid ${C.borderSoft}`,
                          background:
                            cell === 2
                              ? 'linear-gradient(135deg, #C9973A, #E8B86D)'
                              : cell === 1
                              ? C.goldTint
                              : C.bgSubtle,
                        }}
                      />
                    ))}
                  </ReactFragmentRow>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 14, marginTop: 12, flexWrap: 'wrap' }}>
                <Legend swatch="linear-gradient(135deg, #C9973A, #E8B86D)" label="Preferred" />
                <Legend swatch={C.goldTint} label="Available" border />
                <Legend swatch={C.bgSubtle} label="Unavailable" border />
              </div>
            </div>

            {/* Side facts */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <Stat label="Hours / week" value={`${minHours}–${maxHours} hrs`} />
              <Stat label="Languages" value="English (native) · Portuguese (fluent)" />
              <Stat label="Hourly rate" value={`$${dm.hourlyRateMin || caregiver.rateMin}–$${dm.hourlyRateMax || caregiver.rateMax}/hr`} />
              <Stat label="Travel radius" value={`${travelRadius} km from ${dm.city || caregiver.city}`} />
              <Stat label="Vehicle" value="Yes — Class G license" />
              <Stat label="Drives clients" value="Yes — willing in own vehicle" />
              <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 10, padding: '10px 14px', marginTop: 4 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Rate breakdown</div>
                {[
                  { label: 'Regular', rate: '$24–$28/hr' },
                  { label: 'Overnight', rate: '$32/hr' },
                  { label: 'Live-in', rate: '$220/day' },
                  { label: 'Holiday', rate: '$36/hr' },
                ].map((r, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#0D1B3E', marginBottom: 4 }}>
                    <span style={{ color: '#64748B' }}>{r.label}</span>
                    <span style={{ fontWeight: 700 }}>{r.rate}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div style={{ marginTop: 18 }}>
            <Eyebrow>Service areas</Eyebrow>
            <div style={{ marginTop: 8, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {serviceAreas.map((a, i) => (
                <span
                  key={i}
                  style={{
                    fontSize: 12,
                    padding: '5px 12px',
                    borderRadius: 999,
                    border: `1px solid rgba(201,151,58,0.40)`,
                    color: C.fg1,
                    background: 'transparent',
                    fontWeight: 500,
                  }}
                >
                  {a}
                </span>
              ))}
            </div>
          </div>
        </Section>

        {/* 7. HIRING SCORECARD */}
        <Section title="Hiring scorecard">
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 320px', gap: 28 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {scorecard.map((s, i) => (
                <div key={i}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'baseline',
                      marginBottom: 4,
                    }}
                  >
                    <span style={{ fontSize: 13, fontWeight: 700, color: C.fg1 }}>{s.label}</span>
                    <span style={{ fontFamily: SERIF, fontSize: 18, color: C.fg1 }}>{s.pct}%</span>
                  </div>
                  <Bar pct={s.pct} />
                  <div style={{ fontSize: 12, color: C.fg3, lineHeight: 1.55, marginTop: 6 }}>{s.reason}</div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div
                style={{
                  background: C.navy,
                  borderRadius: 14,
                  padding: 16,
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                <Eyebrow>
                  <span style={{ color: C.gold }}>Why this caregiver stands out</span>
                </Eyebrow>
                <p
                  style={{
                    fontFamily: SERIF,
                    fontStyle: 'italic',
                    fontSize: 14,
                    lineHeight: 1.55,
                    color: '#F5F0E8',
                    margin: '8px 0 0',
                  }}
                >
                  {aiSummary}
                </p>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.45)', marginTop: 10 }}>
                  Generated from profile evidence — not an endorsement.
                </div>
              </div>
              <div
                style={{
                  background: C.bgSubtle,
                  border: `1px solid ${C.borderSoft}`,
                  borderRadius: 12,
                  padding: 14,
                }}
              >
                <Eyebrow>What to verify in your call</Eyebrow>
                <ul style={{ margin: '8px 0 0', padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {verifyInCall.map((v, i) => (
                    <li
                      key={i}
                      style={{
                        display: 'flex',
                        gap: 8,
                        alignItems: 'flex-start',
                        fontSize: 12,
                        color: C.fg3,
                        lineHeight: 1.5,
                      }}
                    >
                      <span style={{ color: C.gold, fontWeight: 700, lineHeight: 1.5 }}>—</span>
                      <span>{v}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </Section>

        {/* 8. WORKING STYLE */}
        <Section title="Working style">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
            <div>
              <Eyebrow>Scenario-based style profile</Eyebrow>
              <div
                style={{
                  marginTop: 10,
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                  gap: 8,
                }}
              >
                {workingStyle.map((s, i) => (
                  <div
                    key={i}
                    style={{
                      padding: '10px 14px',
                      background: C.white,
                      border: `1px solid ${C.border}`,
                      borderRadius: 10,
                    }}
                  >
                    <div style={{ fontSize: 11, color: C.fg5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                      {s.label}
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: C.fg1, marginTop: 2 }}>{s.value}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Derived working style tags - show if available */}
            {dm.workingStyleTags && dm.workingStyleTags.length > 0 && (
              <div>
                <Eyebrow>Your working style</Eyebrow>
                <div style={{ marginTop: 10, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {dm.workingStyleTags.map((tag: string) => (
                    <span
                      key={tag}
                      style={{
                        background: '#FDF6EC',
                        border: '1px solid #C9973A',
                        borderRadius: 999,
                        padding: '4px 14px',
                        fontSize: 12,
                        fontWeight: 500,
                        color: '#0D1B3E',
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div>
              <Eyebrow>Top strengths</Eyebrow>
              <div style={{ marginTop: 10, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {strengths.map((s, i) => (
                  <span
                    key={i}
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      padding: '6px 14px',
                      borderRadius: 999,
                      background: 'linear-gradient(135deg, #C9973A, #E8B86D)',
                      color: C.navy,
                      letterSpacing: '0.02em',
                    }}
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <Eyebrow>Work environment preferences</Eyebrow>
              <div
                style={{
                  marginTop: 10,
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                  gap: 8,
                }}
              >
                {environmentPrefs.map((e, i) => (
                  <div
                    key={i}
                    style={{
                      display: 'flex',
                      gap: 10,
                      alignItems: 'flex-start',
                      padding: '10px 14px',
                      background: C.bgSubtle,
                      border: `1px solid ${C.borderSoft}`,
                      borderRadius: 10,
                    }}
                  >
                    <CheckCircle size={14} color={C.success} style={{ marginTop: 2, flexShrink: 0 }} />
                    <div>
                      <div style={{ fontSize: 11, color: C.fg5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{e.label}</div>
                      <div style={{ fontSize: 13, color: C.fg3, marginTop: 1 }}>{e.value}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Section>

        {/* 9. WORK HISTORY */}
        <Section title="Work history">
          <button
            type="button"
            onClick={() => setOpenWorkHistory(o => !o)}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '8px 0',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontFamily: SANS,
              fontSize: 13,
              fontWeight: 700,
              color: C.fg3,
              marginBottom: 12,
            }}
          >
            <span>3 documented roles · 8 years total</span>
            {openWorkHistory ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>

          {openWorkHistory && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {workHistory.map((w, i) => {
                const isOpen = openRoles[i]
                return (
                  <div
                    key={i}
                    style={{
                      border: `1px solid ${C.border}`,
                      borderRadius: 12,
                      overflow: 'hidden',
                      background: isOpen ? C.bgSubtle : C.white,
                      transition: 'background 150ms ease',
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => setOpenRoles(o => ({ ...o, [i]: !o[i] }))}
                      style={{
                        width: '100%',
                        display: 'grid',
                        gridTemplateColumns: '1fr auto auto',
                        gap: 12,
                        alignItems: 'center',
                        padding: '14px 16px',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        textAlign: 'left',
                        fontFamily: SANS,
                      }}
                    >
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: 14, fontWeight: 700, color: C.fg1 }}>{w.title}</div>
                        <div style={{ fontSize: 12, color: C.fg4, marginTop: 2 }}>
                          {w.employer} · {w.dates}
                        </div>
                      </div>
                      <TierChip tier={w.tier} />
                      {isOpen ? <ChevronUp size={16} color={C.fg4} /> : <ChevronDown size={16} color={C.fg4} />}
                    </button>
                    {isOpen && (
                      <div
                        style={{
                          padding: '0 16px 16px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 8,
                          fontSize: 13,
                          color: C.fg3,
                          lineHeight: 1.6,
                        }}
                      >
                        <p style={{ margin: 0 }}>{w.duties}</p>
                        <div
                          style={{
                            display: 'inline-flex',
                            alignSelf: 'flex-start',
                            alignItems: 'center',
                            gap: 6,
                            fontSize: 11,
                            fontWeight: 600,
                            padding: '4px 10px',
                            borderRadius: 6,
                            background: 'rgba(37,99,235,0.08)',
                            color: C.royal,
                            border: '1px solid rgba(37,99,235,0.20)',
                          }}
                        >
                          <Award size={11} /> Transfer technique: {w.technique}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </Section>

        {/* 10. CREDENTIALS & COMPLIANCE */}
        <Section title="Credentials & compliance">
          <button
            type="button"
            onClick={() => setOpenCredentials(o => !o)}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '8px 0',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontFamily: SANS,
              fontSize: 13,
              fontWeight: 700,
              color: C.fg3,
              marginBottom: 12,
            }}
          >
            <span>4 credentials · 5 immunisations on file</span>
            {openCredentials ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>

          {openCredentials && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 10 }}>
              {credentials.map((c, i) => (
                <div
                  key={i}
                  style={{
                    background: C.bgSubtle,
                    border: `1px solid ${C.borderSoft}`,
                    borderRadius: 12,
                    padding: 14,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 8,
                        background: 'rgba(37,99,235,0.10)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <Shield size={16} color={C.royal} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8 }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: C.fg1 }}>{c.label}</span>
                        <span
                          style={{
                            fontSize: 10,
                            fontWeight: 700,
                            padding: '2px 8px',
                            borderRadius: 6,
                            background: C.successBg,
                            color: C.successDeep,
                            border: `1px solid ${C.successBorder}`,
                            textTransform: 'uppercase',
                            letterSpacing: '0.04em',
                          }}
                        >
                          {c.status}
                        </span>
                      </div>
                      <div style={{ fontSize: 12, color: C.fg4, marginTop: 4 }}>{c.meta}</div>
                      <div style={{ marginTop: 8 }}>
                        <TierChip tier={c.tier} />
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Immunisations */}
              <div
                style={{
                  gridColumn: '1 / -1',
                  background: C.white,
                  border: `1px solid ${C.border}`,
                  borderRadius: 12,
                  padding: 14,
                }}
              >
                <Eyebrow>Immunisations</Eyebrow>
                <div
                  style={{
                    marginTop: 10,
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                    gap: 6,
                  }}
                >
                  {immunisations.map((im, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: C.fg3 }}>
                      <CheckCircle size={13} color={C.success} />
                      {im}
                    </div>
                  ))}
                </div>
                <div
                  style={{
                    marginTop: 14,
                    paddingTop: 12,
                    borderTop: `1px solid ${C.borderSoft}`,
                    fontSize: 12,
                    color: C.fg4,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                  }}
                >
                  <Shield size={12} color={C.gold} />
                  Declaration of accuracy signed by caregiver on <strong style={{ color: C.fg1 }}>{declarationDate}</strong>.
                </div>
              </div>
            </div>
          )}
        </Section>

        {/* 11. OPEN QUESTIONS */}
        <Section title="In their own words">
          <button
            type="button"
            onClick={() => setOpenOpenQs(o => !o)}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '8px 0',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontFamily: SANS,
              fontSize: 13,
              fontWeight: 700,
              color: C.fg3,
              marginBottom: 12,
            }}
          >
            <span>2 open responses</span>
            {openOpenQs ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          {openOpenQs && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {openQuestions.map((qa, i) => (
                <div key={i}>
                  <div
                    style={{
                      fontFamily: SERIF,
                      fontStyle: 'italic',
                      fontSize: 14,
                      color: C.gold,
                      marginBottom: 6,
                    }}
                  >
                    {qa.q}
                  </div>
                  <p
                    style={{
                      margin: 0,
                      padding: '14px 16px',
                      background: C.goldTint,
                      borderLeft: `3px solid ${C.gold}`,
                      borderRadius: '0 12px 12px 0',
                      fontSize: 13,
                      color: C.fg3,
                      lineHeight: 1.7,
                    }}
                  >
                    {qa.a}
                  </p>
                </div>
              ))}
            </div>
          )}
        </Section>

        {/* 12. DISCLAIMER */}
        <div
          style={{
            marginTop: 8,
            padding: 18,
            background: C.cream,
            border: `1px solid ${C.border}`,
            borderRadius: 12,
            fontSize: 12,
            color: C.fg4,
            lineHeight: 1.7,
            fontFamily: SANS,
          }}
        >
          <strong style={{ color: C.fg1 }}>About this profile.&nbsp;</strong>
          Information shown is self-disclosed by the caregiver and presented by Careified as submitted. Careified
          does not recommend, vouch for, or verify any caregiver. Any employment or engagement decision is the
          responsibility of the hiring agency.
        </div>
      </main>
    </div>
  )
}

// ──────────────────────────────────────────────────────────────────────────────
// Small helpers (kept inside file to satisfy single-file requirement)
// ──────────────────────────────────────────────────────────────────────────────

function Meta({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        fontSize: 13,
        color: 'rgba(245,240,232,0.70)',
      }}
    >
      <span style={{ display: 'inline-flex', color: 'rgba(245,240,232,0.55)' }}>{icon}</span>
      {children}
    </span>
  )
}

function HeroChip({
  icon,
  label,
  color,
  bg,
  dot = false,
}: {
  icon: React.ReactNode
  label: string
  color: string
  bg: string
  dot?: boolean
}) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        fontSize: 11,
        fontWeight: 700,
        padding: '5px 12px',
        borderRadius: 999,
        background: bg,
        color,
        letterSpacing: '0.02em',
      }}
    >
      {dot ? (
        <span style={{ width: 6, height: 6, borderRadius: '50%', background: color }} />
      ) : (
        <span style={{ display: 'inline-flex' }}>{icon}</span>
      )}
      {label}
    </span>
  )
}

function ChipRow({ items, variant }: { items: string[]; variant: 'navy' | 'royal' }) {
  const styles =
    variant === 'navy'
      ? { background: 'rgba(13,27,62,0.06)', color: C.fg1, border: '1px solid rgba(13,27,62,0.10)' }
      : { background: 'rgba(37,99,235,0.08)', color: C.royal, border: '1px solid rgba(37,99,235,0.20)' }
  return (
    <div style={{ marginTop: 10, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
      {items.map((it, i) => (
        <span
          key={i}
          style={{
            fontSize: 12,
            padding: '5px 12px',
            borderRadius: 999,
            fontWeight: 600,
            ...styles,
          }}
        >
          {it}
        </span>
      ))}
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        background: C.bgSubtle,
        border: `1px solid ${C.borderSoft}`,
        borderRadius: 10,
        padding: '10px 14px',
      }}
    >
      <div
        style={{
          fontSize: 10,
          fontWeight: 700,
          color: C.fg5,
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
        }}
      >
        {label}
      </div>
      <div style={{ fontSize: 14, fontWeight: 700, color: C.fg1, marginTop: 3 }}>{value}</div>
    </div>
  )
}

function Legend({ swatch, label, border }: { swatch: string; label: string; border?: boolean }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11, color: C.fg4 }}>
      <span
        style={{
          width: 14,
          height: 10,
          borderRadius: 3,
          background: swatch,
          border: border ? `1px solid ${C.border}` : 'none',
        }}
      />
      {label}
    </span>
  )
}

// React.Fragment-equivalent that allows row layout in CSS grid.
// Using a Fragment keeps grid-row continuity for cells passed in as siblings.
function ReactFragmentRow({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
