'use client'

import { useState, useEffect } from 'react'
import { saveStep5 } from '@/lib/actions/profile'

const RELATIONSHIP_TYPES = [
 'Former Client', 'Healthcare Professional', 'Supervisor/Colleague', 'Community Leader',
 'Teacher/Professor', 'Religious Leader', 'Neighbor/Friend', 'Family Friend',
 'Volunteer Coordinator', 'Care Coordinator', 'Social Worker', 'Other Professional',
]

const DURATION_OPTIONS = ['Less than 6 months', '6 months to 1 year', '1-3 years', '3+ years']

interface Ref {
 id: string
 name: string
 relationshipType: string
 organisation?: string
 duration: string
 contactMethod: string
 email?: string
 phone?: string
 consentKnows: boolean
 consentAgreed: boolean
 consentUnderstands: boolean
}

export default function Step5References({ initialData }: { initialData?: Ref[] }) {
 const [refs, setRefs] = useState<Ref[]>(
 initialData?.length ? initialData :
 [{ id: '1', name: '', relationshipType: '', organisation: '', duration: '', contactMethod: '', consentKnows: false, consentAgreed: false, consentUnderstands: false }]
 )
 const [saving, setSaving] = useState(false)

 const addRef = () => {
 setRefs([...refs, { id: String(refs.length + 1), name: '', relationshipType: '', organisation: '', duration: '', contactMethod: '', consentKnows: false, consentAgreed: false, consentUnderstands: false }])
 }

 const removeRef = (id: string) => {
 if (refs.length > 1) setRefs(refs.filter(r => r.id !== id))
 }

 const updateRef = (id: string, field: keyof Ref, value: any) => {
 setRefs(refs.map(r => r.id === id ? { ...r, [field]: value } : r))
 }

 const formatPhone = (value: string) => {
 const digits = value.replace(/\D/g, '').slice(0, 10)
 if (digits.length <= 3) return digits
 if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`
 return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`
 }

 useEffect(() => {
 const timer = setTimeout(async () => {
 setSaving(true)
 const validRefs = refs.filter(r => r.name && r.relationshipType && r.consentKnows && r.consentAgreed && r.consentUnderstands)
 if (validRefs.length) await saveStep5(validRefs)
 setSaving(false)
 }, 1000)
 return () => clearTimeout(timer)
 }, [refs])

 return (
 <div className="space-y-6">
 <div>
 <h3 className="text-[15px] font-black text-[#0D1B3E] mb-1">Professional references</h3>
 <p className="text-[12.5px] text-[#64748B] mb-4">We need 2-3 professional references who can speak to your caregiving experience.</p>
 </div>

 {refs.map((ref, idx) => (
 <div key={ref.id} className="p-4 border border-[#E2E8F0] rounded-xl">
 <div className="flex justify-between items-center mb-3">
 <h4 className="text-[13px] font-bold text-[#0D1B3E]">Reference {idx + 1}</h4>
 {refs.length > 1 && (
 <button onClick={() => removeRef(ref.id)} className="text-[11px] text-red-500 hover:text-red-600">Remove</button>
 )}
 </div>
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
 <div>
 <label className="block text-[11px] font-bold text-[#0D1B3E] mb-1">Full Name *</label>
 <input type="text" value={ref.name} onChange={(e) => updateRef(ref.id, 'name', e.target.value)}
 placeholder="John Smith" className="w-full px-3 py-2 rounded-lg border border-[#E2E8F0] bg-white text-[12px]" />
 </div>
 <div>
 <label className="block text-[11px] font-bold text-[#0D1B3E] mb-1">Relationship *</label>
 <select value={ref.relationshipType} onChange={(e) => updateRef(ref.id, 'relationshipType', e.target.value)}
 className="w-full px-3 py-2 rounded-lg border border-[#E2E8F0] bg-white text-[12px]">
 <option value="">Select...</option>
 {RELATIONSHIP_TYPES.map(r => <option key={r} value={r}>{r}</option>)}
 </select>
 </div>
 <div>
 <label className="block text-[11px] font-bold text-[#0D1B3E] mb-1">Organization</label>
 <input type="text" value={ref.organisation || ''} onChange={(e) => updateRef(ref.id, 'organisation', e.target.value)}
 placeholder="Optional" className="w-full px-3 py-2 rounded-lg border border-[#E2E8F0] bg-white text-[12px]" />
 </div>
 <div>
 <label className="block text-[11px] font-bold text-[#0D1B3E] mb-1">How long known? *</label>
 <select value={ref.duration} onChange={(e) => updateRef(ref.id, 'duration', e.target.value)}
 className="w-full px-3 py-2 rounded-lg border border-[#E2E8F0] bg-white text-[12px]">
 <option value="">Select...</option>
 {DURATION_OPTIONS.map(d => <option key={d} value={d}>{d}</option>)}
 </select>
 </div>
 <div>
 <label className="block text-[11px] font-bold text-[#0D1B3E] mb-1">Email</label>
 <input type="email" value={ref.email || ''} onChange={(e) => updateRef(ref.id, 'email', e.target.value)}
 placeholder="Optional" className="w-full px-3 py-2 rounded-lg border border-[#E2E8F0] bg-white text-[12px]" />
 </div>
 <div>
 <label className="block text-[11px] font-bold text-[#0D1B3E] mb-1">Phone</label>
 <input type="tel" value={ref.phone || ''} onChange={(e) => updateRef(ref.id, 'phone', formatPhone(e.target.value))}
 placeholder="(XXX) XXX-XXXX" maxLength={14} className="w-full px-3 py-2 rounded-lg border border-[#E2E8F0] bg-white text-[12px]" />
 </div>
 </div>
 <div className="pt-2 border-t border-[#E2E8F0]">
 <p className="text-[11px] font-bold text-[#0D1B3E] mb-2">Consent confirmations required:</p>
 {[
 { key: 'consentKnows', label: "I confirm this person knows I'm applying for caregiving roles" },
 { key: 'consentAgreed', label: "They've agreed to be a reference" },
 { key: 'consentUnderstands', label: 'They understand their reference may be verified' },
 ].map(checkbox => (
 <label key={checkbox.key} className="flex items-start gap-2 mb-2 cursor-pointer">
 <input type="checkbox" checked={ref[checkbox.key as keyof Ref] as boolean}
 onChange={(e) => updateRef(ref.id, checkbox.key as keyof Ref, e.target.checked)}
 className="accent-[#C9973A] w-4 h-4 mt-0.5" />
 <span className="text-[12px] text-[#64748B]">{checkbox.label}</span>
 </label>
 ))}
 </div>
 </div>
 ))}

 <button onClick={addRef} className="w-full py-3 border-2 border-dashed border-[#E2E8F0] rounded-xl text-[13px] text-[#64748B] hover:border-[#C9973A] hover:text-[#C9973A] transition-colors">
 + Add Reference
 </button>

 {saving && <p className="text-[11px] text-[#94A3B8]">Saving...</p>}
 </div>
 )
}
