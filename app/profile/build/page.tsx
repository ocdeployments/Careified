"use client"

import { useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Step1Identity from '@/components/profile/Step1Identity'
import Step2Services from './Step2Services'
import Step3Availability from './Step3Availability'
import Step4Certifications from './Step4Certifications'
import Step5References from './Step5References'
import Step6Review from './Step6Review'

function TestContent() {
  const [formData, setFormData] = useState({})
  const searchParams = useSearchParams()
  const step = searchParams.get('step') || '1'

  const handleSave = (data: any) => {
    console.log('Saved step', step, ':', data)
    setFormData(prev => ({ ...prev, ...data }))
  }

  if (step === '1') {
    return <Step1Identity onSave={handleSave} />
  }

  if (step === '2') {
    return <Step2Services initialData={formData} onSave={handleSave} />
  }

  if (step === '3') {
    return <Step3Availability initialData={formData} onSave={handleSave} />
  }

  if (step === '4') {
    return <Step4Certifications initialData={formData.certifications || []} onSave={handleSave} />
  }

  if (step === '5') {
    return <Step5References initialData={formData.references || []} onSave={handleSave} />
  }

  if (step === '6') {
    return <Step6Review onEdit={(s: number) => console.log('Edit step', s)} />
  }

  return (
    <div style={{padding: 40, textAlign: 'center'}}>
      <h1>Unknown step: {step}</h1>
    </div>
  )
}

export default function TestPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <TestContent />
    </Suspense>
  )
}
