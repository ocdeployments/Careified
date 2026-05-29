import { Metadata } from 'next'
import ForCaregiversClient from './ForCaregiversClient'

export const metadata: Metadata = {
  title: 'For Caregivers — Build Your Verified Profile Once',
  description: 'Create your professional caregiver profile once. Be discovered by top home care agencies in Ontario without applying to every job posting.',
  openGraph: {
    title: 'For Caregivers — Build Your Verified Profile Once',
    description: 'Create your professional caregiver profile once. Be discovered by top home care agencies in Ontario without applying to every job posting.',
  },
}

export default function ForCaregiversPage() {
  return <ForCaregiversClient />
}