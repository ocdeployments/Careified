// Careified — Match Gap Analysis
// Generates "What to verify in your call" list when agency views caregiver vs client

export interface GapItem {
  category: 'clinical' | 'schedule' | 'verification' | 'reference' | 'rate' | 'logistics'
  text: string
  priority: 'high' | 'medium' | 'low'
}

export function generateGapAnalysis(
  caregiver: Record<string, any>,
  client: Record<string, any>
): GapItem[] {
  const gaps: GapItem[] = []

  // Clinical gaps
  if (client.primary_condition) {
    const cgDiagnoses = Object.keys(caregiver.diagnosis_experience || {})
    const conditionMapped = mapConditionToKey(client.primary_condition)
    if (conditionMapped && !cgDiagnoses.some(d => d.toLowerCase().includes(conditionMapped))) {
      gaps.push({
        category: 'clinical',
        priority: 'high',
        text: `Confirm experience with ${client.primary_condition} — not listed in diagnosis history`,
      })
    }
  }

  // Mobility / transfer
  if (client.mobility_level === 'wheelchair' || client.mobility_level === 'bedbound') {
    const adls = Object.keys(caregiver.adls_performed || {})
    if (!adls.some(a => /transfer|lift|hoist/i.test(a))) {
      gaps.push({
        category: 'clinical',
        priority: 'high',
        text: `Confirm transfer technique for ${client.mobility_level} client — no transfer ADLs listed`,
      })
    }
  }

  // Medications
  if (client.medications_complex && !caregiver.credentials?.some((c: string) => /PSW|RPN|RN|LPN|CNA/i.test(c))) {
    gaps.push({
      category: 'clinical',
      priority: 'medium',
      text: 'Complex medication management required — confirm caregiver training and scope',
    })
  }

  // Rate mismatch
  if (client.hourly_rate_max && caregiver.hourly_rate) {
    const cgRate = Number(caregiver.hourly_rate)
    const clientMax = Number(client.hourly_rate_max)
    if (cgRate > clientMax * 0.9) {
      gaps.push({
        category: 'rate',
        priority: 'high',
        text: `Rate proximity — caregiver at $${cgRate}/hr vs client max $${clientMax}/hr. Confirm flexibility.`,
      })
    }
  }

  // Placement type
  if (client.placement_type) {
    const cgTypes = (caregiver.placement_types || []).map((t: string) => t.toLowerCase())
    const wantsLiveIn = /live-in/i.test(client.placement_type)
    const wantsOvernight = /overnight/i.test(client.placement_type)
    if (wantsLiveIn && !caregiver.willing_live_in) {
      gaps.push({
        category: 'logistics',
        priority: 'high',
        text: 'Client requires live-in — caregiver has not indicated live-in availability',
      })
    }
    if (wantsOvernight && !caregiver.willing_overnight) {
      gaps.push({
        category: 'schedule',
        priority: 'medium',
        text: 'Client requires overnight care — confirm caregiver overnight availability',
      })
    }
  }

  // Hours mismatch
  if (client.hours_per_week && caregiver.max_hours_per_week) {
    if (Number(client.hours_per_week) > Number(caregiver.max_hours_per_week)) {
      gaps.push({
        category: 'schedule',
        priority: 'medium',
        text: `Client needs ${client.hours_per_week} hrs/week — caregiver max is ${caregiver.max_hours_per_week} hrs`,
      })
    }
  }

  // Language
  if (client.language_required) {
    const langs = (caregiver.languages || []).map((l: string) => l.toLowerCase())
    if (!langs.includes(client.language_required.toLowerCase())) {
      gaps.push({
        category: 'logistics',
        priority: 'high',
        text: `Client requires ${client.language_required} — not listed in caregiver languages`,
      })
    }
  }

  // Verification gaps
  if (!caregiver.vulnerable_sector_check) {
    gaps.push({
      category: 'verification',
      priority: 'high',
      text: 'VSC not on file — obtain before placement',
    })
  }

  // Red flag disclosures
  if (caregiver.rf_terminated === 'yes') {
    gaps.push({
      category: 'verification',
      priority: 'high',
      text: 'Caregiver disclosed a previous termination — review explanation before placing',
    })
  }
  if (caregiver.rf_complaint === 'yes') {
    gaps.push({
      category: 'verification',
      priority: 'high',
      text: 'Caregiver disclosed a formal complaint — review explanation before placing',
    })
  }

  // Reference gap
  if (!caregiver.verified_references_count || caregiver.verified_references_count < 1) {
    gaps.push({
      category: 'reference',
      priority: 'medium',
      text: 'No verified references on file — request reference contact before placement',
    })
  }

  return gaps.sort((a, b) => {
    const order = { high: 0, medium: 1, low: 2 }
    return order[a.priority] - order[b.priority]
  }).slice(0, 5)
}

function mapConditionToKey(condition: string): string | null {
  const map: Record<string, string> = {
    "alzheimer's/dementia": 'dementia',
    "parkinson's": 'parkinson',
    'stroke recovery': 'stroke',
    'diabetes': 'diabet',
    'mobility/fall risk': 'mobil',
    'hospice/palliative': 'palliat',
    'post-surgical': 'surg',
    'mental health': 'mental',
    'spinal cord injury': 'spinal',
  }
  const lower = condition.toLowerCase()
  for (const [key, val] of Object.entries(map)) {
    if (lower.includes(key) || lower.includes(val)) return val
  }
  return null
}
