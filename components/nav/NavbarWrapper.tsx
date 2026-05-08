'use client'

import { usePathname } from 'next/navigation'
import Navbar from './Navbar'

export default function NavbarWrapper() {
  const pathname = usePathname()

  // Hide navbar on demo profile page
  if (pathname === '/profile/demo') {
    return null
  }

  return <Navbar />
}