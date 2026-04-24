'use client'

import { useEffect, useRef, useState } from 'react'
import { animate } from 'framer-motion'
import BrandLogo from './BrandLogo'

// ── Main component ────────────────────────────────────────────────────────────
export default function HeroAnimation() {
  const containerRef = useRef<HTMLDivElement>(null)
  const glowRef = useRef<HTMLDivElement>(null)
  const line1Ref = useRef<HTMLParagraphElement>(null)
  const line2Ref = useRef<HTMLParagraphElement>(null)
  const painBlockRef = useRef<HTMLDivElement>(null)
  const wordStageRef = useRef<HTMLDivElement>(null)
  const checkmarkRef = useRef<HTMLDivElement>(null)

  const [displayedWord, setDisplayedWord] = useState('')
  const [showCursor, setShowCursor] = useState(false)
  const [showWordStage, setShowWordStage] = useState(false)
  const [showBrand, setShowBrand] = useState(false)
  const [glowActive, setGlowActive] = useState(false)

  // ── Auto-play on mount ─────────────────────────────────────────────────────
  useEffect(() => {
    runSequence()
  }, [])

  // ── Typewriter helpers ───────────────────────────────────────────────────
  async function typeWord(word: string) {
    setShowCursor(true)
    for (let i = 0; i <= word.length; i++) {
      setDisplayedWord(word.slice(0, i))
      await new Promise(r => setTimeout(r, 75))
    }
    setShowCursor(false)
  }

  async function deleteWord(word: string) {
    setShowCursor(true)
    for (let i = word.length; i >= 0; i--) {
      setDisplayedWord(word.slice(0, i))
      await new Promise(r => setTimeout(r, 40))
    }
    setShowCursor(false)
  }

  // ── Main animation sequence ───────────────────────────────────────────────
  async function runSequence() {
    const delay = (ms: number) => new Promise(r => setTimeout(r, ms))

    // ═══════════════════════════════════════════════════════════════════════
    // ACT 1 — Word cycling
    // ═══════════════════════════════════════════════════════════════════════

    // Pain line 1 fades in: delay 300ms, duration 700ms
    await delay(300)
    if (line1Ref.current) {
      await animate(line1Ref.current, { opacity: [0, 1], y: [12, 0] }, { duration: 0.7, ease: 'easeOut' })
    }

    // Pain line 2 fades in: delay 900ms, duration 700ms
    await delay(900)
    if (line2Ref.current) {
      await animate(line2Ref.current, { opacity: [0, 1], y: [12, 0] }, { duration: 0.7, ease: 'easeOut' })
    }

    // Hold: 1000ms
    await delay(1_000)

    // Both fade out: duration 500ms
    if (painBlockRef.current) {
      await animate(painBlockRef.current, { opacity: [1, 0] }, { duration: 0.5, ease: [0.4, 0, 0.6, 1] })
    }

    // Pause: 200ms
    await delay(200)

    // Show word stage
    setShowWordStage(true)
    await delay(80)
    if (wordStageRef.current) {
      animate(wordStageRef.current, { opacity: [0, 1] }, { duration: 0.4, ease: 'easeOut' })
    }

    // Type "Qualified": 75ms/letter → hold 500ms → erase 40ms/letter
    await typeWord('Qualified')
    await delay(500)
    await deleteWord('Qualified')
    await delay(150)

    // Type "Recognized": 75ms/letter → hold 500ms → erase 40ms/letter
    await typeWord('Recognized')
    await delay(500)
    await deleteWord('Recognized')
    await delay(150)

    // Type "Verified": 75ms/letter → hold 800ms → do NOT erase
    await typeWord('Verified')
    await delay(800)

    // Pause: 300ms
    await delay(300)

    // Word stage fades out: duration 400ms
    if (wordStageRef.current) {
      await animate(wordStageRef.current, { opacity: [1, 0] }, { duration: 0.4, ease: 'easeIn' })
    }
    setShowWordStage(false)

    // Pause: 200ms
    await delay(200)

    // ═══════════════════════════════════════════════════════════════════════
    // ACT 2 — Glow + Brand lockup → stays visible
    // ═══════════════════════════════════════════════════════════════════════

    // Glow expands: duration 1800ms cubic-bezier(0.16, 1, 0.3, 1)
    setGlowActive(true)
    if (glowRef.current) {
      await animate(glowRef.current, { opacity: [0, 1], scale: [0, 1] }, { duration: 1.8, ease: [0.16, 1, 0.3, 1] })
    }

    // After 900ms into glow expansion, show BrandLogo
    await delay(900)
    setShowBrand(true)

    // Hold brand + glow: 1200ms
    await delay(1_200)

    // NOTE: No fade out - logo stays visible permanently
  }

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        minHeight: '400px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}
    >
      {/* Glow effect */}
      <div
        ref={glowRef}
        style={{
          position: 'absolute',
          width: '800px',
          height: '800px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(232,184,109,0.35) 0%, rgba(201,151,58,0.2) 30%, rgba(201,151,58,0.08) 60%, transparent 75%)',
          pointerEvents: 'none',
          zIndex: 1,
          opacity: 0,
          transform: 'scale(0)',
        }}
      />

      {/* Phase 1 — Pain lines */}
      <div
        ref={painBlockRef}
        style={{
          textAlign: 'center',
          display: showWordStage || showBrand ? 'none' : 'block',
        }}
      >
        <p
          ref={line1Ref}
          style={{
            fontFamily: 'var(--font-dm-serif, DM Serif Display, serif)',
            fontSize: 'clamp(1.4rem, 3.5vw, 2rem)',
            color: '#F7F4F0',
            opacity: 0,
            marginBottom: '20px',
            lineHeight: 1.3,
            fontWeight: 400,
          }}
        >
          You've spent years caring for others.
        </p>
        <p
          ref={line2Ref}
          style={{
            fontFamily: 'var(--font-dm-serif, DM Serif Display, serif)',
            fontSize: 'clamp(1.4rem, 3.5vw, 2rem)',
            color: 'rgba(247,244,240,0.55)',
            opacity: 0,
            lineHeight: 1.3,
            fontWeight: 400,
          }}
        >
          But no agency can see your full story.
        </p>
      </div>

      {/* Phase 2 — Word cycling stage */}
      {showWordStage && (
        <div
          ref={wordStageRef}
          style={{
            position: 'absolute',
            textAlign: 'center',
            opacity: 0,
          }}
        >
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0px',
            marginBottom: '32px',
            overflow: 'hidden',
            height: 'clamp(3rem, 8vw, 5rem)',
          }}>
            <span style={{
              fontFamily: 'var(--font-dm-serif, DM Serif Display, serif)',
              fontSize: 'clamp(2.5rem, 6vw, 4rem)',
              color: '#F7F4F0',
              fontWeight: 400,
              lineHeight: 1,
            }}>
              care
            </span>
            <div style={{
              position: 'relative',
              overflow: 'hidden',
              height: 'clamp(3rem, 8vw, 5rem)',
              display: 'flex',
              alignItems: 'center',
              minWidth: '9ch',
              textAlign: 'left',
            }}>
              <span style={{
                fontFamily: 'var(--font-dm-serif, DM Serif Display, serif)',
                fontSize: 'clamp(2.5rem, 6vw, 4rem)',
                color: '#E8B86D',
                fontWeight: 400,
                lineHeight: 1,
              }}>
                {displayedWord}
                {showCursor && (
                  <span style={{
                    display: 'inline-block',
                    width: '3px',
                    height: '1em',
                    background: '#E8B86D',
                    marginLeft: '2px',
                    animation: 'cursorBlink 0.6s infinite',
                  }} />
                )}
              </span>
            </div>
            {/* Checkmark */}
            <div
              ref={checkmarkRef}
              style={{
                marginLeft: '16px',
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #C9973A, #E8B86D)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: 0,
                flexShrink: 0,
              }}
            >
              <svg width="16" height="13" viewBox="0 0 16 13" fill="none">
                <path d="M1.5 6.5L5.5 10.5L14.5 1.5" stroke="#0D1B3E" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>
        </div>
      )}

      {/* Phase 3 — Brand lockup using BrandLogo */}
      {showBrand && (
        <div style={{ zIndex: 10 }}>
          <BrandLogo size="xl" showTagline={true} animate={true} />
        </div>
      )}

      {/* Cursor blink keyframes */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes cursorBlink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0; }
        }
      ` }} />
    </div>
  )
}
