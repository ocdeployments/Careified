'use client'

import { usePathname } from 'next/navigation'
import Navbar from './Navbar'

export default function NavbarWrapper() {
  const pathname = usePathname()
  if (pathname?.startsWith('/gate') || pathname?.startsWith('/waitlist') || pathname?.startsWith('/dashboard/v2')) {
    return null
  }
  return <Navbar />
}