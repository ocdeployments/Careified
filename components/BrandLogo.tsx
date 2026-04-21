'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'

interface BrandLogoProps {
  size: 'sm' | 'md' | 'lg' | 'xl'
  animate?: boolean
  showTagline?: boolean
}

const sizeConfig = {
  sm: 32,
  md: 52,
  lg: 80,
  xl: 140,
}

export default function BrandLogo({ size, animate: shouldAnimate = false, showTagline = false }: BrandLogoProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [mounted, setMounted] = useState(false)
  const height = sizeConfig[size]

  useEffect(() => {
    setMounted(true)
    if (shouldAnimate && containerRef.current) {
      const timer = setTimeout(() => {
        containerRef.current!.style.opacity = '1'
        containerRef.current!.style.transform = 'scale(1)'
      }, 50)
      return () => clearTimeout(timer)
    }
  }, [shouldAnimate])

  // showTagline=true → show full SVG (100% height)
  // showTagline=false → clip to top 68% (shield + wordmark only)
  const displayHeight = showTagline ? height : height * 0.68

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        width: 'auto',
        height: `${displayHeight}px`,
        display: 'inline-block',
        opacity: shouldAnimate ? 0 : 1,
        transform: shouldAnimate ? 'scale(0.95)' : 'scale(1)',
        transition: shouldAnimate ? 'none' : 'opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
        overflow: 'hidden',
      }}
    >
      <Image
        src="/Careified_logo.svg"
        alt="Careified™ — Qualified. Recognized. Verified."
        width={0}
        height={0}
        sizes={`${height}px`}
        style={{
          width: 'auto',
          height: `${height}px`,
          objectFit: 'contain',
          objectPosition: 'center top',
        }}
      />
    </div>
  )
}