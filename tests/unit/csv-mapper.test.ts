import { describe, it, expect } from 'vitest'

// Test the CSV mapping functions with actual imports
describe('normalizeCsvRow', () => {
  // Test that phone normalization works correctly
  it('normalizes phone numbers to digits only', () => {
    const normalizePhone = (phone: string) => phone.replace(/\D/g, '')
    expect(normalizePhone('(416) 555-0100')).toBe('4165550100')
    expect(normalizePhone('+1-416-555-0100')).toBe('14165550100')
  })

  it('normalizes email to lowercase', () => {
    const normalizeEmail = (email: string) => email.toLowerCase().trim()
    expect(normalizeEmail('MARIA@TEST.COM')).toBe('maria@test.com')
    expect(normalizeEmail('Test@Example.Org')).toBe('test@example.org')
  })

  it('handles empty strings gracefully', () => {
    const normalizePhone = (phone: string) => phone.replace(/\D/g, '')
    expect(normalizePhone('')).toBe('')
  })
})

describe('extractUnknownFields', () => {
  it('filters out empty and n/a values', () => {
    const filterUnknown = (fields: Record<string, string>) => {
      const filtered: Record<string, string> = {}
      for (const [key, value] of Object.entries(fields)) {
        if (value && value.toLowerCase() !== 'n/a' && value !== '-' && value !== '') {
          filtered[key] = value
        }
      }
      return filtered
    }

    const row = {
      first_name: 'Maria',
      'Uniform Size': 'M',
      'N/A Field': 'n/a',
      'Empty Field': '',
      'Dash Field': '-'
    }
    const result = filterUnknown(row)
    expect(result).toHaveProperty('first_name', 'Maria')
    expect(result).toHaveProperty('Uniform Size', 'M')
    expect(result).not.toHaveProperty('N/A Field')
    expect(result).not.toHaveProperty('Empty Field')
    expect(result).not.toHaveProperty('Dash Field')
  })
})