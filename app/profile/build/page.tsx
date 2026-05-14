"use client"

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { ProfileFormProvider, useProfileForm } from '@/lib/context/ProfileFormContext'
import Step1Identity from '@/components/profile/Step1Identity'
import Step2Services from './Step2Services'
import Step3Availability from './Step3Availability'
import Step4Location from './Step4Location'
import Step5Credentials from './Step5Credentials'
import Step9References from './Step9References'
import Step10OpenQuestions from './Step10OpenQuestions'
import Step11Consent from './Step11Consent'
import Step6Compliance from './Step6Compliance'
import Step7Personality from './Step7Personality'
import Step8WorkHistory from './Step8WorkHistory'
import Step6Review from './Step6Review'
import { CheckCircle, Circle, ChevronRight, ChevronLeft } from 'lucide-react'
import ProfilePreviewCard from '@/components/profile/ProfilePreviewCard'
import IDCardReveal from '@/components/profile/IDCardReveal'
import GhostProfileModal from '@/components/profile/GhostProfileModal'
import LiveBanner from '@/components/profile/LiveBanner'

const FONT_SERIF = "'Inter', sans-serif"
const FONT_SANS = "'Inter', sans-serif"

const STEPS = [
 { num: 1, title: 'Identity', desc: 'Name, photo, bio' },
 { num: 2, title: 'Services', desc: 'What you offer' },
 { num: 3, title: 'Availability', desc: 'When & where' },
 { num: 4, title: 'Location', desc: 'Service area, transport' },
 { num: 5, title: 'Credentials', desc: 'Licences, certifications' },
 { num: 6, title: 'Compliance', desc: 'Consents, declarations' },
 { num: 7, title: 'Personality', desc: 'Work style, strengths' },
 { num: 8, title: 'Work History', desc: 'Experience, employers' },
 { num: 9, title: 'References', desc: 'Who vouches for you' },
 { num: 10, title: 'Open Q\'s', desc: 'Final profile questions' },
 { num: 11, title: 'Your Preferences', desc: 'Communication & consent' },
]

const PROGRESS = [15, 30, 50, 57, 64, 70, 76, 82, 88, 94, 100]
const TIERS = ['Incomplete', 'Incomplete', 'Basic', 'Location', 'Verified', 'Compliance', 'Professional', 'Work History', 'References', 'Open Q\'s', 'Ready to Submit']

const MILESTONES: Record<number, { text: string; sub: string }> = {
  3: { text: 'Complete all steps to maximise your match score', sub: 'Agencies can find you once you complete Availability.' },
  5: { text: 'Complete all steps to maximise your match score', sub: 'Complete through Compliance for verification.' },
  7: { text: 'Complete all steps to maximise your match score', sub: 'Complete through Work History for Professional status.' },
}

interface FormData {
 certifications?: any[]
 references?: any[]
 [key: string]: any
}

function Step0ResumeUpload({ onParsed }: { onParsed: (fields: Record<string, any>) => void }) {
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [parsedData, setParsedData] = useState<Record<string, any> | null>(null)
  const [error, setError] = useState<string | null>(null)
  const searchParams = useSearchParams()
  const isClaimed = searchParams.get('claimed') === 'true'

  const handleFile = async (file: File) => {
    if (!file) return
    setIsUploading(true)
    setError(null)
    const formData = new FormData()
    formData.append('resume', file)
    try {
      const res = await fetch('/api/profile/parse-resume', { method: 'POST', body: formData })
      const data = await res.json()
      if (res.ok) setParsedData(data)
      else setError('Could not parse resume. Try again or skip.')
    } catch {
      setError('Upload failed. Try again or skip.')
    } finally {
      setIsUploading(false)
    }
  }

  const handleApply = async () => {
    if (!parsedData) return
    const fieldMap: Record<string, any> = {
      firstName: parsedData.firstName,
      lastName: parsedData.lastName,
      email: parsedData.email,
      phone: parsedData.phone,
      city: parsedData.city,
      state: parsedData.state,
      jobTitle: parsedData.jobTitle,
      yearsExperience: parsedData.yearsExperience,
      bio: parsedData.bio,
      services: parsedData.services,
      credentials: parsedData.certifications,
      specializations: parsedData.specializations,
      diagnosisExperience: parsedData.diagnosisExperience,
      adlsPerformed: parsedData.adlsPerformed,
      workHistory: parsedData.employers,
    }
    await Promise.all(
      Object.entries(fieldMap)
        .filter(([_, v]) => v !== null && v !== undefined && !(Array.isArray(v) && v.length === 0))
        .map(([field, value]) =>
          fetch('/api/profile/save-field', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ field, value })
          })
        )
    )
    onParsed(fieldMap)
    window.location.href = '/profile/build?step=1'
  }

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '40px 24px' }}>
      <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#0D1B3E', marginBottom: '8px', fontFamily: "'DM Serif Display', serif" }}>
        {isClaimed ? "Your profile has a head start." : "Let's build your profile"}
      </h1>
      <p style={{ fontSize: '15px', color: '#64748B', marginBottom: '32px' }}>
        {isClaimed
          ? "Your agency gave us your basic details. Upload your resume and we'll fill in the rest automatically — credentials, work history, certifications. Takes 2 minutes."
          : "Upload your resume and we'll fill in your details automatically. Takes 2 minutes."}
      </p>
      {!parsedData && !isUploading && (
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => { e.preventDefault(); setIsDragging(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f) }}
          onClick={() => document.getElementById('resume-upload')?.click()}
          style={{
            border: `2px dashed ${isDragging ? '#C9973A' : '#CBD5E1'}`,
            borderRadius: '12px', padding: '48px 24px', textAlign: 'center',
            cursor: 'pointer', background: isDragging ? 'rgba(201,151,58,0.04)' : '#F8FAFC',
            transition: 'all 0.2s'
          }}
        >
          <input id="resume-upload" type="file" accept=".pdf,.doc,.docx" style={{ display: 'none' }}
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f) }} />
          <p style={{ fontSize: '15px', color: '#475569', fontWeight: 500 }}>
            Drop your resume here or click to browse
          </p>
          <p style={{ fontSize: '13px', color: '#94A3B8', marginTop: '8px' }}>PDF, DOC, DOCX — max 5MB</p>
        </div>
      )}
      {isUploading && (
        <div style={{ textAlign: 'center', padding: '48px', color: '#64748B' }}>
          Reading your resume...
        </div>
      )}
      {error && <p style={{ color: '#DC2626', fontSize: '14px', marginTop: '16px' }}>{error}</p>}
      {parsedData && (
        <div style={{ marginTop: '24px' }}>
          <p style={{ fontSize: '15px', color: '#16A34A', fontWeight: 700, marginBottom: '20px' }}>✓ We extracted the following from your resume</p>

{/* Personal Info Grid */}
<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '20px' }}>
  {([
    ['First Name', parsedData.firstName],
    ['Last Name', parsedData.lastName],
    ['Email', parsedData.email],
    ['Phone', parsedData.phone],
    ['City', parsedData.city],
    ['State', parsedData.state],
    ['Job Title', parsedData.jobTitle],
    ['Years Experience', parsedData.yearsExperience],
  ] as [string, any][]).map(([label, value]) => (
    <div key={label} style={{
      background: value ? '#F0FDF4' : '#FFF7F7',
      border: `1px solid ${value ? '#BBF7D0' : '#FEE2E2'}`,
      borderRadius: '8px', padding: '10px'
    }}>
      <p style={{ fontSize: '11px', color: '#94A3B8', marginBottom: '2px' }}>{label}</p>
      <p style={{ fontSize: '13px', color: value ? '#15803D' : '#DC2626', fontWeight: 500 }}>
        {value ? String(value) : '✗ Not found'}
      </p>
    </div>
  ))}
</div>

{/* Bio */}
{parsedData.bio && (
  <div style={{ marginBottom: '16px' }}>
    <p style={{ fontSize: '12px', fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>Professional Summary</p>
    <p style={{ fontSize: '13px', color: '#334155', lineHeight: 1.5, background: '#F8FAFC', borderRadius: '8px', padding: '12px' }}>{parsedData.bio}</p>
  </div>
)}

{/* Work History */}
{parsedData.employers?.length > 0 && (
  <div style={{ marginBottom: '16px' }}>
    <p style={{ fontSize: '12px', fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>Work History — {parsedData.employers.length} positions found</p>
    {parsedData.employers.map((e: any, i: number) => (
      <div key={i} style={{ background: '#F8FAFC', borderRadius: '8px', padding: '10px 12px', marginBottom: '6px' }}>
        <p style={{ fontSize: '13px', fontWeight: 600, color: '#0D1B3E' }}>{e.title}</p>
        <p style={{ fontSize: '12px', color: '#64748B' }}>{e.organisation}{e.startYear && ` · ${e.startYear} – ${e.current ? 'Present' : e.endYear || '?'}`}</p>
      </div>
    ))}
  </div>
)}

{/* Services */}
{parsedData.services?.length > 0 && (
  <div style={{ marginBottom: '16px' }}>
    <p style={{ fontSize: '12px', fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>Services — {parsedData.services.length} found</p>
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
      {parsedData.services.map((s: string) => (
        <span key={s} style={{ background: '#EFF6FF', color: '#1D4ED8', borderRadius: '20px', padding: '4px 10px', fontSize: '12px', fontWeight: 500 }}>{s}</span>
      ))}
    </div>
  </div>
)}

{/* Certifications */}
{parsedData.certifications?.length > 0 && (
  <div style={{ marginBottom: '16px' }}>
    <p style={{ fontSize: '12px', fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>Certifications — {parsedData.certifications.length} found</p>
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
      {parsedData.certifications.map((c: string) => (
        <span key={c} style={{ background: '#FEF9C3', color: '#854D0E', borderRadius: '20px', padding: '4px 10px', fontSize: '12px', fontWeight: 500 }}>{c}</span>
      ))}
    </div>
  </div>
)}

{/* Specializations */}
{parsedData.specializations?.length > 0 && (
  <div style={{ marginBottom: '16px' }}>
    <p style={{ fontSize: '12px', fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>Specializations — {parsedData.specializations.length} found</p>
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
      {parsedData.specializations.map((s: string) => (
        <span key={s} style={{ background: '#F0FDF4', color: '#15803D', borderRadius: '20px', padding: '4px 10px', fontSize: '12px', fontWeight: 500 }}>{s}</span>
      ))}
    </div>
  </div>
)}

{/* Education */}
{parsedData.education?.length > 0 && (
  <div style={{ marginBottom: '16px' }}>
    <p style={{ fontSize: '12px', fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>Education</p>
    {parsedData.education.map((e: any, i: number) => (
      <div key={i} style={{ background: '#F8FAFC', borderRadius: '8px', padding: '10px 12px', marginBottom: '6px' }}>
        <p style={{ fontSize: '13px', fontWeight: 600, color: '#0D1B3E' }}>{e.degree}</p>
        <p style={{ fontSize: '12px', color: '#64748B' }}>{e.institution}{e.startYear && ` · ${e.startYear} – ${e.endYear || '?'}`}</p>
      </div>
    ))}
  </div>
)}

{/* ADLs */}
{parsedData.adlsPerformed?.length > 0 && (
  <div style={{ marginBottom: '16px' }}>
    <p style={{ fontSize: '12px', fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>ADLs Performed</p>
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
      {parsedData.adlsPerformed.map((a: string) => (
        <span key={a} style={{ background: '#FDF4FF', color: '#7E22CE', borderRadius: '20px', padding: '4px 10px', fontSize: '12px', fontWeight: 500 }}>{a}</span>
      ))}
    </div>
  </div>
)}

{/* Awards */}
{parsedData.awards?.length > 0 && (
  <div style={{ marginBottom: '16px' }}>
    <p style={{ fontSize: '12px', fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>Awards & Recognition</p>
    {parsedData.awards.map((a: any, i: number) => (
      <div key={i} style={{ background: '#FFFBEB', borderRadius: '8px', padding: '10px 12px', marginBottom: '6px', fontSize: '13px' }}>
        <span style={{ fontWeight: 600, color: '#92400E' }}>⭐ {a.title}</span>
        {a.organisation && <span style={{ color: '#78716C' }}> · {a.organisation}</span>}
        {a.year && <span style={{ color: '#A8A29E' }}> · {a.year}</span>}
      </div>
    ))}
  </div>
)}

{/* Missing fields note */}
<div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '12px', marginBottom: '20px', fontSize: '13px', color: '#64748B' }}>
  ℹ Missing fields can be filled in manually in the next steps.
</div>

<button onClick={handleApply} style={{
            width: '100%', padding: '14px', borderRadius: '10px', border: 'none',
            background: 'linear-gradient(135deg, #C9973A, #E8B86D)', color: '#0D1B3E',
            fontSize: '15px', fontWeight: 600, cursor: 'pointer', marginBottom: '12px'
          }}>
            Apply to my profile →
          </button>
        </div>
      )}
      <button onClick={() => { window.location.href = '/profile/build?step=1' }}
        style={{ background: 'none', border: 'none', color: '#94A3B8', fontSize: '13px', cursor: 'pointer', marginTop: '8px' }}>
        {isClaimed ? "Skip — I'll review what's already there" : "Skip for now"}
      </button>
    </div>
  )
}

function SavedIndicator({ show }: { show: boolean }) {
 return (
 <div style={{
 display: 'flex', alignItems: 'center', gap: '6px',
 opacity: show ? 1 : 0,
 transition: 'opacity 0.4s ease',
 fontSize: '11px', color: 'rgba(255,255,255,0.4)',
 fontFamily: FONT_SANS,
 }}>
 <div style={{
 width: '5px', height: '5px', borderRadius: '50%',
 background: '#22C55E',
 }} />
 Saved
 </div>
 )
}

function ProfileBuilder({ formData: contextFormData }: { formData?: any }) {
 const [formData, setFormData] = useState<FormData>(contextFormData || {})
 const [savedVisible, setSavedVisible] = useState(false)
 const [animDir, setAnimDir] = useState<'forward' | 'back'>('forward')
 const [animating, setAnimating] = useState(false)
 const [showReveal, setShowReveal] = useState(false)
 const [showModal, setShowModal] = useState(false)
 const [isClient, setIsClient] = useState(false)
 const [showLiveBanner, setShowLiveBanner] = useState(false)
 const searchParams = useSearchParams()
 const router = useRouter()
 const step = searchParams.get('step') || '0'
 const currentStep = parseInt(step)
 const progress = PROGRESS[currentStep - 1]
 const tier = TIERS[currentStep - 1]
 const milestone = MILESTONES[currentStep]

 // Use context formData if passed, otherwise local state
 const data = contextFormData || formData

 useEffect(() => {
 // Mark as client-side mounted
 setIsClient(true)
 
 // Check if user has seen the motivation modal
 const seen = localStorage.getItem('hasSeenProfileMotivation')
 
 // Show if never seen before
 if (!seen) {
 setShowModal(true)
 }
 }, [])

 const handleDismissModal = () => {
 localStorage.setItem('hasSeenProfileMotivation', 'true')
 setShowModal(false)
 }

 useEffect(() => {
 setAnimating(true)
 const t = setTimeout(() => setAnimating(false), 280)
 return () => clearTimeout(t)
 }, [currentStep])

 // Check for "went live" flag when entering step 4
 useEffect(() => {
 if (currentStep === 4) {
 const wentLive = localStorage.getItem('careified_went_live')
 if (wentLive === 'true') {
 setShowLiveBanner(true)
 localStorage.removeItem('careified_went_live')
 // Auto-dismiss after 8 seconds
 const t = setTimeout(() => setShowLiveBanner(false), 8000)
 return () => clearTimeout(t)
 }
 }
 }, [currentStep])

 const handleSave = (saveData: any) => {
 if (contextFormData) {
 // Context handles saving - just show indicator
 } else {
 setFormData(prev => ({ ...prev, ...saveData }))
 }
 setSavedVisible(true)
 setTimeout(() => setSavedVisible(false), 2000)
 }

 const navigate = (dir: 'forward' | 'back') => {
 setAnimDir(dir)
 const next = dir === 'forward' ? currentStep + 1 : currentStep - 1
 // Set "went live" flag when going from step 3 to step 4
 if (dir === 'forward' && currentStep === 3) {
 localStorage.setItem('careified_went_live', 'true')
 }
 if (next >= 1 && next <= 11) router.push(`?step=${next}`)
 }

  const goToStep = (num: number) => {
  // Allow backward navigation to any step <= currentStep
  if (num > currentStep) return
  setAnimDir(num < currentStep ? 'back' : 'forward')
  router.push(`?step=${num}`)
  }

 const renderStep = () => {
// Temporary placeholder for unbuilt steps
const StepPlaceholder = ({ title }: { title: string }) => (
 <div style={{ padding: '40px 20px', textAlign: 'center', color: '#94A3B8', fontSize: '14px' }}>
 {title} - coming soon
 </div>
)

 // Step 0 — redirect to Step 1 (consent now at Step 11)
  switch (currentStep) {
    case 0: return <Step0ResumeUpload onParsed={(fields) => { handleSave(fields) }} />
 case 1: return <AnimatePresence mode='wait'><motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}><Step1Identity /></motion.div></AnimatePresence>
 case 2: return <AnimatePresence mode='wait'><motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}><Step2Services /></motion.div></AnimatePresence>
 case 3: return <AnimatePresence mode='wait'><motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}><Step3Availability /></motion.div></AnimatePresence>
 case 4: return <AnimatePresence mode='wait'><motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}><Step4Location /></motion.div></AnimatePresence>
 case 5: return <AnimatePresence mode='wait'><motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}><Step5Credentials /></motion.div></AnimatePresence>
 case 6: return <AnimatePresence mode='wait'><motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}><Step6Compliance /></motion.div></AnimatePresence>
 case 7: return <AnimatePresence mode='wait'><motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}><Step7Personality /></motion.div></AnimatePresence>
 case 8: return <AnimatePresence mode='wait'><motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}><Step8WorkHistory /></motion.div></AnimatePresence>
 case 9: return <AnimatePresence mode='wait'><motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}><Step9References /></motion.div></AnimatePresence>
 case 10: return <AnimatePresence mode='wait'><motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}><Step10OpenQuestions /></motion.div></AnimatePresence>
 case 11: return <AnimatePresence mode='wait'><motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}><Step11Consent /></motion.div></AnimatePresence>
 default: return <Step1Identity />
 }
 }

 return (
 <>
 {isClient && showModal && <GhostProfileModal onDismiss={handleDismissModal} />}

 {/* Top bar */}
 <div style={{
 position: 'fixed', top: '60px', left: 0, right: 0,
 zIndex: 40, background: '#0D1B3E',
 height: '48px', display: 'flex',
 alignItems: 'center', justifyContent: 'space-between',
 padding: '0 24px',
 borderBottom: '1px solid rgba(255,255,255,0.06)',
 fontFamily: FONT_SANS,
 }}>
 <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
 <span style={{
 fontSize: '13px', fontWeight: 600, color: 'white',
 fontFamily: FONT_SERIF,
 }}>
 Build your profile
 </span>
 <span style={{
 fontSize: '11px', color: 'rgba(255,255,255,0.3)',
 paddingLeft: '16px',
 borderLeft: '1px solid rgba(255,255,255,0.1)',
 }}>
 Step {currentStep} of {STEPS.length}
 </span>
 </div>
 <SavedIndicator show={savedVisible} />
 </div>

 {/* Mobile step dots */}
 <div className="pb-mobile-steps" style={{
 display: 'none',
 position: 'fixed', top: '108px', left: 0, right: 0,
 zIndex: 39, background: 'white',
 padding: '12px 24px',
 borderBottom: '1px solid #F1F5F9',
 justifyContent: 'center', gap: '8px',
 }}>
 {STEPS.map(s => (
 <div
 key={s.num}
 onClick={() => goToStep(s.num)}
 style={{
 width: s.num === currentStep ? '24px' : '8px',
 height: '8px', borderRadius: '4px',
 background: s.num < currentStep
 ? '#C9973A'
 : s.num === currentStep
 ? 'linear-gradient(90deg, #C9973A, #E8B86D)'
 : '#E2E8F0',
 transition: 'all 0.3s ease',
 cursor: s.num < currentStep ? 'pointer' : 'default',
 }}
 />
 ))}
 </div>

 {/* Main layout */}
 <div style={{
 minHeight: '100vh', background: '#F7F4F0',
 paddingTop: '108px', paddingBottom: '160px', fontFamily: FONT_SANS,
 }}>
 <div className="pb-layout" style={{
 maxWidth: '1280px', margin: '0 auto',
 display: 'grid',
 gridTemplateColumns: '240px 560px 340px',
 gap: '40px', minHeight: 'calc(100vh - 108px)',
 padding: '120px 40px 160px',
 }}>

 {/* Sidebar */}
 <div className="pb-sidebar" style={{
 background: 'white',
 borderRight: '1px solid rgba(13,27,62,0.06)',
 padding: '24px 16px',
 position: 'sticky', top: '108px',
 height: 'calc(100vh - 108px)',
 overflowY: 'auto',
 }}>
 {/* Progress */}
 <div style={{
 marginBottom: '20px', paddingBottom: '16px',
 borderBottom: '1px solid #F1F5F9',
 }}>
 <div style={{
 fontSize: '10px', fontWeight: 700,
 letterSpacing: '0.08em', textTransform: 'uppercase',
 color: '#94A3B8', marginBottom: '8px',
 }}>
 Profile completion
 </div>
 <div style={{
 height: '4px', background: '#F1F5F9',
 borderRadius: '2px', overflow: 'hidden', marginBottom: '6px',
 }}>
 <div style={{
 height: '4px', borderRadius: '2px',
 background: 'linear-gradient(90deg, #C9973A, #E8B86D)',
 width: `${progress}%`,
 transition: 'width 0.6s cubic-bezier(0.4,0,0.2,1)',
 }} />
 </div>
 <div style={{
 display: 'flex', justifyContent: 'space-between',
 alignItems: 'center',
 }}>
 <span style={{
 fontSize: '13px', fontWeight: 600, color: '#C9973A',
 }}>
 {progress}%
 </span>
 <span style={{ fontSize: '10px', color: '#94A3B8' }}>
 {tier}
 </span>
 </div>
 </div>

 {/* Steps */}
 <div style={{
 display: 'flex', flexDirection: 'column', gap: '2px',
 marginBottom: '16px',
 }}>
 {STEPS.map(s => {
 const isDone = s.num < currentStep
 const isActive = s.num === currentStep
 const isLocked = s.num > currentStep
 return (
 <div
 key={s.num}
 className={isDone ? 'sidebar-step' : ''}
 onClick={() => goToStep(s.num)}
 style={{
 display: 'flex', alignItems: 'center', gap: '10px',
 padding: '8px 10px', borderRadius: '8px',
 cursor: isDone ? 'pointer' : 'default',
 background: isActive ? '#FDF6EC' : 'transparent',
 border: isActive ? '1px solid rgba(201,151,58,0.2)' : '1px solid transparent',
 opacity: isLocked ? 0.4 : 1,
 transition: 'all 0.15s',
 }}
 >
 <div style={{
 width: '22px', height: '22px', borderRadius: '50%',
 flexShrink: 0, display: 'flex',
 alignItems: 'center', justifyContent: 'center',
 background: isDone
 ? 'linear-gradient(135deg, #C9973A, #E8B86D)'
 : isActive
 ? 'linear-gradient(135deg, #C9973A, #E8B86D)'
 : '#F1F5F9',
 fontSize: '10px', fontWeight: 700,
 color: (isDone || isActive) ? '#0D1B3E' : '#CBD5E1',
 }}>
 {isDone ? '✓' : s.num}
 </div>
 <div>
 <div style={{
 fontSize: '12px', fontWeight: 500,
 color: isActive ? '#92400E' : isDone ? '#0D1B3E' : '#94A3B8',
 }}>
 {s.title}
 </div>
 <div style={{ fontSize: '10px', color: '#94A3B8' }}>
 {s.desc}
 </div>
 </div>
 </div>
 )
 })}
 </div>

 {/* Submit button */}
 <motion.button
whileHover={{ scale: 1.03 }}
whileTap={{ scale: 0.98 }}
transition={{ duration: 0.15 }}
 disabled={currentStep < 11}
 style={{
 width: '100%', padding: '10px',
 borderRadius: '8px', border: 'none',
 fontSize: '12px', fontWeight: 600,
 fontFamily: FONT_SANS,
 cursor: currentStep === 11 ? 'pointer' : 'not-allowed',
 opacity: currentStep === 11 ? 1 : 0.3,
 background: currentStep === 11
 ? 'linear-gradient(135deg, #C9973A, #E8B86D)'
 : '#F1F5F9',
 color: currentStep === 11 ? '#0D1B3E' : '#94A3B8',
 transition: 'all 0.2s',
 }}
 >
 Submit for review →
 </motion.button>
 </div>

 {/* Content area */}
 <div style={{ padding: '32px', overflowY: 'auto' }}>

 {/* Step header */}
 <div style={{ marginBottom: '28px' }}>
 <div style={{
 fontSize: '10px', fontWeight: 700,
 letterSpacing: '0.1em', textTransform: 'uppercase',
 color: '#C9973A', marginBottom: '6px',
 }}>
 Step {currentStep} · {STEPS[currentStep - 1]?.title || 'Starting'}
 </div>
 <div style={{
 fontFamily: FONT_SERIF,
 fontSize: '26px', color: '#0D1B3E',
 letterSpacing: '-0.02em', lineHeight: 1.1,
 }}>
 {currentStep === 1 && "Let's start with you."}
 {currentStep === 2 && "What do you offer?"}
 {currentStep === 3 && "When can you work?"}
 {currentStep === 4 && "Where will you work?"}
 {currentStep === 5 && "Your credentials."}
 {currentStep === 6 && "Compliance and consent."}
 {currentStep === 7 && "Your work style."}
 {currentStep === 8 && "Your experience."}
 {currentStep === 9 && "Who vouches for you?"}
 {currentStep === 10 && "Final questions."}
 {currentStep === 11 && "Almost done — just set your preferences below."}
 </div>
 </div>

 {/* Milestone banner */}
 {milestone && (
 <div style={{
 background: 'linear-gradient(135deg, rgba(201,151,58,0.08), rgba(201,151,58,0.04))',
 border: '1px solid rgba(201,151,58,0.2)',
 borderRadius: '10px', padding: '12px 16px',
 marginBottom: '24px',
 display: 'flex', alignItems: 'center', gap: '12px',
 }}>
 <div style={{
 width: '28px', height: '28px', borderRadius: '7px',
 background: 'linear-gradient(135deg, #C9973A, #E8B86D)',
 display: 'flex', alignItems: 'center', justifyContent: 'center',
 flexShrink: 0,
 }}>
 <CheckCircle size={14} color="#0D1B3E" />
 </div>
 <div>
 <div style={{
 fontSize: '12px', fontWeight: 600, color: '#92400E',
 }}>
 {milestone.text}
 </div>
 <div style={{ fontSize: '11px', color: '#B45309' }}>
 {milestone.sub}
 </div>
 </div>
 </div>
 )}

 {/* Live banner - shows when profile goes live at Step 3 */}
 {currentStep === 3 && <LiveBanner firstName={formData.firstName} />}

 {/* You're live banner - shows on Step 4 after completing Step 3 */}
 {showLiveBanner && currentStep === 4 && (
 <div style={{
 position: 'fixed',
 bottom: 0,
 left: 0,
 right: 0,
 zIndex: 50,
 background: '#0D1B3E',
 borderLeft: '4px solid #C9973A',
 padding: '16px 24px',
 display: 'flex',
 alignItems: 'center',
 justifyContent: 'space-between',
 }}>
 <style>{`
 @keyframes pulse {
 0%, 100% { opacity: 1; transform: scale(1); }
 50% { opacity: 0.5; transform: scale(1.4); }
 }
 `}</style>
 <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
   <div style={{
     width: 8,
     height: 8,
     borderRadius: '50%',
     background: '#C9973A',
     animation: 'pulse 2s ease-in-out infinite',
   }} />
   <div>
     <div style={{ color: 'white', fontSize: '14px', fontWeight: 600 }}>
       You're now live in agency search.
     </div>
     <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px' }}>
       Agencies can find you right now.
     </div>
   </div>
 </div>
 <button
   onClick={() => setShowLiveBanner(false)}
   style={{
     padding: '8px 16px',
     background: 'transparent',
     border: '1px solid rgba(255,255,255,0.3)',
     borderRadius: 6,
     color: 'white',
     fontSize: '13px',
     fontWeight: 500,
     cursor: 'pointer',
   }}
 >
   Got it
 </button>
 </div>
 )}

 {/* Step content with animation */}
 <div
 className={animating
 ? animDir === 'forward'
 ? 'step-content-forward'
 : 'step-content-back'
 : ''}
 >
 {renderStep()}
 </div>

 {/* Bottom navigation */}
 <div style={{
 display: 'flex', alignItems: 'center',
 justifyContent: 'space-between',
 marginTop: '40px', paddingTop: '20px',
 borderTop: '1px solid #F1F5F9',
 }}>
 {currentStep > 1 ? (
 <motion.button
whileHover={{ scale: 1.03 }}
whileTap={{ scale: 0.98 }}
transition={{ duration: 0.15 }}
 className="nav-btn-back"
 onClick={() => navigate('back')}
 style={{
 display: 'flex', alignItems: 'center', gap: '4px',
 fontSize: '13px', fontWeight: 500,
 color: '#64748B', background: 'none',
 border: 'none', cursor: 'pointer',
 fontFamily: FONT_SANS, transition: 'color 0.15s',
 padding: 0,
 }}
 >
 <ChevronLeft size={16} />
 Back
 </motion.button>
 ) : (
 <div />
 )}

 {currentStep < 11 ? (
 <motion.button
whileHover={{ scale: 1.03 }}
whileTap={{ scale: 0.98 }}
transition={{ duration: 0.15 }}
 className="nav-btn-next"
 onClick={() => navigate('forward')}
 style={{
 display: 'flex', alignItems: 'center', gap: '6px',
 fontSize: '13px', fontWeight: 600,
 padding: '10px 24px', borderRadius: '8px',
 background: 'linear-gradient(135deg, #C9973A, #E8B86D)',
 color: '#0D1B3E', border: 'none', cursor: 'pointer',
 fontFamily: FONT_SANS, marginLeft: 'auto',
 transition: 'opacity 0.2s',
 }}
 >
 Continue
 <ChevronRight size={16} />
 </motion.button>
 ) : (
 <motion.button
whileHover={{ scale: 1.03 }}
whileTap={{ scale: 0.98 }}
transition={{ duration: 0.15 }}
 className="nav-btn-next"
 style={{
 display: 'flex', alignItems: 'center', gap: '6px',
 fontSize: '13px', fontWeight: 600,
 padding: '10px 24px', borderRadius: '8px',
 background: 'linear-gradient(135deg, #C9973A, #E8B86D)',
 color: '#0D1B3E', border: 'none', cursor: 'pointer',
 fontFamily: FONT_SANS, marginLeft: 'auto',
 transition: 'opacity 0.2s',
 }}
 >
 Submit for review →
 </motion.button>
 )}
 </div>
 </div>

 {/* Live preview panel */}
 <div className="pb-preview" style={{ padding: '24px 16px 24px 0' }}>
 <ProfilePreviewCard data={formData as any} step={currentStep} />
 </div>
 </div>
 </div>

 {/* ID Card Reveal */}
 {showReveal && (
 <IDCardReveal
 caregiverData={{
 firstName: formData.firstName,
 lastName: formData.lastName,
 preferredName: formData.preferredName,
 jobTitle: formData.jobTitle,
 city: formData.city,
 state: formData.state,
 credentials: formData.credentials,
 caregiverCode: formData.caregiverCode,
 }}
  onViewProfile={() => {
  setShowReveal(false)
  router.push('/profile/strength')
  }}
 onDismiss={() => setShowReveal(false)}
 />
 )}
 </>
 )
}

export default function ProfileBuildPage() {
 return (
 <ProfileFormProvider>
 <ProfileBuilderWrapper />
 </ProfileFormProvider>
 )
}

function ProfileBuilderWrapper() {
 const { formData, updateFields, isLoaded } = useProfileForm()

 // Load from DB on mount
 useEffect(() => {
 if (!isLoaded) return
 fetch('/api/profile/load')
 .then(r => r.json())
 .then(({ exists, data }) => {
 if (exists && data) {
 updateFields(data)
 }
 })
 .catch(err => console.error('Profile load error:', err))
 }, [isLoaded])

 if (!isLoaded) {
 return (
 <div style={{
 minHeight: '100vh', display: 'flex',
 alignItems: 'center', justifyContent: 'center',
 background: '#F7F4F0',
 }}>
 <div style={{ fontSize: '13px', color: '#94A3B8' }}>
 Loading your profile...
 </div>
 </div>
 )
 }

 return <ProfileBuilder formData={formData} />
}
