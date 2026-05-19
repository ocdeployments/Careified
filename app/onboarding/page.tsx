import { auth, clerkClient } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import OnboardingForm from './OnboardingForm'

export default async function OnboardingPage() {
  const { userId } = await auth()

  if (!userId) {
    redirect('/sign-in')
  }

  const client = await clerkClient()
  const user = await client.users.getUser(userId)
  const role = user.publicMetadata?.role as string
  console.log('[onboarding] userId:', userId, 'raw role:', JSON.stringify(user.publicMetadata))

  if (role === 'agency') {
    redirect('/agency/signup')
  }

  // Only caregivers reach here
  return <OnboardingForm />
}