import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/db'
import { scoreTranscript } from '@/lib/airecruit/scoring'

async function scoreCallTranscript(
  callId: string,
  transcript: string,
  campaignId: string,
  phoneNumber: string,
  agencyId: string
) {
  try {
    const { rows: campaignRows } = await pool.query(
      `SELECT title, "screeningQuestions" FROM "AIRecruitCampaign" WHERE id = $1 LIMIT 1`,
      [campaignId]
    )
    if (!campaignRows.length) return

    const campaign = campaignRows[0]
    const result = await scoreTranscript(
      transcript,
      campaign.screeningQuestions,
      campaign.title
    )
    if (!result) return

    await pool.query(
      `UPDATE "AIRecruitCall"
       SET "rawScore" = $1, "scoreBreakdown" = $2, recommendation = $3, "updatedAt" = NOW()
       WHERE id = $4`,
      [result.overallScore, JSON.stringify(result), result.recommendation, callId]
    )
    console.log('SCORING COMPLETE:', { callId, score: result.overallScore, recommendation: result.recommendation })

    // Check for opt-out phrases in transcript
    const optOutPhrases = [
      'remove me', 'take me off', 'do not call',
      'stop calling', 'unsubscribe', 'not interested',
      'leave me alone', 'opted out'
    ]

    const transcriptLower = transcript.toLowerCase()
    const optedOut = optOutPhrases.some(phrase =>
      transcriptLower.includes(phrase)
    )

    if (optedOut) {
      await pool.query(
        `INSERT INTO "AIRecruitSuppression"
          (id, "phoneNumber", reason, "addedBy", "agencyId", "createdAt", "updatedAt")
         VALUES
          (gen_random_uuid(), $1, 'opted_out_during_call', 'system', $2, NOW(), NOW())
         ON CONFLICT ("phoneNumber") DO NOTHING`,
        [phoneNumber, agencyId]
      )
      await pool.query(
        `UPDATE "AIRecruitCall"
         SET "callStatus" = 'opted_out', "updatedAt" = NOW()
         WHERE id = $1`,
        [callId]
      )
      console.log('OPT OUT RECORDED:', phoneNumber)
    }
  } catch (error) {
    console.error('SCORE CALL ERROR:', error)
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const { message } = body
    if (!message) {
      return NextResponse.json({ received: true })
    }

    const { type } = message

    if (type !== 'end-of-call-report') {
      return NextResponse.json({ received: true })
    }

    const vapiCallId = message?.call?.id
    const transcript = message?.artifact?.transcript || null
    const duration = message?.durationSeconds
      ? Math.round(message.durationSeconds)
      : null
    const endedReason = message?.endedReason || null

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

    const { rows } = await pool.query(
      `SELECT id, "campaignId", "phoneNumber" FROM "AIRecruitCall" WHERE "vapiCallId" = $1 LIMIT 1`,
      [vapiCallId]
    )

    if (rows.length === 0) {
      console.error('No AIRecruitCall found for vapiCallId:', vapiCallId)
      return NextResponse.json({ received: true })
    }

    const callRecord = rows[0]

    await pool.query(
      `UPDATE "AIRecruitCall"
       SET status = 'completed', transcript = $1, duration = $2, "completedAt" = NOW(), "updatedAt" = NOW()
       WHERE id = $3`,
      [transcript, duration, callRecord.id]
    )
    console.log('CALL RECORD UPDATED:', callRecord.id)

    await pool.query(
      `UPDATE "AIRecruitCampaign"
       SET "callsCompleted" = "callsCompleted" + 1, "callsPending" = GREATEST("callsPending" - 1, 0), "updatedAt" = NOW()
       WHERE id = $1`,
      [callRecord.campaignId]
    )
    console.log('CAMPAIGN COUNTERS UPDATED')

    // Get agencyId for scoring and opt-out detection
    const { rows: campaignRows } = await pool.query(
      `SELECT "agencyId" FROM "AIRecruitCampaign" WHERE id = $1 LIMIT 1`,
      [callRecord.campaignId]
    )
    const agencyId = campaignRows[0]?.agencyId

    if (transcript && agencyId) {
      scoreCallTranscript(callRecord.id, transcript, callRecord.campaignId, callRecord.phoneNumber, agencyId)
    }

    return NextResponse.json({ received: true })

  } catch (error) {
    console.error('WEBHOOK ERROR:', error)
    return NextResponse.json({ received: true })
  }
}
