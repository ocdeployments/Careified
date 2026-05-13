// Careified — Resume Parse API (LLM-powered)
// Delegates to shared lib/resume/parse-resume.ts

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { parseResume } from '@/lib/resume/parse-resume'

export const runtime = 'nodejs'
export const maxDuration = 30

export async function POST(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const formData = await req.formData()
    const file = formData.get('resume') as File | null
    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    if (file.size > 5 * 1024 * 1024) return NextResponse.json({ error: 'File too large — max 5MB' }, { status: 400 })

    const buffer = Buffer.from(await file.arrayBuffer())
    const result = await parseResume(buffer, file.type)

    if (Object.keys(result).length === 0) {
      return NextResponse.json({ error: 'Could not parse resume — try filling in manually' }, { status: 422 })
    }

    console.log('FINAL PARSED:', JSON.stringify(result).substring(0, 400))
    return NextResponse.json(result)
  } catch (err) {
    console.error('parse-resume error:', err)
    return NextResponse.json({ error: 'Failed to parse resume' }, { status: 500 })
  }
}