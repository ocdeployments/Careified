const VAPI_API_KEY = process.env.VAPI_API_KEY!
const VAPI_BASE_URL = 'https://api.vapi.ai'

if (!VAPI_API_KEY) {
  throw new Error('VAPI_API_KEY environment variable is not set')
}

export interface VapiCallParams {
  phoneNumber: string
  campaignId: string
  callId: string
  candidateName?: string
  roleTitle: string
  screeningQuestions: string[]
  vapiAssistantId: string
  vapiPhoneNumberId: string
}

export interface VapiCallResult {
  success: boolean
  vapiCallId?: string
  error?: string
}

export async function initiateVapiCall(
  params: VapiCallParams
): Promise<VapiCallResult> {
  console.log("VAPI CALL ATTEMPT:", { 
    phoneNumber: params.phoneNumber,
    campaignId: params.campaignId,
    hasApiKey: !!process.env.VAPI_API_KEY,
    hasAssistantId: !!process.env.VAPI_ASSISTANT_ID,
    hasPhoneNumberId: !!process.env.VAPI_PHONE_NUMBER_ID,
  })

  const {
    phoneNumber,
    campaignId,
    callId,
    candidateName,
    roleTitle,
    screeningQuestions,
    vapiAssistantId,
    vapiPhoneNumberId,
  } = params

  // Build the dynamic system prompt for this specific call
  const questionsText = screeningQuestions
    .map((q, i) => `${i + 1}. ${q}`)
    .join('\n')

  const systemPrompt = `You are a friendly and empathetic 
recruiter calling on behalf of an agency using Careified, 
a professional caregiving platform in Canada and the US.

You are calling ${candidateName || 'a caregiver'} about 
a ${roleTitle} position.

Your goal is to conduct a brief, warm screening interview. 
Ask the following questions in order, one at a time. 
Listen carefully to each answer before moving on.

Screening questions:
${questionsText}

Guidelines:
- Introduce yourself as an AIRecruit assistant from Careified
- Be warm, professional, and empathetic
- Keep the total call under 10 minutes
- If the candidate seems busy, offer to call back later
- Thank them genuinely at the end
- Do not make promises about the role or compensation
- If asked if you are AI, be honest — say yes, you are 
  an AI assistant helping with initial screening

After all questions are answered, thank the candidate 
and let them know a human recruiter will follow up 
with next steps within 24-48 hours.

Call metadata (do not read aloud):
Campaign ID: ${campaignId}
Call ID: ${callId}`

  try {
    const response = await fetch(`${VAPI_BASE_URL}/call`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${VAPI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        assistantId: vapiAssistantId,
        assistantOverrides: {
          firstMessage: `Hi${candidateName ? `, ${candidateName}` : ''}! My name is Alex, and I'm an AI recruiting assistant calling from Careified. I'm reaching out because you may be a great fit for a ${roleTitle} position. Do you have about 5 to 10 minutes to answer a few quick questions?`,
          model: {
            messages: [
              {
                role: 'system',
                content: systemPrompt,
              }
            ]
          }
        },
        phoneNumberId: vapiPhoneNumberId,
        customer: {
          number: phoneNumber,
        },
        metadata: {
          campaignId,
          callId,
        },
      }),
    })

    console.log("VAPI RESPONSE STATUS:", response.status)
    if (!response.ok) {
      const errorText = await response.text()
      console.error("VAPI ERROR BODY:", errorText)
      return { 
        success: false, 
        error: errorText 
      }
    }
    const data = await response.json()
    console.log("VAPI SUCCESS:", data.id)
    return { 
      success: true, 
      vapiCallId: data.id 
    }

  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
}