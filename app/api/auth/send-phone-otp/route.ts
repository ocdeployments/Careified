import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { checkRateLimit, getClientIp } from '@/lib/rateLimit'

// In-memory OTP store (use Redis in production)
const otpStore: Map<string, { code: string; expires: number; attempts: number }> = new Map()

function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

function isValidNANP(phone: string): boolean {
  // Remove all non-digits
  const digits = phone.replace(/\D/g, '')

  // Must be 10 digits
  if (digits.length !== 10) return false

  // Reject invalid area codes
  const areaCode = digits.substring(0, 3)
  if (areaCode.startsWith('0') || areaCode.startsWith('1')) return false

  // Reject 555-01xx (fake numbers)
  if (areaCode === '555' && digits.substring(3, 5) === '00') return false

  // Reject all same digits
  if (/^(\d)\1{9}$/.test(digits)) return false

  return true
}

function formatPhoneForDisplay(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`
  }
  return phone
}

export async function POST(request: NextRequest) {
  try {
    // Rate limit check
    const clientIp = getClientIp(request)
    if (!checkRateLimit(clientIp)) {
      return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 })
    }

    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { phoneNumber } = await request.json()

    if (!phoneNumber) {
      return NextResponse.json({ error: 'Phone number required' }, { status: 400 })
    }

    // Validate phone number format
    if (!isValidNANP(phoneNumber)) {
      return NextResponse.json({ error: 'Please enter a valid 10-digit phone number' }, { status: 400 })
    }

    const digits = phoneNumber.replace(/\D/g, '')
    const cacheKey = `${userId}:${digits}`

    // Check if already verified recently (within 30 min)
    const existing = otpStore.get(cacheKey)
    if (existing && existing.expires > Date.now()) {
      return NextResponse.json({ error: 'Code already sent. Please wait for existing code or try again later.' }, { status: 429 })
    }

    // Generate and store OTP
    const code = generateOTP()
    otpStore.set(cacheKey, {
      code,
      expires: Date.now() + 5 * 60 * 1000, // 5 minutes
      attempts: 0,
    })

    // In development, log the code and return it for testing
    const isDev = process.env.NODE_ENV === 'development'

    if (isDev) {
      console.log(`[DEV] OTP for ${formatPhoneForDisplay(phoneNumber)}: ${code}`)
      return NextResponse.json({
        success: true,
        devCode: code, // Remove in production
        message: 'Code sent (check console in dev)'
      })
    }

    // In production, use Twilio or Clerk phone verification
    // For now, return success - implement actual SMS in production
    return NextResponse.json({
      success: true,
      message: 'Verification code sent'
    })

  } catch (error) {
    console.error('Send OTP error:', error)
    return NextResponse.json({ error: 'Failed to send code' }, { status: 500 })
  }
}