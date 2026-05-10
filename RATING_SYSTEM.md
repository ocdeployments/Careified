# RATING_SYSTEM.md — Careified Rating System Specification
# Purpose: Post-placement rating system design
# Status: NOT BUILT — target Phase 3 (October 2026)
# Owner: Both

---

## 1. PURPOSE

The rating system captures both:
- **Professional:** did they do the job right?
- **Human:** did they treat the person with dignity?

These are NOT the same thing. Both matter enormously.

Reputations are **EARNED** through real work — not portable.
Careified makes earned reputations **VISIBLE**, **VERIFIABLE**, and **UNDENIABLE**.

---

## 2. THE FOUR SOURCES — WEIGHTED

| Source | Weight | Notes |
|--------|--------|-------|
| Caregiver (self) | Baseline — lowest | Structured fields, not free text |
| System (behavioural) | Medium | Passive signals — completeness, recency, response rate |
| Agency (employer) | High | Confirmed working relationship required before scoring |
| Platform admin | Highest | Verified against external standards |

**Key rule:** Max trust score from self-assessment alone: **4.0**. Max with agency validation: **5.0**. You cannot self-report your way to a perfect score.

---

## 3. THE SIX CATEGORIES

1. **Professional Reliability** (CRITICAL)
   - Punctuality, Reliability, Would re-engage, Professional conduct
   - "Would re-engage" is the single most powerful binary signal

2. **Human Qualities** (HIGH)
   - Warmth and friendliness, Dignity and respect, Patience, Emotional presence

3. **Personal Care and Hygiene** (HIGH)
   - Personal hygiene standards, Client hygiene and personal care, Environment and cleanliness

4. **Beyond the Call** (BONUS — elevates only)
   - Initiative, Emotional support, Family communication, Creative engagement, Problem solving

5. **Skills Match and Competency** (HIGH)
   - Specialty match, Medical awareness, Medication handling, Mobility and transfer safety

6. **Communication and Conduct** (MEDIUM)
   - Communication with agency, Communication with family, Boundaries and professionalism

---

## 4. SCORE CEILINGS

- **Self-assessment max:** 4.0
- **Agency validation max:** 5.0
- Self-report alone cannot reach 5.0 — agency confirmation required

---

## 5. DB SCHEMA

### Table: placement_reviews
```sql
CREATE TABLE placement_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  caregiver_id UUID NOT NULL REFERENCES caregivers(id),
  agency_id UUID NOT NULL REFERENCES agencies(id),
  client_id UUID REFERENCES clients(id),

  -- Who submitted
  reviewer_type VARCHAR(20) NOT NULL, -- caregiver, system, agency, admin
  reviewer_id UUID, -- FK to user/agency based on type

  -- Timing
  placement_start_date DATE NOT NULL,
  placement_end_date DATE,
  review_submitted_at TIMESTAMP DEFAULT NOW(),

  -- Scores (0-5 scale, 0.5 increments)
  professional_reliability_score DECIMAL(2,1),
  human_qualities_score DECIMAL(2,1),
  personal_care_hygiene_score DECIMAL(2,1),
  beyond_the_call_score DECIMAL(2,1),
  skills_match_score DECIMAL(2,1),
  communication_conduct_score DECIMAL(2,1),

  -- Binary
  would_reengage BOOLEAN,

  -- Qualitative (optional)
  positive_feedback TEXT,
  improvement_feedback TEXT,

  -- Status
  status VARCHAR(20) DEFAULT 'pending_review', -- pending_review, approved, disputed, archived

  -- Admin override (for admin source)
  admin_override_notes TEXT,

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Table: badges (existing structure expanded)
Add triggers for badge awards.

---

## 6. NON-RECOMMENDER COMPLIANCE

Ratings stay on the right side of liability:
- Always present scores as "as reported by [source]"
- Never "verified by Careified"
- Display as data, not endorsement
- Agency makes all hiring decisions — rating is one input

Required disclaimer on profile:
"This rating was submitted by [source]. Careified presents
ratings as reported and does not verify or endorse any caregiver."

---

## 7. BADGES

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

## 8. CAREGIVER PROTECTIONS

- **Minimum relationship threshold** — agency must confirm engagement dates
- **Statistical outlier protection** — auto-flagged for admin review
- **Aggregate visibility only** — caregivers see dimension scores in aggregate
- **Dispute path** — 14 days to flag unfair score before permanent publish
- **No public negative scores** — only positive signals publicly visible

---

## 9. PROFILE COMPLETION TIERS

| Tier | Score | Unlocks |
|------|-------|---------|
| Incomplete | < 40% | Not visible in search |
| Basic | 40–59% | Visible in search |
| Verified | 60–79% | Verified badge shown |
| Professional | 80–94% | Featured matching eligible |
| Elite | 95%+ | Top placement (requires agency validation) |

---

## 10. STATUS

NOT BUILT — target Phase 3 (October 2026)

Pre-launch:
- [ ] DB migration: create placement_reviews table
- [ ] DB migration: add badge trigger columns
- [ ] Design: rating input forms (caregiver self, agency)
- [ ] API: POST /api/reviews/submit
- [ ] API: GET /api/reviews/caregiver/:id
- [ ] UI: agency rating form post-placement
- [ ] UI: caregiver self-assessment
- [ ] Badge award logic
- [ ] Dispute workflow

---

Last updated: May 9 2026
Target build: Phase 3 (October 2026)