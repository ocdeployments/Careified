'use client'

import { useState, useEffect } from 'react'
import { getProfileData, submitProfile } from '@/lib/actions/profile'

export default function Step6Review({ onEdit, onSave }: { onEdit?: (step: number) => void; onSave?: () => void }) {
 const [data, setData] = useState<any>(null)
 const [loading, setLoading] = useState(true)
 const [submitting, setSubmitting] = useState(false)
 const [finalConsent, setFinalConsent] = useState(false)
 const [submitted, setSubmitted] = useState(false)

 useEffect(() => {
 getProfileData().then(result => {
 if (result) setData(result)
 setLoading(false)
 })
 }, [])

 const handleSubmit = async () => {
 if (!finalConsent) return
 setSubmitting(true)
 const result = await submitProfile()
 if (result.success) setSubmitted(true)
 setSubmitting(false)
 }

 if (loading) return <div className="p-8 text-center text-[13px] text-[#64748B]">Loading...</div>
 if (submitted) return (
 <div className="p-8 text-center">
 <h2 className="text-[20px] font-black text-[#10B981] mb-2">Profile Submitted!</h2>
 <p className="text-[13px] text-[#64748B]">Your profile is now visible to agencies.</p>
 </div>
 )

 return (
 <div className="space-y-6">
 <div>
 <h3 className="text-[15px] font-black text-[#0D1B3E] mb-1">Review your profile</h3>
 <p className="text-[12.5px] text-[#64748B] mb-4">Review each section. Click "Edit" to make changes before submitting.</p>
 </div>

 {[
 { step: 1, title: 'Basic Information', key: null },
 { step: 2, title: 'Services & Specialties', key: 'services' },
 { step: 3, title: 'Availability', key: 'availabilityStatus' },
 { step: 4, title: 'Certifications', key: 'certifications' },
 { step: 5, title: 'References', key: 'references' },
 ].map(section => (
 <div key={section.step} className="p-4 border border-[#E2E8F0] rounded-xl">
 <div className="flex justify-between items-center">
 <h4 className="text-[13px] font-bold text-[#0D1B3E]">{section.title}</h4>
 <button onClick={() => onEdit(section.step)} className="text-[11px] text-[#C9973A] hover:underline">Edit</button>
 </div>
 {section.key && data?.[section.key] && (
 <p className="text-[12px] text-[#64748B] mt-2">
 {Array.isArray(data[section.key]) ? `${data[section.key].length} items` : String(data[section.key]).slice(0, 50)}
 </p>
 )}
 </div>
 ))}

 <div className="p-4 bg-[#FDF6EC] border border-[#C9973A]/20 rounded-xl">
 <label className="flex items-start gap-3 cursor-pointer">
 <input type="checkbox" checked={finalConsent} onChange={(e) => setFinalConsent(e.target.checked)} className="accent-[#C9973A] w-4 h-4 mt-0.5" />
 <span className="text-[12px] text-[#92400E]">
 I confirm that all information provided is accurate and I consent to background verification.
 </span>
 </label>
 </div>

 <button onClick={handleSubmit} disabled={!finalConsent || submitting}
 className={`w-full py-3 rounded-xl text-[14px] font-bold transition-colors ${
 finalConsent ? 'bg-[#C9973A] text-white hover:bg-[#B8862A]' : 'bg-[#E2E8F0] text-[#94A3B8] cursor-not-allowed'
 }`}>
 {submitting ? 'Submitting...' : 'Submit Profile'}
 </button>
 </div>
 )
}
