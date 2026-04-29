const VAPI_API_KEY = process.env.VAPI_API_KEY!
const VAPI_ASSISTANT_ID = process.env.VAPI_ASSISTANT_ID!
const VAPI_PHONE_NUMBER_ID = process.env.VAPI_PHONE_NUMBER_ID!
const VAPI_BASE_URL = 'https://api.vapi.ai'

export interface VapiCallParams {
  phoneNumber: string
  campaignId: string
  callId: string
  candidateFirstName?: string
  candidateLastName?: string
  candidateNotes?: string
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
    candidateFirstName,
    candidateLastName,
    candidateNotes,
    roleTitle,
    screeningQuestions,
    agencyName = 'home care staffing agency',
    roleLocation,
  } = params

  try {
    const systemPrompt = buildSystemPrompt({
      roleTitle,
      screeningQuestions,
      candidateFirstName,
      candidateLastName,
      candidateNotes,
      agencyName,
      roleLocation,
    })

    const response = await fetch(`${VAPI_BASE_URL}/call`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${VAPI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        assistant_id: VAPI_ASSISTANT_ID,
        phone_number_id: VAPI_PHONE_NUMBER_ID,
        phone_number: phoneNumber,
        system_prompt: systemPrompt,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      console.error('VAPI ERROR:', data)
      return { success: false, error: data.message || 'Failed to initiate call' }
    }

    console.log('VAPI CALL INITIATED:', {
      callId,
      vapiCallId: data.id,
      phoneNumber,
    })

    return { success: true, vapiCallId: data.id }
  } catch (error) {
    console.error('VAPI EXCEPTION:', error)
    return { success: false, error: String(error) }
  }
}

function buildSystemPrompt({
  roleTitle,
  screeningQuestions,
  candidateFirstName,
  candidateLastName,
  candidateNotes,
  agencyName,
  roleLocation,
}: {
  roleTitle: string
  screeningQuestions: string[]
  candidateFirstName?: string
  candidateLastName?: string
  candidateNotes?: string
  agencyName?: string
  roleLocation?: string
}) {
  const candidateName = candidateFirstName
    ? `${candidateFirstName}${candidateLastName ? ' ' + candidateLastName : ''}`.trim()
    : null

  const intro = candidateName
    ? `You are calling ${candidateName}.`
    : `You are calling a candidate.`

  const note = candidateNotes
    ? `\n\nCandidate background: ${candidateNotes}`
    : ''

  return `${intro} You are calling on behalf of ${agencyName}${roleLocation ? ` in ${roleLocation}` : ''}.

Your role is to conduct a brief screening interview for the position of ${roleTitle}.

IMPORTANT: You must begin the call by:
1. Stating your name (Alex) and that you are calling from Careified
2. Asking if they are available for a brief 5-minute screening
3. If they are not available, ask for a better time to call back and end the call politely
4. If they are available, proceed with the screening questions

You must ask these questions in order:
${screeningQuestions.map((q, i) => `${i + 1}. ${q}`).join('\n')}

After each question, listen to their answer and note key points.

At the end of the screening:
- Thank them for their time
- Let them know they will receive a follow-up if there's interest
- Say goodbye politely

CRTC DISCLOSURE (MUST SAY VERBATIM AT START OF CALL):
"This call is from Careified, a home care staffing platform. This call is being recorded for quality assurance purposes. If you would like to be removed from our calling list, please say 'remove me' or 'take me off' and we will honor your request immediately."

Do not ask for personal identifying information like SSN, driver's license, or financial details during this call.
Do not leave voicemail messages.
Be friendly, professional, and concise.${note}`
}
