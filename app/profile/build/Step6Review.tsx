'use client'

import { useState, useEffect } from 'react'
import { submitProfile } from '@/lib/actions/profile'

export default function Step6Review({
 onEdit,
 onSubmitSuccess,
}: {
 onEdit?: (step: number) => void
 onSubmitSuccess?: () => void
}) {
 const [submitting, setSubmitting] = useState(false)
 const [submitted, setSubmitted] = useState(false)
 const [errors, setErrors] = useState<string[]>([])

 // Check completion status from localStorage
 const checkCompletion = () => {
   const issues: string[] = []
   
   // Check Step 1 - Identity
   const identity = JSON.parse(localStorage.getItem('step1_identity') || '{}')
   if (!identity.firstName || !identity.lastName || !identity.email || !identity.phone || !identity.city) {
     issues.push('Step 1: Complete your identity (name, email, phone, location)')
   }
   
   // Check Step 2 - Services
   const services = JSON.parse(localStorage.getItem('step2_services') || '{}')
   if (!services.services || services.services.length === 0) {
     issues.push('Step 2: Select at least one service')
   }
   
   // Check Step 3 - Availability (specialties)
   const availability = JSON.parse(localStorage.getItem('step3_availability') || '{}')
   if (!availability.availabilityStatus) {
     issues.push('Step 3: Set your availability status')
   }
   
   // Check Step 4 - Qualifications
   const qualifications = JSON.parse(localStorage.getItem('step4_qualifications') || '{}')
   if (!qualifications.credential && !qualifications.certifications?.length) {
     issues.push('Step 4: Add your credential or at least one certification')
   }
   
   // Check Step 5 - References
   const references = JSON.parse(localStorage.getItem('step5_references') || '{}')
   if (!references.length || references.length < 2) {
     issues.push('Step 5: Add at least 2 professional references')
   }
   
   setErrors(issues)
   return issues.length === 0
 }

 const handleSubmit = async () => {
   if (!checkCompletion()) {
     return // Errors shown, don't submit
   }
   
   setSubmitting(true)
   const result = await submitProfile()
   setSubmitting(false)
   if (result.success) {
     setSubmitted(true)
     onSubmitSuccess?.()
   }
 }

 // Auto-check on mount
 useEffect(() => {
   checkCompletion()
 }, [])

 if (submitted) {
   return (
     <div style={{ textAlign: 'center', padding: '40px' }}>
       <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
         <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
           <polyline points="20 6 9 17 4 12"></polyline>
         </svg>
       </div>
       <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#0D1B3E', marginBottom: '8px' }}>Profile Submitted!</h3>
       <p style={{ fontSize: '14px', color: '#64748B' }}>Your profile is now visible to agencies.</p>
     </div>
   )
 }

 return (
   <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
     {/* Validation Errors */}
     {errors.length > 0 && (
       <div style={{ padding: '16px', borderRadius: '12px', background: '#FEF3C7', border: '1px solid #F59E0B' }}>
         <div style={{ fontSize: '14px', fontWeight: 700, color: '#92400E', marginBottom: '12px' }}>
           ⚠️ Please complete these sections before submitting:
         </div>
         {errors.map((err, i) => (
           <div key={i} style={{ fontSize: '12px', color: '#B45309', marginBottom: '4px' }}>
             • {err}
           </div>
         ))}
       </div>
     )}

     <div style={{ padding: '20px', borderRadius: '12px', background: '#FDF6EC', border: '1px solid rgba(201, 151, 58, 0.2)' }}>
       <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0D1B3E', marginBottom: '8px' }}>Review Your Profile</h3>
       <p style={{ fontSize: '13px', color: '#64748B' }}>Make sure all sections are complete before submitting.</p>
     </div>

     {/* Section Review Cards */}
     <div style={{ display: 'grid', gap: '12px' }}>
       {[
         { num: 1, title: 'Identity', desc: 'Name, contact, location' },
         { num: 2, title: 'Services', desc: 'Care services you provide' },
         { num: 3, title: 'Availability', desc: 'Status, specialties, service area' },
         { num: 4, title: 'Qualifications', desc: 'Credential & certifications' },
         { num: 5, title: 'References', desc: 'Professional references' },
       ].map((section) => (
         <div key={section.num} style={{ 
           display: 'flex', 
           justifyContent: 'space-between', 
           alignItems: 'center',
           padding: '16px', 
           border: '1px solid #E2E8F0', 
           borderRadius: '12px',
           background: 'white'
         }}>
           <div>
             <div style={{ fontSize: '13px', fontWeight: 700, color: '#0D1B3E' }}>{section.num}. {section.title}</div>
             <div style={{ fontSize: '12px', color: '#64748B' }}>{section.desc}</div>
           </div>
           <button
             type="button"
             onClick={() => onEdit && onEdit(section.num)}
             style={{
               padding: '8px 16px',
               borderRadius: '8px',
               border: '1px solid #E2E8F0',
               background: 'white',
               color: '#64748B',
               fontSize: '12px',
               fontWeight: 600,
               cursor: 'pointer',
             }}
           >
             Edit
           </button>
         </div>
       ))}
     </div>

     {/* Submit Button */}
     <button
       type="button"
       onClick={handleSubmit}
       disabled={submitting || errors.length > 0}
       style={{
         padding: '16px 24px',
         borderRadius: '12px',
         border: 'none',
         background: submitting || errors.length > 0 ? '#94A3B8' : 'linear-gradient(135deg, #C9973A, #E8B86D)',
         color: 'white',
         fontSize: '15px',
         fontWeight: 700,
         cursor: submitting || errors.length > 0 ? 'not-allowed' : 'pointer',
         marginTop: '8px',
       }}
     >
       {submitting ? 'Submitting...' : errors.length > 0 ? 'Complete all steps to submit' : 'Submit Profile'}
     </button>

     {errors.length > 0 && (
       <p style={{ fontSize: '11px', color: '#EF4444', textAlign: 'center' }}>
         You must complete all steps before submitting
       </p>
     )}
   </div>
 )
}
