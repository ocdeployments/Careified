'use client'

import { useState, useEffect } from 'react'
import { saveStep4 } from '@/lib/actions/profile'

const CERT_TYPES = [
 'CPR / First Aid', 'Nursing License (RN/LPN)', 'Certified Nursing Assistant (CNA)', 'Home Health Aide (HHA)', 
 'PCA/PSW Certification', 'OTA Certification', 'PTA Certification', 'Social Work License',
 'Medication Aide', 'Food Handler Permit', 'Driver License', 'Background Check', 
 'TB Screening', 'Physical Exam', 'Dementia Training', 'Alzheimer\'s Certification', 
 'Hospice Training',
]

const CREDENTIAL_TYPES = [
 'High School Diploma', 'GED', 'Associate\'s Degree (Healthcare)', 'Bachelor\'s Degree (Healthcare)',
 'Nursing Degree (ADN/BSN)', 'Social Work Degree', 'Medical Assistant Cert', 'Phlebotomy Cert',
 'EKG Technician', 'Patient Care Technician', 'Home Health Aide Cert',
]

const NO_CERT_REASONS = [
 'Currently in training / studying', 'Just started career', 'Waiting for certification exam',
 'Previously certified, let it expire', 'Employer does not require', 'Other reason',
]

// Credentials that REQUIRE specific certifications
const CREDENTIALS = [
 { id: 'rn', label: 'RN — Registered Nurse', requiredCert: 'Nursing License (RN/LPN)' },
 { id: 'lpn', label: 'LPN / LVN — Licensed Practical Nurse', requiredCert: 'Nursing License (RN/LPN)' },
 { id: 'cna', label: 'CNA — Certified Nursing Assistant', requiredCert: 'Certified Nursing Assistant (CNA)' },
 { id: 'hha', label: 'HHA — Home Health Aide', requiredCert: 'Home Health Aide (HHA)' },
 { id: 'psw', label: 'PSW — Personal Support Worker', requiredCert: 'PCA/PSW Certification' },
 { id: 'ot_assistant', label: 'Occupational Therapy Assistant', requiredCert: 'OTA Certification' },
 { id: 'pt_assistant', label: 'Physiotherapy Assistant', requiredCert: 'PTA Certification' },
 { id: 'social_worker', label: 'Social Worker', requiredCert: 'Social Work License' },
 { id: 'nursing_student', label: 'Nursing Student (supervised practice)', requiredCert: '' },
 { id: 'hospital_support', label: 'Hospital Support Worker', requiredCert: '' },
 { id: 'no_credential', label: 'No formal credential — experienced carer', requiredCert: '' },
 { id: 'other', label: 'Other (specify below)', requiredCert: '' },
]

interface CertItem { type: string; issuingBody: string; issueDate: string }

export default function Step4Certifications({ initialData, onSave }: { initialData?: any; onSave?: (data: any) => void }) {
 const [selectedCredential, setSelectedCredential] = useState('')
 const [certifications, setCertifications] = useState<CertItem[]>(initialData?.certifications || [])
 const [hasNoCertReason, setHasNoCertReason] = useState(false)
 const [noCertReason, setNoCertReason] = useState('')
 const [saving, setSaving] = useState(false)

 // Get required cert based on selected credential
 const getRequiredCert = () => {
   const cred = CREDENTIALS.find(c => c.id === selectedCredential)
   return cred?.requiredCert || ''
 }

 const requiredCert = getRequiredCert()
 const hasRequiredCert = requiredCert ? certifications.some(c => c.type === requiredCert) : false

 const saveData = async (certData: CertData[], noCert: string = '') => {
   setSaving(true)
   localStorage.setItem("step4_qualifications", JSON.stringify({ credential: selectedCredential, certifications: certData }));
    await saveStep4(certData)
   setSaving(false)
 }

 const addCertification = () => setCertifications([...certifications, { type: '', issuingBody: '', issueDate: '' }])
 
 const updateCertification = (i: number, f: string, v: string) => {
   const u = [...certifications]; u[i] = { ...u[i], [f]: v }; setCertifications(u)
   saveData(u.filter(c => c.type && c.issueDate))
 }
 
 const removeCertification = (i: number) => {
   const u = certifications.filter((_, idx) => i !== idx); setCertifications(u)
   saveData(u.filter(c => c.type && c.issueDate))
 }

 const handleCredentialSelect = (credId: string) => {
   setSelectedCredential(credId)
   localStorage.setItem('caregiver_credential', credId)
 }

 const handleNoCertReason = (reason: string) => { 
   setNoCertReason(reason)
   saveData([], reason)
 }

 return (
   <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
     {/* SECTION 1: PRIMARY CREDENTIAL - Comes FIRST */}
     <div style={{ padding: '20px', background: '#FDF6EC', borderRadius: '16px', border: '1px solid rgba(201, 151, 58, 0.2)' }}>
       <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0D1B3E', marginBottom: '4px' }}>1. Your Primary Credential ⭐</h3>
       <p style={{ fontSize: '12.5px', color: '#64748B', marginBottom: '16px' }}>What best describes your professional role? This determines what certifications you need.</p>
       
       <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '10px' }}>
         {CREDENTIALS.map((cred) => (
           <button
             key={cred.id}
             type="button"
             onClick={() => handleCredentialSelect(cred.id)}
             style={{
               padding: '14px 16px',
               borderRadius: '12px',
               fontSize: '12px',
               fontWeight: 600,
               textAlign: 'left',
               border: selectedCredential === cred.id ? '2px solid #C9973A' : '2px solid #E2E8F0',
               background: selectedCredential === cred.id ? '#FDF6EC' : 'white',
               color: selectedCredential === cred.id ? '#92400E' : '#0D1B3E',
               cursor: 'pointer',
             }}
           >
             {selectedCredential === cred.id && '✓ '} {cred.label}
           </button>
         ))}
       </div>
       
       {selectedCredential && (
         <p style={{ fontSize: '12px', color: '#C9973A', marginTop: '12px' }}>
           ✓ Selected: {CREDENTIALS.find(c => c.id === selectedCredential)?.label}
           {requiredCert && <span> — Must add: <strong>{requiredCert}</strong></span>}
         </p>
       )}
     </div>

     {/* Required cert warning */}
     {requiredCert && !hasRequiredCert && !hasNoCertReason && (
       <div style={{ padding: '16px', borderRadius: '12px', background: '#FEF3C7', border: '1px solid #F59E0B', display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
         <div style={{ fontSize: '20px' }}>⚠️</div>
         <div>
           <div style={{ fontSize: '13px', fontWeight: 700, color: '#92400E' }}>
             Required: Add your {requiredCert}
           </div>
           <div style={{ fontSize: '12px', color: '#B45309', marginTop: '4px' }}>
             This certification is required because you selected "{CREDENTIALS.find(c => c.id === selectedCredential)?.label}"
           </div>
         </div>
       </div>
     )}

     {/* Success if required certs added */}
     {requiredCert && hasRequiredCert && (
       <div style={{ padding: '12px', borderRadius: '12px', background: '#D1FAE5', border: '1px solid #10B981' }}>
         <span style={{ fontSize: '12px', color: '#065F46' }}>✓ {requiredCert} added!</span>
       </div>
     )}

     {/* SECTION 2: SUPPORTING CERTIFICATIONS */}
     <div>
       <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0D1B3E', marginBottom: '4px' }}>2. Supporting Certifications 🏆</h3>
       <p style={{ fontSize: '12.5px', color: '#64748B', marginBottom: '16px' }}>Add any additional certifications, training, or licenses you hold.</p>
       
       {certifications.map((cert, i) => (
         <div key={i} style={{ padding: '16px', border: '1px solid #E2E8F0', borderRadius: '12px', marginBottom: '12px', background: '#F8FAFC' }}>
           <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
             <span style={{ fontSize: '13px', fontWeight: 700, color: '#0D1B3E' }}>Certification {i + 1}</span>
             <button type="button" onClick={() => removeCertification(i)} style={{ color: '#EF4444', background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px' }}>Remove</button>
           </div>
           <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '12px' }}>
             <div>
               <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#64748B', marginBottom: '4px' }}>Type</label>
               <select value={cert.type} onChange={(e) => updateCertification(i, 'type', e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '12px' }}>
                 <option value="">Select...</option>
                 {CERT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
               </select>
             </div>
             <div>
               <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#64748B', marginBottom: '4px' }}>Issuing Body</label>
               <input type="text" value={cert.issuingBody} onChange={(e) => updateCertification(i, 'issuingBody', e.target.value)} placeholder="e.g. American Red Cross" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '12px' }} />
             </div>
             <div>
               <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#64748B', marginBottom: '4px' }}>Date</label>
               <input type="date" value={cert.issueDate} onChange={(e) => updateCertification(i, 'issueDate', e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '12px' }} />
             </div>
           </div>
         </div>
       ))}
       
       <button type="button" onClick={addCertification} style={{ padding: '12px 20px', borderRadius: '8px', border: '1px dashed #C9973A', background: '#FDF6EC', color: '#92400E', fontSize: '13px', fontWeight: 600, cursor: 'pointer', width: '100%' }}>
         + Add Certification
       </button>
     </div>

     {/* SECTION 3: Professional Credentials (Degrees) */}
     <div>
       <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0D1B3E', marginBottom: '4px' }}>3. Education / Degrees 📜</h3>
       <p style={{ fontSize: '12.5px', color: '#64748B', marginBottom: '16px' }}>Add any relevant degrees or educational qualifications.</p>
       
       <button type="button" style={{ padding: '12px 20px', borderRadius: '8px', border: '1px dashed #E2E8F0', background: '#F8FAFC', color: '#64748B', fontSize: '13px', fontWeight: 600, cursor: 'pointer', width: '100%' }}>
         + Add Education (optional)
       </button>
     </div>

     {/* No certs reason */}
     {(!hasRequiredCert || certifications.length === 0) && (
       <div style={{ padding: '16px', borderRadius: '12px', background: '#F8FAFC', border: '1px solid #E2E8F0' }}>
         <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', marginBottom: '12px' }}>
           <input type="checkbox" checked={hasNoCertReason} onChange={(e) => { setHasNoCertReason(e.target.checked); if (!e.target.checked) { setNoCertReason(''); saveData([]) }}} style={{ accentColor: '#C9973A', width: '18px', height: '18px' }} />
           <span style={{ fontSize: '13px', fontWeight: 600, color: '#0D1B3E' }}>I don't have certifications yet</span>
         </label>
         
         {hasNoCertReason && (
           <div style={{ marginTop: '12px' }}>
             <p style={{ fontSize: '12px', color: '#64748B', marginBottom: '8px' }}>Why not?</p>
             <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
               {NO_CERT_REASONS.map((reason) => (
                 <button key={reason} type="button" onClick={() => handleNoCertReason(reason)} style={{ padding: '8px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: 500, border: noCertReason === reason ? '2px solid #C9973A' : '2px solid #E2E8F0', background: noCertReason === reason ? '#FDF6EC' : 'white', color: noCertReason === reason ? '#92400E' : '#64748B', cursor: 'pointer' }}>
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
