'use client'

import { useEffect, useState } from 'react'

interface LandingAnimationProps {
  className?: string
}

export default function LandingAnimation({ className = '' }: LandingAnimationProps) {
  const [phase, setPhase] = useState<'idle' | 'shield' | 'care' | 'ified' | 'tagline'>('idle')

  useEffect(() => {
    // Phase 1: Shield fades in and scales (0-800ms)
    const timer1 = setTimeout(() => setPhase('shield'), 100)
    
    // Phase 2: "Care" text fades in (800ms-1600ms)
    const timer2 = setTimeout(() => setPhase('care'), 900)
    
    // Phase 3: "ified" text fades in (1600ms-2200ms)
    const timer3 = setTimeout(() => setPhase('ified'), 1700)
    
    // Phase 4: Tagline fades in (2200ms-2800ms)
    const timer4 = setTimeout(() => setPhase('tagline'), 2300)

    return () => {
      clearTimeout(timer1)
      clearTimeout(timer2)
      clearTimeout(timer3)
      clearTimeout(timer4)
    }
  }, [])

  return (
    <div className={`flex flex-col items-center ${className}`}>
      {/* Shield + Text Row */}
      <div className="flex items-center justify-center gap-1">
        {/* Shield Icon */}
        <div 
          className="relative w-12 h-14 transition-all duration-500"
          style={{
            opacity: phase === 'idle' ? 0 : 1,
            transform: phase === 'idle' ? 'scale(0.8)' : 'scale(1)',
          }}
        >
          <svg viewBox="0 0 48 56" className="w-full h-full">
            {/* Shield shape - deep navy with gold border */}
            <path 
              d="M24 2 L46 12 L46 32 C46 44 36 52 24 56 C12 52 2 44 2 32 L2 12 Z" 
              fill="#0D1B3E" 
              stroke="#C9A84C" 
              strokeWidth="2"
            />
            {/* Gold checkmark inside */}
            <path 
              d="M16 28 L22 34 L34 22" 
              fill="none" 
              stroke="#C9A84C" 
              strokeWidth="3" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
          </svg>
        </div>

        {/* "Care" text - cream/white serif */}
        <span 
          className="text-5xl md:text-6xl font-serif text-[#F5F0E8] transition-all duration-500"
          style={{
            opacity: phase === 'idle' || phase === 'shield' ? 0 : 1,
            transform: phase === 'idle' || phase === 'shield' ? 'translateX(-10px)' : 'translateX(0)',
          }}
        >
          Care
        </span>

        {/* "ified" text - gold serif */}
        <span 
          className="text-5xl md:text-6xl font-serif text-[#C9A84C] transition-all duration-500"
          style={{
            opacity: phase === 'idle' || phase === 'shield' || phase === 'care' ? 0 : 1,
            transform: phase === 'idle' || phase === 'shield' || phase === 'care' ? 'translateX(-10px)' : 'translateX(0)',
          }}
        >
          ified
        </span>
      </div>

      {/* Tagline */}
      <div 
        className="mt-4 transition-all duration-500"
        style={{
          opacity: phase === 'tagline' ? 1 : 0,
        }}
      >
        <p className="text-sm tracking-[0.2em] uppercase text-[#C9A84C]/70">
          Qualified · Recognized · Verified
        </p>
      </div>
    </div>
  )
}