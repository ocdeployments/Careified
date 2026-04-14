"use client"

import { useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Step1Identity from '@/components/profile/Step1Identity'
import Step2Services from './Step2Services'
import Step3Availability from './Step3Availability'
import Step4Certifications from './Step4Certifications'
import Step5References from './Step5References'
import Step6Review from './Step6Review'

const STEPS = [
  { num: 1, title: 'Identity' },
  { num: 2, title: 'Services' },
  { num: 3, title: 'Availability' },
  { num: 4, title: 'Certifications' },
  { num: 5, title: 'References' },
  { num: 6, title: 'Review' },
]

function ProfileBuilder() {
  const [formData, setFormData] = useState({})
  const searchParams = useSearchParams()
  const step = searchParams.get('step') || '1'
  const currentStep = parseInt(step)

  const handleSave = (data: any) => {
    console.log('Saved step', currentStep, ':', data)
    setFormData(prev => ({ ...prev, ...data }))
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <Step1Identity onSave={handleSave} />
      case 2:
        return <Step2Services initialData={formData} onSave={handleSave} />
      case 3:
        return <Step3Availability initialData={formData} onSave={handleSave} />
      case 4:
        return <Step4Certifications initialData={formData.certifications || []} onSave={handleSave} />
      case 5:
        return <Step5References initialData={formData.references || []} onSave={handleSave} />
      case 6:
        return <Step6Review onEdit={(s: number) => window.location.href = `?step=${s}`} />
      default:
        return <Step1Identity onSave={handleSave} />
    }
  }

  return (
    <div style={{ minHeight: 'calc(100vh - 64px)', background: '#FEF9F3', padding: '40px 20px' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#0D1B3E', marginBottom: '32px', textAlign: 'center' }}>
          Build Your Profile
        </h1>
        
        {/* Step buttons */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '32px', flexWrap: 'wrap' }}>
          {STEPS.map(s => (
            <a
              key={s.num}
              href={`?step=${s.num}`}
              style={{
                padding: '8px 16px',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: 'bold',
                border: currentStep === s.num ? 'none' : '1px solid #E2E8F0',
                backgroundColor: currentStep === s.num ? '#C9973A' : 'white',
                color: currentStep === s.num ? 'white' : '#64748B',
                cursor: 'pointer',
                textDecoration: 'none',
                display: 'inline-block',
              }}
            >
              {s.num}. {s.title}
            </a>
          ))}
        </div>

        {/* Step content */}
        <div style={{ background: 'white', borderRadius: '16px', padding: '24px', border: '1px solid #E2E8F0' }}>
          {renderStep()}
        </div>

        {/* Navigation buttons */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '32px' }}>
          {currentStep > 1 && (
            <a
              href={`?step=${currentStep - 1}`}
              style={{
                padding: '12px 24px',
                borderRadius: '8px',
                border: '1px solid #E2E8F0',
                backgroundColor: 'white',
                color: '#64748B',
                fontSize: '13px',
                fontWeight: 'bold',
                textDecoration: 'none',
                display: 'inline-block',
              }}
            >
              Back
            </a>
          )}
          {currentStep < 6 && (
            <a
              href={`?step=${currentStep + 1}`}
              style={{
                padding: '12px 24px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: '#C9973A',
                color: 'white',
                fontSize: '13px',
                fontWeight: 'bold',
                textDecoration: 'none',
                display: 'inline-block',
                marginLeft: 'auto',
              }}
            >
              Next
            </a>
          )}
          {currentStep === 6 && (
            <a
              href="#"
              style={{
                padding: '12px 24px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: '#C9973A',
                color: 'white',
                fontSize: '13px',
                fontWeight: 'bold',
                textDecoration: 'none',
                display: 'inline-block',
                marginLeft: 'auto',
              }}
            >
              Review & Submit
            </a>
          )}
        </div>
      </div>
    </div>
  )
}

export default function ProfileBuildPage() {
  return (
    <Suspense fallback={<div style={{ padding: '50px', textAlign: 'center' }}>Loading...</div>}>
      <ProfileBuilder />
    </Suspense>
  )
}
