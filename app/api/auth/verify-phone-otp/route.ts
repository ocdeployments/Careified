import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'

// In-memory OTP store (use Redis in production)
const otpStore: Map<string, { code: string; expires: number; attempts: number; locked?: boolean; lockExpires?: number }> = new Map()

const MAX_ATTEMPTS = 3
const LOCK_DURATION = 5 * 60 * 1000 // 5 minutes

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { phoneNumber, code } = await request.json()

    if (!phoneNumber || !code) {
      return NextResponse.json({ error: 'Phone number and code required' }, { status: 400 })
    }

    if (code.length !== 6 || !/^\d{6}$/.test(code)) {
      return NextResponse.json({ error: 'Please enter a valid 6-digit code' }, { status: 400 })
    }

    const digits = phoneNumber.replace(/\D/g, '')
    const cacheKey = `${userId}:${digits}`

    const stored = otpStore.get(cacheKey)

    if (!stored) {
      return NextResponse.json({ error: 'No code found. Please request a new code.' }, { status: 400 })
    }

    // Check if locked
    if (stored.locked && stored.lockExpires && stored.lockExpires > Date.now()) {
      const remaining = Math.ceil((stored.lockExpires - Date.now()) / 1000 / 60)
      return NextResponse.json({ error: `Too many attempts. Try again in ${remaining} minute(s).` }, { status: 429 })
    }

    // Clear lock if expired
    if (stored.locked && stored.lockExpires && stored.lockExpires <= Date.now()) {
      stored.locked = false
      stored.attempts = 0
    }

    // Check expiration
    if (stored.expires < Date.now()) {
      otpStore.delete(cacheKey)
      return NextResponse.json({ error: 'Code expired. Please request a new one.' }, { status: 400 })
    }

    // Check code
    if (stored.code !== code) {
      stored.attempts += 1

      if (stored.attempts >= MAX_ATTEMPTS) {
        stored.locked = true
        stored.lockExpires = Date.now() + LOCK_DURATION
        return NextResponse.json({ error: 'Too many attempts. Account locked for 5 minutes.' }, { status: 429 })
      }

      const remaining = MAX_ATTEMPTS - stored.attempts
      return NextResponse.json({
        error: `Incorrect code. ${remaining} attempt${remaining === 1 ? '' : 's'} remaining.`,
        remainingAttempts: remaining
      }, { status: 400 })
    }

    // Success - clear the OTP and return verified
    otpStore.delete(cacheKey)

    return NextResponse.json({
      success: true,
      verified: true,
      phoneNumber: `+1${digits}`
    })

  } catch (error) {
    console.error('Verify OTP error:', error)
    return NextResponse.json({ error: 'Failed to verify code' }, { status: 500 })
  }
}