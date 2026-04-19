// scripts/test-matching.ts
import { computeMatchScore } from '../lib/matching'
import type { CaregiverForMatching, MatchNeed } from '../lib/matching'

// ─────────────────────────────────────────────────────────
// Test fixtures
// ─────────────────────────────────────────────────────────

const mariaSantos: CaregiverForMatching = {
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

const newbieCaregiver: CaregiverForMatching = {
  ...mariaSantos,
  id: 'newbie-test',
  first_name: 'New',
  last_name: 'Caregiver',
  specializations: ['Companion Care'],
  credentials: ['HHA'],
  years_experience: 1,
  motivation: null,
  reliability_metrics: null,
}

// ─────────────────────────────────────────────────────────
// Test runner
// ─────────────────────────────────────────────────────────

type Test = {
  name: string
  caregiver: CaregiverForMatching
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
      if (r.overall_score == null) fails.push('overall_score should be non-null')
      else if (r.overall_score < 75) fails.push(`overall_score should be >=75, got ${r.overall_score}`)
      if (!r.unknowns.includes('reliability')) fails.push('reliability should be unknown (no placement data)')
      if (r.strong_fits.length < 3) fails.push(`expected >=3 strong_fits, got ${r.strong_fits.length}`)
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
      if (r.overall_score !== null) fails.push(`overall_score should be null (excluded), got ${r.overall_score}`)
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
      if (!r.strong_fits.some(s => /Spanish|Multilingual/i.test(s)))
        fails.push('should mention Spanish or multilingual in strong_fits')
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
    console.log(`   score: ${result.overall_score}, unknowns: [${result.unknowns.join(',')}]`)
  } else {
    failed++
    failures.push({ name: test.name, errors })
    console.log(`❌ ${test.name}`)
    for (const err of errors) console.log(`   - ${err}`)
    console.log(`   full result: ${JSON.stringify(result, null, 2)}`)
  }
}

console.log(`\n${'─'.repeat(50)}`)
console.log(`Passed: ${passed}/${tests.length}`)
console.log(`Failed: ${failed}/${tests.length}`)

if (failed > 0) {
  process.exit(1)
}
