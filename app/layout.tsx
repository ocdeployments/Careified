import './globals.css'
import { DM_Serif_Display, DM_Sans } from 'next/font/google'
import Navbar from '@/components/nav/Navbar'
import { ClerkProvider } from '@clerk/nextjs'
import { Toaster } from 'sonner'

const dmSerif = DM_Serif_Display({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-dm-serif',
  display: 'swap',
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-dm-sans',
  display: 'swap',
})

export const metadata = {
  title: 'Careified™ — Qualified. Recognized. Verified.',
  description: 'The decision engine for agencies choosing caregivers. Verified profiles, match scores, and placement outcomes — all in one platform.',
  icons: {
    icon: '/Careified_logo.svg',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${dmSerif.variable} ${dmSans.variable}`}>
      <body className="font-sans m-0 bg-white text-navy antialiased">
        {/* Skip to main content — accessibility */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-gold focus:text-navy focus:font-semibold focus:rounded-lg focus:shadow-lg"
        >
          Skip to main content
        </a>
        <ClerkProvider publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}>
          <Navbar />
          <main id="main-content" className="pt-16">
            {children}
          </main>
        </ClerkProvider>
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              fontFamily: 'var(--font-dm-sans)',
              borderRadius: '12px',
            },
            classNames: {
              success: 'border-l-4 border-l-green-500',
              error: 'border-l-4 border-l-red-500',
            },
          }}
        />
      </body>
    </html>
  )
}
