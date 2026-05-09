// Simple in-memory rate limiter using sliding window
// 10 requests per minute per IP
import { NextRequest } from 'next/server'

interface RateLimitEntry {
  count: number
  windowStart: number
}

const rateLimitMap = new Map<string, RateLimitEntry>()

const DEFAULT_LIMIT = 10
const WINDOW_MS = 60 * 1000 // 1 minute

export function checkRateLimit(ip: string, limit: number = DEFAULT_LIMIT): boolean {
  const now = Date.now()
  const entry = rateLimitMap.get(ip)

  if (!entry) {
    // First request from this IP
    rateLimitMap.set(ip, { count: 1, windowStart: now })
    return true
  }

  // Check if window has expired
  if (now - entry.windowStart > WINDOW_MS) {
    // Reset the window
    rateLimitMap.set(ip, { count: 1, windowStart: now })
    return true
  }

  // Check if under limit
  if (entry.count < limit) {
    entry.count++
    rateLimitMap.set(ip, entry)
    return true
  }

  // Rate limit exceeded
  return false
}

export function getClientIp(req: NextRequest): string {
  // Try various headers to get client IP
  const forwarded = req.headers.get('x-forwarded-for')
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }

  const realIp = req.headers.get('x-real-ip')
  if (realIp) {
    return realIp
  }

  return 'unknown'
}

// Cleanup old entries periodically
setInterval(() => {
  const now = Date.now()
  const windowMs = WINDOW_MS * 2 // Clean entries older than 2 windows

  for (const [ip, entry] of rateLimitMap.entries()) {
    if (now - entry.windowStart > windowMs) {
      rateLimitMap.delete(ip)
    }
  }
}, 5 * 60 * 1000) // Run cleanup every 5 minutes