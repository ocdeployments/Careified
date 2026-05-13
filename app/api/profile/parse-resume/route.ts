// Careified — Resume Parse API (LLM-powered)
// Two-pass: Pass 1 = raw extraction, Pass 2 = schema translation

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
// eslint-disable-next-line @typescript-eslint/no-require-imports
const pdfParse = require('pdf-parse/lib/pdf-parse.js')

export const runtime = 'nodejs'
export const maxDuration = 30

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY!
const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1'

const SERVICES_MAP: Record<string, string> = {
  'medication': 'Medication Administration',
  'med admin': 'Medication Administration',
  'personal care': 'Personal Care',
  'bathing': 'Personal Care',
  'grooming': 'Personal Care',
  'hygiene': 'Personal Care',
  'meal prep': 'Meal Preparation',
  'cooking': 'Meal Preparation',
  'nutrition': 'Meal Preparation',
  'companionship': 'Companionship',
  'companion': 'Companionship',
  'mobility': 'Mobility Assistance',
  'transfer': 'Mobility Assistance',
  'hoyer': 'Mobility Assistance',
  'health monitor': 'Health Monitoring',
  'vital signs': 'Health Monitoring',
  'wound care': 'Wound Care',
  'memory care': 'Memory Care Activities',
  'care plan': 'Care Planning',
  'documentation': 'Care Documentation',
  'dressing': 'Personal Care',
  'toileting': 'Continence Care',
  'catheter': 'Catheter Care',
  'ostomy': 'Ostomy Care',
  'feeding': 'Feeding Assistance',
  'exercise': 'Exercise Assistance',
  'range of motion': 'Range of Motion',
}

const CERTIFICATIONS_MAP: Record<string, string> = {
  'cpr': 'CPR',
  'cardiopulmonary': 'CPR',
  'basic life support': 'CPR',
  'bls': 'CPR',
  'first aid': 'First Aid',
  'psw': 'PSW',
  'personal support worker': 'PSW',
  'hca': 'HCA',
  'home care aide': 'HCA',
  'home health aide': 'HHA',
  'cna': 'CNA',
  'certified nursing assistant': 'CNA',
  'nurse aide': 'CNA',
  'medication administration': 'Medication Administration Certificate',
  'rn': 'RN',
  'registered nurse': 'RN',
  'rpn': 'RPN',
  'registered practical nurse': 'RPN',
  'lpn': 'LPN',
  'dementia care certificate': 'Dementia Care Certificate',
  'palliative care certificate': 'Palliative Care Certificate',
}

const SPECIALIZATIONS_MAP: Record<string, string> = {
  'elder': 'Elderly Care',
  'senior': 'Elderly Care',
  'geriatric': 'Elderly Care',
  'older adult': 'Elderly Care',
  'dementia': 'Dementia Care',
  'alzheimer': 'Dementia Care',
  'memory loss': 'Dementia Care',
  'cognitive': 'Dementia Care',
  'palliative': 'Palliative Care',
  'hospice': 'Palliative Care',
  'end of life': 'Palliative Care',
  'disability': 'Disability Support',
  'pediatric': 'Pediatric Care',
  'children': 'Pediatric Care',
  'post-surg': 'Post-Surgical Care',
  'rehabilitation': 'Rehabilitation Care',
  'mental health': 'Mental Health Support',
}

const ADLS_MAP: Record<string, string> = {
  'bath': 'Bathing',
  'shower': 'Bathing',
  'dress': 'Dressing',
  'groom': 'Grooming',
  'oral hygiene': 'Grooming',
  'toilet': 'Toileting',
  'continence': 'Toileting',
  'feed': 'Feeding',
  'eating': 'Feeding',
  'transfer': 'Transfers',
  'reposition': 'Transfers',
  'lift': 'Transfers',
  'ambulation': 'Ambulation',
  'walking': 'Ambulation',
}

const DIAGNOSES = [
  'Alzheimer', 'Dementia', 'Parkinson', 'Multiple Sclerosis',
  'Stroke', 'COPD', 'Diabetes', 'Cancer', 'Heart Failure',
  'Arthritis', 'Osteoporosis', 'Depression', 'Anxiety',
  'Schizophrenia', 'Autism', 'Cerebral Palsy', 'ALS', 'Epilepsy',
  'Hypertension', 'Traumatic Brain Injury', 'Spinal Cord Injury'
]

function mapToList(text: string, map: Record<string, string>): string[] {
  const lower = text.toLowerCase()
  const found = new Set<string>()
  for (const [key, value] of Object.entries(map)) {
    if (lower.includes(key)) found.add(value)
  }
  return Array.from(found)
}

function extractDiagnoses(text: string): string[] {
  return DIAGNOSES.filter(d => text.toLowerCase().includes(d.toLowerCase()))
}

function translateToSchema(raw: any, resumeText: string) {
  const allText = JSON.stringify(raw) + ' ' + resumeText
  const exp = raw.experience || raw.work_experience || raw.employment || raw.workExperience || []
  return {
    firstName: raw.firstName || raw.first_name || (raw.name?.split(' ')[0]) || null,
    lastName: raw.lastName || raw.last_name || (raw.name?.split(' ').slice(1).join(' ')) || null,
    email: raw.email || null,
    phone: raw.phone || raw.phoneNumber || raw.phone_number || null,
    city: raw.city || raw.location?.city || null,
    state: raw.state || raw.location?.state || null,
    jobTitle: raw.jobTitle || raw.job_title || raw.currentTitle || raw.title || null,
    yearsExperience: raw.yearsExperience || raw.years_experience || raw.totalExperience || null,
    bio: raw.bio || raw.summary || raw.professional_summary || raw.objective || null,
    certifications: mapToList(allText, CERTIFICATIONS_MAP),
    credentials: [
      ...(raw.education || []).map((e: any) => e.degree || e.credential || e.qualification).filter(Boolean),
    ],
    services: mapToList(allText, SERVICES_MAP),
    specializations: mapToList(allText, SPECIALIZATIONS_MAP),
    diagnosisExperience: extractDiagnoses(allText),
    adlsPerformed: mapToList(allText, ADLS_MAP),
    languages: raw.languages || [],
    employers: exp.map((e: any) => {
      // Parse dates field "08/2023 - Present" or "05/2021 - 08/2023"
      let startYear = null, endYear = null, current = false
      const datesStr = e.dates || e.date || e.period || ''
      if (datesStr) {
        const parts = datesStr.split(/[-–—]/).map((s: string) => s.trim())
        const startMatch = parts[0]?.match(/\d{4}/)
        const endMatch = parts[1]?.match(/\d{4}/)
        startYear = startMatch ? parseInt(startMatch[0]) : null
        current = parts[1]?.toLowerCase().includes('present') || false
        endYear = endMatch ? parseInt(endMatch[0]) : null
      }
      return {
        organisation: e.company || e.employer || e.organisation || e.organization || '',
        title: e.position || e.title || e.role || e.jobTitle || '',
        startYear,
        endYear,
        current,
      }
    }).filter((e: any) => e.organisation),
  }
}

async function extractText(buffer: Buffer, mimeType: string): Promise<string> {
  if (mimeType === 'application/pdf') {
    const data = await pdfParse(buffer)
    return data.text.slice(0, 8000)
  }
  return buffer.toString('utf-8').slice(0, 8000)
}

export async function POST(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const formData = await req.formData()
    const file = formData.get('resume') as File | null
    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    if (file.size > 5 * 1024 * 1024) return NextResponse.json({ error: 'File too large — max 5MB' }, { status: 400 })

    const buffer = Buffer.from(await file.arrayBuffer())
    const resumeText = await extractText(buffer, file.type)

    if (!resumeText || resumeText.trim().length < 50) {
      return NextResponse.json({ error: 'Could not extract text from file' }, { status: 400 })
    }

    // PASS 1 — Raw extraction prompt
    const pass1Prompt = `You are an expert resume parser. Extract ALL information from this resume as JSON.
Include everything: names, contact info, all jobs with dates, all skills,
all certifications, education, languages, locations.
Return ONLY valid JSON, no markdown, no explanation.
Resume:
${resumeText}`

    const response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://careified.vercel.app',
        'X-Title': 'Careified Resume Parser',
      },
      body: JSON.stringify({
        model: 'minimax/minimax-01',
        max_tokens: 1500,
        temperature: 0.1,
        messages: [{ role: 'user', content: pass1Prompt }],
      }),
    })

    if (!response.ok) {
      const err = await response.text()
      console.error('OpenRouter error:', err)
      return NextResponse.json({ error: 'LLM parsing failed' }, { status: 500 })
    }

    const data = await response.json()
    const content = data.choices?.[0]?.message?.content || ''

    let raw: any = {}
    try {
      const clean = content.replace(/```json|```/g, '').trim()
      raw = JSON.parse(clean)
      console.log('RAW EXPERIENCE:', JSON.stringify(raw.experience || raw.work_experience || raw.employment || raw.workExperience || 'NONE').substring(0, 500))
    } catch {
      console.error('JSON parse failed:', content)
      return NextResponse.json({ error: 'Could not parse resume — try filling in manually' }, { status: 422 })
    }

    // PASS 2 — Translate to Careified schema
    const result = translateToSchema(raw, resumeText)

    console.log('FINAL PARSED:', JSON.stringify(result).substring(0, 400))

    return NextResponse.json(result)
  } catch (err) {
    console.error('parse-resume error:', err)
    return NextResponse.json({ error: 'Failed to parse resume' }, { status: 500 })
  }
}