import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

const isPublicRoute = createRouteMatcher([
  '/',
  '/about',
  '/contact',
  '/privacy',
  '/terms',
  '/sign-in',
  '/sign-up',
  '/for-caregivers',
  '/for-agencies',
  '/for-families',
  '/demo(.*)',
  '/opportunities',
  '/profile/build',
  '/profile/demo',
  '/id(.*)',
  '/verify(.*)',
  '/reference(.*)',
  '/settings(.*)',
  '/api/health(.*)',
  '/api/admin/status',
  '/api/qa/report',
])

export default clerkMiddleware((auth, request) => {
  if (!isPublicRoute(request)) {
    auth.protect()
  }
})

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
}