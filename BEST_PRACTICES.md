---
# BEST_PRACTICES.md
# Careified — Engineering & Product Best Practices
# Created: May 8 2026
# Rule: Read at START of every session
# Rule: Update when a new pattern is established
# Source: Derived from LESSONS_LEARNED.md — every entry here has a real failure behind it

---

## 1. CODE

### File Rewrites
- **ALWAYS** use bash heredoc for full file rewrites
- **NEVER** use str_replace or write_file for files over 200 lines
- str_replace is for targeted changes only — under 20 lines, unique string
- One file per commit — always, no exceptions

### TypeScript
- `npx tsc --noEmit` must pass before every commit — zero errors
- Never use `any` unless absolutely unavoidable — document why
- Server components by default — `'use client'` only when genuinely needed
- Prisma fields: camelCase. DB columns: snake_case. Never mix.

### Styling
- Inline styles only — no Tailwind classes (v4 prod failures on Vercel)
- Never introduce new CSS frameworks without explicit approval
- Design tokens: Navy #0D1B3E, Gold #C9973A/#E8B86D, Royal #1E3A8A
- Gold hex: always #C9973A — never #C9A84C (flagged as inconsistency)
- No emojis anywhere in UI — lucide-react only
- No green as primary colour — success states only

### Database
- Always snake_case for table and column names
- Never DROP, TRUNCATE, or DELETE without a backup first
- Never run migrations on production without testing locally first
- Backup before every migration: `pg_dump $DATABASE_URL > backup_$(date +%Y%m%d).sql`
- Never use pg Pool in middleware/proxy files — Edge Runtime incompatible
- No caregiver_security table — does not exist, never reference it
- Null means null — never impute defaults for missing data

### API Routes
- Auth check at the top of every protected route — no exceptions
- Never return raw DB errors to the client
- Rate limiting required on all registration + AI routes before launch
- Always validate input against an allowlist — never trust user-supplied field names
- UUID for all tokens — never sequential or predictable IDs

### Environment Variables
- **NEVER** set Vercel env vars via CLI — dashboard only (CLI adds \n)
- **NEVER** run `npx vercel --prod` — push to main, let Vercel auto-deploy
- After adding to Vercel dashboard, immediately add to .env.local
- Never commit .env files — .gitignore must cover all .env* variants
- Never paste API keys in chat — use terminal only

### Git
- One file per commit — non-negotiable
- `git diff --staged` before every commit — no blind commits
- `npx tsc --noEmit` before every commit
- Commit message format: `feat:` / `fix:` / `chore:` / `docs:` / `copy:`
- Never commit directly to main — use develop branch
- Never auto-push — push is always a manual human decision
- Safe revert point updated in HANDOFF.md and STATUS.md after every session

---

## 2. SECURITY

### Authentication
- Every new route: ask "should this require auth?" before writing code
- Protected routes: never add to publicRoutes in proxy.ts without explicit reason
- After adding any route, run auth audit: `npx tsx scripts/audit-auth.ts`
- Admin routes: ADMIN_CLERK_USER_ID check in layout.tsx — never skip
- Never trust role from client — always verify server-side

### Input Handling
- Never use dangerouslySetInnerHTML — use plain text or <pre> tags
- Sanitise all user input before storing or rendering
- Validate field names against allowlist before using in SQL queries
- File uploads: validate type AND size before processing

### Secrets & Keys
- Clerk dev keys (pk_test_) must be upgraded to production keys before launch
- PHI encryption key must be set before any health data is stored
- SSL cert (rejectUnauthorized: true) must be set before launch
- Rotate DB password after any suspected exposure

### Webhooks
- Always verify HMAC signatures on incoming webhooks (Vapi, Stripe)
- Never process webhook payload without signature verification
- Log all webhook events to audit_log table

---

## 3. UX & FORMS

### Form Validation
- Every field must show an inline error on blur — never silent rejection
- Required fields highlighted red on submit attempt
- Scroll to first error on submit
- Phone fields: always show format example, always show error on invalid
- Never disable a button without explaining why it's disabled

### User Feedback
- Every save action needs visual confirmation (toast, checkmark, colour change)
- Every destructive action needs a confirmation dialog
- Every async operation needs a loading state
- Every empty state needs a message and a CTA — never blank screen
- Every error needs a recovery path — never dead end

### Navigation
- Every page must have a reachability path (NAV / ACTION / DYNAMIC / SYSTEM)
- No true orphan pages — flag immediately if found
- Every CTA must route through auth if the destination requires it
- Never link directly to /profile/build — route through /sign-up first

### Copy
- Lead with pain, then solution — never feature lists
- Never use recommender language: "screens", "recommends", "best fit", "delivers"
- Always use alignment language: "criteria_aligned", "alignment_score"
- Non-recommender disclaimer on every profile page — non-negotiable
- All stats must come from verified sources (75% Activated Insights, 4 in 5 HCAOA, 9.7M PHI)
- Never fabricate statistics — cite source or remove

---

## 4. ARCHITECTURE

### Component Design
- Server components by default
- Client components only when state, events, or browser APIs are needed
- Never put DB queries in client components
- Reusable components go in components/ — never duplicate logic across pages
- Large files (>300 lines): consider splitting into sub-components

### Data Flow
- Three-layer save pattern: memory → localStorage → DB (profile builder)
- Never impute defaults for missing data — null means null
- Verification tiers applied consistently: Tier 1 (1.0) → Tier 4 (0.35)
- Non-recommender output: always include alignment_score + disclaimer

### Demo Mode
- Demo routes must use mock data only — never call authenticated APIs
- isDemo prop pattern: pass to components, switch to mock data when true
- Never write to DB in demo mode
- Demo gate: agency must sign up before accessing demo

### Locale
- All locale logic goes through lib/locale/config.ts
- Never hardcode CA/US strings in components
- NEXT_PUBLIC_LOCALE drives all locale decisions
- proxy.ts handles geo-redirect — never duplicate this logic

---

## 5. PROCESS

### Session Discipline
- Read ALL context files at session start before touching any code
- Read the actual file before writing any prompt about it — never assume contents
- Verify agent output via raw commands — never trust narrative summary
- Stop and wait after each commit — never chain multiple commits without confirmation
- No new packages without explicit approval

### Verification Pattern
After any change, verify via:
```bash
# Code change
npx tsc --noEmit

# DB change
node -e "const { Pool } = require('pg'); ..."

# Route change
grep -rn "href=" app/ components/ | grep "[new route]"

# Auth change
grep -n "publicRoutes" proxy.ts
```

### Agent Prompts (Claude Code via terminal)
- Always specify the exact file to read first
- Always specify bash heredoc for rewrites
- Always specify npx tsc --noEmit before commit
- Always specify git push after commit
- Always specify "Stop" at the end — one commit at a time
- Never write multi-file prompts

### Documentation
Every session must update:
1. CAREIFIED_STATUS.md — what was done
2. PRODUCTION_CHECKLIST.md — what was completed/added
3. CAREIFIED_SPEC.md — new pages, resolved issues
4. MASTER_DOCS.md — new decisions, security updates
5. LESSONS_LEARNED.md — at least one entry
6. BEST_PRACTICES.md — if new pattern established
7. CONTEXT.md — significant decisions only

---

## 6. LEGAL & COMPLIANCE

### Non-Recommender Rules (NON-NEGOTIABLE)
- Careified presents data — agencies make all decisions
- Never: "screens candidates", "recommends", "best fit", "delivers professionals"
- Always: "alignment score", "criteria match", "submitted data", "agency decides"
- Disclaimer on every profile page — cannot be removed
- All AI output labeled as "collected via automated screening"
- Third-party verification "as reported by [provider]" — never "verified by Careified"

### Consent
- Explicit, versioned, timestamped consent for all communication types
- TCPA (US): 8am-9pm local time — enforced in calling-hours.ts
- CRTC (Canada): 9am-9:30pm weekdays, 10am-6pm weekends — enforced
- Never call without consent gate — lib/airecruit/consent-gate.ts
- Age verification (18+) required at signup

### Data
- PHI must be encrypted at rest (AES-256-GCM) before launch
- Never store raw payment card data — Stripe handles PCI compliance
- PIPEDA: data export + delete available, 30-day SLA via ticketing system
- Lawyer must review lib/legal/text.ts before launch
- All consent text versioned — never edit without creating new version

---

## 7. DESIGN

### Visual Hierarchy
- Page headlines: DM Serif Display, 48px, navy
- Section headlines: DM Serif Display, 26px, navy
- Card titles: DM Serif Display, 20px, navy
- Body: DM Sans, 16px, navy or slate
- Labels/eyebrows: DM Sans, 11px, uppercase, gold, letter-spacing 0.12em

### Spacing
- Section padding: 80px mobile / 120px desktop
- Card padding: 24px mobile / 40px desktop
- Card border-radius: 16px standard / 12px compact
- Gap between cards: 16px standard / 24px featured

### Interaction
- Card hover: translateY(-2px) default, -4px featured only
- Gold glow on hover: box-shadow 0 8px 24px rgba(201,151,58,0.3)
- CTA gradient: linear-gradient(135deg, #C9973A, #E8B86D)
- Focus ring: 2px solid #C9973A on all interactive elements
- Transitions: 0.15s ease on all hover states

### Brand Consistency
- No competitors named — "general job boards" only
- No pricing figures until Stripe confirmed
- No medical-only framing — all care backgrounds
- Reputations EARNED — made VISIBLE by Careified
- "You don't need another app" — caregiver messaging
- "Recruit without the legwork" — agency messaging

---

## 8. PERFORMANCE (pre-launch checklist)

- [ ] Leaflet lazy loaded — only on location pages
- [ ] Image optimization pipeline for caregiver photos
- [ ] Match ranking API caching strategy
- [ ] Pagination on /agency/search (currently loads all records)
- [ ] Bundle size audit before launch
- [ ] Remove all console.log before launch
- [ ] Dead code removal pass

---
_Update this file when a new pattern is established.
Every rule here has a real failure behind it — respect them._