import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { Pool } from 'pg'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
})

const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/onboarding(.*)',
  '/verify(.*)',
  '/about',
  '/contact',
  '/terms',
  '/privacy',
  '/for-caregivers',
  '/for-agencies',
  '/for-families',
  '/profile/[id]',
  '/api/health',
  '/agency/pending-approval',
])

const isAgencyRoute = createRouteMatcher([
  '/agency/search(.*)',
  '/agency/shortlist(.*)',
])

const isAdminRoute = createRouteMatcher([
  '/admin(.*)',
])

export default clerkMiddleware(async (auth, request) => {
  // Allow public routes
  if (isPublicRoute(request)) {
    return
  }

  // Require auth for everything else
  const { userId } = await auth()
  if (!userId) {
    auth.protect()
    return
  }

  // Agency routes — check approval status
  if (isAgencyRoute(request)) {
    try {
      const { rows } = await pool.query(
        'SELECT status FROM agencies WHERE clerk_user_id = $1',
        [userId]
      )

      // No agency record — redirect to onboarding
      if (rows.length === 0) {
        return NextResponse.redirect(new URL('/onboarding', request.url))
      }

      // Pending or rejected — redirect to pending page
      if (rows[0].status !== 'approved') {
        return NextResponse.redirect(
          new URL('/agency/pending-approval', request.url)
        )
      }
    } catch (error) {
      console.error('Middleware agency check error:', error)
      // On DB error — fail open for now, log for investigation
    }
  }

  // Admin routes — check admin user ID
  if (isAdminRoute(request)) {
    const adminId = process.env.ADMIN_CLERK_USER_ID
    if (!adminId || userId !== adminId) {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }
})

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}
