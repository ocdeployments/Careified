import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { pool } from '@/lib/db'
import { initiateVapiCall } from '@/lib/airecruit/vapi'

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.log('AUTH userId:', userId)

    const body = await req.json()
    const { title, roleDescription, screeningQuestions, phoneNumbers } = body
    console.log('BODY:', { title, screeningQuestions, phoneNumbers })

    if (!title || !roleDescription || !screeningQuestions || !phoneNumbers) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }
    if (!Array.isArray(screeningQuestions) || screeningQuestions.length === 0) {
      return NextResponse.json({ error: 'At least one screening question required' }, { status: 400 })
    }
    if (!Array.isArray(phoneNumbers) || phoneNumbers.length === 0) {
      return NextResponse.json({ error: 'At least one phone number required' }, { status: 400 })
    }

    const { rows } = await pool.query(
      `SELECT id, "vapiAssistantId", "vapiPhoneNumberId" FROM agencies WHERE clerk_user_id = $1 LIMIT 1`,
      [userId]
    )
    const agency = rows[0]
    console.log('AGENCY:', agency?.id, agency?.vapiAssistantId, agency?.vapiPhoneNumberId)

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
      [agency.id, title, roleDescription, screeningQuestions, phoneNumbers.length]
    )
    const campaignId = campaignResult.rows[0].id
    console.log('CAMPAIGN CREATED:', campaignId)

    for (const phoneNumber of phoneNumbers) {
      await pool.query(
        `INSERT INTO "AIRecruitCall" 
          (id, "campaignId", "phoneNumber", status, "createdAt", "updatedAt") 
         VALUES 
          (gen_random_uuid(), $1, $2, 'pending', NOW(), NOW())`,
        [campaignId, phoneNumber]
      )
    }

    const callsResult = await pool.query(
      `SELECT id, "phoneNumber" FROM "AIRecruitCall" WHERE "campaignId" = $1`,
      [campaignId]
    )
    const createdCalls = callsResult.rows
    console.log('CALLS CREATED:', createdCalls.length)

    const vapiResults = await Promise.allSettled(
      createdCalls.map(async (call: { id: string; phoneNumber: string }) => {
        console.log('FIRING VAPI CALL for:', call.phoneNumber)

        const result = await initiateVapiCall({
          phoneNumber: call.phoneNumber,
          campaignId: campaignId,
          callId: call.id,
          roleTitle: title,
          screeningQuestions,
          vapiAssistantId: agency.vapiAssistantId || '',
          vapiPhoneNumberId: agency.vapiPhoneNumberId || '',
        })

        console.log('VAPI RESULT:', JSON.stringify(result))

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

    console.log('ALL VAPI RESULTS:', JSON.stringify(vapiResults))

    return NextResponse.json({
      success: true,
      campaignId,
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