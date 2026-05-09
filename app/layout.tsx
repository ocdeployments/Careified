import './globals.css'
import { DM_Serif_Display, DM_Sans } from 'next/font/google'
import NavbarWrapper from '@/components/nav/NavbarWrapper'
import { ClerkProvider } from '@clerk/nextjs'
import { Toaster } from 'sonner'
import Script from 'next/script'

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
          <NavbarWrapper />
          <main id="main-content" className="pt-16">
            {children}
          </main>
        <footer style={{
          background: '#0D1B3E',
          borderTop: '1px solid rgba(255,255,255,0.08)',
          padding: '32px 24px',
          fontFamily: "'DM Sans', sans-serif",
        }}>
          <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
            <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)' }}>
              © 2026 Careified. All rights reserved.
            </div>
            <div style={{ display: 'flex', gap: '24px' }}>
              <a href="/privacy" style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', textDecoration: 'none' }}>Privacy Policy</a>
              <a href="/terms" style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', textDecoration: 'none' }}>Terms of Use</a>
              <a href="/contact" style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', textDecoration: 'none' }}>Contact</a>
            </div>
          </div>
        </footer>
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
        {process.env.NEXT_PUBLIC_CLARITY_ID && (
          <Script id="microsoft-clarity" strategy="afterInteractive">
            {`(function(c,l,a,r,i,t,y){c[i]=c[i]||function(){(c[i].q=c[i].q||[]).push(arguments)};t=l.createElement(a);y=l.getElementsByTagName(a)[0];t.async=1;t.src=r;y.parentNode.insertBefore(t,y)})(window,document,"clarity","script","${process.env.NEXT_PUBLIC_CLARITY_ID}");`}
          </Script>
        )}
        {process.env.NEXT_PUBLIC_YBUG_ID && (
          <Script id="ybug-init" strategy="afterInteractive">
            {`window.ybug_settings = {"id": "${process.env.NEXT_PUBLIC_YBUG_ID}"};(function(d,s){var s=d.createElement('script');s.type='text/javascript';s.async=true;s.src='https://widget.ybug.io/button.js';var x=d.getElementsByTagName('script')[0];x.parentNode.insertBefore(s,x);})(document);`}
          </Script>
        )}
      </body>
    </html>
  )
}
