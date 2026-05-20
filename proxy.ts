import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

const isAgencyRoute = createRouteMatcher([
  '/agency/dashboard(.*)',
  '/agency/search(.*)',
  '/agency/roster(.*)',
  '/agency/shortlist(.*)',
  '/agency/clients(.*)',
  '/agency/airecruit(.*)',
  '/agency/assistant(.*)',
  '/agency/settings(.*)',
  '/agency/reviews(.*)',
  '/agency/signup(.*)',
  '/agency/support(.*)',
  '/agency/team(.*)',
  '/api/agency/(.*)',
  '/api/airecruit/(.*)',
  '/api/roster/(.*)',
])

const isCaregiverRoute = createRouteMatcher([
  '/profile/build(.*)',
  '/profile/strength(.*)',
  '/caregiver/(.*)',
  '/api/profile/(.*)',
  '/api/caregivers/me(.*)',
  '/api/caregiver/(.*)',
  '/opportunities(.*)',
  '/settings/communications(.*)',
  '/settings/data-rights(.*)',
])

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
  '/profile/demo-preview',
  '/api/health',
  '/agency/pending-approval',
  '/api/onboarding/set-role(.*)',
  '/api/auth/role-redirect(.*)',
  '/demo(.*)',
  '/api/demo(.*)',
  '/reference(.*)',
  '/claim(.*)',
  '/.well-known(.*)',
  // /api/profile/upload-photo — auth required, not in publicRoutes (verified 2026-05-12)
])

// Explicitly protected profile routes (not in public list)
const isProtectedProfileRoute = createRouteMatcher([
  '/profile/build(.*)',
])

const isAdminRoute = createRouteMatcher(['/admin(.*)'])

export default clerkMiddleware(
  async (auth, request) => {
  // Get the pathname
  const pathname = request.nextUrl.pathname

  // Explicitly protect /profile/build routes
  if (pathname.startsWith('/profile/build')) {
    const { userId } = await auth()
    if (!userId) {
      // Use explicit redirect instead of auth.protect() to avoid NEXT_REDIRECT issues
      return NextResponse.redirect(new URL('/sign-in?redirect_url=' + encodeURIComponent(pathname), request.url))
    }
  }

  // Explicitly protect /opportunities, /caregiver/, /profile/ routes
  if (pathname.startsWith('/opportunities') ||
      pathname.startsWith('/caregiver/') ||
      pathname.startsWith('/profile/')) {
    const { userId: uid } = await auth()
    if (!uid) {
      return NextResponse.redirect(
        new URL('/sign-in?redirect_url=' + encodeURIComponent(pathname), request.url)
      )
    }
  }

  // Public routes - allow without auth
  if (isPublicRoute(request)) return

  // All other routes require auth
  const { userId, sessionClaims } = await auth()
  if (!userId) {
    return NextResponse.redirect(new URL('/sign-in?redirect_url=' + encodeURIComponent(pathname), request.url))
  }

  // Role-based route protection
  const role = (sessionClaims?.publicMetadata as any)?.role as string | undefined

  // Block agencies from caregiver routes
  if (isCaregiverRoute(request) && role === 'agency') {
    return NextResponse.redirect(new URL('/agency/dashboard', request.url))
  }

  // Block caregivers from agency routes
  if (isAgencyRoute(request) && role === 'caregiver') {
    return NextResponse.redirect(new URL('/profile/build', request.url))
  }

  if (isAdminRoute(request)) {
    const adminId = process.env.ADMIN_CLERK_USER_ID
    if (!adminId || userId !== adminId) {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }
}, {
  proxyUrl: process.env.CLERK_PROXY_URL,
})

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}
