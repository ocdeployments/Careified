const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY!

const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1'

export interface QuestionScore {
  question: string
  answer: string
  score: number
  rationale: string
}

export interface ScoringResult {
  overallScore: number
  recommendation: 'advance' | 'review' | 'pass'
  summary: string
  questionScores: QuestionScore[]
  flags: string[]
  confidence: number
}

export async function scoreTranscript(
  transcript: string,
  screeningQuestions: string[],
  roleTitle: string
): Promise<ScoringResult | null> {
  if (!transcript || !screeningQuestions.length) {
    return null
  }

  const questionsText = screeningQuestions
    .map((q, i) => `${i + 1}. ${q}`)
    .join('\n')

  const prompt = `You are an expert caregiver recruiter evaluating a screening call transcript for a ${roleTitle} position.

SCREENING QUESTIONS ASKED:
${questionsText}

TRANSCRIPT:
${transcript}

Evaluate the candidate's responses and return a JSON object with exactly this structure:
{
  "overallScore": <number 0.0 to 1.0>,
  "recommendation": <"advance" | "review" | "pass">,
  "summary": <2-3 sentence plain English summary of the candidate>,
  "questionScores": [
    {
      "question": <the question text>,
      "answer": <brief summary of what candidate said>,
      "score": <number 0.0 to 1.0>,
      "rationale": <1 sentence explanation of score>
    }
  ],
  "flags": [<list of concerns, e.g. "Candidate gave inconsistent answers", "Expressed negative attitude toward clients", "Refused to answer questions">],
  "confidence": <number 0.0 to 1.0 — how confident you are in this score based on answer quality>
}

SCORING RULES:
- Score 0.8-1.0: Strong candidate, clear experience, positive attitude
- Score 0.6-0.79: Decent candidate, some gaps but worth a conversation
- Score 0.4-0.59: Marginal, significant concerns
- Score 0.0-0.39: Do not advance, clear disqualifiers

RECOMMENDATION RULES:
- advance: overallScore >= 0.65 and no critical flags
- pass: overallScore < 0.40 or has critical disqualifying flags
- review: everything else

CRITICAL FLAGS (automatically recommend pass):
- Expressed hatred or strong aversion toward clients
- Admitted to abusing or mistreating clients
- Refused to participate in interview
- Made threats

IMPORTANT:
- If candidate gave inconsistent answers, flag it
- If candidate asked to restart, note it and score based on the FINAL answers given, not the initial ones
- Be honest and direct — agencies depend on accurate scores
- Return ONLY valid JSON, no markdown, no explanation

Return only the JSON object.`

  try {
    const response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://careified.vercel.app',
        'X-Title': 'Careified AIRecruit',
      },
      body: JSON.stringify({
        model: 'minimax/minimax-2.5-flash',
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: 1500,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Scoring API error:', response.status, errorText)
      return null
    }

    const data = await response.json()
    const text = data.choices?.[0]?.message?.content

    if (!text) {
      console.error('No text in scoring response')
      return null
    }

    // Parse JSON from response
    const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim()
    const result = JSON.parse(cleanedText) as ScoringResult
    return result

  } catch (error) {
    console.error('Scoring error:', error)
    return null
  }
}