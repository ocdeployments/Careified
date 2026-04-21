'use client'

import { useEffect, useRef, useState } from 'react'
import { animate } from 'framer-motion'

interface Props {
  onComplete: () => void
}

// ── Stacked pill item ─────────────────────────────────────────────────────────
function StackedPill({ word, index, delay }: { word: string; index: number; delay: number }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!ref.current) return
    // Each bullet: opacity 0, translateX(-20px) → opacity 1, translateX(0)
    // Duration 600ms ease-out
    animate(
      ref.current,
      { opacity: [0, 1], x: [-20, 0] },
      { duration: 0.6, ease: 'easeOut', delay: delay / 1000 }
    )
  }, [delay])

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
  const bulletListRef = useRef<HTMLDivElement>(null)

  const [stackedWords, setStackedWords] = useState<string[]>([])
  const [displayedWord, setDisplayedWord] = useState('')
  const [showCursor, setShowCursor] = useState(false)
  const [showWordStage, setShowWordStage] = useState(false)
  const [showBrand, setShowBrand] = useState(false)
  const [showEnter, setShowEnter] = useState(false)
  const [showBulletList, setShowBulletList] = useState(false)
  const [glowActive, setGlowActive] = useState(false)
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

    // ═══════════════════════════════════════════════════════════════════════
    // ACT 1 — Word cycling (no bullet list visible at all)
    // ═══════════════════════════════════════════════════════════════════════

    // Pain line 1 fades in: delay 600ms, duration 800ms
    await delay(600)
    if (line1Ref.current) {
      await animate(line1Ref.current, { opacity: [0, 1], y: [12, 0] }, { duration: 0.8, ease: 'easeOut' })
    }

    // Pain line 2 fades in: delay 1600ms, duration 800ms
    await delay(15000) // 16000 - 600 - 800 = 15000ms more (after line1 completes at 1400ms)
    if (line2Ref.current) {
      await animate(line2Ref.current, { opacity: [0, 1], y: [12, 0] }, { duration: 0.8, ease: 'easeOut' })
    }

    // Hold: 1800ms
    await delay(18000)

    // Both fade out: duration 700ms ease-in-out
    if (painBlockRef.current) {
      await animate(painBlockRef.current, { opacity: [1, 0] }, { duration: 0.7, ease: [0.4, 0, 0.6, 1] })
    }

    // Pause: 500ms
    await delay(500)

    // Show word stage: "care" prefix + typewriter slot
    // Hide bullet list completely (display: none, not just opacity 0)
    setShowWordStage(true)
    await delay(80) // let DOM render
    if (wordStageRef.current) {
      animate(wordStageRef.current, { opacity: [0, 1] }, { duration: 0.4, ease: 'easeOut' })
    }

    // For Qualified:
    // Type letter by letter: 75ms per letter
    await typeWord('Qualified')

    // Hold: 600ms
    await delay(600)

    // Erase letter by letter: 40ms per letter
    await deleteWord('Qualified')

    // Pause: 250ms
    await delay(250)

    // For Recognized:
    // Type letter by letter: 75ms per letter
    await typeWord('Recognized')

    // Hold: 600ms
    await delay(600)

    // Erase letter by letter: 40ms per letter
    await deleteWord('Recognized')

    // Pause: 250ms
    await delay(250)

    // For Verified:
    // Type letter by letter: 75ms per letter
    await typeWord('Verified')

    // Hold: 900ms ← holds longer, final word
    await delay(900)

    // Do NOT erase Verified

    // Pause: 600ms (Verified + checkmark still visible)
    await delay(600)

    // Word stage fades out entirely: duration 600ms ease-in
    if (wordStageRef.current) {
      await animate(wordStageRef.current, { opacity: [1, 0] }, { duration: 0.6, ease: 'easeIn' })
    }
    setShowWordStage(false)

    // Pause: 800ms dead silence — nothing on screen but background
    await delay(800)

    // ═══════════════════════════════════════════════════════════════════════
    // ACT 2 — Checkmark bullets (word stage gone, bullets only)
    // ═══════════════════════════════════════════════════════════════════════

    // After 800ms silence, show bullet list
    setShowBulletList(true)
    await delay(80) // let DOM render

    // Hold all three visible: 1000ms
    await delay(1000)

    // Pause: 600ms dead silence
    await delay(600)

    // ═══════════════════════════════════════════════════════════════════════
    // ACT 3 — Sunrise glow (bullets fade, glow expands)
    // ═══════════════════════════════════════════════════════════════════════

    // Fade out bullets: duration 500ms ease-in
    if (bulletListRef.current) {
      await animate(bulletListRef.current, { opacity: [1, 0] }, { duration: 0.5, ease: 'easeIn' })
    }
    setShowBulletList(false)

    // Pause: 300ms
    await delay(300)

    // Now trigger the sunrise glow effect
    setGlowActive(true)

    // While glow is expanding (after 800ms into glow):
    // CAREIFIED brand lockup fades in ON TOP of glow
    // scale 0.9 → 1, opacity 0 → 1
    // duration 800ms cubic-bezier(0.16, 1, 0.3, 1)
    await delay(800)
    setShowBrand(true)
    await delay(60)
    if (brandRef.current) {
      await animate(brandRef.current, { opacity: [0, 1], scale: [0.9, 1] }, { duration: 0.8, ease: [0.16, 1, 0.3, 1] })
    }

    // Gold bar sweeps: delay 500ms after brand appears
    await delay(500)
    if (goldBarRef.current) {
      await animate(goldBarRef.current, { width: ['0%', '60%'] }, { duration: 1.0, ease: 'easeOut' })
    }

    // Tagline fades: delay 900ms after brand appears
    await delay(400) // 900 - 500 = 400ms more
    if (taglineRef.current) {
      await animate(taglineRef.current, { opacity: [0, 1], y: [8, 0] }, { duration: 0.6, ease: 'easeOut' })
    }

    // Enter button: delay 1400ms after brand appears
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
        background: glowActive ? '#0D1525' : '#080f23',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 99,
        overflow: 'hidden',
        transition: 'background 20s ease',
      }}
    >
      {/* Sunrise glow effect - positioned behind text, above background */}
      <div
        ref={glowRef}
        className={glowActive ? 'sunrise-glow' : ''}
        style={{
          position: 'absolute',
          width: '800px',
          height: '800px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(232,184,109,0.35) 0%, rgba(201,151,58,0.2) 30%, rgba(201,151,58,0.08) 60%, transparent 75%)',
          pointerEvents: 'none',
          zIndex: 5,
          opacity: 0,
          transform: 'scale(0)',
        }}
      />

      {/* Phase 1 — Pain lines */}
      <div
        ref={painBlockRef}
        style={{
          textAlign: 'center',
          display: showWordStage || showBrand || showBulletList ? 'none' : 'block',
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
        </div>
      )}

      {/* Phase 2b — Bullet list (shown after word stage is gone) */}
      {showBulletList && (
        <div
          ref={bulletListRef}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            minWidth: '200px',
            opacity: 1,
          }}
        >
          {/* Bullet 1 "Qualified": duration 600ms ease-out, delay 0ms */}
          <StackedPill word="Qualified" index={0} delay={0} />
          {/* Bullet 2 "Recognized": duration 600ms ease-out, delay 400ms */}
          <StackedPill word="Recognized" index={1} delay={400} />
          {/* Bullet 3 "Verified": duration 600ms ease-out, delay 800ms */}
          <StackedPill word="Verified" index={2} delay={800} />
        </div>
      )}

      {/* Phase 9 — Brand lockup */}
      {showBrand && (
        <div
          ref={brandRef}
          style={{
            textAlign: 'center',
            opacity: 0,
            zIndex: 10, // Above the glow
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
            zIndex: 10,
          }}
        >
          Enter Careified
        </button>
      )}

      {/* Cursor blink keyframes and Sunrise glow animation */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes cursorBlink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0; }
        }

        @keyframes sunriseExpand {
          0% {
            transform: scale(0);
            opacity: 0;
          }
          25% {
            transform: scale(0.4);
            opacity: 0.4;
          }
          50% {
            transform: scale(0.75);
            opacity: 0.7;
          }
          75% {
            transform: scale(1.1);
            opacity: 0.85;
          }
          85% {
            transform: scale(1.2);
            opacity: 0.9;
          }
          100% {
            transform: scale(1.15);
            opacity: 0.75;
          }
        }

        .sunrise-glow {
          animation: sunriseExpand 20000ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      ` }} />
    </div>
  )
}
