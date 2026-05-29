import { Metadata } from 'next'
import ForAgenciesClient from './ForAgenciesClient'

export const metadata: Metadata = {
  title: 'For Agencies — Hire Verified Caregivers Faster',
  description: 'Search, screen, and shortlist credentialed caregivers without the staffing agency markup. Careified gives Ontario home care agencies a faster, safer way to hire.',
  openGraph: {
    title: 'For Agencies — Hire Verified Caregivers Faster',
    description: 'Search, screen, and shortlist credentialed caregivers without the staffing agency markup. Careified gives Ontario home care agencies a faster, safer way to hire.',
  },
}

export default function ForAgenciesPage() {
  return <ForAgenciesClient />
}