'use client'

import { useState, useEffect, Suspense } from 'react'
import Step1Identity from '@/components/profile/Step1Identity'
import Step2Services from './Step2Services'
import Step3Availability from './Step3Availability'
import Step4Certifications from './Step4Certifications'
import Step5References from './Step5References'
import Step6Review from './Step6Review'
import { getProfileData } from '@/lib/actions/profile'

const STEPS = [
 { num: 1, title: 'Identity' },
 { num: 2, title: 'Services' },
 { num: 3, title: 'Availability' },
 { num: 4, title: 'Certifications' },
 { num: 5, title: 'References' },
 { num: 6, title: 'Review' },
]

export default function ProfileBuildPage() {
 const [currentStep, setCurrentStep] = useState(1)
 const [profileData, setProfileData] = useState<any>(null)
 const [loading, setLoading] = useState(true)

 useEffect(() => {
 getProfileData().then(result => {
 setProfileData(result)
 setLoading(false)
 })
 }, [])

 const handleSave = (data: any) => {
 console.log('Saved step:', currentStep, data)
 }

 const handleEdit = (step: number) => {
 setCurrentStep(step)
 }

 const renderStep = () => {
 switch (currentStep) {
 case 1:
 return <Step1Identity onSave={handleSave} />
 case 2:
 return <Step2Services initialData={profileData} />
 case 3:
 return <Step3Availability initialData={profileData} />
 case 4:
 return <Step4Certifications initialData={profileData?.certifications} />
 case 5:
 return <Step5References initialData={profileData?.references} />
 case 6:
 return <Step6Review onEdit={handleEdit} />
 default:
 return <Step1Identity onSave={handleSave} />
 }
 }

 if (loading) return (
 <div className="min-h-screen bg-[#FEF9F3] flex items-center justify-center">
 <p className="text-[13px] text-[#64748B]">Loading...</p>
 </div>
 )

 return (
 <div className="min-h-screen bg-[#FEF9F3] py-8 px-4">
 <div className="max-w-3xl mx-auto">
 <h1 className="text-[22px] font-black text-[#0D1B3E] mb-6 text-center">Build Your Profile</h1>
 
 <div className="flex justify-center gap-2 mb-6 flex-wrap">
 {STEPS.map(step => (
 <button key={step.num} onClick={() => setCurrentStep(step.num)}
 className={`px-4 py-2 rounded-full text-[12px] font-bold transition-colors ${
 currentStep === step.num
 ? 'bg-[#C9973A] text-white'
 : 'bg-white text-[#64748B] border border-[#E2E8F0] hover:border-[#C9973A]'
 }`}>
 {step.num}. {step.title}
 </button>
 ))}
 </div>

 <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#E2E8F0]">
 {renderStep()}
 </div>

 {currentStep < 6 && (
 <div className="flex justify-between mt-6">
 <button onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
 className={`px-4 py-2 rounded-lg border text-[13px] font-bold ${
 currentStep === 1 ? 'border-transparent text-[#94A3B8] cursor-not-allowed'
 : 'border-[#E2E8F0] text-[#64748B] hover:border-[#C9973A]'
 }`}
 disabled={currentStep === 1}>
 Back
 </button>
 <button onClick={() => setCurrentStep(currentStep + 1)}
 className="px-6 py-2 rounded-lg bg-[#C9973A] text-white text-[13px] font-bold hover:bg-[#B8862A]">
 Next
 </button>
 </div>
 )}
 </div>
 </div>
 )
}
