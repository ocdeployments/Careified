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
  const checkmarkRef = useRef<HTMLDivElement>(null)
  const brandRef = useRef<HTMLDivElement>(null)
  const goldBarRef = useRef<HTMLDivElement>(null)
  const taglineRef = useRef<HTMLParagraphElement>(null)
  const enterBtnRef = useRef<HTMLButtonElement>(null)

  const [stackedWords, setStackedWords] = useState<string[]>([])
  const [displayedWord, setDisplayedWord] = useState('')
  const [showCursor, setShowCursor] = useState(false)
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

    // PHASE 1 — Pain lines
    // p1 fades in: delay 600ms, duration 800ms
    await delay(600)
    if (line1Ref.current) {
      await animate(line1Ref.current, { opacity: [0, 1], y: [12, 0] }, { duration: 0.8, ease: 'easeOut' })
    }
    // p2 fades in: delay 1600ms, duration 800ms
    await delay(1000) // 1600 - 600 = 1000ms more
    if (line2Ref.current) {
      await animate(line2Ref.current, { opacity: [0, 1], y: [12, 0] }, { duration: 0.8, ease: 'easeOut' })
    }
    // Hold: 1800ms
    await delay(1800)
    // Both fade out: duration 700ms
    if (painBlockRef.current) {
      await animate(painBlockRef.current, { opacity: [1, 0] }, { duration: 0.7, ease: [0.4, 0, 0.6, 1] })
    }

    // PHASE 2 — Word cycling (word stage visible, bullet list HIDDEN)
    setShowWordStage(true)
    await delay(80) // let DOM render
    if (wordStageRef.current) {
      animate(wordStageRef.current, { opacity: [0, 1] }, { duration: 0.4, ease: 'easeOut' })
    }

    // For each word (Qualified → Recognized → Verified)
    for (let i = 0; i < words.length; i++) {
      const word = words[i]

      // Type letter by letter: 75ms per letter
      await typeWord(word)

      // Hold after last letter: 500ms
      await delay(500)

      // Checkmark pops: spring scale 0→1, duration 400ms
      if (checkmarkRef.current) {
        await animate(checkmarkRef.current, { scale: [0, 1], opacity: [0, 1] }, { duration: 0.4, ease: [0.34, 1.56, 0.64, 1] })
      }

      // Hold with checkmark: 600ms
      await delay(600)

      // Add to stacked pills
      setStackedWords(prev => [...prev, word])

      if (i < words.length - 1) {
        // Erase letter by letter: 40ms per letter
        await deleteWord(word)
        // Pause: 200ms
        await delay(200)
      }
      // If LAST WORD (Verified): Do NOT erase — hold Verified + checkmark visible
    }

    // PHASE 3 — 500ms dead pause (nothing animates)
    await delay(500)

    // PHASE 4 — Word stage fades out: duration 500ms ease-in
    // Simultaneously: nothing else moves
    if (wordStageRef.current) {
      await animate(wordStageRef.current, { opacity: [1, 0] }, { duration: 0.5, ease: 'easeIn' })
    }
    setShowWordStage(false)

    // PHASE 5 — 300ms dead pause
    await delay(300)

    // PHASE 6 — Bullet list builds (word stage gone)
    // Each bullet slides in from left with checkmark circle:
    // Bullet 1 (Qualified): delay 0ms, duration 500ms
    // Bullet 2 (Recognized): delay 300ms, duration 500ms
    // Bullet 3 (Verified): delay 600ms, duration 500ms
    // Hold all three visible: 800ms
    // (StackedPill component handles its own animation on mount via useEffect)
    await delay(800)

    // PHASE 7 — 400ms dead pause
    await delay(400)

    // PHASE 8 — Bullet list fades out: duration 400ms
    // 300ms pause after
    // (We hide stackedWords by unmounting when showWordStage=false, so this is implicit)
    await delay(300)

    // PHASE 9 — CAREIFIED brand lockup appears:
    // scale 0.85 → 1, opacity 0 → 1
    // duration 900ms cubic-bezier(0.16, 1, 0.3, 1)
    setShowBrand(true)
    await delay(60)
    if (brandRef.current) {
      await animate(brandRef.current, { opacity: [0, 1], scale: [0.85, 1] }, { duration: 0.9, ease: [0.16, 1, 0.3, 1] })
    }

    // PHASE 10 — Gold bar sweeps in: delay 500ms, duration 1000ms
    await delay(500)
    if (goldBarRef.current) {
      await animate(goldBarRef.current, { width: ['0%', '60%'] }, { duration: 1.0, ease: 'easeOut' })
    }

    // PHASE 11 — Tagline fades in: delay 900ms, duration 600ms
    await delay(400) // 900 - 500 = 400ms more
    if (taglineRef.current) {
      await animate(taglineRef.current, { opacity: [0, 1], y: [8, 0] }, { duration: 0.6, ease: 'easeOut' })
    }

    // PHASE 12 — Enter button slides up: delay 1400ms, duration 500ms
    await delay(500) // 1400 - 900 = 500ms more
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
        background: '#0D1B3E',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        overflow: 'hidden',
      }}
    >
      {/* Subtle radial glow */}
      <div
        ref={glowRef}
        style={{
          position: 'absolute',
          width: '800px',
          height: '800px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(201,151,58,0.08) 0%, transparent 70%)',
          pointerEvents: 'none',
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
            {/* Word container with fixed min-width for "Recognized" (9 chars) */}
            <div style={{
              position: 'relative',
              overflow: 'hidden',
              height: 'clamp(3rem, 8vw, 5rem)',
              display: 'flex',
              alignItems: 'center',
              minWidth: '9ch', // longest word "Recognized" = 9 chars
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
                {/* Blinking cursor */}
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

          {/* Stacked pills */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', minWidth: '200px' }}>
            {stackedWords.map((w, i) => (
              <StackedPill key={w} word={w} index={i} />
            ))}
          </div>
        </div>
      )}

      {/* Phase 9 — Brand lockup */}
      {showBrand && (
        <div
          ref={brandRef}
          style={{
            textAlign: 'center',
            opacity: 0,
          }}
        >
          <h1 style={{
            fontFamily: 'var(--font-dm-serif, DM Serif Display, serif)',
            fontSize: 'clamp(2.5rem, 7vw, 4.5rem)',
            color: '#F7F4F0',
            fontWeight: 400,
            letterSpacing: '0.02em',
            marginBottom: '12px',
          }}>
            Careified
          </h1>
          {/* Gold bar */}
          <div
            ref={goldBarRef}
            style={{
              height: '3px',
              width: '0%',
              background: 'linear-gradient(90deg, #C9973A, #E8B86D)',
              margin: '0 auto 16px',
              borderRadius: '2px',
            }}
          />
          {/* Tagline */}
          <p
            ref={taglineRef}
            style={{
              fontFamily: 'var(--font-dm-sans, DM Sans, sans-serif)',
              fontSize: 'clamp(0.9rem, 2vw, 1.1rem)',
              color: 'rgba(247,244,240,0.6)',
              fontWeight: 400,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              opacity: 0,
            }}
          >
            Your credentials. Your story. Your value.
          </p>
        </div>
      )}

      {/* Phase 12 — Enter button */}
      {showEnter && (
        <button
          ref={enterBtnRef}
          onClick={handleEnter}
          style={{
            marginTop: '40px',
            padding: '14px 36px',
            background: 'linear-gradient(135deg, #C9973A, #E8B86D)',
            color: '#0D1B3E',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: 600,
            fontFamily: 'var(--font-dm-sans, DM Sans, sans-serif)',
            cursor: 'pointer',
            opacity: 0,
          }}
        >
          Enter Careified
        </button>
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