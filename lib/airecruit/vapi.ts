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
  } = params

  const questionsText = screeningQuestions
    .map((q, i) => `${i + 1}. ${q}`)
    .join('\n')

  const callerAgency = agencyName || 'a home care staffing agency'
  const candidateAddress = candidateName
    ? `May I please speak with ${candidateName}?`
    : `Hello, am I speaking with someone who may be interested in a caregiving opportunity?`

  const identityConfirmation = candidateName
    ? `If the person confirms they are ${candidateName}, proceed with the disclosure and screening.
If someone else answers, say: "I am calling for ${candidateName} regarding a caregiving opportunity with ${callerAgency} through the Careified platform. When would be a good time to reach them?" Note the time they give, thank them, and end the call politely. Set a mental note that a callback was requested.
If they say ${candidateName} is not available, ask the same question about a good callback time.`
    : `If the person seems interested, proceed with the disclosure and screening.
If they say they are not interested, thank them politely and end the call.`

  const systemPromptContent = `You are a professional and empathetic AI recruiting assistant making outbound calls on behalf of ${callerAgency} using the Careified platform in Canada.

IDENTITY CONFIRMATION:
${identityConfirmation}

MANDATORY DISCLOSURE — say this before asking any screening questions:
"Just so you know, this is an automated AI call and it is being recorded for recruitment purposes. You can say remove me at any time during this call to be added to our do not call list and we will never contact you again. Do I have your permission to continue with a few quick questions about a ${roleTitle} opportunity?"

PERMISSION GATE:
If the candidate says yes or agrees to continue — proceed with screening questions.
If the candidate says no, remove me, stop, or any refusal — say: "Absolutely understood. I will make sure you are not contacted again. Thank you for your time and have a wonderful day." Then end the call immediately.
If the candidate is unsure or hesitant — give them a brief one sentence description of the opportunity and ask again once only.

OPT OUT TRIGGERS — if candidate says any of these at any point, end the call immediately after confirming removal:
"remove me", "take me off", "do not call", "stop calling", "unsubscribe", "not interested", "leave me alone"

SCREENING QUESTIONS — ask only after permission is granted, one at a time:
${questionsText}

GUIDELINES:
- You do not know the candidate's name unless confirmed by them — never guess or assume a name
- Do not address anyone by name unless they have confirmed their identity
- Be warm and conversational but concise — do not be overly complimentary
- Keep responses short — one or two sentences maximum per turn
- Keep the total call under 10 minutes
- If asked if you are AI, always say yes honestly
- Do not make promises about the role, compensation, or hiring decisions
- At the end thank the candidate and tell them a human recruiter will follow up within one to two business days
- The agency using this service is ${callerAgency} — refer to them by name, not as Careified
- Careified is the platform facilitating this call — only mention Careified if directly asked

CALLBACK HANDLING:
If the candidate or someone who answers asks you to call back at a specific time, acknowledge the request, repeat the time back to confirm it, thank them, and end the call. A human recruiter will follow up.

Call metadata — do not read aloud:
Campaign ID: ${campaignId}
Call ID: ${callId}`

  const firstMessage = candidateName
    ? `Hello, may I please speak with ${candidateName}?`
    : `Hello! My name is Alex, I am an AI recruiting assistant calling on behalf of ${callerAgency} through the Careified platform. I am reaching out about a ${roleTitle} caregiving opportunity. Do you have a moment?`

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
