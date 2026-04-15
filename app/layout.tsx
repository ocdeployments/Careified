import './globals.css'
import Navbar from '@/components/nav/Navbar'
import { ClerkProvider } from '@clerk/nextjs'

export const metadata = {
 title: 'Careified - Healthcare Hiring Platform',
 description: 'Connect with top healthcare professionals',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
 return (
 <html lang="en">
 <body style={{ margin: 0 }}>
 <ClerkProvider publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}>
 <Navbar />
 <main style={{ paddingTop: '73px' }}>
 {children}
 </main>
 </ClerkProvider>
 </body>
 </html>
 )
}
