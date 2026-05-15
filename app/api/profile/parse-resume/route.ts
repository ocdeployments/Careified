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

    try {
      const result = await parseResume(buffer, file.type, file.name)

      if (Object.keys(result).length === 0) {
        return NextResponse.json({ error: 'Could not parse resume — try filling in manually' }, { status: 422 })
      }

      return NextResponse.json(result)
    } catch (err: any) {
      if (err.message === 'LEGACY_DOC_UNSUPPORTED') {
        return NextResponse.json({
          error: 'unsupported_format',
          message: "Old .doc files aren't supported. Please save as .docx or PDF."
        }, { status: 400 })
      }
      if (err.message === 'PDF_PARSE_FAILED' || err.message === 'DOCX_PARSE_FAILED') {
        return NextResponse.json({
          parsed: {},
          warning: 'parse_failed',
          message: "We couldn't read this file. Please enter your details manually."
        })
      }
      console.error('parse-resume error:', err)
      return NextResponse.json({ error: 'Failed to parse resume' }, { status: 500 })
    }
  } catch (err) {
    console.error('parse-resume outer error:', err)
    return NextResponse.json({ error: 'Failed to parse resume' }, { status: 500 })
  }
}