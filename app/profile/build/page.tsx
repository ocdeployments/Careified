"use client"

import { useState, Suspense, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { ProfileFormProvider, useProfileForm } from '@/lib/context/ProfileFormContext'
import Step1Identity from '@/components/profile/Step1Identity'
import Step2Services from './Step2Services'
import Step3Availability from './Step3Availability'
import Step4Location from './Step4Location'
import Step4Certifications from './Step4Certifications'
import Step5References from './Step5References'
import Step6Review from './Step6Review'
import { CheckCircle, Circle, ChevronRight, ChevronLeft } from 'lucide-react'
import ProfilePreviewCard from '@/components/profile/ProfilePreviewCard'
import IDCardReveal from '@/components/profile/IDCardReveal'

const FONT_SERIF = "'DM Serif Display', serif"
const FONT_SANS = "'DM Sans', sans-serif"

const STEPS = [
 { num: 1, title: 'Identity', desc: 'Name, photo, bio' },
 { num: 2, title: 'Services', desc: 'What you offer' },
 { num: 3, title: 'Availability', desc: 'When & where' },
 { num: 4, title: 'Qualifications', desc: 'Your credentials' },
 { num: 5, title: 'References', desc: 'Who vouches for you' },
 { num: 6, title: 'Review', desc: 'Submit your profile' },
]

const PROGRESS = [14, 28, 42, 58, 72, 86]
const TIERS = ['Incomplete', 'Incomplete', 'Basic', 'Verified', 'Professional', 'Professional']

const MILESTONES: Record<number, { text: string; sub: string }> = {
 3: { text: 'Halfway there', sub: 'Complete 3 more steps to go live.' },
 5: { text: 'Almost live', sub: 'One more step before your profile is submitted.' },
}

interface FormData {
 certifications?: any[]
 references?: any[]
 [key: string]: any
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
 const searchParams = useSearchParams()
 const router = useRouter()
 const step = searchParams.get('step') || '1'
 const currentStep = parseInt(step)
 const progress = PROGRESS[currentStep - 1]
 const tier = TIERS[currentStep - 1]
 const milestone = MILESTONES[currentStep]

 // Use context formData if passed, otherwise local state
 const data = contextFormData || formData

 useEffect(() => {
 setAnimating(true)
 const t = setTimeout(() => setAnimating(false), 280)
 return () => clearTimeout(t)
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
 if (next >= 1 && next <= 6) router.push(`?step=${next}`)
 }

 const goToStep = (num: number) => {
 if (num >= currentStep) return
 setAnimDir('back')
 router.push(`?step=${num}`)
 }

 const renderStep = () => {
 switch (currentStep) {
 case 1: return <Step1Identity />
 case 2: return <Step2Services />
 case 3: return <Step3Availability />
 case 4: return <Step4Location />
 case 5: return <Step5References initialData={formData.references || []} onSave={handleSave} />
 case 6: return <Step6Review
 onEdit={(s: number) => router.push(`?step=${s}`)}
 onSubmitSuccess={() => setShowReveal(true)}
 />
 default: return <Step1Identity />
 }
 }

 return (
 <>
 <style>{`
 @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap');
 @keyframes slideInForward {
 from { opacity: 0; transform: translateX(24px); }
 to { opacity: 1; transform: translateX(0); }
 }
 @keyframes slideInBack {
 from { opacity: 0; transform: translateX(-24px); }
 to { opacity: 1; transform: translateX(0); }
 }
 .step-content-forward { animation: slideInForward 0.28s ease forwards; }
 .step-content-back { animation: slideInBack 0.28s ease forwards; }
 .sidebar-step:hover { background: #F8FAFC !important; }
 .nav-btn-back:hover { color: #0D1B3E !important; }
 .nav-btn-next:hover { opacity: 0.88; }
 @media (max-width: 768px) {
 .pb-layout { grid-template-columns: 1fr !important; }
 .pb-sidebar { display: none !important; }
 .pb-mobile-steps { display: flex !important; }
 .pb-preview { display: none !important; }
 }
 `}</style>

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
 paddingTop: '108px', fontFamily: FONT_SANS,
 }}>
 <div className="pb-layout" style={{
 maxWidth: '1000px', margin: '0 auto',
 display: 'grid',
 gridTemplateColumns: '220px 1fr 280px',
 gap: '0', minHeight: 'calc(100vh - 108px)',
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
 <button
 disabled={currentStep < 6}
 style={{
 width: '100%', padding: '10px',
 borderRadius: '8px', border: 'none',
 fontSize: '12px', fontWeight: 600,
 fontFamily: FONT_SANS,
 cursor: currentStep === 6 ? 'pointer' : 'not-allowed',
 opacity: currentStep === 6 ? 1 : 0.3,
 background: currentStep === 6
 ? 'linear-gradient(135deg, #C9973A, #E8B86D)'
 : '#F1F5F9',
 color: currentStep === 6 ? '#0D1B3E' : '#94A3B8',
 transition: 'all 0.2s',
 }}
 >
 Submit for review →
 </button>
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
 Step {currentStep} · {STEPS[currentStep - 1].title}
 </div>
 <div style={{
 fontFamily: FONT_SERIF,
 fontSize: '26px', color: '#0D1B3E',
 letterSpacing: '-0.02em', lineHeight: 1.1,
 }}>
 {currentStep === 1 && "Let's start with you."}
 {currentStep === 2 && "What do you offer?"}
 {currentStep === 3 && "When can you work?"}
 {currentStep === 4 && "Your credentials."}
 {currentStep === 5 && "Who vouches for you?"}
 {currentStep === 6 && "Ready to submit."}
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
 <button
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
 </button>
 ) : (
 <div />
 )}

 {currentStep < 6 ? (
 <button
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
 </button>
 ) : (
 <button
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
 </button>
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
 router.push('/profile/view')
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
 <Suspense fallback={
 <div style={{
 padding: '50px', textAlign: 'center',
 fontFamily: "'DM Sans', sans-serif",
 color: '#64748B', fontSize: '13px',
 }}>
 Loading...
 </div>
 }>
 <ProfileBuilderWrapper />
 </Suspense>
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
