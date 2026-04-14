'use client'

import { useState, useEffect } from 'react'
import { saveStep4 } from '@/lib/actions/profile'

const CERT_TYPES = [
 'CPR / First Aid', 'Nursing License (RN/LPN)', 'Medication Aide', 'Food Handler Permit',
 'Driver License', 'Background Check', 'TB Screening', 'Physical Exam',
 'Dementia Training', 'Alzheimer\'s Certification', 'Hospice Training',
]

export default function Step4Certifications({ initialData, onSave }: { initialData?: any; onSave?: (data: any) => void }) {
 const [certifications, setCertifications] = useState<Array<{
   type: string
   issuingBody: string
   issueDate: string
   noExpiry: boolean
 }>>(initialData || [])

 const [saving, setSaving] = useState(false)

 const addCertification = () => {
   setCertifications([...certifications, { type: '', issuingBody: '', issueDate: '', noExpiry: false }])
 }

 const updateCertification = (index: number, field: string, value: any) => {
   const updated = [...certifications]
   updated[index] = { ...updated[index], [field]: value }
   setCertifications(updated)
   
   // Auto-save after delay
   setTimeout(async () => {
     setSaving(true)
     await saveStep4(updated.filter(c => c.type && c.issueDate))
     setSaving(false)
   }, 1000)
 }

 const removeCertification = (index: number) => {
   const updated = certifications.filter((_, i) => i !== index)
   setCertifications(updated)
   
   setTimeout(async () => {
     setSaving(true)
     await saveStep4(updated.filter(c => c.type && c.issueDate))
     setSaving(false)
   }, 500)
 }

 return (
   <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
     <div>
       <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0D1B3E', marginBottom: '4px' }}>Certifications & Credentials</h3>
       <p style={{ fontSize: '12.5px', color: '#64748B', marginBottom: '16px' }}>Add your certifications and licenses.</p>
       
       {certifications.map((cert, index) => (
         <div key={index} style={{ 
           padding: '16px', 
           border: '1px solid #E2E8F0', 
           borderRadius: '12px', 
           marginBottom: '12px',
           background: '#F8FAFC'
         }}>
           <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
             <span style={{ fontSize: '13px', fontWeight: 700, color: '#0D1B3E' }}>Certification {index + 1}</span>
             <button 
               type="button"
               onClick={() => removeCertification(index)}
               style={{ color: '#EF4444', background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px' }}
             >
               Remove
             </button>
           </div>
           <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '12px' }}>
             <div>
               <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#64748B', marginBottom: '4px' }}>Type</label>
               <select 
                 value={cert.type}
                 onChange={(e) => updateCertification(index, 'type', e.target.value)}
                 style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '12px' }}
               >
                 <option value="">Select...</option>
                 {CERT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
               </select>
             </div>
             <div>
               <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#64748B', marginBottom: '4px' }}>Issuing Body</label>
               <input 
                 type="text"
                 value={cert.issuingBody}
                 onChange={(e) => updateCertification(index, 'issuingBody', e.target.value)}
                 placeholder="e.g. American Red Cross"
                 style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '12px' }}
               />
             </div>
             <div>
               <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#64748B', marginBottom: '4px' }}>Issue Date</label>
               <input 
                 type="date"
                 value={cert.issueDate}
                 onChange={(e) => updateCertification(index, 'issueDate', e.target.value)}
                 style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '12px' }}
               />
             </div>
           </div>
         </div>
       ))}
       
       <button 
         type="button"
         onClick={addCertification}
         style={{
           padding: '12px 20px',
           borderRadius: '8px',
           border: '1px dashed #C9973A',
           background: '#FDF6EC',
           color: '#92400E',
           fontSize: '13px',
           fontWeight: 600,
           cursor: 'pointer',
           width: '100%',
         }}
       >
         + Add Certification
       </button>
     </div>

     {saving && <p style={{ fontSize: '11px', color: '#94A3B8' }}>Saving...</p>}
   </div>
 )
}
