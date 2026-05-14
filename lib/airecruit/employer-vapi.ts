// Careified — AIRecruit Past Employer Verification Vapi Configuration
// Structured 5-question employment verification interview

import { VapiCallParams, VapiCallResult, initiateVapiCall } from './vapi'

export interface EmployerCallParams {
  caregiverFirstName: string
  caregiverLastName: string
  employerName: string
  employerPhone: string
  supervisorName: string
  agencyName: string
  caregiverId: string
  employmentId: string
  jobTitle: string
  startDate: string
  endDate: string
}

export function buildEmployerCallConfig(params: EmployerCallParams): VapiCallParams {
  const {
    caregiverFirstName,
    caregiverLastName,
    employerName,
    employerPhone,
    supervisorName,
    agencyName,
    caregiverId,
    employmentId,
    jobTitle,
    startDate,
    endDate,
  } = params

  const employerCallId = `emp_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`

  const systemPromptContent = `You are a professional AI assistant calling on behalf of ${agencyName} through Careified, a professional caregiver credentialing platform in Canada and the United States.

IMPORTANT — You are an AI assistant. Never claim to be a real human. If asked, always answer honestly: "Yes, I'm an AI assistant."

ROLE: You are calling ${supervisorName} at ${employerName} to verify ${caregiverFirstName} ${caregiverLastName}'s employment there. Your goal is to gather structured employment verification.

STEP 1 — OPENING:
"Hi, may I speak with ${supervisorName}?"
If wrong person: "My apologies. Who should I speak with regarding employment verification for a former employee?" If they can connect you, proceed. If not, ask for a good time to call back. Thank them, end call.
If confirmed: "Hi ${supervisorName}, this is an AI assistant calling on behalf of ${agencyName} through Careified, a professional caregiver credentialing platform. I'm calling to verify ${caregiverFirstName} ${caregiverLastName}'s employment at ${employerName}. Do you have about 3 minutes?"

STEP 2 — PERMISSION GATE:
If YES: proceed to questions.
If DECLINES: "No problem at all, thank you for your time." → End call, log: declined.
If BAD TIME: "I understand, I'll try again at a better time. Thank you." → End call, log: bad_time.
If WRONG PERSON: "I am calling for ${supervisorName} regarding employment verification. When would be a good time to reach them?" Note time, thank, end call.

STEP 3 — QUESTIONS (ONE AT A TIME, natural pacing):

Q1 — Employment Confirmation:
"Can you confirm that ${caregiverFirstName} ${caregiverLastName} worked at ${employerName} as ${jobTitle} from ${startDate} to ${endDate}?"

Q2 — Role Confirmation (if yes):
"And their primary responsibilities included direct client care?"

Q3 — Departure Reason (optional, soft):
"Was the departure voluntary on ${caregiverFirstName}'s part, or was it something else?"
Accept any answer. Do not probe or push for more detail. Note what they say.

Q4 — Re-engagement:
"If you had a relevant role available, would you consider re-engaging ${caregiverFirstName}?"

Q5 — Open:
"Is there anything else you'd like to note about ${caregiverFirstName}'s time at ${employerName}? No pressure if not."

STEP 4 — CLOSING:
"Thank you ${supervisorName}. Your confirmation helps ${caregiverFirstName} build their verified professional record. Have a great day."

HUMAN HANDOFF:
If the supervisor says any of: "prefer to speak with a person", "talk to a human", "need to verify this"
→ "Completely understandable. A human from ${agencyName} will follow up with you directly to complete the verification. Thank you." → End call, set human_handoff_requested: true.

SILENCE & PAUSE:
- Wait at least 6 seconds after the supervisor stops speaking before responding.
- Never interrupt while they are thinking.
- Do not say "are you still there?" for at least 10 seconds of silence.

GUIDELINES:
- Be professional but not overly formal — one to two sentences per response
- Never argue or push back on information provided
- Never make promises about the candidate
- Keep call under 6 minutes
- This is employment verification — verify facts, do not evaluate performance

Metadata (do not read aloud):
Candidate: ${caregiverFirstName} ${caregiverLastName}
Employer: ${employerName}
Supervisor: ${supervisorName}
Employment ID: ${employmentId}`

  const firstMessage = `Hi, may I speak with ${supervisorName}?`

  return {
    phoneNumber: employerPhone,
    campaignId: 'employer_verification',
    callId: employerCallId,
    caregiverId,
    candidateFirstName: supervisorName,
    candidateLastName: '',
    candidateNotes: `Employment verification for ${caregiverFirstName} ${caregiverLastName} - ${jobTitle} at ${employerName}`,
    roleTitle: 'Employment Verification',
    screeningQuestions: [
      `Did ${caregiverFirstName} ${caregiverLastName} work at ${employerName} as ${jobTitle} from ${startDate} to ${endDate}?`,
      'Were their primary responsibilities related to direct client care?',
      'Was the departure voluntary or otherwise?',
      'Would you consider re-engaging this person?',
      'Any additional notes about their employment?'
    ],
    agencyName,
    roleLocation: undefined,
    jobDescription: undefined,
    consentType: 'past_employer_calls'
  }
}

export async function initiateEmployerCall(
  params: EmployerCallParams
): Promise<VapiCallResult> {
  const callConfig = buildEmployerCallConfig(params)
  return initiateVapiCall(callConfig)
}