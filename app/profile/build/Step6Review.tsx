'use client'

import { useState } from 'react'
import { submitProfile } from '@/lib/actions/profile'

export default function Step6Review({ onEdit }: { onEdit?: (step: number) => void }) {
 const [submitting, setSubmitting] = useState(false)
 const [submitted, setSubmitted] = useState(false)

 const handleSubmit = async () => {
   setSubmitting(true)
   const result = await submitProfile()
   setSubmitting(false)
   if (result.success) {
     setSubmitted(true)
   }
 }

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
     <div style={{ padding: '20px', borderRadius: '12px', background: '#FDF6EC', border: '1px solid rgba(201, 151, 58, 0.2)' }}>
       <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0D1B3E', marginBottom: '8px' }}>Review Your Profile</h3>
       <p style={{ fontSize: '13px', color: '#64748B' }}>Make sure all sections are complete before submitting.</p>
     </div>

     {/* Section Review Cards */}
     <div style={{ display: 'grid', gap: '12px' }}>
       {[
         { num: 1, title: 'Identity', desc: 'Basic info, contact, languages' },
         { num: 2, title: 'Services', desc: 'Services, specialties, credentials' },
         { num: 3, title: 'Availability', desc: 'Status, location, placement types' },
         { num: 4, title: 'Certifications', desc: 'Your certifications & licenses' },
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
       disabled={submitting}
       style={{
         padding: '16px 24px',
         borderRadius: '12px',
         border: 'none',
         background: submitting ? '#94A3B8' : 'linear-gradient(135deg, #C9973A, #E8B86D)',
         color: 'white',
         fontSize: '15px',
         fontWeight: 700,
         cursor: submitting ? 'not-allowed' : 'pointer',
         marginTop: '8px',
       }}
     >
       {submitting ? 'Submitting...' : 'Submit Profile'}
     </button>

     <p style={{ fontSize: '11px', color: '#94A3B8', textAlign: 'center' }}>
       By submitting, you confirm all information is accurate.
     </p>
   </div>
 )
}
