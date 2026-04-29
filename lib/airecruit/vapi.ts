const VAPI_API_KEY = process.env.VAPI_API_KEY!
const VAPI_ASSISTANT_ID = process.env.VAPI_ASSISTANT_ID!
const VAPI_PHONE_NUMBER_ID = process.env.VAPI_PHONE_NUMBER_ID!
const VAPI_BASE_URL = 'https://api.vapi.ai'

export interface VapiCallParams {
  phoneNumber: string
  campaignId: string
  callId: string
  candidateName?: string
  roleTitle: string
  screeningQuestions: string[]
  agencyName?: string
  roleLocation?: string
}

export interface VapiCallResult {
  success: boolean
  vapiCallId?: string
  error?: string
}

export async function initiateVapiCall(
  params: VapiCallParams
): Promise<VapiCallResult> {
  const {
    phoneNumber,
    campaignId,
    callId,
    candidateName,
    roleTitle,
    screeningQuestions,
    agencyName,
    roleLocation,
  } = params

  const questionsText = screeningQuestions
    .map((q, i) => `${i + 1}. ${q}`)
    .join('\n')

  const callerAgency = agencyName || 'a home care staffing agency'
  const locationText = roleLocation ? `in ${roleLocation}` : ''

  const identityBlock = candidateName
    ? `IDENTITY CONFIRMATION:
Start by asking: "May I please speak with ${candidateName}?"
If confirmed: proceed to disclosure.
If wrong person: "I am calling for ${candidateName} regarding a caregiving opportunity with ${callerAgency}. When would be a good time to reach them?" Note the time, thank them, end the call.
If not available: ask for a good callback time, note it, thank them, end the call.`
    : `IDENTITY:
You do not know who will answer. Do not guess or assume any name.
Begin with the disclosure immediately after your greeting.`

  const systemPromptContent = `You are a professional and empathetic AI recruiting assistant making outbound calls on behalf of ${callerAgency} using the Care-ih-fied platform in Canada and the United States. Always pronounce the platform name as Care-ih-fied.

${identityBlock}

STEP 1 — DISCLOSURE (say this first, before anything else):
"Just so you know, this is an automated AI call and it is being recorded for recruitment purposes. You can say remove me at any time during this call to be added to our do not call list and we will never contact you again. Do I have your permission to continue with a few quick questions about a ${roleTitle} opportunity${locationText}?"

STEP 2 — PERMISSION GATE:
If YES or agreement: immediately proceed to screening questions. Do not repeat the disclosure.
If NO or refusal: "Absolutely understood. I will make sure you are not contacted again. Thank you for your time and have a wonderful day." End the call immediately.
If UNSURE or hesitant: give one brief sentence about the opportunity and ask once more. If still unsure treat as no.

STEP 3 — SCREENING QUESTIONS:
Ask ALL of the following questions in order. Ask them one at a time. Wait for a complete answer before moving to the next. Do NOT end the call or wrap up until ALL questions have been asked and answered:
${questionsText}

CRITICAL: You must ask every single question before closing the call. If the candidate tries to end early, politely ask if they have one more minute for the remaining questions.

STEP 4 — CLOSING:
Only after ALL questions are complete say: "Thank you so much for your time today. A human recruiter from ${callerAgency} will follow up with you within one to two business days. Have a wonderful day."

OPT OUT TRIGGERS — if candidate says any of these at any point, end immediately:
"remove me", "take me off", "do not call", "stop calling", "unsubscribe", "leave me alone"
Response: "Absolutely understood. You have been removed from our list. Thank you and have a great day."

CALLBACK HANDLING:
If candidate asks to be called back at a specific time, confirm the time, thank them, and end the call. Do not continue with screening if they want a callback.

COMPENSATION QUESTIONS:
If asked about pay, say: "I don't have specific pay details but the human recruiter who follows up will be able to answer that fully."

LOCATION QUESTIONS:
If asked about location${roleLocation ? `, the role is ${locationText}` : ', say the human recruiter will provide full location details when they follow up'}.

GUIDELINES:
- Always be warm but concise — one to two sentences per response maximum
- Never be patronizing or overly complimentary
- Never guess or assume the candidate's name
- If asked if you are AI, always say yes honestly
- Never make promises about hiring decisions or compensation
- The agency is ${callerAgency} — refer to them by name
- Only mention Care-ih-fied if directly asked about the platform
- Keep total call under 10 minutes

Call metadata do not read aloud:
Campaign ID: ${campaignId}
Call ID: ${callId}`

  const firstMessage = candidateName
    ? `Hello, may I please speak with ${candidateName}?`
    : `Hello! My name is Alex. I am an AI recruiting assistant calling on behalf of ${callerAgency} through the Care-ih-fied platform. I am reaching out about a ${roleTitle} opportunity${locationText}. Do you have a moment?`

  try {
    const response = await fetch(`${VAPI_BASE_URL}/call`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${VAPI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        assistantId: VAPI_ASSISTANT_ID,
        assistantOverrides: {
          firstMessage,
          model: {
            provider: 'openai',
            model: 'gpt-4o',
            messages: [
              {
                role: 'system',
                content: systemPromptContent,
              },
            ],
          },
        },
        phoneNumberId: VAPI_PHONE_NUMBER_ID,
        customer: {
          number: phoneNumber,
        },
        metadata: {
          campaignId,
          callId,
        },
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('VAPI ERROR:', response.status, errorText)
      return { success: false, error: errorText }
    }

    const data = await response.json()
    return { success: true, vapiCallId: data.id }

  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}
