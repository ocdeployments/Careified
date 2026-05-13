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
    const pass1Prompt = `You are an expert resume parser for a home care staffing platform.
Your job is to extract and NORMALIZE all resume information into a precise JSON schema.

CRITICAL RULES:
- Return ONLY valid JSON. No markdown, no explanation, no extra text.
- Normalize ALL data to match the exact field formats below.
- If information is not present, use null for strings/numbers, [] for arrays.

EXTRACTION AND NORMALIZATION RULES:

NAME: Extract first and last name separately.
- "ADDISON HARRIS", "Addison Harris", "Harris, Addison" → firstName: "Addison", lastName: "Harris"

EMAIL: Extract from contact section or anywhere in resume.
- Formats: name@domain.com, name [at] domain [dot] com

PHONE: Handle all North American formats:
- "(416) 835-0940", "416.835.0940", "416 835 0940",
  "+1-(234)-555-1234", "234-555-1234"
- Normalize all to +1XXXXXXXXXX

LOCATION: Extract city and state/province separately.
- "Charlotte, NC" → city: "Charlotte", state: "NC"
- "Toronto, Ontario" → city: "Toronto", state: "ON"

JOB TITLE: Use the most recent job title.

YEARS EXPERIENCE: Extract as a number.
- "5 years of experience", "5+ years" → 5
- If not stated, calculate from work history dates.

BIO: Use the professional summary or objective section verbatim.

WORK HISTORY: Extract ALL positions. For dates:
- "08/2023 - Present" → startYear: 2023, endYear: null, current: true
- "May 2021 - Aug 2023" → startYear: 2021, endYear: 2023, current: false
- "2019 – 2021" → startYear: 2019, endYear: 2021, current: false
- Always extract the 4-digit year from any date format.
- "Present", "Current", "Now", "—" in end date → current: true, endYear: null

CERTIFICATIONS: Normalize to standard names. Look EVERYWHERE in the resume.
- "CPR/AED", "CPR Certified", "Basic Life Support", "BLS" → "CPR"
- "First Aid", "Emergency First Aid", "Standard First Aid" → "First Aid"
- "Personal Support Worker", "PSW Certificate", "PSW" → "PSW"
- "Home Care Aide", "HCA", "Home Health Aide", "HHA" → "HCA"
- "Certified Nursing Assistant", "CNA", "Nurse Aide" → "CNA"
- "Registered Nurse", "RN" → "RN"
- "Registered Practical Nurse", "RPN" → "RPN"
- "Licensed Practical Nurse", "LPN" → "LPN"
- "Medication Administration Certificate" → "Medication Administration Certificate"

CREDENTIALS: Academic degrees only.
- "Bachelor of Science in Nursing", "BSN" → "BSN"
- "Associate Degree Nursing", "ADN" → "ADN"
- "Diploma in Personal Support Work" → "PSW Diploma"

EDUCATION: Extract as object.
- education: [{ institution, degree, field, startYear, endYear }]
- e.g. { institution: "UNC Charlotte", degree: "BSN", field: "Nursing", startYear: 2018, endYear: 2021 }

AWARDS: Extract any awards or recognition mentioned.
- awards: [{ title, organisation, year }]

VOLUNTEER: If volunteer or community work mentioned:
- volunteerExperience: true
- volunteerDescription: brief description

SERVICES: Normalize care tasks to standard names. Scan the ENTIRE resume including job duties.
- Any mention of giving/administering medications → "Medication Administration"
- Bathing, showering, personal hygiene, hygiene assistance → "Personal Care"
- Meal preparation, cooking, nutrition planning, meal planning → "Meal Preparation"
- Companionship, social engagement, recreational activities → "Companionship"
- Mobility assistance, transfers, walking assistance, ambulation → "Mobility Assistance"
- Vital signs, health monitoring, documenting health → "Health Monitoring"
- Wound care, dressing changes → "Wound Care"
- Memory care activities, cognitive engagement → "Memory Care Activities"
- Care planning, care documentation → "Care Planning"
- Light housekeeping, cleaning, laundry → "Light Housekeeping"
- Transportation, driving clients → "Transportation"
- Grooming, hair care, oral hygiene → "Grooming Assistance"

SPECIALIZATIONS: Patient populations. Infer from employer names and job duties.
- Any mention of seniors, elderly, older adults, geriatric → "Elderly Care"
- Dementia, Alzheimer's, memory care, cognitive decline → "Dementia Care"
- Palliative, hospice, end of life → "Palliative Care"
- Disability, disabled clients → "Disability Support"
- Pediatric, children, pediatric care → "Pediatric Care"
- Post-surgical, post-op, rehabilitation → "Post-Surgical Care"
- Mental health → "Mental Health Support"
- If employer is a "Senior Living" or "Senior Care" facility → add "Elderly Care"

DIAGNOSIS EXPERIENCE: Medical conditions mentioned anywhere.
- Look for: Alzheimer's, Dementia, Parkinson's, MS, Stroke, COPD, Diabetes,
  Cancer, Heart Failure, Arthritis, Osteoporosis, Depression, Anxiety,
  Autism, Cerebral Palsy, ALS, Epilepsy, Hypertension, TBI

ADLS PERFORMED: Activities of daily living. Scan all job duties.
- Bathing, showering → "Bathing"
- Dressing, clothing → "Dressing"
- Grooming, hair, oral hygiene → "Grooming"
- Toileting, continence, incontinence → "Toileting"
- Feeding, eating assistance → "Feeding"
- Transfers, repositioning, hoyer lift → "Transfers"
- Walking, ambulation → "Ambulation"

LANGUAGES: Languages spoken. If not mentioned, do not guess.

LINKEDIN: Extract LinkedIn URL if present.

INFER FROM INTERESTS: If interests mention care-related topics:
- "Elderly Care Advocacy" → add "Elderly Care" to specializations if not already there
- "Cooking and Nutrition" → add "Meal Preparation" to services if not already there

Resume text:
${resumeText}

Return ONLY this JSON object:
{
  "firstName": string | null,
  "lastName": string | null,
  "email": string | null,
  "phone": string | null,
  "city": string | null,
  "state": string | null,
  "jobTitle": string | null,
  "yearsExperience": number | null,
  "bio": string | null,
  "certifications": string[],
  "credentials": string[],
  "awards": Array<{ title: string, organisation: string, year: number | null }>,
  "volunteerExperience": boolean,
  "volunteerDescription": string | null,
  "education": Array<{ institution: string, degree: string, field: string, startYear: number | null, endYear: number | null }>,
  "services": string[],
  "specializations": string[],
  "diagnosisExperience": string[],
  "adlsPerformed": string[],
  "languages": string[],
  "linkedinUrl": string | null,
  "employers": Array<{
    "organisation": string,
    "title": string,
    "startYear": number | null,
    "endYear": number | null,
    "current": boolean
  }>
}`

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

    // Single-pass: prompt does all normalization
    const result = raw

    console.log('FINAL PARSED:', JSON.stringify(result).substring(0, 400))

    return NextResponse.json(result)
  } catch (err) {
    console.error('parse-resume error:', err)
    return NextResponse.json({ error: 'Failed to parse resume' }, { status: 500 })
  }
}