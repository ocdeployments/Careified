// scripts/test-matching.ts
import { computeMatchScore } from '../lib/matching'
import type { MatchNeed } from '../lib/matching'
import type { CaregiverWithProvenance } from '../lib/matching'

// Helper to build provenance for test caregivers.
// Defaults all fields to Tier 4 (self-reported) unless overrides provided.
function mkProvenance(
  overrides: Partial<Record<string, { source: string; tier: 1|2|3|4 }>> = {}
): CaregiverWithProvenance['_provenance'] {
  const fields = [
    'specializations', 'credentials', 'placement_types', 'languages',
    'years_experience', 'hourly_rate', 'gender',
    'city', 'state', 'travel_radius',
    'has_vehicle', 'willing_live_in', 'willing_overnight',
    'availability_status',
    'client_preferences', 'environment_comfort', 'motivation',
    'reliability_metrics',
  ]
  const prov: CaregiverWithProvenance['_provenance'] = {}
  const tierConf = { 1: 1.0, 2: 0.75, 3: 0.55, 4: 0.35 }
  for (const f of fields) {
    const o = overrides[f]
    const tier = o?.tier ?? 4
    prov[f] = {
      source: o?.source ?? 'test_fixture',
      tier,
      confidence: tierConf[tier],
    }
  }
  return prov
}

// Base caregiver data
const baseCaregiver = {
  id: 'maria-test',
  first_name: 'Maria',
  last_name: 'Santos',
  specializations: ['Dementia / Alzheimer\'s', 'Memory care', 'Medication management'],
  credentials: ['PSW'],
  placement_types: ['Permanent placement', 'Live-in care', 'Regular part-time'],
  languages: ['English', 'Spanish', 'Tagalog'],
  years_experience: 8,
  hourly_rate: 28,
  hourly_rate_max: null,
  gender: 'female',
  city: 'Frisco',
  state: 'TX',
  postal_code: null,
  travel_radius: 25,
  has_vehicle: true,
  willing_live_in: true,
  willing_overnight: null,
  availability_status: 'available_now',
  client_preferences: {
    personality_types: ['Gentle and easy-going', 'Quiet and reflective'],
    age_ranges: ['seniors', 'elderly'],
    care_style: 'balanced',
  },
  environment_comfort: {
    dogs: 'yes', cats: 'yes', other_pets: 'prefer_not',
    smoking_indoor: 'no', smoking_outdoor: 'yes',
    clutter: 'yes', large_family: 'yes', hoarding: 'no', substance_use: 'no',
  },
  motivation: {
    why_caregiving: 'I cared for my grandmother through her Alzheimer\'s and found my calling in this work',
    proudest_placement: 'Stayed 3 years with Mrs. Chen',
    ideal_client: 'Elderly clients who need patience and long-term continuity',
  },
  reliability_metrics: null, // No placement data yet
}

const mariaSantos: CaregiverWithProvenance = {
  ...baseCaregiver,
  client_preferences: baseCaregiver.client_preferences as CaregiverWithProvenance['client_preferences'],
  environment_comfort: baseCaregiver.environment_comfort as CaregiverWithProvenance['environment_comfort'],
  _provenance: mkProvenance(),
}

const newbieCaregiver: CaregiverWithProvenance = {
  ...baseCaregiver,
  id: 'newbie-test',
  first_name: 'New',
  last_name: 'Caregiver',
  specializations: ['Companion Care'],
  credentials: ['HHA'],
  years_experience: 1,
  motivation: null,
  reliability_metrics: null,
  client_preferences: baseCaregiver.client_preferences as CaregiverWithProvenance['client_preferences'],
  environment_comfort: baseCaregiver.environment_comfort as CaregiverWithProvenance['environment_comfort'],
  _provenance: mkProvenance(),
}

// ─────────────────────────────────────────────────────────
// Test runner
// ─────────────────────────────────────────────────────────

type Test = {
  name: string
  caregiver: CaregiverWithProvenance
  need: MatchNeed
  expect: (r: ReturnType<typeof computeMatchScore>) => string[] // returns array of failure messages
}

const tests: Test[] = [
  // ── Test 1: Perfect match ──
  {
    name: 'perfect match — Maria with Alzheimer\'s live-in client',
    caregiver: mariaSantos,
    need: {
      city: 'Frisco',
      state: 'TX',
      primary_condition: 'Alzheimer\'s',
      placement_type: 'Live-in care',
      language_required: 'Spanish',
      personality_desired: ['Gentle and easy-going'],
      care_intensity: 'moderate',
    },
    expect: (r) => {
      const fails: string[] = []
      if (r.gates_passed !== true) fails.push(`gates should pass, got failed: ${r.gates_failed.join(',')}`)
      if (r.alignment_score == null) fails.push('alignment_score should be non-null')
      else if (r.alignment_score < 75) fails.push(`alignment_score should be >=75, got ${r.alignment_score}`)
      if (!r.unknowns.includes('reliability')) fails.push('reliability should be unknown (no placement data)')
      if (r.criteria_aligned.length < 3) fails.push(`expected >=3 criteria_aligned, got ${r.criteria_aligned.length}`)
      if (!r.disclaimer || !r.disclaimer.includes('not a recommendation')) {
        fails.push('disclaimer should be present')
      }
      return fails
    },
  },

  // ── Test 2: Hard filter failure ──
  {
    name: 'hard filter — Mandarin required, caregiver doesn\'t speak it',
    caregiver: mariaSantos,
    need: {
      city: 'Frisco',
      state: 'TX',
      language_required: 'Mandarin',
    },
    expect: (r) => {
      const fails: string[] = []
      if (r.gates_passed !== false) fails.push('gates should fail')
      if (r.alignment_score !== null) fails.push(`alignment_score should be null (excluded), got ${r.alignment_score}`)
      if (!r.gates_failed.some(g => g.includes('language_required'))) fails.push('should mention language gate')
      return fails
    },
  },

  // ── Test 3: No placement data honest handling ──
  {
    name: 'no placement data — reliability is unknown, NOT defaulted',
    caregiver: mariaSantos,
    need: {
      city: 'Frisco',
      state: 'TX',
      primary_condition: 'Dementia',
    },
    expect: (r) => {
      const fails: string[] = []
      if (r.dimensions.reliability.score !== null)
        fails.push(`reliability.score should be null, got ${r.dimensions.reliability.score}`)
      if (r.dimensions.reliability.confidence !== 'none')
        fails.push(`reliability.confidence should be 'none', got '${r.dimensions.reliability.confidence}'`)
      if (r.dimensions.reliability.confidence_multiplier !== 0)
        fails.push(`reliability.confidence_multiplier should be 0, got ${r.dimensions.reliability.confidence_multiplier}`)
      if (!r.unknowns.includes('reliability'))
        fails.push('reliability should appear in unknowns array')
      if (r.dimensions.reliability.weight_applied !== 0)
        fails.push(`null dimension should have weight_applied=0, got ${r.dimensions.reliability.weight_applied}`)
      return fails
    },
  },

  // ── Test 4: No client personality data ──
  {
    name: 'no client personality — dimension is null, not faked',
    caregiver: mariaSantos,
    need: {
      city: 'Frisco',
      state: 'TX',
      primary_condition: 'Dementia',
      // personality_desired omitted
    },
    expect: (r) => {
      const fails: string[] = []
      if (r.dimensions.personality_compatibility.score !== null)
        fails.push('personality should be null without client data')
      if (!r.unknowns.includes('personality_compatibility'))
        fails.push('personality_compatibility should be in unknowns')
      return fails
    },
  },

  // ── Test 5: Bad specialty match ──
  {
    name: 'bad specialty — pediatric client, dementia caregiver',
    caregiver: mariaSantos,
    need: {
      city: 'Frisco',
      state: 'TX',
      primary_condition: 'pediatric autism',
    },
    expect: (r) => {
      const fails: string[] = []
      if (r.dimensions.clinical_fit.score === null)
        fails.push('clinical_fit should have a score (even if low)')
      else if (r.dimensions.clinical_fit.score > 45)
        fails.push(`bad match should score low, got ${r.dimensions.clinical_fit.score}`)
      return fails
    },
  },

  // ── Test 6: Multilingual boost ──
  {
    name: 'multilingual — 3+ languages adds to cultural fit',
    caregiver: mariaSantos,
    need: {
      city: 'Frisco',
      state: 'TX',
      language_required: 'Spanish',
    },
    expect: (r) => {
      const fails: string[] = []
      const lang = r.dimensions.cultural_language_fit
      if (lang.score === null) fails.push('cultural_language should have a score')
      else if (lang.score < 60) fails.push(`multilingual should score well, got ${lang.score}`)
      if (!r.criteria_aligned.some(s => /Spanish|Multilingual/i.test(s)))
        fails.push('should mention Spanish or multilingual in criteria_aligned')
      return fails
    },
  },

  // ── Test 7: Environment conflict ──
  {
    name: 'environment conflict — client has dogs, caregiver opted out',
    caregiver: {
      ...mariaSantos,
      environment_comfort: { ...mariaSantos.environment_comfort!, dogs: 'no' },
    },
    need: {
      city: 'Frisco',
      state: 'TX',
      primary_condition: 'Dementia',
      pets_present: ['dogs'],
      home_condition: 'organized',
    },
    expect: (r) => {
      const fails: string[] = []
      const env = r.dimensions.environment_fit
      // Score should be reduced from 100 by 30 (dogs conflict)
      if (env.score == null) fails.push('environment_fit should be scored')
      else if (env.score >= 100) fails.push(`conflict should reduce env score, got ${env.score}`)
      else if (env.score > 80) fails.push(`conflict should reduce env score more, got ${env.score}`)
      // Check that the source mentions the conflict
      if (!env.source.includes('dogs')) fails.push('env source should mention dogs conflict')
      return fails
    },
  },

  // ── Test 8: New caregiver no motivation + no placements ──
  {
    name: 'new caregiver — retention signal is unknown, not defaulted',
    caregiver: newbieCaregiver,
    need: {
      city: 'Frisco',
      state: 'TX',
      primary_condition: 'Companion care',
    },
    expect: (r) => {
      const fails: string[] = []
      if (r.dimensions.retention_signal.score !== null)
        fails.push('retention should be null with no data and no stated preference')
      if (!r.unknowns.includes('retention_signal'))
        fails.push('retention_signal should be in unknowns')
      return fails
    },
  },

  // ── Test 9: confidence propagates — Tier 1 data outscores Tier 4 at equal raw scores ──
  {
    name: 'confidence — verified data outscores self-reported at equal inputs',
    caregiver: {
      ...mariaSantos,
      _provenance: mkProvenance({
        specializations: { source: 'state_board_api', tier: 1 },
        credentials: { source: 'nursys', tier: 1 },
        years_experience: { source: 'payroll_records', tier: 1 },
        languages: { source: 'document_on_file', tier: 2 },
        city: { source: 'address_verification', tier: 1 },
        travel_radius: { source: 'address_verification', tier: 1 },
        has_vehicle: { source: 'self_reported', tier: 4 },
        willing_live_in: { source: 'self_reported', tier: 4 },
        availability_status: { source: 'self_reported', tier: 4 },
        placement_types: { source: 'self_reported', tier: 4 },
        client_preferences: { source: 'self_reported', tier: 4 },
        motivation: { source: 'self_reported', tier: 4 },
      }),
    },
    need: {
      city: 'Frisco',
      state: 'TX',
      primary_condition: 'Alzheimer\'s',
      language_required: 'Spanish',
      care_intensity: 'moderate',
    },
    expect: (r) => {
      const fails: string[] = []
      if (r.alignment_score == null) fails.push('alignment_score should exist')
      if (r.overall_confidence == null) fails.push('overall_confidence should exist')
      else if (r.overall_confidence < 0.5) {
        fails.push(`verified data should give higher overall_confidence, got ${r.overall_confidence}`)
      }
      // Clinical fit should have attributes_used populated
      if (r.dimensions.clinical_fit.attributes_used.length === 0) {
        fails.push('clinical_fit should list attributes_used')
      }
      // With Tier 1 specializations/credentials/years, clinical should have higher confidence
      if (r.dimensions.clinical_fit.confidence_multiplier < 0.8) {
        fails.push(`Tier 1 clinical should give >0.8 confidence_multiplier, got ${r.dimensions.clinical_fit.confidence_multiplier}`)
      }
      return fails
    },
  },

  // ── Test 10: all self-reported confidence stays low ──
  {
    name: 'confidence — all Tier 4 keeps overall_confidence low',
    caregiver: mariaSantos, // default provenance = all Tier 4
    need: {
      city: 'Frisco',
      state: 'TX',
      primary_condition: 'Alzheimer\'s',
      language_required: 'Spanish',
      care_intensity: 'moderate',
    },
    expect: (r) => {
      const fails: string[] = []
      if (r.overall_confidence == null) fails.push('overall_confidence should exist')
      else if (r.overall_confidence > 0.45) {
        fails.push(`all self-reported should cap confidence <=0.45, got ${r.overall_confidence}`)
      }
      if (!r.disclaimer || !r.disclaimer.includes('not a recommendation')) {
        fails.push('disclaimer should be present and state not a recommendation')
      }
      return fails
    },
  },
]

// ─────────────────────────────────────────────────────────
// Run all tests
// ─────────────────────────────────────────────────────────

let passed = 0
let failed = 0
const failures: Array<{ name: string; errors: string[] }> = []

for (const test of tests) {
  const result = computeMatchScore(test.caregiver, test.need)
  const errors = test.expect(result)
  if (errors.length === 0) {
    passed++
    console.log(`✅ ${test.name}`)
    console.log(`   score: ${result.alignment_score}, unknowns: [${result.unknowns.join(',')}]`)
  } else {
    failed++
    failures.push({ name: test.name, errors })
    console.log(`❌ ${test.name}`)
    for (const err of errors) console.log(`   - ${err}`)
    console.log(`   full result: ${JSON.stringify(result, null, 2)}`)
  }
}

// Cross-test check: verified > self-reported at equal inputs
console.log(`\n${'─'.repeat(50)}`)
const t9 = tests.find(t => t.name.includes('verified data outscores'))
const t10 = tests.find(t => t.name.includes('all Tier 4 keeps'))
if (t9 && t10) {
  const r9 = computeMatchScore(t9.caregiver, t9.need)
  const r10 = computeMatchScore(t10.caregiver, t10.need)
  console.log(`Verified confidence: ${r9.overall_confidence}`)
  console.log(`Self-reported confidence: ${r10.overall_confidence}`)
  if ((r9.overall_confidence ?? 0) > (r10.overall_confidence ?? 0)) {
    console.log('✅ Confidence hierarchy preserved: verified > self-reported')
  } else {
    console.log('❌ Confidence hierarchy BROKEN')
    failed++
    failures.push({ name: 'Confidence hierarchy', errors: ['verified confidence must be > self-reported'] })
  }
}

console.log(`\nPassed: ${passed}/${tests.length}`)
console.log(`Failed: ${failed}/${tests.length}`)

if (failed > 0) {
  process.exit(1)
}
