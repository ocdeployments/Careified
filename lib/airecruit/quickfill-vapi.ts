// Careified — AIRecruit QuickFill Alert Vapi Configuration
// Opportunity notification calls for QuickFill Phase 2

import { VapiCallParams, VapiCallResult, initiateVapiCall } from './vapi'

export interface QuickFillAlertParams {
  caregiverFirstName: string
  caregiverPhone: string
  agencyName: string
  shiftDate: string
  shiftTime: string
  shiftLocation: string
  hourlyRate: string
  requirementsMatch: string
  caregiverId: string
  blastId: string
}

export function buildQuickFillAlertConfig(params: QuickFillAlertParams): VapiCallParams {
  const {
    caregiverFirstName,
    caregiverPhone,
    agencyName,
    shiftDate,
    shiftTime,
    shiftLocation,
    hourlyRate,
    requirementsMatch,
    caregiverId,
    blastId,
  } = params

  const quickfillCallId = `qf_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`

  const systemPromptContent = `You are a professional AI assistant calling on behalf of ${agencyName} through Careified, a professional caregiver credentialing platform in Canada and the United States.

IMPORTANT — You are an AI assistant. Never claim to be a real human. If asked, always answer honestly: "Yes, I'm an AI assistant."

ROLE: You are calling ${caregiverFirstName} to alert them about a care opportunity that matches their profile. This is a QUICK opportunity — they need to respond quickly.

STEP 1 — OPENING (brief and urgent):
"Hi ${caregiverFirstName}, this is an AI calling on behalf of ${agencyName} through Careified. I'm calling about a care opportunity that matches your profile that needs to be filled soon."

STEP 2 — OPPORTUNITY DETAILS:
"On ${shiftDate} from ${shiftTime} in ${shiftLocation}, there's a shift available that matches ${requirementsMatch}. The rate is ${hourlyRate} per hour."

STEP 3 — RESPONSE OPTIONS:
"Press 1 if you're interested — someone from ${agencyName} will follow up with the full details within the hour.
Press 2 if you're not available for this opportunity.
Press 3 if you'd like to be removed from opportunity alerts — you can always re-enable them in your settings."

STEP 4 — ACKNOWLEDGMENT:
If they press 1: "Great, someone from ${agencyName} will be in touch shortly. Thank you!" → End call.
If they press 2: "No problem, thank you for your time." → End call.
If they press 3: "You've been removed from opportunity alerts. You can re-enable them anytime in your settings. Thank you." → End call.
If they ask questions: "A human from ${agencyName} will have all the details when they follow up with you."

GUIDELINES:
- Keep the call UNDER 60 SECONDS — this is a quick notification, not a conversation
- Be efficient and to the point
- Do NOT do a full recruitment screening — this is just an alert
- If they hang up before pressing, that's fine — record as no response

Metadata (do not read aloud):
Caregiver ID: ${caregiverId}
Blast ID: ${blastId}
Call ID: ${quickfillCallId}`

  const firstMessage = `Hi ${caregiverFirstName}, this is an AI calling on behalf of ${agencyName} through Careified. I'm calling about a care opportunity that matches your profile that needs to be filled soon. Are you available to hear the details?`

  return {
    phoneNumber: caregiverPhone,
    campaignId: 'quickfill_alert',
    callId: quickfillCallId,
    caregiverId,
    candidateFirstName: caregiverFirstName,
    candidateLastName: '',
    candidateNotes: `QuickFill alert from ${agencyName} for ${shiftDate} ${shiftTime}`,
    roleTitle: 'QuickFill Opportunity Alert',
    screeningQuestions: [
      'Are you available for this shift opportunity?',
      'Would you like someone from the agency to follow up with details?'
    ],
    agencyName,
    roleLocation: shiftLocation,
    jobDescription: `${requirementsMatch} - ${hourlyRate}/hour`,
    consentType: 'match_time_calls'
  }
}

export async function initiateQuickFillAlert(
  params: QuickFillAlertParams
): Promise<VapiCallResult> {
  const callConfig = buildQuickFillAlertConfig(params)
  return initiateVapiCall(callConfig)
}