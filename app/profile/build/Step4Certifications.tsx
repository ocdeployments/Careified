'use client'

import { useState, useEffect } from 'react'
import { saveStep4 } from '@/lib/actions/profile'

const CERT_TYPES = [
 'CPR / First Aid', 'Nursing License (RN/LPN)', 'Medication Aide', 'Food Handler Permit',
 'Driver License', 'Background Check', 'TB Screening', 'Physical Exam',
 'Dementia Training', 'Alzheimer\'s Certification', 'Hospice Training', 'PCA Certification',
]

const NO_CERT_REASONS = [
 'Currently in training / studying',
 'Just started career',
 'Waiting for certification exam',
 'Previously certified, let it expire',
 'Employer does not require',
 'Other reason',
]

interface Certification {
  type: string
  issuingBody: string
  issueDate: string
  noExpiry: boolean
}

export default function Step4Certifications({ initialData, onSave }: { initialData?: any; onSave?: (data: any) => void }) {
 const [certifications, setCertifications] = useState<Certification[]>(initialData || [])
 const [hasNoCertReason, setHasNoCertReason] = useState(false)
 const [noCertReason, setNoCertReason] = useState('')
 const [saving, setSaving] = useState(false)

 // Get specialties from localStorage (set by Step 3)
 const [specialties, setSpecialties] = useState<string[]>([])
 useEffect(() => {
   const stored = localStorage.getItem('caregiver_specialties')
   if (stored) {
     setSpecialties(JSON.parse(stored))
   }
 }, [])

 const saveData = async (certData: Certification[], noCert: string = '') => {
   setSaving(true)
   await saveStep4(certData)
   setSaving(false)
 }

 const addCertification = () => {
   const updated = [...certifications, { type: '', issuingBody: '', issueDate: '', noExpiry: false }]
   setCertifications(updated)
 }

 const updateCertification = (index: number, field: string, value: any) => {
   const updated = [...certifications]
   updated[index] = { ...updated[index], [field]: value }
   setCertifications(updated)
   saveData(updated.filter(c => c.type && c.issueDate))
 }

 const removeCertification = (index: number) => {
   const updated = certifications.filter((_, i) => i !== index)
   setCertifications(updated)
   saveData(updated.filter(c => c.type && c.issueDate))
 }

 const handleNoCertReason = (reason: string) => {
   setNoCertReason(reason)
   saveData([], reason)
 }

 // Check if claimed specialties match certifications
 const claimedSpecialties = specialties.length > 0
 const hasCerts = certifications.filter(c => c.type && c.issueDate).length > 0
 const missingCertsWarning = claimedSpecialties && !hasCerts && !hasNoCertReason

 return (
   <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
     {/* Warning if specialties claimed but no certs */}
     {missingCertsWarning && (
       <div style={{ 
         padding: '16px', 
         borderRadius: '12px', 
         background: '#FEF3C7', 
         border: '1px solid #F59E0B',
         display: 'flex',
         alignItems: 'flex-start',
         gap: '12px',
       }}>
         <div style={{ color: '#92400E', fontSize: '20px' }}>⚠️</div>
         <div>
           <div style={{ fontSize: '13px', fontWeight: 700, color: '#92400E' }}>
             You claimed {specialties.length} specialty(ies) in Step 3 but have no certifications listed!
           </div>
           <div style={{ fontSize: '12px', color: '#B45309', marginTop: '4px' }}>
             Agencies verify credentials. Add certifications or explain why you don't have them.
           </div>
         </div>
       </div>
     )}

     {/* Certifications List */}
     <div>
       <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0D1B3E', marginBottom: '4px' }}>Your Certifications</h3>
       <p style={{ fontSize: '12.5px', color: '#64748B', marginBottom: '16px' }}>Add all relevant certifications.</p>
       
       {certifications.length === 0 && !hasNoCertReason && (
         <p style={{ fontSize: '12px', color: '#64748B', padding: '12px', background: '#F8FAFC', borderRadius: '8px' }}>
           No certifications added yet. {specialties.length > 0 && `You claimed ${specialties.length} specialty(ies) - add certs to prove them!`}
         </p>
       )}
       
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
               <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#64748B', marginBottom: '4px' }}>Type *</label>
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
               <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#64748B', marginBottom: '4px' }}>Issue Date *</label>
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

     {/* If no certifications, ask why */}
     {(certifications.length === 0 || !hasCerts) && (
       <div style={{ 
         padding: '16px', 
         borderRadius: '12px', 
         background: '#F8FAFC', 
         border: '1px solid #E2E8F0',
       }}>
         <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', marginBottom: '12px' }}>
           <input 
             type="checkbox" 
             checked={hasNoCertReason}
             onChange={(e) => { 
               setHasNoCertReason(e.target.checked)
               if (!e.target.checked) {
                 setNoCertReason('')
                 saveData([])
               }
             }}
             style={{ accentColor: '#C9973A', width: '18px', height: '18px' }}
           />
           <span style={{ fontSize: '13px', fontWeight: 600, color: '#0D1B3E' }}>
             I don't have certifications yet
           </span>
         </label>
         
         {hasNoCertReason && (
           <div style={{ marginTop: '12px' }}>
             <p style={{ fontSize: '12px', color: '#64748B', marginBottom: '8px' }}>Why not?</p>
             <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
               {NO_CERT_REASONS.map((reason) => (
                 <button
                   key={reason}
                   type="button"
                   onClick={() => handleNoCertReason(reason)}
                   style={{
                     padding: '8px 14px',
                     borderRadius: '8px',
                     fontSize: '12px',
                     fontWeight: 500,
                     border: noCertReason === reason ? '2px solid #C9973A' : '2px solid #E2E8F0',
                     background: noCertReason === reason ? '#FDF6EC' : 'white',
                     color: noCertReason === reason ? '#92400E' : '#64748B',
                     cursor: 'pointer',
                   }}
                 >
                   {noCertReason === reason && '✓ '} {reason}
                 </button>
               ))}
             </div>
           </div>
         )}
       </div>
     )}

     {saving && <p style={{ fontSize: '11px', color: '#94A3B8' }}>Saving...</p>}
   </div>
 )
}
