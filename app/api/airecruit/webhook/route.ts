import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    console.log('VAPI WEBHOOK:', JSON.stringify(body))

    // Vapi sends different event types
    // We only care about call completion
    const { message } = body

    if (!message) {
      return NextResponse.json({ received: true })
    }

    const { type, call } = message

    // Only process end-of-call-report events
    if (type !== 'end-of-call-report') {
      return NextResponse.json({ received: true })
    }

    if (!call) {
      return NextResponse.json({ received: true })
    }

    // Extract data from Vapi payload
    const vapiCallId = call.id
    const transcript = call.transcript || null
    const duration = call.duration 
      ? Math.round(call.duration) 
      : null
    const endedReason = call.endedReason || null

    console.log('CALL ENDED:', { 
      vapiCallId, 
      duration, 
      endedReason,
      hasTranscript: !!transcript 
    })

    if (!vapiCallId) {
      console.error('No vapiCallId in webhook payload')
      return NextResponse.json({ received: true })
    }

    // Find the call record by vapiCallId
    const { rows } = await pool.query(
      `SELECT id, "campaignId" FROM "AIRecruitCall" 
       WHERE "vapiCallId" = $1 LIMIT 1`,
      [vapiCallId]
    )

    if (rows.length === 0) {
      console.error('No AIRecruitCall found for vapiCallId:', vapiCallId)
      return NextResponse.json({ received: true })
    }

    const callRecord = rows[0]

    // Update the call record with transcript and completion data
    await pool.query(
      `UPDATE "AIRecruitCall" 
       SET 
         status = 'completed',
         transcript = $1,
         duration = $2,
         "completedAt" = NOW(),
         "updatedAt" = NOW()
       WHERE id = $3`,
      [transcript, duration, callRecord.id]
    )

    console.log('CALL RECORD UPDATED:', callRecord.id)

    // Update campaign counters
    await pool.query(
      `UPDATE "AIRecruitCampaign"
       SET
         "callsCompleted" = "callsCompleted" + 1,
         "callsPending" = GREATEST("callsPending" - 1, 0),
         "updatedAt" = NOW()
       WHERE id = $1`,
      [callRecord.campaignId]
    )

    console.log('CAMPAIGN COUNTERS UPDATED')

    return NextResponse.json({ received: true })

  } catch (error) {
    console.error('WEBHOOK ERROR:', error)
    // Always return 200 to Vapi even on error
    // Otherwise Vapi will retry repeatedly
    return NextResponse.json({ received: true })
  }
}