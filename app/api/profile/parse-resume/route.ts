// Careified — Resume Parse API
// Accepts PDF or Word file upload, extracts text, returns structured fields
// No AI — regex + heuristic extraction only

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'

export const runtime = 'nodejs'
export const maxDuration = 30

// Simple heuristic extractors
function extractEmail(text: string): string | undefined {
  const match = text.match(/[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/)
  return match?.[0]
}

function extractPhone(text: string): string | undefined {
  const match = text.match(/(\+?1[\s\-.]?)?\(?\d{3}\)?[\s\-.]?\d{3}[\s\-.]?\d{4}/)
  return match?.[0]?.trim()
}

function extractName(text: string): { firstName?: string; lastName?: string } {
  // First non-empty line is usually the name
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean)
  const firstLine = lines[0] || ''
  // Skip if it looks like a title or address
  if (firstLine.length > 40) return {}
  if (/\d/.test(firstLine)) return {}
  const parts = firstLine.split(/\s+/)
  if (parts.length >= 2) {
    return { firstName: parts[0], lastName: parts[parts.length - 1] }
  }
  return {}
}

function extractCity(text: string): string | undefined {
  // Look for "City, Province/State" or "City, XX" pattern
  const match = text.match(/([A-Z][a-zA-Z\s]+),\s*([A-Z]{2}|Ontario|British Columbia|Alberta|Quebec|Texas|California|Florida|New York)/)
  return match?.[1]?.trim()
}

function extractYearsExperience(text: string): number | undefined {
  const match = text.match(/(\d+)\+?\s*years?\s*(of\s*)?(experience|exp)/i)
  if (match) return parseInt(match[1])
  return undefined
}

function extractJobTitle(text: string): string | undefined {
  const titles = [
    'Personal Support Worker', 'PSW', 'Registered Nurse', 'RN',
    'Registered Practical Nurse', 'RPN', 'Licensed Practical Nurse', 'LPN',
    'Home Health Aide', 'HHA', 'Certified Nursing Assistant', 'CNA',
    'Early Childhood Educator', 'ECE', 'Developmental Support Worker', 'DSW',
    'Caregiver', 'Care Aide', 'Health Care Aide', 'HCA',
    'Personal Care Aide', 'Companion', 'Live-in Caregiver',
  ]
  const lower = text.toLowerCase()
  for (const title of titles) {
    if (lower.includes(title.toLowerCase())) return title
  }
  return undefined
}

function extractServices(text: string): string[] {
  const serviceKeywords = [
    'Dementia care', 'Alzheimer', 'Palliative care', 'Hospice',
    'Medication management', 'Personal hygiene', 'Bathing', 'Grooming',
    'Meal preparation', 'Meal prep', 'Companionship', 'Mobility assistance',
    'Transfer', 'Wound care', 'Catheter', 'Feeding', 'Respite',
    'Child care', 'Childcare', 'Infant care', 'Special needs',
    'Disability support', 'Mental health',
  ]
  const found: string[] = []
  const lower = text.toLowerCase()
  for (const kw of serviceKeywords) {
    if (lower.includes(kw.toLowerCase())) found.push(kw)
  }
  return [...new Set(found)].slice(0, 6)
}

async function extractTextFromBuffer(buffer: Buffer, mimeType: string): Promise<string> {
  // For plain text / basic extraction — read raw bytes as UTF-8
  // PDF binary will have some readable text interspersed
  const raw = buffer.toString('utf-8', 0, Math.min(buffer.length, 50000))
  
  if (mimeType.includes('pdf')) {
    // Extract readable ASCII strings from PDF binary
    const strings: string[] = []
    const matches = raw.match(/[^\x00-\x08\x0E-\x1F\x7F-\xFF]{4,}/g) || []
    strings.push(...matches)
    return strings.join(' ')
  }

  // For .doc/.docx — try reading as text directly (works for some docx)
  return raw
}

export async function POST(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const formData = await req.formData()
    const file = formData.get('resume') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large — max 5MB' }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const text = await extractTextFromBuffer(buffer, file.type)

    const name = extractName(text)
    const result = {
      ...(name.firstName ? { firstName: name.firstName } : {}),
      ...(name.lastName ? { lastName: name.lastName } : {}),
      ...(extractEmail(text) ? { email: extractEmail(text) } : {}),
      ...(extractPhone(text) ? { phone: extractPhone(text) } : {}),
      ...(extractCity(text) ? { city: extractCity(text) } : {}),
      ...(extractYearsExperience(text) ? { yearsExperience: extractYearsExperience(text) } : {}),
      ...(extractJobTitle(text) ? { jobTitle: extractJobTitle(text) } : {}),
      ...(extractServices(text).length > 0 ? { services: extractServices(text) } : {}),
    }

    return NextResponse.json(result)
  } catch (err) {
    console.error('parse-resume error:', err)
    return NextResponse.json({ error: 'Failed to parse resume' }, { status: 500 })
  }
}
