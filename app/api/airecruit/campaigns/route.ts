import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { pool } from '@/lib/db'
import { initiateVapiCall } from '@/lib/airecruit/vapi'

async function getAgencyId(clerkUserId: string): Promise<string | null> {
  const { rows } = await pool.query(
    `SELECT id FROM agencies WHERE clerk_user_id = $1 LIMIT 1`,
    [clerkUserId]
  )
  return rows[0]?.id ?? null
}

export async function POST(req: NextRequest) {
  try {
    // 1. Auth check
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // 2. Parse body
    const body = await req.json()
    const { title, roleDescription, screeningQuestions, phoneNumbers } = body

    // 3. Validate required fields
    if (!title || !roleDescription || !screeningQuestions || !phoneNumbers) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }
    if (!Array.isArray(screeningQuestions) || screeningQuestions.length === 0) {
      return NextResponse.json(
        { error: 'At least one screening question required' },
        { status: 400 }
      )
    }
    if (!Array.isArray(phoneNumbers) || phoneNumbers.length === 0) {
      return NextResponse.json(
        { error: 'At least one phone number required' },
        { status: 400 }
      )
    }

    // 4. Look up agency by Clerk userId
    const agencyResult = await pool.query(
      `SELECT id, "vapiAssistantId", "vapiPhoneNumberId" FROM agencies WHERE clerk_user_id = $1 LIMIT 1`,
      [userId]
    )
    const agency = agencyResult.rows[0]
    if (!agency) {
      return NextResponse.json(
        { error: 'Agency not found' },
        { status: 404 }
      )
    }
    const agencyId = agency.id
    const vapiAssistantId = agency.vapiAssistantId
    const vapiPhoneNumberId = agency.vapiPhoneNumberId

    // 5. Create campaign
    const campaignResult = await pool.query(
      `INSERT INTO "AIRecruitCampaign" 
        (id, "agencyId", title, "roleDescription", "screeningQuestions", status, "totalCandidates", "callsPending", "callsCompleted", "callsFailed", "createdAt", "updatedAt") 
      VALUES (gen_random_uuid(), $1, $2, $3, $4, 'draft', $5, $5, 0, 0, NOW(), NOW()) 
      RETURNING id`,
      [agencyId, title, roleDescription, screeningQuestions, phoneNumbers.length]
    )
    const campaignId = campaignResult.rows[0].id

    // 6. Create one AIRecruitCall per phone number
    for (const phoneNumber of phoneNumbers) {
      await pool.query(
        `INSERT INTO "AIRecruitCall" (id, "campaignId", "phoneNumber", "updatedAt") VALUES (gen_random_uuid(), $1, $2, NOW())`,
        [campaignId, phoneNumber]
      )
    }

    // 7. Fetch the created calls to get their IDs
    const createdCallsResult = await pool.query(
      `SELECT id, "phoneNumber" FROM "AIRecruitCall" WHERE "campaignId" = $1`,
      [campaignId]
    )
    const createdCalls = createdCallsResult.rows

    // 8. Launch Vapi calls for each — fire and don't await
    const vapiPromises = createdCalls.map(async (call: { id: string; phoneNumber: string }) => {
      const result = await initiateVapiCall({
        phoneNumber: call.phoneNumber,
        campaignId: campaignId,
        callId: call.id,
        roleTitle: title,
        screeningQuestions,
        vapiAssistantId: vapiAssistantId || '',
        vapiPhoneNumberId: vapiPhoneNumberId || '',
      })

      // Update call record with vapiCallId or error status
      if (result.success && result.vapiCallId) {
        await pool.query(
          `UPDATE "AIRecruitCall" SET "vapiCallId" = $1, status = 'calling', "startedAt" = NOW() WHERE id = $2`,
          [result.vapiCallId, call.id]
        )
      } else {
        await pool.query(
          `UPDATE "AIRecruitCall" SET status = 'failed' WHERE id = $1`,
          [call.id]
        )
      }
    })

    // Launch all calls in parallel and await results
    const vapiResults = await Promise.allSettled(vapiPromises)
    console.log("VAPI RESULTS:", JSON.stringify(vapiResults))

    // 9. Return created campaign
    return NextResponse.json({
      success: true,
      campaignId
    })
  } catch (error) {
    console.error('AIRECRUIT ERROR:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}
