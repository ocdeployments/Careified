// Careified — useProfileSave hook
// Three-layer save: Context (instant) + localStorage (auto) + DB (on blur)
// Usage: const { saveField, saveStep, saveStatus } = useProfileSave()

'use client'

import { useState, useCallback, useRef } from 'react'
import { useProfileForm } from '@/lib/context/ProfileFormContext'

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'

export function useProfileSave() {
 const { formData, updateField, updateFields } = useProfileForm()
 const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle')
 const saveTimerRef = useRef<NodeJS.Timeout | null>(null)

 // Save a single field to DB on blur
 const saveField = useCallback(async (
  field: string,
  value: any
 ) => {
 // Update context immediately (instant)
 updateField(field as any, value)

 // Debounce DB save — wait 800ms after last change
 if (saveTimerRef.current) clearTimeout(saveTimerRef.current)

 saveTimerRef.current = setTimeout(async () => {
  setSaveStatus('saving')
  try {
   const response = await fetch('/api/profile/save-field', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ field, value }),
   })
   if (!response.ok) throw new Error('Save failed')
   setSaveStatus('saved')
   setTimeout(() => setSaveStatus('idle'), 2000)
  } catch (err) {
   console.error('Field save error:', err)
   setSaveStatus('error')
   setTimeout(() => setSaveStatus('idle'), 4000)
  }
 }, 800)
 }, [updateField])

 // Save entire step to DB on step completion
 const saveStep = useCallback(async (
  step: number,
  data: Record<string, any>
 ) => {
  updateFields(data)
  setSaveStatus('saving')
  try {
   const response = await fetch('/api/profile/save-step', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ step, data }),
   })
   if (!response.ok) throw new Error('Step save failed')
   setSaveStatus('saved')
   setTimeout(() => setSaveStatus('idle'), 2000)
   return true
  } catch (err) {
   console.error('Step save error:', err)
   setSaveStatus('error')
   setTimeout(() => setSaveStatus('idle'), 4000)
   return false
  }
 }, [updateFields])

 return { saveField, saveStep, saveStatus, formData }
}
