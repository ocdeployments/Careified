'use client'

import { useState, useEffect } from 'react'

interface Props {
  form: React.ReactNode
  preview: React.ReactNode
}

export default function MobilePreviewToggle({ form, preview }: Props) {
  const [view, setView] = useState<'form' | 'preview'>('form')
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  // Desktop: side by side
  if (!isMobile) {
    return (
      <div className="flex gap-6">
        <div className="flex-1">{form}</div>
        <div className="w-[340px] flex-shrink-0">{preview}</div>
      </div>
    )
  }

  // Mobile: tabs
  return (
    <>
      {/* Tab bar */}
      <div className="flex border-b border-slate-200 bg-white sticky top-16 z-10">
        {(['form', 'preview'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setView(tab)}
            aria-selected={view === tab}
            className={[
              'flex-1 flex items-center justify-center gap-1.5 py-3.5 text-[15px] transition-colors',
              'focus-visible:ring-2 focus-visible:ring-gold focus-visible:outline-none',
              view === tab
                ? 'font-semibold text-navy border-b-[3px] border-gold'
                : 'font-normal text-slate-500',
            ].join(' ')}
          >
            {tab === 'form' ? '📝 Form' : '👁️ Preview'}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="p-4">
        {view === 'form' ? form : preview}
      </div>
    </>
  )
}
