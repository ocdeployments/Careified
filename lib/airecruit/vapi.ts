
const VAPI_API_KEY = process.env.c4b3afc1-aaa9-4916-bf0d-c4fa510ef6df!

const VAPI_ASSISTANT_ID = process.env.fdd84833-80ef-4c50-8391-2d7b38e56ead!

const VAPI_PHONE_NUMBER_ID = process.env.efd1fdc0-6795-4d5f-a399-b95367bd88ff!

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

  const systemPromptContent = `You are a friendly and empathetic recruiter calling on behalf of an agency using Careified, a professional caregiving platform in Canada and the US. You are calling ${candidateName || 'a caregiver'} about a ${roleTitle} position. Your goal is to conduct a brief, warm screening interview. Ask the following questions in order, one at a time. Listen carefully to each answer before moving on. Screening questions: ${questionsText}. Guidelines: Introduce yourself as an AIRecruit assistant from Careified. Be warm, professional, and empathetic. Keep the total call under 10 minutes. If the candidate seems busy, offer to call back later. Thank them genuinely at the end. Do not make promises about the role or compensation. If asked if you are AI, be honest. After all questions are answered, thank the candidate and let them know a human recruiter will follow up within 24-48 hours.`

  try {

    const response = await fetch(`${VAPI_BASE_URL}/call`, {

      method: 'POST',

      headers: {

        'Authorization': `Bearer ${VAPI_API_KEY}`,

        'Content-Type': 'application/json',

      },

      body: JSON.stringify({

        assistantId: VAPI_ASSISTANT_ID,

        assistantOverrides: {

          firstMessage: `Hi${candidateName ? `, ${candidateName}` : ''}! My name is Alex, and I am an AI recruiting assistant calling from Careified. I am reaching out because you may be a great fit for a ${roleTitle} position. Do you have about 5 to 10 minutes to answer a few quick questions?`,

          model: {

            provider: 'openai',

            model: 'gpt-4o',

            messages: [

              {

                role: 'system',

                content: systemPromptContent,

              }

            ]

          }

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

    console.log('VAPI SUCCESS:', data.id)

    return { success: true, vapiCallId: data.id }

  } catch (error) {

    return {

      success: false,

      error: error instanceof Error ? error.message : 'Unknown error'

    }

  }

}

