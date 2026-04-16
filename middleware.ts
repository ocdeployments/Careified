import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

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

const isAdminRoute = createRouteMatcher(['/admin(.*)'])

export default clerkMiddleware(async (auth, request) => {
  if (isPublicRoute(request)) return

  const { userId } = await auth()
  if (!userId) {
    auth.protect()
    return
  }

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
