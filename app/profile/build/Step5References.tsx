'use client'

import { useState, useEffect } from 'react'
import { saveStep5 } from '@/lib/actions/profile'

const RELATIONSHIPS = ['Previous Employer', 'Supervisor', 'Colleague', 'Healthcare Professional', 'Other']

export default function Step5References({ initialData, onSave }: { initialData?: any; onSave?: (data: any) => void }) {
 const [references, setReferences] = useState<Array<{
   name: string
   relationshipType: string
   organisation?: string
   duration: string
   contactMethod: string
   phone?: string
   email?: string
 }>>(initialData || [])

 const [saving, setSaving] = useState(false)

 const addReference = () => {
   setReferences([...references, { name: '', relationshipType: '', duration: '', contactMethod: 'phone' }])
 }

 const updateReference = (index: number, field: string, value: any) => {
   const updated = [...references]
   updated[index] = { ...updated[index], [field]: value }
   setReferences(updated)
   
   setTimeout(async () => {
     setSaving(true)
     await saveStep5(updated.filter(r => r.name && r.relationshipType))
     setSaving(false)
   }, 1000)
 }

 const removeReference = (index: number) => {
   const updated = references.filter((_, i) => i !== index)
   setReferences(updated)
   
   setTimeout(async () => {
     setSaving(true)
     await saveStep5(updated.filter(r => r.name && r.relationshipType))
     setSaving(false)
   }, 500)
 }

 return (
   <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
     <div>
       <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0D1B3E', marginBottom: '4px' }}>Professional References</h3>
       <p style={{ fontSize: '12.5px', color: '#64748B', marginBottom: '16px' }}>Add 2-3 professional references.</p>
       
       {references.map((ref, index) => (
         <div key={index} style={{ 
           padding: '16px', 
           border: '1px solid #E2E8F0', 
           borderRadius: '12px', 
           marginBottom: '12px',
           background: '#F8FAFC'
         }}>
           <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
             <span style={{ fontSize: '13px', fontWeight: 700, color: '#0D1B3E' }}>Reference {index + 1}</span>
             <button 
               type="button"
               onClick={() => removeReference(index)}
               style={{ color: '#EF4444', background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px' }}
             >
               Remove
             </button>
           </div>
           <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '12px' }}>
             <div>
               <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#64748B', marginBottom: '4px' }}>Name *</label>
               <input 
                 type="text"
                 value={ref.name}
                 onChange={(e) => updateReference(index, 'name', e.target.value)}
                 placeholder="Jane Smith"
                 style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '12px' }}
               />
             </div>
             <div>
               <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#64748B', marginBottom: '4px' }}>Relationship *</label>
               <select 
                 value={ref.relationshipType}
                 onChange={(e) => updateReference(index, 'relationshipType', e.target.value)}
                 style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '12px' }}
               >
                 <option value="">Select...</option>
                 {RELATIONSHIPS.map(r => <option key={r} value={r}>{r}</option>)}
               </select>
             </div>
             <div>
               <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#64748B', marginBottom: '4px' }}>Organization</label>
               <input 
                 type="text"
                 value={ref.organisation}
                 onChange={(e) => updateReference(index, 'organisation', e.target.value)}
                 placeholder="ABC Home Care"
                 style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '12px' }}
               />
             </div>
             <div>
               <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#64748B', marginBottom: '4px' }}>Duration</label>
               <input 
                 type="text"
                 value={ref.duration}
                 onChange={(e) => updateReference(index, 'duration', e.target.value)}
                 placeholder="2 years"
                 style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '12px' }}
               />
             </div>
             <div>
               <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#64748B', marginBottom: '4px' }}>Phone</label>
               <input 
                 type="tel"
                 value={ref.phone}
                 onChange={(e) => updateReference(index, 'phone', e.target.value)}
                 placeholder="(555) 123-4567"
                 style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '12px' }}
               />
             </div>
             <div>
               <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#64748B', marginBottom: '4px' }}>Email</label>
               <input 
                 type="email"
                 value={ref.email}
                 onChange={(e) => updateReference(index, 'email', e.target.value)}
                 placeholder="reference@email.com"
                 style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '12px' }}
               />
             </div>
           </div>
         </div>
       ))}
       
       <button 
         type="button"
         onClick={addReference}
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
         + Add Reference
       </button>
     </div>

     {saving && <p style={{ fontSize: '11px', color: '#94A3B8' }}>Saving...</p>}
   </div>
 )
}
