'use client'

import { useState, useEffect } from 'react'
import { saveStep4 } from '@/lib/actions/profile'

const CERT_TYPES = [
 { type: 'CNA', body: 'State Board of Nursing' },
 { type: 'HHA', body: 'Department of Health' },
 { type: 'CPR', body: 'American Heart Association' },
 { type: 'First Aid', body: 'Red Cross' },
 { type: 'LVN', body: 'State Board of Nursing' },
 { type: 'LPN', body: 'State Board of Nursing' },
 { type: 'RN', body: 'State Board of Nursing' },
 { type: 'Medication Aide', body: 'Board of Pharmacy' },
 { type: 'Dementia Care', body: "Alzheimer's Association" },
 { type: 'Home Health Aide', body: 'Medicare Certified Agency' },
 { type: 'Physical Therapy Aide', body: 'APTA' },
 { type: 'Occupational Therapy', body: 'NBCOT' },
 { type: 'Speech Therapy', body: 'ASHA' },
 { type: 'Hospice Care', body: 'NHPCO' },
 { type: 'Forklift', body: 'OSHA' },
]

interface Cert {
 id: string
 type: string
 issuingBody: string
 certNumber: string
 issueDate: string
 expiryDate: string
 noExpiry: boolean
}

export default function Step4Certifications({ initialData, onSave }: { initialData?: any; onSave?: (data: any) => void }) {
 const [certs, setCerts] = useState<Cert[]>(
 initialData?.length ? initialData :
 [{ id: '1', type: '', issuingBody: '', certNumber: '', issueDate: '', expiryDate: '', noExpiry: false }]
 )
 const [saving, setSaving] = useState(false)

 const addCert = () => {
 setCerts([...certs, { id: String(certs.length + 1), type: '', issuingBody: '', certNumber: '', issueDate: '', expiryDate: '', noExpiry: false }])
 }

 const removeCert = (id: string) => {
 if (certs.length > 1) setCerts(certs.filter(c => c.id !== id))
 }

 const updateCert = (id: string, field: keyof Cert, value: any) => {
 setCerts(certs.map(c => c.id === id ? { ...c, [field]: value } : c))
 }

 useEffect(() => {
 const timer = setTimeout(async () => {
 setSaving(true)
 const validCerts = certs.filter(c => c.type)
 if (validCerts.length) await saveStep4(validCerts)
 setSaving(false)
 }, 1000)
 return () => clearTimeout(timer)
 }, [certs])

 return (
 <div className="space-y-6">
 <div>
 <h3 className="text-[15px] font-black text-[#0D1B3E] mb-1">Your certifications & training</h3>
 <p className="text-[12.5px] text-[#64748B] mb-4">Add your professional certifications. Required for most placements.</p>
 </div>

 {certs.map((cert, idx) => (
 <div key={cert.id} className="p-4 border border-[#E2E8F0] rounded-xl">
 <div className="flex justify-between items-center mb-3">
 <h4 className="text-[13px] font-bold text-[#0D1B3E]">Certification {idx + 1}</h4>
 {certs.length > 1 && (
 <button onClick={() => removeCert(cert.id)} className="text-[11px] text-red-500 hover:text-red-600">Remove</button>
 )}
 </div>
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
 <div>
 <label className="block text-[11px] font-bold text-[#0D1B3E] mb-1">Certification Type *</label>
 <select value={cert.type} onChange={(e) => { const body = CERT_TYPES.find(t => t.type === e.target.value)?.body || ''; updateCert(cert.id, 'type', e.target.value); updateCert(cert.id, 'issuingBody', body); }}
 className="w-full px-3 py-2 rounded-lg border border-[#E2E8F0] bg-white text-[12px]">
 <option value="">Select...</option>
 {CERT_TYPES.map(t => <option key={t.type} value={t.type}>{t.type}</option>)}
 </select>
 </div>
 <div>
 <label className="block text-[11px] font-bold text-[#0D1B3E] mb-1">Certificate Number</label>
 <input type="text" value={cert.certNumber} onChange={(e) => updateCert(cert.id, 'certNumber', e.target.value)}
 placeholder="Optional" className="w-full px-3 py-2 rounded-lg border border-[#E2E8F0] bg-white text-[12px]" />
 </div>
 <div>
 <label className="block text-[11px] font-bold text-[#0D1B3E] mb-1">Issue Date *</label>
 <input type="date" value={cert.issueDate} onChange={(e) => updateCert(cert.id, 'issueDate', e.target.value)}
 className="w-full px-3 py-2 rounded-lg border border-[#E2E8F0] bg-white text-[12px]" />
 </div>
 <div>
 <label className="block text-[11px] font-bold text-[#0D1B3E] mb-1">Expiry Date</label>
 <input type="date" value={cert.expiryDate} onChange={(e) => updateCert(cert.id, 'expiryDate', e.target.value)}
 disabled={cert.noExpiry} className="w-full px-3 py-2 rounded-lg border border-[#E2E8F0] bg-white text-[12px] disabled:bg-gray-50" />
 </div>
 </div>
 <label className="flex items-center gap-2 mt-3 cursor-pointer">
 <input type="checkbox" checked={cert.noExpiry} onChange={(e) => updateCert(cert.id, 'noExpiry', e.target.checked)} className="accent-[#C9973A] w-4 h-4" />
 <span className="text-[12px] text-[#64748B]">No expiry date / Lifetime certification</span>
 </label>
 </div>
 ))}

 <button onClick={addCert} className="w-full py-3 border-2 border-dashed border-[#E2E8F0] rounded-xl text-[13px] text-[#64748B] hover:border-[#C9973A] hover:text-[#C9973A] transition-colors">
 + Add Certification
 </button>

 {saving && <p className="text-[11px] text-[#94A3B8]">Saving...</p>}
 </div>
 )
}
