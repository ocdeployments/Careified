'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  LayoutDashboard,
  PhoneCall,
  Shield,
  Sparkles,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react'

const PAGE_BG = 'rgba(8,15,30,0.97)'
const GOLD = '#C9973A'
const GOLD_LIGHT = '#E8B86D'
const GOLD_GRADIENT = 'linear-gradient(135deg, #C9973A, #E8B86D)'
const TEXT_PRIMARY = '#F8FAFC'
const TEXT_MUTED = 'rgba(255,255,255,0.5)'
const TEXT_BODY = 'rgba(255,255,255,0.7)'
const PURPLE = '#818CF8'
const GREEN = '#22C55E'
const SERIF = "'DM Serif Display', Georgia, serif"
const SANS = "'Plus Jakarta Sans', sans-serif"

interface ParacleOnboardingProps {
  onDismiss: () => void
}

const slides = [
  {
    render: () => (
      <div style={{ textAlign: 'center', animation: 'fadeIn 400ms ease' }}>
        <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }`}</style>
        <div style={{
          fontFamily: SERIF,
          fontSize: 48,
          background: GOLD_GRADIENT,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          marginBottom: 24,
        }}>
          Careified
        </div>
        <div style={{ fontFamily: SERIF, fontSize: 24, color: TEXT_PRIMARY, marginBottom: 12 }}>
          Your agency, at its most intelligent.
        </div>
        <div style={{ fontSize: 13, color: TEXT_MUTED, fontFamily: SANS }}>
          A quick introduction — takes 30 seconds.
        </div>
      </div>
    ),
  },
  {
    icon: LayoutDashboard,
    iconTint: GOLD,
    heading: "Your morning briefing, ready before you arrive.",
    body: "The dashboard shows you what's urgent, who's available, and what Paracle handled overnight — before you've had your first coffee.",
  },
  {
    icon: PhoneCall,
    iconTint: GOLD,
    heading: "Meet Paracle.",
    subheading: "Named from parakletos — called alongside you to help.",
    body: "Paracle makes the calls you don't have time to make. Screening, references, verification, QuickFill — overnight, while you sleep. It's also on your dashboard, ready to answer questions and take action.",
  },
  {
    icon: Shield,
    iconTint: PURPLE,
    heading: "Careified does the triage. You make the call.",
    body: "Every score, every flag, every recommendation is information for your decision — never a replacement for it. You are always in control. The platform thinks ahead so you don't have to.",
  },
  {
    icon: Sparkles,
    iconTint: GREEN,
    heading: "You're ready.",
    body: "Start by adding your first client or importing your roster. Paracle will take it from there.",
    actions: true,
  },
]

export default function ParacleOnboarding({ onDismiss }: ParacleOnboardingProps) {
  const [currentSlide, setCurrentSlide] = useState(0)

  const slide = slides[currentSlide]
  const IconComponent = 'icon' in slide ? slide.icon : null

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(prev => prev + 1)
    } else {
      onDismiss()
    }
  }

  const handleBack = () => {
    if (currentSlide > 0) {
      setCurrentSlide(prev => prev - 1)
    }
  }

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: PAGE_BG,
      backdropFilter: 'blur(12px)',
      zIndex: 1000,
      display: 'flex',
      flexDirection: 'column',
      fontFamily: SANS,
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap');
        @keyframes slideIn { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      `}</style>

      {/* Skip button */}
      <button
        onClick={onDismiss}
        style={{
          position: 'absolute',
          top: 24,
          right: 24,
          background: 'none',
          border: 'none',
          color: 'rgba(255,255,255,0.4)',
          fontSize: 12,
          fontFamily: SANS,
          cursor: 'pointer',
        }}
      >
        Skip
      </button>

      {/* Content */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px 32px',
        maxWidth: 600,
        margin: '0 auto',
        width: '100%',
        animation: 'slideIn 250ms ease',
      }}>
        {/* Icon */}
        {IconComponent && (
          <div style={{
            width: 64,
            height: 64,
            borderRadius: 16,
            background: 'rgba(201,151,58,0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 24,
          }}>
            {IconComponent && <IconComponent size={32} color={slide.iconTint} />}
          </div>
        )}

        {/* Slide 1: Welcome */}
        {'render' in slide && slide.render ? slide.render() : (
          <>
            <h2 style={{
              fontFamily: SERIF,
              fontSize: currentSlide === 1 ? 22 : 28,
              color: currentSlide === 2 ? GOLD : TEXT_PRIMARY,
              textAlign: 'center',
              marginBottom: currentSlide === 2 ? 8 : 16,
            }}>
              {slide.heading}
            </h2>
            {slide.subheading && (
              <p style={{
                fontSize: 13,
                fontStyle: 'italic',
                color: TEXT_MUTED,
                textAlign: 'center',
                marginBottom: 16,
              }}>
                {slide.subheading}
              </p>
            )}
            <p style={{
              fontSize: 15,
              color: TEXT_BODY,
              maxWidth: 480,
              lineHeight: 1.7,
              textAlign: 'center',
            }}>
              {slide.body}
            </p>
          </>
        )}

        {/* Slide 5: Actions */}
        {'actions' in slide && slide.actions && (
          <div style={{ marginTop: 24, display: 'flex', gap: 12, flexDirection: 'column', width: '100%', maxWidth: 320 }}>
            <div style={{ display: 'flex', gap: 12 }}>
              <Link
                href="/agency/clients/new"
                onClick={onDismiss}
                style={{
                  flex: 1,
                  padding: '12px 20px',
                  fontSize: 13,
                  fontWeight: 500,
                  color: TEXT_PRIMARY,
                  background: 'transparent',
                  border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: 8,
                  textDecoration: 'none',
                  textAlign: 'center',
                }}
              >
                Add a client
              </Link>
              <Link
                href="/agency/roster"
                onClick={onDismiss}
                style={{
                  flex: 1,
                  padding: '12px 20px',
                  fontSize: 13,
                  fontWeight: 500,
                  color: '#0D1728',
                  background: GOLD_GRADIENT,
                  border: 'none',
                  borderRadius: 8,
                  textDecoration: 'none',
                  textAlign: 'center',
                }}
              >
                Import roster
              </Link>
            </div>
            <p style={{ fontSize: 11, color: TEXT_MUTED, textAlign: 'center' }}>
              You can revisit this introduction in Settings → Help.
            </p>
          </div>
        )}
      </div>

      {/* Progress dots */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: 8,
        marginBottom: 24,
      }}>
        {slides.map((_, i) => (
          <div
            key={i}
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: i === currentSlide ? GOLD : 'rgba(255,255,255,0.2)',
              transition: 'background 200ms ease',
            }}
          />
        ))}
      </div>

      {/* Navigation */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '0 32px 32px',
        maxWidth: 600,
        margin: '0 auto',
        width: '100%',
      }}>
        {currentSlide > 0 ? (
          <button
            onClick={handleBack}
            style={{
              background: 'none',
              border: 'none',
              color: TEXT_MUTED,
              fontSize: 12,
              fontFamily: SANS,
              cursor: 'pointer',
            }}
          >
            ← Back
          </button>
        ) : (
          <div />
        )}
        <button
          onClick={handleNext}
          style={{
            padding: '10px 24px',
            fontSize: 13,
            fontWeight: 500,
            color: '#0D1728',
            background: GOLD_GRADIENT,
            border: 'none',
            borderRadius: 8,
            cursor: 'pointer',
          }}
        >
          {currentSlide === slides.length - 1 ? 'Get started →' : 'Next →'}
        </button>
      </div>
    </div>
  )
}