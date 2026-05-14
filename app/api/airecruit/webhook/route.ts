import { NextRequest, NextResponse } from 'next/server'
import { createHmac } from 'crypto'
import { pool } from '@/lib/db'
import { scoreTranscript } from '@/lib/airecruit/scoring'
import { scoreReferenceCall } from '@/lib/airecruit/score-reference'
import { scoreEmployerCall } from '@/lib/airecruit/score-employer'
import { checkRateLimit, getClientIp } from '@/lib/rateLimit'
import { recomputeCaregiverScore } from '@/lib/ratings/recompute-caregiver-score'

function verifyWebhookSignature(req: NextRequest, body: string): boolean {
  const signature = req.headers.get('x-vapi-signature') || req.headers.get('vapi-signature')
  const webhookSecret = process.env.VAPI_WEBHOOK_SECRET

  if (!webhookSecret || !signature) {
    console.error('Missing webhook secret or signature')
    return false
  }

  const expectedSignature = createHmac('sha256', webhookSecret)
    .update(body)
    .digest('hex')

  return signature === expectedSignature
}

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
    // Rate limit check
    const clientIp = getClientIp(req)
    if (!checkRateLimit(clientIp)) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
    }

    const bodyText = await req.text()

    // Verify HMAC signature
    if (!verifyWebhookSignature(req, bodyText)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    const body = JSON.parse(bodyText)

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

    // Check if this is a reference call
    const { rows: refCallRows } = await pool.query(
      `SELECT id, caregiver_id, reference_id, agency_id FROM reference_calls WHERE vapi_call_id = $1 LIMIT 1`,
      [vapiCallId]
    )

    if (refCallRows.length > 0) {
      // Handle reference call completion
      const refCall = refCallRows[0]

      await pool.query(
        `UPDATE reference_calls
         SET status = 'completed',
             completed_at = NOW(),
             duration_seconds = $1,
             transcript = $2
         WHERE id = $3`,
        [duration, transcript, refCall.id]
      )

      // Get caregiver name for scoring
      const { rows: cgRows } = await pool.query(
        `SELECT first_name, last_name FROM caregivers WHERE id = $1`,
        [refCall.caregiver_id]
      )
      const caregiverName = cgRows.length > 0
        ? `${cgRows[0].first_name} ${cgRows[0].last_name}`
        : 'the candidate'

      // Score the reference call
      if (transcript) {
        const score = await scoreReferenceCall(transcript, caregiverName)

        await pool.query(
          `UPDATE reference_calls
           SET would_reengage = $1,
               overall_sentiment = $2,
               ai_summary = $3,
               reliability_notes = $4,
               client_interaction_notes = $5,
               strengths = $6,
               additional_notes = $7,
               confidence = $8
           WHERE id = $9`,
          [
            score.would_reengage,
            score.overall_sentiment,
            score.ai_summary,
            score.reliability_notes,
            score.client_interaction_notes,
            score.strengths,
            score.additional_notes,
            score.confidence,
            refCall.id
          ]
        )

        // Update reference verification status
        await pool.query(
          `UPDATE caregiver_references
           SET verified = true,
               verification_source = 'ai_call',
               verification_tier = 3,
               would_reengage = $1,
               ai_summary = $2,
               verified_at = NOW()
           WHERE id = $3`,
          [score.would_reengage, score.ai_summary, refCall.reference_id]
        )

        // Recompute trust score
        try {
          await recomputeCaregiverScore(refCall.caregiver_id)
        } catch (err) {
          console.error('[webhook] recompute score failed:', err)
        }

        // Check for human handoff request
        const handoffPhrases = [
          'prefer to speak with a person',
          'talk to a human',
          "don't want to talk to",
          'speak with someone directly',
          'real person'
        ]
        const transcriptLower = transcript.toLowerCase()
        const handoffRequested = handoffPhrases.some(phrase =>
          transcriptLower.includes(phrase.toLowerCase())
        )

        if (handoffRequested) {
          await pool.query(
            `UPDATE reference_calls SET human_handoff_requested = true WHERE id = $1`,
            [refCall.id]
          )
        }

        // Audit log
        await pool.query(
          `INSERT INTO "AuditLog" (id, action, target_type, target_id, metadata, created_at)
           VALUES (gen_random_uuid()::text, $1, $2, $3, $4, NOW())`,
          [
            'reference_call_completed',
            'reference_call',
            refCall.id,
            JSON.stringify({
              caregiver_id: refCall.caregiver_id,
              reference_id: refCall.reference_id,
              would_reengage: score.would_reengage,
              overall_sentiment: score.overall_sentiment,
              agency_id: refCall.agency_id
            })
          ]
        )

        // Audit log for trust score recompute
        await pool.query(
          `INSERT INTO "AuditLog" (id, action, target_type, target_id, metadata, created_at)
           VALUES (gen_random_uuid()::text, $1, $2, $3, $4, NOW())`,
          [
            'trust_score_recomputed',
            'caregiver',
            refCall.caregiver_id,
            JSON.stringify({ trigger: 'reference_call_completed' })
          ]
        )

        console.log('REFERENCE CALL SCORED:', { refCallId: refCall.id, wouldReengage: score.would_reengage })
      }
    }

    // Check if this is an employer verification call
    const { rows: empCallRows } = await pool.query(
      `SELECT id, caregiver_id, agency_id, employer_name, employment_record_id FROM employment_verifications WHERE vapi_call_id = $1 LIMIT 1`,
      [vapiCallId]
    )

    if (empCallRows.length > 0) {
      // Handle employer call completion
      const empCall = empCallRows[0]

      await pool.query(
        `UPDATE employment_verifications
         SET status = 'completed',
             completed_at = NOW(),
             duration_seconds = $1,
             transcript = $2
         WHERE id = $3`,
        [duration, transcript, empCall.id]
      )

      // Get caregiver name for scoring
      const { rows: cgRows } = await pool.query(
        `SELECT first_name, last_name FROM caregivers WHERE id = $1`,
        [empCall.caregiver_id]
      )
      const caregiverName = cgRows.length > 0
        ? `${cgRows[0].first_name} ${cgRows[0].last_name}`
        : 'the candidate'

      // Score the employer call
      if (transcript) {
        const score = await scoreEmployerCall(transcript, caregiverName, empCall.employer_name)

        await pool.query(
          `UPDATE employment_verifications
           SET employment_confirmed = $1,
               re_engage = $2,
               departure_reason = $3,
               additional_notes = $4,
               overall_sentiment = $5,
               confidence = $6,
               ai_summary = $7
           WHERE id = $8`,
          [
            score.employment_confirmed,
            score.re_engage,
            score.departure_reason,
            score.additional_notes,
            score.overall_sentiment,
            score.confidence,
            score.ai_summary,
            empCall.id
          ]
        )

        // Recompute trust score
        try {
          await recomputeCaregiverScore(empCall.caregiver_id)
        } catch (err) {
          console.error('[webhook] recompute score failed:', err)
        }

        // Check for human handoff request
        const handoffPhrases = [
          'prefer to speak with a person',
          'talk to a human',
          "don't want to talk to",
          'speak with someone directly',
          'verify this',
          'need to verify'
        ]
        const transcriptLower = transcript.toLowerCase()
        const handoffRequested = handoffPhrases.some(phrase =>
          transcriptLower.includes(phrase.toLowerCase())
        )

        if (handoffRequested) {
          await pool.query(
            `UPDATE employment_verifications SET status = 'declined' WHERE id = $1`,
            [empCall.id]
          )
        }

        // Audit log
        await pool.query(
          `INSERT INTO "AuditLog" (id, action, target_type, target_id, metadata, created_at)
           VALUES (gen_random_uuid()::text, $1, $2, $3, $4, NOW())`,
          [
            'employer_call_completed',
            'employment_verification',
            empCall.id,
            JSON.stringify({
              caregiver_id: empCall.caregiver_id,
              employer_name: empCall.employer_name,
              employment_confirmed: score.employment_confirmed,
              re_engage: score.re_engage,
              agency_id: empCall.agency_id
            })
          ]
        )

        console.log('EMPLOYER CALL SCORED:', { empCallId: empCall.id, employmentConfirmed: score.employment_confirmed })
      }
    }

    return NextResponse.json({ received: true })

  } catch (error) {
    console.error('WEBHOOK ERROR:', error)
    return NextResponse.json({ received: true })
  }
}
