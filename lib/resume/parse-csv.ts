// CSV column mapping and normalization for roster import
// Uses OpenRouter to intelligently map agency columns to ParsedResume fields

import { ParsedResume } from './parse-resume'

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY!
const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1'

export interface CsvColumnMap {
  mapping: { [agencyColumn: string]: keyof ParsedResume | null }
  confidence: { [agencyColumn: string]: 'high' | 'medium' | 'low' }
  unmapped: string[]
}

// Allowed caregiver roles
const ALLOWED_ROLES = ['PSW', 'HCA', 'DSW', 'Companion', 'LiveIn', 'Other']

// Province/state codes
const CA_PROVINCES = new Set(['ON', 'BC', 'AB', 'QC', 'MB', 'SK', 'NS', 'NB', 'NL', 'PE', 'YT', 'NT', 'NU'])
const US_STATES = new Set([
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA', 'HI', 'ID',
  'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN',
  'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR',
  'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
])

const IGNORE_VALUES = new Set(['n/a', '-', 'none', 'na', '', null, undefined])

// Map agency column variations to ParsedResume field names
const KNOWN_MAPPINGS: Record<string, keyof ParsedResume> = {
  // Name variations
  'first name': 'firstName',
  'firstname': 'firstName',
  'first_name': 'firstName',
  'first': 'firstName',
  'given name': 'firstName',
  'last name': 'lastName',
  'lastname': 'lastName',
  'last_name': 'lastName',
  'surname': 'lastName',
  'last': 'lastName',
  'family name': 'lastName',
  'name': 'firstName', // Fallback - will split later

  // Contact
  'email': 'email',
  'email address': 'email',
  'e-mail': 'email',
  'phone': 'phone',
  'phone number': 'phone',
  'phone_number': 'phone',
  'mobile': 'phone',
  'cell': 'phone',
  'telephone': 'phone',

  // Location
  'city': 'city',
  'town': 'city',
  'location': 'city',
  'province': 'state',
  'province_state': 'state',
  'province/state': 'state',
  'state': 'state',
  'state/province': 'state',
  'region': 'state',

  // Role/Title
  'role': 'jobTitle',
  'title': 'jobTitle',
  'job title': 'jobTitle',
  'job_title': 'jobTitle',
  'position': 'jobTitle',
  'occupation': 'jobTitle',
  'designation': 'jobTitle',

  // Experience
  'years experience': 'yearsExperience',
  'years_experience': 'yearsExperience',
  'years of experience': 'yearsExperience',
  'experience': 'yearsExperience',
  'exp': 'yearsExperience',
  'yrs experience': 'yearsExperience',

  // Bio
  'bio': 'bio',
  'biography': 'bio',
  'summary': 'bio',
  'profile': 'bio',
  'about': 'bio',
  'description': 'bio',

  // Arrays
  'services': 'services',
  'skills': 'services',
  'care services': 'services',
  'specializations': 'specializations',
  'specialties': 'specializations',
  'areas of expertise': 'specializations',
  'languages': 'languages',
  'language': 'languages',
  'spoken languages': 'languages',
  'credentials': 'credentials',
  'certifications': 'certifications',
  'certs': 'certifications',
  'diagnosis experience': 'diagnosisExperience',
  'diagnoses': 'diagnosisExperience',
  'conditions': 'diagnosisExperience',
  'adls': 'adlsPerformed',
  'adl': 'adlsPerformed',
  'activities of daily living': 'adlsPerformed',
}

export async function mapCsvColumns(
  headers: string[],
  sampleRows: string[][]
): Promise<CsvColumnMap> {
  const normalizedHeaders = headers.map(h => h.toLowerCase().trim())

  // Build quick lookup from known mappings
  const mapping: CsvColumnMap['mapping'] = {}
  const confidence: CsvColumnMap['confidence'] = {}
  const unmapped: string[] = []

  for (const header of headers) {
    const norm = header.toLowerCase().trim()
    const knownField = KNOWN_MAPPINGS[norm]

    if (knownField) {
      mapping[header] = knownField
      confidence[header] = 'high'
    } else {
      // Try OpenRouter for unknown columns
      mapping[header] = null
      unmapped.push(header)
    }
  }

  // If there are unmapped columns, try to map them with LLM
  if (unmapped.length > 0 && sampleRows.length > 0) {
    try {
      const samplePreview = sampleRows.slice(0, 3).map(row => {
        const obj: Record<string, string> = {}
        headers.forEach((h, i) => { obj[h] = row[i] || '' })
        return obj
      })

      const prompt = `You are a CSV column mapper for a home care staffing platform.
Given these CSV headers and sample data rows, map each unknown column to a ParsedResume field.

Headers: ${JSON.stringify(headers)}
Sample rows: ${JSON.stringify(samplePreview, null, 2)}

Known ParsedResume fields:
- firstName, lastName, email, phone, city, state, jobTitle, yearsExperience, bio
- services, specializations, languages, credentials, certifications, diagnosisExperience, adlsPerformed

If a column cannot be mapped to any of these fields, return null.

Return ONLY a JSON object with this structure:
{
  "mappings": { "column_name": "parsed_resume_field" or null },
  "confidence": { "column_name": "high" or "medium" or "low" }
}`

      const response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://careified.vercel.app',
          'X-Title': 'Careified CSV Mapper',
        },
        body: JSON.stringify({
          model: 'upstage/ring-2.6-1t:free',
          max_tokens: 500,
          temperature: 0.1,
          messages: [{ role: 'user', content: prompt }],
        }),
      })

      if (response.ok) {
        const data = await response.json()
        const content = data.choices?.[0]?.message?.content || ''

        try {
          const clean = content.replace(/```json|```/g, '').trim()
          const llmResult = JSON.parse(clean)

          if (llmResult.mappings) {
            for (const [col, field] of Object.entries(llmResult.mappings)) {
              if (field && mapping[col] === null) {
                mapping[col] = field as keyof ParsedResume
                confidence[col] = llmResult.confidence?.[col] || 'medium'
              }
            }
          }
        } catch {
          console.error('LLM mapping parse failed:', content)
        }
      }
    } catch (err) {
      console.error('mapCsvColumns LLM error:', err)
    }
  }

  // Recalculate unmapped
  const finalUnmapped = Object.entries(mapping)
    .filter(([_, v]) => v === null)
    .map(([k]) => k)

  return { mapping, confidence, unmapped: finalUnmapped }
}

export function normalizeCsvRow(
  row: Record<string, string>,
  mapping: CsvColumnMap
): Partial<ParsedResume> {
  const result: Partial<ParsedResume> = {}

  for (const [col, value] of Object.entries(row)) {
    if (!value || IGNORE_VALUES.has(value)) continue

    const targetField = mapping.mapping[col]
    if (!targetField) continue

    const normalizedValue = normalizeValue(value, targetField)
    if (normalizedValue !== undefined && normalizedValue !== null) {
      if (targetField === 'firstName' || targetField === 'lastName') {
        result[targetField] = normalizedValue as string
      } else if (Array.isArray(result[targetField])) {
        (result[targetField] as string[]).push(normalizedValue as string)
      } else if (targetField === 'yearsExperience') {
        (result as any)[targetField] = normalizedValue as number
      } else if (Array.isArray(normalizedValue)) {
        (result as any)[targetField] = normalizedValue
      } else {
        (result as any)[targetField] = normalizedValue
      }
    }
  }

  // Handle name splitting if full name provided
  if (result.firstName && !result.lastName) {
    const nameParts = splitFullName(result.firstName as string)
    if (nameParts.first && nameParts.last) {
      result.firstName = nameParts.first
      result.lastName = nameParts.last
    }
  }

  return result
}

function normalizeValue(value: string, targetField: keyof ParsedResume): string | string[] | number | undefined {
  const trimmed = value.trim()

  switch (targetField) {
    case 'phone':
      return trimmed.replace(/\D/g, '').slice(0, 10)

    case 'email':
      return trimmed.toLowerCase()

    case 'yearsExperience':
      const extracted = parseYearsExperience(trimmed)
      return extracted

    case 'state':
      return normalizeProvinceState(trimmed)

    case 'jobTitle':
      return normalizeRole(trimmed)

    case 'firstName':
    case 'lastName':
    case 'city':
    case 'bio':
      return trimmed

    case 'services':
    case 'specializations':
    case 'languages':
    case 'credentials':
    case 'certifications':
    case 'diagnosisExperience':
    case 'adlsPerformed':
      return trimmed.split(/[,;]/).map(s => s.trim()).filter(Boolean)

    default:
      return trimmed
  }
}

function splitFullName(name: string): { first: string; last: string } {
  const trimmed = name.trim()

  // "Smith, John" format
  if (trimmed.includes(',')) {
    const parts = trimmed.split(',')
    return { last: parts[0].trim(), first: parts[1]?.trim() || '' }
  }

  // "John Smith" format
  const parts = trimmed.split(/\s+/)
  if (parts.length >= 2) {
    return { first: parts[0], last: parts.slice(1).join(' ') }
  }

  return { first: trimmed, last: '' }
}

function parseYearsExperience(value: string): number | undefined {
  // Handle "5 years", "5+", "5-7 years", "5", etc.
  const match = value.match(/(\d+)/)
  if (match) {
    const num = parseInt(match[1], 10)
    if (num >= 0 && num <= 50) return num
  }
  return undefined
}

function normalizeProvinceState(value: string): string {
  const upper = value.toUpperCase().trim()

  if (CA_PROVINCES.has(upper) || upper === 'CANADA') return upper
  if (US_STATES.has(upper) || upper === 'USA' || upper === 'UNITED STATES') return upper

  // Return as-is if unrecognized
  return value
}

function normalizeRole(value: string): string {
  const lower = value.toLowerCase()

  for (const role of ALLOWED_ROLES) {
    if (lower.includes(role.toLowerCase())) {
      return role
    }
  }

  // Common variations
  if (lower.includes('personal support') || lower.includes('psw')) return 'PSW'
  if (lower.includes('health care') || lower.includes('hca')) return 'HCA'
  if (lower.includes('developmental') || lower.includes('dsw')) return 'DSW'
  if (lower.includes('companion')) return 'Companion'
  if (lower.includes('live') && lower.includes('in')) return 'LiveIn'

  return 'Other'
}

export function extractUnknownFields(
  row: Record<string, string>,
  mapping: CsvColumnMap
): Record<string, string> {
  const unknown: Record<string, string> = {}

  for (const [col, value] of Object.entries(row)) {
    if (!value || IGNORE_VALUES.has(value)) continue
    if (mapping.mapping[col] !== null) continue

    unknown[col] = value
  }

  return unknown
}