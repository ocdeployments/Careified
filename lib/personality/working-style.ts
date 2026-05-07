// Careified — Working Style Tag Engine
// Pure TypeScript: derives working style tags from personality scenario answers

export const WORKING_STYLE_TAGS = [
  'Calm under pressure',
  'Routine-oriented',
  'Emotionally attuned',
  'Proactively observant',
  'Adapts to change',
  'Structured & consistent',
  'Direct communicator',
  'Collaborative listener',
  'Decisive',
  'Protocol-driven',
  'Independent thinker',
  'Team-oriented',
] as const

export type WorkingStyleTag = typeof WORKING_STYLE_TAGS[number]

const SCORING_MAP: Record<number, { A: WorkingStyleTag; B: WorkingStyleTag }> = {
  1: { A: 'Calm under pressure', B: 'Routine-oriented' },
  2: { A: 'Emotionally attuned', B: 'Proactively observant' },
  3: { A: 'Adapts to change', B: 'Structured & consistent' },
  4: { A: 'Direct communicator', B: 'Collaborative listener' },
  5: { A: 'Decisive', B: 'Protocol-driven' },
  6: { A: 'Independent thinker', B: 'Team-oriented' },
  7: { A: 'Proactively observant', B: 'Emotionally attuned' },
}

const TAG_POINTS: Record<WorkingStyleTag, number> = {
  'Calm under pressure': 2,
  'Routine-oriented': 2,
  'Emotionally attuned': 2,
  'Proactively observant': 2,
  'Adapts to change': 2,
  'Structured & consistent': 2,
  'Direct communicator': 2,
  'Collaborative listener': 2,
  'Decisive': 2,
  'Protocol-driven': 2,
  'Independent thinker': 2,
  'Team-oriented': 2,
}

// Override points for Q7 (worth only 1 point each)
TAG_POINTS['Proactively observant'] = 1
TAG_POINTS['Emotionally attuned'] = 1

/**
 * Derives working style tags from personality scenario answers
 * @param answers - Object keyed by scenario number (1-7), values 'A' or 'B'
 * @returns Top 3 tags by score, ties broken by first appearance. Empty array if invalid input.
 */
export function deriveWorkingStyle(answers: Record<number, 'A' | 'B'>): WorkingStyleTag[] {
  // Check if answers is empty or incomplete (need at least some answers)
  if (!answers || Object.keys(answers).length === 0) {
    return []
  }

  // Verify all answers are valid A or B
  const validScenarios = [1, 2, 3, 4, 5, 6, 7]
  for (const scenario of validScenarios) {
    if (answers[scenario] && answers[scenario] !== 'A' && answers[scenario] !== 'B') {
      return []
    }
  }

  // Score each tag
  const tagScores: Record<string, number> = {} as Record<string, number>
  const tagOrder: string[] = []

  for (const scenario of validScenarios) {
    const answer = answers[scenario]
    if (!answer) continue

    const tag = SCORING_MAP[scenario][answer]
    if (!tag) continue

    if (!(tag in tagScores)) {
      tagScores[tag] = 0
      tagOrder.push(tag)
    }
    tagScores[tag] += TAG_POINTS[tag]
  }

  // Sort by score descending, then by first appearance order for ties
  const sortedTags = tagOrder.sort((a, b) => {
    const scoreDiff = tagScores[b] - tagScores[a]
    if (scoreDiff !== 0) return scoreDiff
    return tagOrder.indexOf(a) - tagOrder.indexOf(b)
  })

  // Return top 3
  return sortedTags.slice(0, 3) as WorkingStyleTag[]
}