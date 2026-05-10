# ARCHITECTURE.md — Careified Platform Layers
# Four-layer architecture for scaling the care economy
# Last updated: May 9 2026

---

## LAYER OVERVIEW

```
┌─────────────────────────────────────────────────────┐
│                  LAYER 4: COMMUNITY                 │
│          Network effects & social layer            │
├─────────────────────────────────────────────────────┤
│                 LAYER 3: INTELLIGENCE               │
│              AI-powered automation                  │
├─────────────────────────────────────────────────────┤
│                 LAYER 2: OPERATIONS                  │
│            Daily workflow & tools                  │
├─────────────────────────────────────────────────────┤
│                LAYER 1: REPUTATION                   │
│           Trust infrastructure (BASE)              │
└─────────────────────────────────────────────────────┘
```

---

## LAYER 1 — REPUTATION

**Purpose:** Trust infrastructure. The foundation everything else builds on.

### Components
- **Verified profiles** — Identity verification, background checks
- **Credentials** — Certifications, training, VSC tracking
- **References** — Reference verification (Tier 3+)
- **Trust score** — Aggregate score from placements, verifications, references
- **Badges** — Verification badges, completion badges, specialty badges

### Why first
No agency will pay for caregiver profiles that aren't verified.
No family will trust a caregiver without credentials.
Reputation is the moat — it's what Careified sells.

### Current state
- ✅ Profile builder (Steps 0-10)
- ✅ Credential tracking (Step 5)
- ✅ Reference form (Step 9)
- ❌ Verification tiers (Tier 1-3)
- ❌ Background check integration
- ❌ Trust score algorithm exposed

---

## LAYER 2 — OPERATIONS

**Purpose:** Daily workflow. What agencies and caregivers do every day.

### Components
- **Agency Roster** — Import existing caregivers, claim flows, bulk management
- **QuickFill** — AI dispatch system for urgent shifts
- **Scheduling** — Shift management, calendar, availability
- **Family portal** — Read-only view for families (schedule, notes, caregiver card)
- **Client matching** — Align caregiver to client needs

### Why second
Once you have verified caregivers, you need to manage them.
Operations turn "here's a caregiver" into "here's today's shift."

### Current state
- ✅ Client matching (demo)
- ❌ Agency Roster (import flow)
- ❌ QuickFill dispatch system
- ❌ Scheduling/calendar
- ❌ Family portal

---

## LAYER 3 — INTELLIGENCE

**Purpose:** AI layer. Automation that scales operations.

### Components
- **AIRecruit** — Outbound screening calls (Phase 1)
- **WhatsApp assistant** — Natural language interface for agencies & caregivers
- **Retention AI** — At-risk detection, engagement triggers
- **Reference calls** — Automated reference verification calls
- **Smart matching** — AI-enhanced matching beyond rules

### Why third
Intelligence automates what operations can't scale.
One recruiter can manage 50 candidates with AI.
Without AI, you're just building a bigger spreadsheet.

### Current state
- ✅ AIRecruit screening (outbound calls)
- ❌ WhatsApp assistant
- ❌ Retention AI
- ❌ Reference calls (Session B)
- ❌ Smart matching

---

## LAYER 4 — COMMUNITY

**Purpose:** Network effects. Where the platform becomes self-sustaining.

### Components
- **Follow** — Follow agencies, caregivers, families
- **Connect** — Direct messaging between users
- **Feed** — Activity feed (placements, verifications, badges)
- **Rank** — Leaderboards, reputation rankings
- **Badges** — Achievement system, earned through platform activity
- **Referrals** — Viral growth loops (caregiver invites caregiver)

### Why fourth
Community creates defensibility.
More caregivers → more agencies → more caregivers.
The network effect is the final moat.

### Current state
- ❌ Follow system
- ❌ Connect/messaging
- ❌ Activity feed
- ❌ Leaderboards
- ❌ Badge system
- ❌ Referral loops

---

## BUILD ORDER

```
Phase 1 (Launch): Layer 1 + 3 (partial)
  - Verified profiles
  - AIRecruit screening
  
Phase 2 (Growth): Layer 2
  - Agency Roster
  - QuickFill
  - Family portal
  
Phase 3 (Scale): Layer 3 (full) + Layer 4 (partial)
  - WhatsApp assistant
  - Retention AI
  - Community features
```

---

## DEPENDENCIES

| Layer | Depends on |
|-------|------------|
| L1 (Reputation) | Nothing — base layer |
| L2 (Operations) | L1 — needs verified caregivers |
| L3 (Intelligence) | L1 + L2 — needs data + workflow |
| L4 (Community) | L1 + L2 + L3 — needs scale |

---

## KEY DECISIONS

1. **Never launch Layer 2 without Layer 1** — Unverified caregivers = no trust = no payment
2. **Layer 3 enables Layer 2 scale** — QuickFill without AI is just a form
3. **Layer 4 requires critical mass** — Don't build community before 1000+ caregivers

---

Last updated: May 9 2026