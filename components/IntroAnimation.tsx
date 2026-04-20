'use client'

import { useEffect, useRef, useState } from 'react'
import { animate } from 'framer-motion'

interface Props {
  onComplete: () => void
}

// ── Stacked pill item ─────────────────────────────────────────────────────────
function StackedPill({ word, index }: { word: string; index: number }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!ref.current) return
    animate(ref.current, { opacity: [0, 1], x: [-16, 0] }, { duration: 0.5, ease: [0.16, 1, 0.3, 1] })
  }, [])

  return (
    <div
      ref={ref}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        opacity: 0,
        marginBottom: '8px',
      }}
    >
      <div style={{
        width: '20px',
        height: '20px',
        borderRadius: '50%',
        background: '#C9973A',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}>
        <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
          <path d="M1 4L3.5 6.5L9 1" stroke="#0D1B3E" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <span style={{
        fontFamily: 'var(--font-dm-sans, DM Sans, sans-serif)',
        fontSize: '14px',
        fontWeight: 500,
        color: 'rgba(247,244,240,0.85)',
        letterSpacing: '0.04em',
      }}>
        care{word}
      </span>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────
export default function IntroAnimation({ onComplete }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const glowRef = useRef<HTMLDivElement>(null)
  const line1Ref = useRef<HTMLParagraphElement>(null)
  const line2Ref = useRef<HTMLParagraphElement>(null)
  const painBlockRef = useRef<HTMLDivElement>(null)
  const wordStageRef = useRef<HTMLDivElement>(null)
  const wordSlotRef = useRef<HTMLDivElement>(null)
  const checkmarkRef = useRef<HTMLDivElement>(null)
  const brandRef = useRef<HTMLDivElement>(null)
  const goldBarRef = useRef<HTMLDivElement>(null)
  const taglineRef = useRef<HTMLParagraphElement>(null)
  const enterBtnRef = useRef<HTMLButtonElement>(null)

  const [stackedWords, setStackedWords] = useState<string[]>([])
  const [currentWord, setCurrentWord] = useState<string | null>(null)
  const [showWordStage, setShowWordStage] = useState(false)
  const [showBrand, setShowBrand] = useState(false)
  const [showEnter, setShowEnter] = useState(false)
  const [exiting, setExiting] = useState(false)

  const words = ['Qualified', 'Recognized', 'Verified']

  // ── Skip if already seen ──────────────────────────────────────────────────
  useEffect(() => {
    if (typeof window !== 'undefined' && sessionStorage.getItem('careified_intro_seen')) {
      onComplete()
      return
    }
    runSequence()
  }, [])

  // ── Main animation sequence ───────────────────────────────────────────────
  async function runSequence() {
    const delay = (ms: number) => new Promise(r => setTimeout(r, ms))

    // Phase 1 — Pain lines
    await delay(600)
    if (line1Ref.current) {
      await animate(line1Ref.current, { opacity: [0, 1], y: [12, 0] }, { duration: 0.8, ease: 'easeOut' })
    }
    await delay(1400)
    if (line2Ref.current) {
      await animate(line2Ref.current, { opacity: [0, 1], y: [12, 0] }, { duration: 0.8, ease: 'easeOut' })
    }
    await delay(1800)

    // Phase 2 — Fade out pain lines
    if (painBlockRef.current) {
      await animate(painBlockRef.current, { opacity: [1, 0] }, { duration: 0.7, ease: [0.4, 0, 0.6, 1] })
    }

    // Show word stage
    setShowWordStage(true)
    await delay(80) // let DOM render

    if (wordStageRef.current) {
      animate(wordStageRef.current, { opacity: [0, 1] }, { duration: 0.4, ease: 'easeOut' })
    }

    // Cycle through words
    for (let i = 0; i < words.length; i++) {
      const word = words[i]

      // Slide in new word from below
      setCurrentWord(word)
      await delay(60)
      if (wordSlotRef.current) {
        await animate(wordSlotRef.current, { opacity: [0, 1], y: ['100%', '0%'] }, { duration: 0.7, ease: [0.16, 1, 0.3, 1] })
      }

      // Pop checkmark — 500ms after word starts (word anim is 700ms, so fire at ~200ms into it via delay)
      await delay(200)
      if (checkmarkRef.current) {
        await animate(checkmarkRef.current, { scale: [0.4, 1.2, 1], opacity: [0, 1] }, { duration: 0.5, ease: [0.34, 1.56, 0.64, 1] })
      }

      // Stack the word — 400ms AFTER checkmark pops (not simultaneous)
      await delay(400)
      setStackedWords(prev => [...prev, word])

      // Hold so the bullet is visible before sliding out
      await delay(900)

      // Slide current word out upward (last word stays — no slide-out)
      if (i < words.length - 1) {
        if (wordSlotRef.current) {
          await animate(wordSlotRef.current, { opacity: [1, 0], y: ['0%', '-100%'] }, { duration: 0.5, ease: 'easeIn' })
        }
        if (checkmarkRef.current) {
          animate(checkmarkRef.current, { opacity: 0, scale: 0.6 }, { duration: 0.2 })
        }
      }

      await delay(100)
    }

    // Phase 3 — Fade out word stage
    await delay(600)
    if (wordStageRef.current) {
      await animate(wordStageRef.current, { opacity: [1, 0], scale: [1, 0.92] }, { duration: 0.6, ease: 'easeOut' })
    }
    setShowWordStage(false)

    // Dead pause — crucial breathing room before brand appears
    await delay(300)

    // Phase 4 — Brand lockup
    setShowBrand(true)
    await delay(60)
    if (brandRef.current) {
      await animate(brandRef.current, { opacity: [0, 1], scale: [0.8, 1] }, { duration: 0.8, ease: [0.16, 1, 0.3, 1] })
    }

    // Gold bar sweep — delay 600ms after brand appears
    await delay(600)
    if (goldBarRef.current) {
      await animate(goldBarRef.current, { width: ['0%', '60%'] }, { duration: 1.0, ease: 'easeOut' })
    }

    // Tagline — delay 800ms after brand appears (200ms after gold bar starts)
    await delay(200)
    if (taglineRef.current) {
      await animate(taglineRef.current, { opacity: [0, 1], y: [8, 0] }, { duration: 0.6, ease: 'easeOut' })
    }

    // Phase 5 — Enter button — delay 1400ms after brand appears (600ms after tagline starts)
    await delay(600)
    setShowEnter(true)
    await delay(60)
    if (enterBtnRef.current) {
      await animate(enterBtnRef.current, { opacity: [0, 1], y: [12, 0] }, { duration: 0.5, ease: 'easeOut' })
    }
  }

  // ── Enter click ───────────────────────────────────────────────────────────
  async function handleEnter() {
    if (exiting) return
    setExiting(true)
    sessionStorage.setItem('careified_intro_seen', '1')
    if (containerRef.current) {
      await animate(containerRef.current, { opacity: [1, 0], scale: [1, 1.04] }, { duration: 0.7, ease: 'easeIn' })
    }
    onComplete()
  }

  return (
    <div
      ref={containerRef}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        background: '#080f23',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}
    >
      {/* Ambient glow */}
      <div
        ref={glowRef}
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '600px',
          height: '600px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(201,151,58,0.08) 0%, transparent 70%)',
          animation: 'pulse-glow 4s ease-in-out infinite',
          pointerEvents: 'none',
        }}
      />

      <style>{`
        @keyframes pulse-glow {
          0%, 100% { opacity: 0.6; transform: translate(-50%, -50%) scale(1); }
          50% { opacity: 1; transform: translate(-50%, -50%) scale(1.12); }
        }
      `}</style>

      {/* Phase 1 — Pain lines */}
      <div
        ref={painBlockRef}
        style={{
          position: 'absolute',
          textAlign: 'center',
          padding: '0 24px',
          maxWidth: '560px',
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
          You&apos;ve spent years caring for others.
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
          {/* care + animated word */}
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
            <div style={{ position: 'relative', overflow: 'hidden', height: 'clamp(3rem, 8vw, 5rem)', display: 'flex', alignItems: 'center' }}>
              <div
                ref={wordSlotRef}
                style={{
                  fontFamily: 'var(--font-dm-serif, DM Serif Display, serif)',
                  fontSize: 'clamp(2.5rem, 6vw, 4rem)',
                  color: '#E8B86D',
                  fontWeight: 400,
                  lineHeight: 1,
                  opacity: 0,
                }}
              >
                {currentWord}
              </div>
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

          {/* Stacked pills */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', minWidth: '200px' }}>
            {stackedWords.map((w, i) => (
              <StackedPill key={w} word={w} index={i} />
            ))}
          </div>
        </div>
      )}

      {/* Phase 4 — Brand lockup */}
      {showBrand && (
        <div
          ref={brandRef}
          style={{
            position: 'absolute',
            textAlign: 'center',
            opacity: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          {/* Brand name */}
          <div style={{
            fontFamily: 'var(--font-dm-serif, DM Serif Display, serif)',
            fontSize: 'clamp(3.5rem, 10vw, 7rem)',
            fontWeight: 400,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            lineHeight: 1,
            marginBottom: '16px',
          }}>
            <span style={{ color: '#F7F4F0' }}>CARE</span>
            <span style={{ color: '#E8B86D' }}>IFIED</span>
          </div>

          {/* Gold bar */}
          <div style={{
            height: '2px',
            width: '0%',
            background: 'linear-gradient(90deg, transparent, #C9973A, transparent)',
            marginBottom: '20px',
          }}
            ref={goldBarRef}
          />

          {/* Tagline */}
          <p
            ref={taglineRef}
            style={{
              fontFamily: 'var(--font-dm-sans, DM Sans, sans-serif)',
              fontSize: 'clamp(0.65rem, 1.5vw, 0.8rem)',
              fontWeight: 300,
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              color: 'rgba(247,244,240,0.5)',
              opacity: 0,
              margin: 0,
            }}
          >
            Your care career. Careified.
          </p>

          {/* Enter button */}
          {showEnter && (
            <button
              ref={enterBtnRef}
              onClick={handleEnter}
              style={{
                marginTop: '48px',
                padding: '0.85rem 2.5rem',
                background: '#E8B86D',
                color: '#0D1B3E',
                fontFamily: 'var(--font-dm-sans, DM Sans, sans-serif)',
                fontSize: '0.8rem',
                fontWeight: 500,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                border: 'none',
                borderRadius: '2px',
                cursor: 'pointer',
                opacity: 0,
                transition: 'background 0.2s ease',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = '#C9973A' }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = '#E8B86D' }}
            >
              Enter →
            </button>
          )}
        </div>
      )}
    </div>
  )
}
