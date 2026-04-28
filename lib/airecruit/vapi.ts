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
  } = params

  const questionsText = screeningQuestions
    .map((q, i) => `${i + 1}. ${q}`)
    .join('\n')

  const systemPromptContent = `You are a friendly and empathetic recruiter calling on behalf of Careified. You are calling about a ${roleTitle} position. Ask these questions one at a time: ${questionsText}. Be warm and empathetic. Keep the call under 10 minutes. If asked if you are AI, be honest. Thank the candidate at the end and tell them a human recruiter will follow up within 24-48 hours.`

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
          firstMessage: `Hi! My name is Alex, I am an AI recruiting assistant from Careified calling about a ${roleTitle} position. Do you have 5 to 10 minutes for a few quick questions?`,
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
