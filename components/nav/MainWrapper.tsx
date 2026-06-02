'use client'

import { usePathname } from 'next/navigation'

export default function MainWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isAgency = pathname?.startsWith('/agency')

  return (
    <main id="main-content" style={{ paddingTop: isAgency ? 0 : '64px' }}>
      {children}
    </main>
  )
}