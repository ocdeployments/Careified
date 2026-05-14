import { describe, it, expect } from 'vitest'
import { isWithinCallingHours, detectRegion } from '@/lib/airecruit/calling-hours'

describe('detectRegion', () => {
  it('detects Canadian area codes', () => {
    expect(detectRegion('+1-416-555-0100')).toBe('CA')
    expect(detectRegion('4165550100')).toBe('CA')
  })

  it('detects US area codes', () => {
    expect(detectRegion('+1-212-555-0100')).toBe('US')
    expect(detectRegion('2125550100')).toBe('US')
  })
})

describe('isWithinCallingHours', () => {
  it('CA: 3am local time is blocked', () => {
    // Create a date that is 3am in Toronto time
    const d = new Date('2026-05-14T03:00:00-04:00')
    const result = isWithinCallingHours('+14165550100', d)
    expect(result.allowed).toBe(false)
  })

  it('CA: 10am on weekday is allowed', () => {
    // Wednesday 10am Toronto
    const d = new Date('2026-05-13T10:00:00-04:00')
    const result = isWithinCallingHours('+14165550100', d)
    expect(result.allowed).toBe(true)
  })

  it('CA: 9:30pm is blocked (after cutoff)', () => {
    const d = new Date('2026-05-13T21:30:00-04:00')
    const result = isWithinCallingHours('+14165550100', d)
    expect(result.allowed).toBe(false)
  })

  it('US: 8am is allowed', () => {
    // 8am Chicago time
    const d = new Date('2026-05-13T08:00:00-05:00')
    const result = isWithinCallingHours('+12125550100', d)
    expect(result.allowed).toBe(true)
  })

  it('US: 9pm is blocked', () => {
    // 9pm Chicago time
    const d = new Date('2026-05-13T21:00:00-05:00')
    const result = isWithinCallingHours('+12125550100', d)
    expect(result.allowed).toBe(false)
  })

  it('blocked call returns retryAfter', () => {
    const d = new Date('2026-05-14T03:00:00-04:00')
    const result = isWithinCallingHours('+14165550100', d)
    expect(result.retryAfter).toBeDefined()
  })
})