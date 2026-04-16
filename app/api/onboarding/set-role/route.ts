import { NextResponse } from 'next/server'
import { auth, currentUser } from '@clerk/nextjs/server'

export async function POST(request: Request) {
  try {
    const { userId } = await auth()
    const user = await currentUser()
    
    if (!userId || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { role } = await request.json()
    
    if (!role || !['agency', 'caregiver'].includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
    }

    // Update user's publicMetadata via Clerk API
    // Using the Clerk backend API to update metadata
    const { clerkClient } = await import('@clerk/nextjs/server')
    const clerk = await clerkClient()
    
    await clerk.users.updateUser(userId, {
      publicMetadata: {
        role,
      },
    })

    return NextResponse.json({ success: true, role })
  } catch (error) {
    console.error('Error setting role:', error)
    return NextResponse.json({ error: 'Failed to set role' }, { status: 500 })
  }
}
