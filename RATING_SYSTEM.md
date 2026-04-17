# RATING_SYSTEM.md — Careified

> The complete caregiver reputation and rating architecture.
> Read this file whenever building anything related to:
> caregiver profiles · agency reviews · trust scores · badges
> Last updated: April 2026 — Session 6F

---

## Core Philosophy

Reputations are **EARNED** through real work — not portable.
Careified makes earned reputations **VISIBLE**, **VERIFIABLE** and **UNDENIABLE**.

The rating system captures both:

- **Professional:** did they do the job right?
- **Human:** did they treat the person with dignity?

These are NOT the same thing. Both matter enormously.

- Max trust score from self-assessment alone: **4.0**
- Max trust score with agency validation: **5.0**
- You cannot self-report your way to a perfect score.

---

## Four Sources — Weighted by Credibility

| Source | Weight | Notes |
|--------|--------|-------|
| Caregiver (self) | Baseline — lowest | Structured fields, not free text |
| System (behavioural) | Medium | Passive signals — completeness, recency, response rate |
| Agency (employer) | High | Confirmed working relationship required before scoring |
| Platform admin | Highest | Verified against external standards |

**Agency credibility weighting:** A long-standing verified agency's score carries more weight than a brand new account's first score.

---

## Six Rating Categories

### Category 1 — Professional Reliability (Weight: CRITICAL)

| Dimension | Scored by | Type |
|----------|-----------|------|
| Punctuality | Agency | 1–5 scale |
| Reliability | Agency | 1–5 scale |
| Would re-engage | Agency | Yes / No |
| Professional conduct | Agency | 1–5 scale |

**"Would re-engage"** is the single most powerful binary signal.

### Category 2 — Human Qualities (Weight: HIGH)

| Dimension | Scored by | Type |
|----------|-----------|------|
| Warmth and friendliness | Agency + Family | 1–5 scale |
| Dignity and respect | Agency + Family | 1–5 scale |
| Patience | Agency + Family | 1–5 scale |
| Emotional presence | Family only | 1–5 scale |

### Category 3 — Personal Care and Hygiene (Weight: HIGH)

| Dimension | Scored by | Type |
|----------|-----------|------|
| Personal hygiene standards | Agency + Family | 1–5 scale |
| Client hygiene and personal care | Family only | 1–5 scale |
| Environment and cleanliness | Family only | 1–5 scale |
| Infection control awareness | Agency only | 1–5 scale |

### Category 4 — Beyond the Call (Weight: BONUS — elevates only)

| Dimension | Scored by | Type |
|----------|-----------|------|
| Initiative | Agency + Family | Yes / No |
| Emotional support | Family only | Yes / No |
| Family communication | Agency + Family | Yes / No |
| Creative engagement | Agency + Family | Yes / No |
| Problem solving | Agency + Family | Yes / No |
| Continuity of care | Agency + Family | Yes / No |
| Beyond the call — other | Agency + Family | Free text |

### Category 5 — Skills Match and Competency (Weight: HIGH)

| Dimension | Scored by | Type |
|----------|-----------|------|
| Specialty match | Agency only | 1–5 scale |
| Medical awareness | Agency only | 1–5 scale |
| Medication handling | Agency only | 1–5 scale |
| Mobility and transfer safety | Agency only | 1–5 scale |

Validates self-reported profile data. Did stated specialties reflect real competency?

### Category 6 — Communication and Conduct (Weight: MEDIUM)

| Dimension | Scored by | Type |
|----------|-----------|------|
| Communication with agency | Agency only | 1–5 scale |
| Communication with family | Family only | 1–5 scale |
| Boundaries and professionalism | Agency only | 1–5 scale |
| Cultural sensitivity | Agency + Family | 1–5 scale |

---

## Full Weighted Scoring Model

| Dimension | Weight |
|----------|--------|
| Would re-engage | 5x |
| Reliability | 5x |
| Dignity and respect | 4x |
| Specialty match | 4x |
| Punctuality | 4x |
| Warmth and friendliness | 3x |
| Hygiene — personal | 3x |
| Hygiene — client care | 3x |
| Communication — agency | 3x |
| Patience | 3x |
| Cultural sensitivity | 2x |
| Communication — family | 2x |
| Initiative | Bonus |
| Emotional support | Bonus |
| Beyond the call — other | Bonus |

---

## Personality Assessment Integration (Session 9)

### Self-Assessment (Forced Choice — 7 Questions)

Each question presents a real caregiving scenario.
Two options — both sound reasonable, neither is obviously correct.

Answer maps to style label + base score:

| Answer type | Base score | Style label |
|------------|------------|-------------|
| Natural/intrinsic | 4.0 | Natural [trait] |
| Effort-based/professional | 3.0 | Developing [trait] |

**Traits assessed:**

1. Patience — dementia repetition scenario
2. Empathy — family emotional subtext scenario
3. Adaptability — unexpected care plan change scenario
4. Communication — end-of-shift observation scenario
5. Emotional Regulation — angry family member scenario
6. Problem Solving — medication refusal scenario
7. Resilience — client death/grief scenario

### Agency Validation (Post-Placement)

After 30+ days placement, agency answers per trait:

- Matches exactly → no score change
- Undersold themselves → +0.5 per agency
- Oversold themselves → -0.5 per agency
- Significantly undersold → +1.0
- Significantly oversold → -1.0 + admin flag

### Honesty Scoring

| Pattern | Result |
|---------|--------|
| Consistent match (3+ agencies) | Self-Aware badge |
| Consistent underselling | Humble Professional badge |
| Consistent overselling | Trust score suppressed, admin flag |

---

## JSONB Schema — personality_profile column

```json
{
  "soft_skills": {
    "patience": {
      "style": "natural_acceptance",
      "style_label": "Natural acceptance — at ease with repetition",
      "self_score": 4.0,
      "agency_scores": [4.0, 4.5],
      "agency_count": 2,
      "validated_score": 4.3,
      "display_score": 4.3
    }
  },
  "working_style": {
    "autonomy": "independent",
    "pace": "steady_routine",
    "social_energy": "ambivert",
    "conflict_style": "collaborative"
  },
  "strengths": ["patience", "warmth", "reliability", "compassion", "attentiveness"],
  "care_philosophy": {
    "motivation": "...",
    "brings_joy": "..."
  },
  "ideal_match": {
    "excels_with": ["dementia_care", "long_term_companionship"],
    "client_personalities": ["talkative", "warm_affectionate"],
    "avoid_situations": ["aggressive_behaviour", "smoking_environments"]
  },
  "growth_areas": ["advanced_dementia", "cultural_competency"],
  "honesty_score": {
    "assessment_count": 2,
    "average_delta": 0.25,
    "status": "honest",
    "badge_earned": "self_aware"
  }
}
```

---

## Recognition Badges

Earned — not scored. Appear visibly on profile.

| Badge | Trigger condition |
|-------|------------------|
| Consistently Reliable | 5x would re-engage across 3+ agencies |
| Exceptionally Caring | Top dignity + warmth scores from families |
| Above and Beyond | 3+ agencies noted initiative |
| Dementia Specialist | Specialty confirmed by 2+ agencies |
| Family Favourite | Top scores from family feedback |
| Trusted Veteran | 3+ years on platform, consistently high |
| Culturally Aware | Cultural sensitivity noted by multiple sources |
| Quick Response | Consistently high availability update rate |
| Highly Communicative | Top communication scores across agency + family |
| Self-Aware | Personality self-assessment consistently validated |
| Humble Professional | Consistently undersells — agencies always rate higher |

---

## Caregiver Protections

- **Minimum relationship threshold** — agency must confirm engagement dates
- **Statistical outlier protection** — auto-flagged for admin review
- **Aggregate visibility only** — caregivers see dimension scores in aggregate
- **Dispute path** — 14 days to flag unfair score before permanent publish
- **No public negative scores** — only positive signals publicly visible
- **Recency weighting** — scores older than 2 years decay gradually
- **Source credibility weighting** — new agencies weighted lower

---

## What Caregivers See vs What Agencies See

| Data point | Caregiver | Agency |
|------------|-----------|--------|
| Overall trust score | ✓ | ✓ |
| Dimension scores (aggregate) | ✓ | ✓ |
| Which agency gave which score | ✗ | ✗ |
| Earned badges | ✓ | ✓ |
| Personality style labels | ✓ | ✓ |
| Personality score bars | ✓ | ✓ |
| Dispute status | ✓ | ✗ |
| Recency decay status | ✓ | ✗ |

---

## Agency Rating Form Flow (Session 10)

1. Agency confirms engagement dates (required before form unlocks)
2. **Step 1:** Professional reliability dimensions
3. **Step 2:** Human qualities
4. **Step 3:** Hygiene and personal care
5. **Step 4:** Skills match
6. **Step 5:** Communication and conduct
7. **Step 6:** Beyond the call (binary yes/no + optional free text)
8. **Step 7:** "Would re-engage" (prominent, binary, required)
9. **Step 8:** Personality validation (one question per trait)
10. **Step 9:** Review text (optional, 50–500 words)

**After submission:**

- Admin spot-check queue (10% of reviews)
- Statistical outlier check
- Score recalculates immediately
- Caregiver notified (aggregate only — agency not identified)
- 14 days dispute window

---

## Trust Score Calculation

1. Collect all dimension scores from verified sources
2. Apply source credibility weighting (admin > agency > system > self)
3. Apply dimension weight multipliers
4. Apply recency decay to scores > 2 years old
5. Flag and down-weight statistical outliers
6. Add bonus points for Beyond the Call dimensions
7. Normalise to 0–5.0 scale
8. Check badge thresholds and award
9. Store in `caregivers.aggregate_score` column

### Personality Score

1. Self-assessment sets base score (4.0 or 3.0)
2. Agency validation adjusts per agency
3. Cap at 5.0 (requires agency validation)
4. Store in `personality_profile` JSONB

### Update triggers

- New agency review submitted
- Monthly recency decay batch job
- Admin manual recalculation

---

## Profile Completeness Tiers

| Tier | Score | Unlocks |
|------|-------|---------|
| Incomplete | < 40% | Not visible in search |
| Basic | 40–59% | Visible in search |
| Verified | 60–79% | Verified badge shown |
| Professional | 80–94% | Featured matching eligible |
| Elite | 95%+ | Top placement (requires agency validation) |

**Current max achievable:** 85% (personality 15% reserved)

---

## This file is the authoritative spec for all rating and scoring features.

Do not build any profile, review, or scoring feature without reading this first.

---

## Last updated

April 2026 — Careified Session 6F
