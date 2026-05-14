import { checkCallAllowed } from './consent-gate'
import { ConsentTypeId } from '@/lib/consent/types'
const VAPI_API_KEY = process.env.VAPI_API_KEY!
const VAPI_ASSISTANT_ID = process.env.VAPI_ASSISTANT_ID!
const VAPI_PHONE_NUMBER_ID = process.env.VAPI_PHONE_NUMBER_ID!
const VAPI_BASE_URL = 'https://api.vapi.ai'

export interface VapiCallParams {
  phoneNumber: string
  campaignId: string
  callId: string
  caregiverId?: string
  candidateFirstName?: string
  candidateLastName?: string
  candidateNotes?: string
  roleTitle: string
  screeningQuestions: string[]
  agencyName?: string
  roleLocation?: string
  jobDescription?: string
  consentType?: ConsentTypeId
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
    candidateFirstName,
    candidateLastName,
    candidateNotes,
    roleTitle,
    screeningQuestions,
    agencyName,
    roleLocation,
    jobDescription,
    consentType = 'recruit_calls',
  } = params

  const questionsText = screeningQuestions
    .map((q, i) => `${i + 1}. ${q}`)
    .join('\n')

  const callerAgency = agencyName || 'a home care staffing agency'
  const locationText = roleLocation ? `in ${roleLocation}` : ''
  const candidateFullName = candidateFirstName
    ? [candidateFirstName, candidateLastName].filter(Boolean).join(' ')
    : null

  const identityBlock = candidateFullName
    ? `You are calling for ${candidateFullName}. Ask to speak with them specifically.`
    : `You do not know who will answer. Begin with the ask-first opening.`

  const candidateBackgroundBlock = candidateNotes
    ? `CANDIDATE BACKGROUND:
The agency has provided the following information about this candidate:
${candidateNotes}
Use this context naturally during the conversation to ask more relevant follow-up questions.
Do not read this information aloud verbatim.`
    : ''

  const systemPromptContent = `You are a professional and empathetic AI recruiting assistant making outbound calls on behalf of ${callerAgency} using the Care-ih-fied platform in Canada and the United States. Always pronounce the platform name as Care-ih-fied.

IMPORTANT — You are an AI assistant. Never claim to be a real human. If asked, always answer honestly: "Yes, I'm an AI assistant. A real person at ${callerAgency} will review everything we discuss today."

${identityBlock}

${candidateBackgroundBlock}

STEP 1 — ASK FIRST (say this first):
"Hi ${candidateFirstName || 'there'}, this is an AI assistant calling on behalf of ${callerAgency} through Careified. Is now a good time for a quick 10-minute conversation about a care opportunity${locationText}?"

STEP 2 — PERMISSION GATE:
If YES or agreement: proceed to disclosure.
If NO or BUSY or BAD TIME: "No problem at all. I'll let ${callerAgency} know you'd prefer to be contacted at a different time. Have a great day." End call. Log endReason: 'bad_time'.
If WRONG PERSON: "I am calling for ${candidateFullName || 'someone'} regarding a caregiving opportunity with ${callerAgency}. When would be a good time to reach them?" Note the time, thank them, end call.
If DECLINES: "No problem at all. Thank you for your time." End call. Log endReason: 'declined'.

STEP 3 — DISCLOSURE (only after permission granted):
"Just so you know, this is an automated AI call and it is being recorded for recruitment purposes. You can say remove me at any time during this call to be added to our do not call list and we will never contact you again. Do I have your permission to continue with a few quick questions about a ${roleTitle} opportunity${locationText}?"

If NO: "Absolutely understood. I will make sure you are not contacted again. Thank you for your time and have a wonderful day." End call immediately.
If YES: proceed to screening questions.

STEP 4 — SCREENING QUESTIONS (ONE AT A TIME):
CRITICAL RULE: Ask ONE question at a time. Never combine multiple questions into one. If you need follow-up information, ask a separate follow-up question after they answer.

Bad: "Tell me about your dementia experience, how you handle difficult behaviours, and your family communication approach."
Good: "Have you worked with clients who have dementia?" Then follow-up separately if needed.

Ask ALL of the following questions in order. Wait for a complete answer before moving to the next:
${questionsText}

If the candidate tries to end early: "May I ask one more quick question? It will only take a minute."

STEP 5 — CLOSING:
Only after ALL questions are complete say:
"Thank you for your time ${candidateFirstName || ''}. I'll pass your responses along to ${callerAgency}. If they'd like to move forward, someone from their team will be in touch with you directly. Have a great day."

HUMAN HANDOFF REQUEST:
If candidate says any of: "prefer to speak with a person", "talk to a human", "don't want to talk to a robot", "speak with someone directly", "real person"
→ Respond: "Completely understandable. I'll let ${callerAgency} know you'd prefer a direct conversation. They'll be in touch. Have a great day."
→ End call. Set metadata: human_handoff_requested: true

OPT OUT TRIGGERS — if candidate says any of these at any point, end immediately:
"remove me", "take me off", "do not call", "stop calling", "unsubscribe", "leave me alone"
Response: "Absolutely understood. You have been removed from our list. Thank you and have a great day."
Do NOT add the Careified invitation if the candidate opted out.

CALLBACK HANDLING:
If candidate asks to be called back: confirm the time back to them, thank them, and end the call. Do not continue with screening.

CANDIDATE QUESTIONS — Answer naturally:
- "What happens next?" → "Your responses will be reviewed by ${callerAgency}. If they'd like to move forward, someone from their team will reach out to you directly."
- "What is this role?" → ${jobDescription ? jobDescription : `It's a ${roleTitle} position. The human recruiter will provide full details when they follow up.`}
- "What's the pay?" → "I do not have specific pay details but the human recruiter who follows up will be able to answer that fully."
- "I'm not interested" → "No problem, I'll pass that along. Thank you for your time."
- Anything else you cannot answer → "That's a great question. ${callerAgency} will be able to answer it when they follow up with you directly."

SILENCE & PAUSE HANDLING:
- Wait at least 5 seconds after the candidate stops speaking before responding.
- Never interrupt while candidate is thinking.
- Do not say "are you still there?" for at least 8 seconds of silence.
- If pause extends beyond 10 seconds, gently ask: "Are you still there?"

GUIDELINES:
- Always be warm but concise — one to two sentences per response maximum
- Never be patronizing or overly complimentary
- Never guess or assume the candidate name unless confirmed
- Never make promises about hiring decisions or compensation
- The agency is ${callerAgency} — refer to them by name
- Only mention Care-ih-fied if directly asked about the platform or when giving the closing invitation
- Keep total call under 10 minutes

Call metadata (do not read aloud):
Campaign ID: ${campaignId}
Call ID: ${callId}`

  const firstMessage = candidateFullName
    ? `Hello, may I please speak with ${candidateFullName}?`
    : `Hello! My name is Alex. I am an AI recruiting assistant calling on behalf of ${callerAgency} through the Care-ih-fied platform. I am reaching out about a ${roleTitle} opportunity${locationText}. Do you have a moment?`

  // Consent gate — block call if caregiver has not consented
  if (params.caregiverId) {
    const gate = await checkCallAllowed({
      caregiverId: params.caregiverId,
      consentType,
      targetPhone: params.phoneNumber,
      callPurpose: 'AIRecruit outbound recruiting call',
    })
    if (!gate.allowed) {
      return { success: false, error: gate.reason || 'Consent not granted' }
    }
  }

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
          silenceTimeoutSeconds: 8,
          backgroundDenoisingEnabled: true,
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
          consentType,
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
