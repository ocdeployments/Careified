# DOC_INDEX.md — Careified Documentation Index
# Purpose: Single navigation hub — which doc owns which topic
# Updated: May 9 2026
# Owner: Both

---

## 1. PURPOSE

Single map of which doc owns which topic.
Prevents contradictions and clarifies source of truth.

---

## 2. SOURCE OF TRUTH TABLE

| Topic | Owner Doc | Other docs may reference but not redefine |
|-------|-----------|--------------------------------------------|
| Pricing | PRICING.md | (everywhere else: link only) |
| Verified stats | COPY.md | (everywhere else: link only) |
| Build status | CAREIFIED_STATUS.md | |
| Page specs | CAREIFIED_SPEC.md | |
| Roadmap / phases | ROADMAP.md | |
| Launch blockers | PRODUCTION_CHECKLIST.md | |
| Tech rules | CLAUDE.md | |
| Engineering standards | BEST_PRACTICES.md | |
| Identity / lenses | SOUL.md | |
| Vision | FOUNDER.md | |
| Decisions log | CONTEXT.md | |
| Lessons | LESSONS_LEARNED.md | |
| AI flows | AI_PLAYBOOK.md | |
| Integrations | INTEGRATIONS.md | |
| Architecture | ARCHITECTURE.md | |
| Security | SECURITY_RUNBOOK.md | |
| User journeys | USER_JOURNEYS.md | |
| Copy | COPY.md | |
| Agency Roster | AGENCY_ROSTER_SPEC.md | |
| Rating system | RATING_SYSTEM.md | |
| Client intake | CLIENT_INTAKE.md | |
# ACCESSIBILITY.md — planned, not yet written

---

## 3. SESSION READ ORDER (Priority)

At session start, read in this order:

1. **SOUL.md** — Identity, lenses, limits (read first always)
2. **CONTEXT.md** — Decisions made and why
3. **CLAUDE.md** — Technical rules and conventions
4. **BEST_PRACTICES.md** — Engineering standards
5. **CAREIFIED_SPEC.md** — Expected page behaviour
6. **CAREIFIED_STATUS.md** — Current build state
7. **PRODUCTION_CHECKLIST.md** — Launch blockers
8. Then: other docs as needed

---

## 4. CONFLICT RESOLUTION

If two docs disagree on the same topic:
- Owner doc wins
- If owner doc is silent on the topic → raise to Romy

---

## 5. QUICK REFERENCE

| Question | Answer |
|----------|--------|
| What's built? | CAREIFIED_STATUS.md |
| What's not built? | PRODUCTION_CHECKLIST.md |
| Page specs? | CAREIFIED_SPEC.md |
| Launch blockers? | PRODUCTION_CHECKLIST.md |
| Pricing? | PRICING.md |
| Rules? | CLAUDE.md + BEST_PRACTICES.md |
| Copy guidelines? | COPY.md |
| Roadmap? | ROADMAP.md |
| Security? | SECURITY_RUNBOOK.md |
| User flows? | USER_JOURNEYS.md |

---

## 6. FILE INVENTORY

Total: 21 .md files
```
AI_PLAYBOOK.md          ARCHITECTURE.md        BEST_PRACTICES.md
CAREIFIED_SPEC.md       CAREIFIED_STATUS.md   CLAUDE.md
CLIENT_INTAKE.md        CONTEXT.md            COPY.md
FOUNDER.md              INTEGRATIONS.md       LESSONS_LEARNED.md
PRICING.md             PRODUCTION_CHECKLIST.md ROADMAP.md
SECURITY_RUNBOOK.md    SOUL.md                USER_JOURNEYS.md
AGENCY_ROSTER_SPEC.md RATING_SYSTEM.md       DOC_INDEX.md (this file)
```

---

Last updated: May 9 2026