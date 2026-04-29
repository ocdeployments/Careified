import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { pool } from '@/lib/db'
import { initiateVapiCall } from '@/lib/airecruit/vapi'
import { isWithinCallingHours } from '@/lib/airecruit/calling-hours'

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { title, roleDescription, screeningQuestions, candidates, consentConfirmed } = body

    if (!title || !roleDescription || !screeningQuestions || !candidates) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }
    if (!Array.isArray(screeningQuestions) || screeningQuestions.length === 0) {
      return NextResponse.json({ error: 'At least one screening question required' }, { status: 400 })
    }
    if (!Array.isArray(candidates) || candidates.length === 0) {
      return NextResponse.json({ error: 'At least one candidate required' }, { status: 400 })
    }
    // Validate each candidate has firstName and phone
    const invalidCandidates = candidates.filter(
      (c: any) => !c.firstName || !c.phone
    )
    if (invalidCandidates.length > 0) {
      return NextResponse.json({ error: 'Each candidate must have firstName and phone' }, { status: 400 })
    }

    const { rows } = await pool.query(
      `SELECT id FROM agencies WHERE clerk_user_id = $1 LIMIT 1`,
      [userId]
    )
    const agency = rows[0]
    if (!agency) {
      return NextResponse.json({ error: 'Agency not found' }, { status: 404 })
    }

    const campaignResult = await pool.query(
      `INSERT INTO "AIRecruitCampaign"
        (id, "agencyId", title, "roleDescription", "screeningQuestions",
         status, "totalCandidates", "callsPending", "callsCompleted",
         "callsFailed", "createdAt", "updatedAt")
       VALUES
        (gen_random_uuid(), $1, $2, $3, $4,
         'active', $5, $5, 0, 0, NOW(), NOW())
       RETURNING id`,
      [agency.id, title, roleDescription, screeningQuestions, candidates.length]
    )
    const campaignId = campaignResult.rows[0].id

    // Insert candidates with structured data
    for (const candidate of candidates) {
      await pool.query(
        `INSERT INTO "AIRecruitCall"
          (id, "campaignId", "phoneNumber", 
           "candidateFirstName", "candidateLastName",
           "candidateEmail", "candidateNotes",
           status, "createdAt", "updatedAt")
         VALUES
          (gen_random_uuid(), $1, $2, $3, $4, $5, $6,
           'pending', NOW(), NOW())`,
        [
          campaignId,
          candidate.phone,
          candidate.firstName,
          candidate.lastName || null,
          candidate.email || null,
          candidate.notes || null,
        ]
      )
    }

    const callsResult = await pool.query(
      `SELECT id, "phoneNumber", "candidateFirstName", 
              "candidateLastName", "candidateNotes"
       FROM "AIRecruitCall" WHERE "campaignId" = $1`,
      [campaignId]
    )
    const createdCalls = callsResult.rows

    // Check suppression list before firing calls
    const phoneNumbersToCall: typeof createdCalls = []
    const suppressedCalls: typeof createdCalls = []

    for (const call of createdCalls) {
      const { rows: suppressed } = await pool.query(
        `SELECT id FROM "AIRecruitSuppression" 
         WHERE "phoneNumber" = $1 LIMIT 1`,
        [call.phoneNumber]
      )
      if (suppressed.length > 0) {
        suppressedCalls.push(call)
        await pool.query(
          `UPDATE "AIRecruitCall" 
           SET status = 'suppressed', "updatedAt" = NOW() 
           WHERE id = $1`,
          [call.id]
        )
        console.log('SUPPRESSED:', call.phoneNumber)
      } else {
        phoneNumbersToCall.push(call)
      }
    }

    // Check calling hours before firing calls
    const allowedCalls: typeof phoneNumbersToCall = []
    const queuedCalls: typeof phoneNumbersToCall = []

    for (const call of phoneNumbersToCall) {
      const hoursCheck = isWithinCallingHours(call.phoneNumber)
      if (!hoursCheck.allowed) {
        queuedCalls.push(call)
        await pool.query(
          `UPDATE "AIRecruitCall"
           SET status = 'queued_compliance',
               "callbackNotes" = $1,
               "updatedAt" = NOW()
           WHERE id = $2`,
          [hoursCheck.reason, call.id]
        )
        console.log('OUTSIDE CALLING HOURS:', call.phoneNumber, hoursCheck.reason)
      } else {
        allowedCalls.push(call)
      }
    }

    const vapiResults = await Promise.allSettled(
      allowedCalls.map(async (call: { id: string; phoneNumber: string; candidateFirstName: string; candidateLastName: string; candidateNotes: string }) => {
        const result = await initiateVapiCall({
          phoneNumber: call.phoneNumber,
          campaignId: campaignId,
          callId: call.id,
          candidateFirstName: call.candidateFirstName,
          candidateLastName: call.candidateLastName,
          candidateNotes: call.candidateNotes,
          roleTitle: title,
          screeningQuestions,
        })

        if (result.success && result.vapiCallId) {
          await pool.query(
            `UPDATE "AIRecruitCall"
             SET "vapiCallId" = $1, status = 'calling', "startedAt" = NOW()
             WHERE id = $2`,
            [result.vapiCallId, call.id]
          )
        } else {
          await pool.query(
            `UPDATE "AIRecruitCall" SET status = 'failed' WHERE id = $1`,
            [call.id]
          )
        }

        return result
      })
    )

    return NextResponse.json({
      success: true,
      campaignId,
      callsInitiated: allowedCalls.length,
      callsQueued: queuedCalls.length,
      callsSuppressed: suppressedCalls.length,
      vapiResults: vapiResults.map(r =>
        r.status === 'fulfilled' ? r.value : { error: String(r.reason) }
      )
    })

  } catch (error) {
    console.error('AIRECRUIT ERROR:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}
