'use client'

import { useEffect, useRef } from 'react'
import { animate } from 'framer-motion'

interface BrandLogoProps {
  size: 'sm' | 'md' | 'lg' | 'xl'
  animate?: boolean
  showTagline?: boolean
}

const sizeConfig = {
  sm: {
    wordmark: '1.1rem',
    tagline: '0.65rem',
    marginTop: '2px',
    taglineMarginTop: '6px',
  },
  md: {
    wordmark: '1.6rem',
    tagline: '0.8rem',
    marginTop: '4px',
    taglineMarginTop: '10px',
  },
  lg: {
    wordmark: '3.5rem',
    tagline: '1rem',
    marginTop: '6px',
    taglineMarginTop: '14px',
  },
  xl: {
    wordmark: '6rem',
    tagline: '1.2rem',
    marginTop: '8px',
    taglineMarginTop: '18px',
  },
}

export default function BrandLogo({ size, animate: shouldAnimate = false, showTagline = false }: BrandLogoProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const config = sizeConfig[size]

  useEffect(() => {
    if (shouldAnimate && containerRef.current) {
      animate(
        containerRef.current,
        { opacity: [0, 1], scale: [0.93, 1] },
        { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
      )
    }
  }, [shouldAnimate])

  return (
    <div
      ref={containerRef}
      style={{
        textAlign: 'center',
        opacity: shouldAnimate ? 0 : 1,
        transform: shouldAnimate ? 'scale(0.93)' : 'scale(1)',
      }}
    >
      {/* Wordmark row */}
      <div
        style={{
          fontFamily: 'DM Serif Display, serif',
          fontSize: config.wordmark,
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          color: '#F7F4F0',
          lineHeight: 1.1,
        }}
      >
        CARE<span style={{ color: '#E8B86D' }}>IFIED</span>
      </div>

      {/* Gold underline bar */}
      <div
        style={{
          height: '1.5px',
          width: '55%',
          margin: '0 auto',
          marginTop: config.marginTop,
          background: 'linear-gradient(90deg, transparent, #C9973A, transparent)',
        }}
      />

      {/* Tagline */}
      {showTagline && (
        <div
          style={{
            fontFamily: 'DM Sans, sans-serif',
            fontSize: config.tagline,
            fontWeight: 300,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: 'rgba(247, 244, 240, 0.55)',
            marginTop: config.taglineMarginTop,
          }}
        >
          Qualified. Recognized. Verified.
        </div>
      )}
    </div>
  )
}
