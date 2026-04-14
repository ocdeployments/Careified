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

interface CertItem { type: string; issuingBody: string; issueDate: string; noExpiry: boolean }

export default function Step4Certifications({ initialData, onSave }: { initialData?: any; onSave?: (data: any) => void }) {
 const [certifications, setCertifications] = useState<CertItem[]>(initialData?.certifications || [])
 const [credentials, setCredentials] = useState<string[]>([])
 const [hasNoCertReason, setHasNoCertReason] = useState(false)
 const [noCertReason, setNoCertReason] = useState('')
 const [saving, setSaving] = useState(false)

 // Read credentials from localStorage (set by Step 2)
 useEffect(() => {
   const storedCreds = localStorage.getItem('caregiver_credentials')
   if (storedCreds) {
     setCredentials(JSON.parse(storedCreds))
   }
 }, [])

 // Map credentials to required certifications
 const getRequiredCerts = () => {
   const CRED_MAP: Record<string, string> = {
     'rn': 'Nursing License (RN/LPN)', 'lpn': 'Nursing License (RN/LPN)',
     'cna': 'Certified Nursing Assistant (CNA)', 'hha': 'Home Health Aide (HHA)',
     'psw': 'PCA/PSW Certification', 'ot_assistant': 'OTA Certification',
     'pt_assistant': 'PTA Certification', 'social_worker': 'Social Work License',
   }
   return credentials.map(c => CRED_MAP[c]).filter(Boolean)
 }

 const requiredCerts = getRequiredCerts()
 const hasRequiredCerts = requiredCerts.some(rc => 
   certifications.some(c => c.type === rc)
 )

 const saveData = async (certData: CertItem[], credData: CertItem[], noCert: string = '') => {
   setSaving(true)
   await saveStep4(certData, credData)
   setSaving(false)
 }

 const addCertification = () => setCertifications([...certifications, { type: '', issuingBody: '', issueDate: '', noExpiry: false }])
 const updateCertification = (i: number, f: string, v: any) => {
   const u = [...certifications]; u[i] = { ...u[i], [f]: v }; setCertifications(u)
   saveData(u.filter(c => c.type && c.issueDate), [])
 }
 const removeCertification = (i: number) => {
   const u = certifications.filter((_, idx) => i !== idx); setCertifications(u)
   saveData(u.filter(c => c.type && c.issueDate), [])
 }

 const addCredential = () => setCredentials([...credentials, { type: '', issuingBody: '', issueDate: '', noExpiry: false }])
 const updateCredential = (i: number, f: string, v: any) => {
   const u = [...credentials]; u[i] = { ...u[i], [f]: v }; setCredentials(u)
   saveData(certifications.filter(c => c.type && c.issueDate), u.filter(c => c.type && c.issueDate))
 }
 const removeCredential = (i: number) => {
   const u = credentials.filter((_, idx) => i !== idx); setCredentials(u)
   saveData(certifications.filter(c => c.type && c.issueDate), u.filter(c => c.type && c.issueDate))
 }

 const handleNoCertReason = (reason: string) => { setNoCertReason(reason); saveData([], [], reason) }

 return (
   <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
     {/* Required certs warning based on Step 2 selections */}
     {requiredCerts.length > 0 && !hasRequiredCerts && !hasNoCertReason && (
       <div style={{ padding: '16px', borderRadius: '12px', background: '#FEF3C7', border: '1px solid #F59E0B', display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
         <div style={{ fontSize: '20px' }}>⚠️</div>
         <div>
           <div style={{ fontSize: '13px', fontWeight: 700, color: '#92400E' }}>
             You selected credentials in Step 2. Add these required certifications:
           </div>
           <div style={{ fontSize: '12px', color: '#B45309', marginTop: '4px' }}>
             {requiredCerts.join(', ')}
           </div>
         </div>
       </div>
     )}

     {/* Success if required certs added */}
     {requiredCerts.length > 0 && hasRequiredCerts && (
       <div style={{ padding: '12px', borderRadius: '12px', background: '#D1FAE5', border: '1px solid #10B981' }}>
         <span style={{ fontSize: '12px', color: '#065F46' }}>✓ Required certifications added!</span>
       </div>
     )}

     {/* Certifications */}
     <div>
       <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0D1B3E', marginBottom: '4px' }}>Certifications 🏆</h3>
       <p style={{ fontSize: '12.5px', color: '#64748B', marginBottom: '16px' }}>Add licenses, certificates, and training credentials.</p>
       
       {certifications.map((cert, i) => (
         <div key={i} style={{ padding: '16px', border: '1px solid #E2E8F0', borderRadius: '12px', marginBottom: '12px', background: '#F8FAFC' }}>
           <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
             <span style={{ fontSize: '13px', fontWeight: 700, color: '#0D1B3E' }}>Certification {i + 1}</span>
             <button type="button" onClick={() => removeCertification(i)} style={{ color: '#EF4444', background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px' }}>Remove</button>
           </div>
           <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '12px' }}>
             <div>
               <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#64748B', marginBottom: '4px' }}>Type *</label>
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
               <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#64748B', marginBottom: '4px' }}>Issue Date *</label>
               <input type="date" value={cert.issueDate} onChange={(e) => updateCertification(i, 'issueDate', e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '12px' }} />
             </div>
           </div>
         </div>
       ))}
       
       <button type="button" onClick={addCertification} style={{ padding: '12px 20px', borderRadius: '8px', border: '1px dashed #C9973A', background: '#FDF6EC', color: '#92400E', fontSize: '13px', fontWeight: 600, cursor: 'pointer', width: '100%' }}>
         + Add Certification
       </button>
     </div>

     {/* Professional Credentials */}
     <div>
       <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0D1B3E', marginBottom: '4px' }}>Professional Credentials 📜</h3>
       <p style={{ fontSize: '12.5px', color: '#64748B', marginBottom: '16px' }}>Add degrees, diplomas, and other qualifications.</p>
       
       {credentials.map((cred: any, i: number) => (
         <div key={i} style={{ padding: '16px', border: '1px solid #E2E8F0', borderRadius: '12px', marginBottom: '12px', background: '#F8FAFC' }}>
           <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
             <span style={{ fontSize: '13px', fontWeight: 700, color: '#0D1B3E' }}>Credential {i + 1}</span>
             <button type="button" onClick={() => removeCredential(i)} style={{ color: '#EF4444', background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px' }}>Remove</button>
           </div>
           <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '12px' }}>
             <div>
               <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#64748B', marginBottom: '4px' }}>Type *</label>
               <select value={cred.type} onChange={(e) => updateCredential(i, 'type', e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '12px' }}>
                 <option value="">Select...</option>
                 {CREDENTIAL_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
               </select>
             </div>
             <div>
               <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#64748B', marginBottom: '4px' }}>Institution</label>
               <input type="text" value={cred.issuingBody} onChange={(e) => updateCredential(i, 'issuingBody', e.target.value)} placeholder="e.g. University of Texas" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '12px' }} />
             </div>
             <div>
               <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#64748B', marginBottom: '4px' }}>Date *</label>
               <input type="date" value={cred.issueDate} onChange={(e) => updateCredential(i, 'issueDate', e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '12px' }} />
             </div>
           </div>
         </div>
       ))}
       
       <button type="button" onClick={addCredential} style={{ padding: '12px 20px', borderRadius: '8px', border: '1px dashed #C9973A', background: '#FDF6EC', color: '#92400E', fontSize: '13px', fontWeight: 600, cursor: 'pointer', width: '100%' }}>
         + Add Credential
       </button>
     </div>

     {/* No certs reason */}
     {(!hasRequiredCerts || certifications.length === 0) && (
       <div style={{ padding: '16px', borderRadius: '12px', background: '#F8FAFC', border: '1px solid #E2E8F0' }}>
         <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', marginBottom: '12px' }}>
           <input type="checkbox" checked={hasNoCertReason} onChange={(e) => { setHasNoCertReason(e.target.checked); if (!e.target.checked) { setNoCertReason(''); saveData([], []) }}} style={{ accentColor: '#C9973A', width: '18px', height: '18px' }} />
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
