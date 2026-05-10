---
# LESSONS_LEARNED.md
# Purpose: Institutional memory — every mistake made and what we learned
# Updated: May 9 2026
# Update trigger: Every session — minimum 1 entry
# Owner: Both
# DO NOT DUPLICATE: Best practices (BEST_PRACTICES.md), rules (CLAUDE.md)

---

## HOW TO ADD AN ENTRY

At end of every session, paste this prompt to Claude:
> "Add to LESSONS_LEARNED.md: [what happened] — [what to do instead]"

Categories: CODE | UX | SECURITY | PROCESS | COPY | ARCHITECTURE | TOOLING | LEGAL

---

## LOG

### May 8 2026

**CODE — Duplicate merges on large files**
What happened: Cline str_replace and write_file caused duplicate content merges on files over 200 lines. Multiple debugging sessions lost.
Do instead: Always use bash heredoc (cat > file << 'EOF') for full file rewrites. str_replace only for targeted single changes under 20 lines.

**CODE — Case-sensitive filesystem broke production**
What happened: Logo filename was Carefied-logo.png (missing 'i') — worked locally on Mac (case-insensitive) but broke on Vercel (case-sensitive Linux).
Do instead: Always verify exact filenames including case before committing. grep for the filename in code before pushing.

**CODE — Tailwind v4 breaks on Vercel**
What happened: Tailwind v4 production build failures on Vercel caused multiple rollbacks early in development.
Do instead: Inline styles only. Never introduce Tailwind classes. This is permanent.

**CODE — pg Pool in middleware.ts crashes**
What happened: Using pg Pool in middleware.ts caused Edge Runtime incompatibility — crashed the entire app.
Do instead: Never use pg Pool in middleware files. Use only in API routes and server components. Renamed to proxy.ts to avoid confusion.

**CODE — /profile/build in public routes**
What happened: /profile/build was added to publicRoutes in proxy.ts — allowed unauthenticated access to the profile builder. Discovered manually by clicking links.
Do instead: Every new protected route must be explicitly removed from publicRoutes. Run auth audit script at end of every session.

**SECURITY — ADMIN_CLERK_USER_ID not set locally**
What happened: Admin pages appeared protected in code but env var was missing from .env.local — anyone could access /admin in development.
Do instead: After adding any new env var to Vercel dashboard, immediately add to .env.local. Run env var audit at session start.

**SECURITY — dangerouslySetInnerHTML left in production code**
What happened: dangerouslySetInnerHTML used in admin/caregivers/page.tsx line 217 — XSS vulnerability present for multiple sessions.
Do instead: Never use dangerouslySetInnerHTML. Use plain text rendering or <pre> tags. Security regression check catches this at session end.

**PROCESS — Agent completion cannot be trusted**
What happened: Build agent reported tasks complete that weren't. Code changes described in summary didn't match actual file contents.
Do instead: Always verify via raw command output — git log --oneline, grep results, cat file. Never trust agent narrative summary alone.

**PROCESS — Multi-file prompts cause compound errors**
What happened: Prompting agent to change multiple files in one commit made it impossible to identify which file caused a bug.
Do instead: One file per commit. Always. Non-negotiable.

**PROCESS — Not running Playwright consistently**
What happened: Playwright E2E tests configured and working but never run consistently — broken links and auth gaps slipped through to be discovered manually.
Do instead: Run Playwright at end of every session as mandatory step. No exceptions.

**PROCESS — QA gaps discovered by manual clicking**
What happened: /profile/build bypassed auth, /for-caregivers CTA went directly to form — discovered by manually clicking links, not automated testing.
Do instead: Auth audit script + link audit script run at every session end. Build QA automation session before adding more features.

**UX — Phone field silently rejects invalid numbers**
What happened: Agency signup phone field showed no error on invalid input — user had no feedback, form appeared broken.
Do instead: Always show inline errors on blur for all form fields. Never silent rejection. UX debt tracked in PRODUCTION_CHECKLIST.md.

**UX — Email collected redundantly before Clerk signup**
What happened: /profile/start collected email + phone before Clerk signup — data never used, Clerk collected it again anyway.
Do instead: Don't collect data that Clerk will collect during auth. Gate with age confirmation only. Let Clerk handle identity fields.

**UX — Separate sign-in and sign-up pages caused confusion**
What happened: Two separate auth pages with different styling and different field configurations. Users directed to wrong page by different CTAs.
Do instead: Single auth entry point. Clerk handles new vs existing users inline. One page, one flow.

**COPY — Non-recommender language violations**
What happened: Agency card copy contained "screens candidates" and "delivers interview-ready professionals" — implies Careified vouches for caregivers, creating liability.
Do instead: All copy must use alignment_score, criteria_aligned language. Never imply Careified certifies or recommends anyone. Flag for lawyer review.

**COPY — Weak value proposition messaging**
What happened: "Your name. Your credentials. Your working style. Your trust score. All verified. All in one place." — flat feature list, not a value statement.
Do instead: Lead with the pain (every agency move resets everything), then the solution. Test copy against: does this speak to the specific frustration?

**COPY — "Matching Engine" is generic**
What happened: Used "Matching Engine" throughout — forgettable, sounds like every other SaaS tool.
Do instead: "Careified Engine" — ownable, branded, reinforces platform name. Apply consistently everywhere.

**ARCHITECTURE — Demo search called authenticated API**
What happened: /demo/search called /api/match/rank which requires Clerk auth — returned 401 for all demo users.
Do instead: Demo routes must use mock data only. Never call authenticated APIs from public demo pages. isDemo prop pattern established.

**ARCHITECTURE — LiveProfilePreview deferred too long**
What happened: LiveProfilePreview was the most important caregiver-facing feature but was deferred for multiple sessions — ghost profile was confusing without it.
Do instead: Build the most user-visible features first. Don't defer what the user sees first.

**LEGAL — Gold hex inconsistency**
What happened: #C9A84C and #C9973A used interchangeably across files — brand inconsistency flagged 3+ times, still unresolved.
Do instead: Design tokens session needed. Single source of truth for all colour values. Grep before using any hex value.

**TOOLING — Vercel env vars via CLI add newline characters**
What happened: Setting env vars via CLI (vercel env add) appended \n to values — broke Clerk auth in production silently.
Do instead: NEVER set Vercel env vars via CLI. Dashboard only. Non-negotiable.

**TOOLING — Never npx vercel --prod**
What happened: Direct Vercel CLI deploys bypass GitHub integration and can push untested code directly to production.
Do instead: Always push to main branch — Vercel auto-deploys. Never run npx vercel --prod.

---

### May 9 2026

**PROCESS — Documentation drift across files**
What happened: Docs accumulated contradictions over multiple sessions. PRICING/CLAUDE/CONTEXT disagreed on pricing visibility. MASTER_DOCS.md and HANDOFF.md were referenced but didn't exist. PHI encryption was mis-categorised. Locale migration had no backfill plan. Email provider was missing entirely. Demo data hygiene wasn't planned.
Do instead: At end of every session, run grep against all .md files for the topic touched that day. If two files mention the same fact, verify they say the same thing. DOC_INDEX.md is now the source-of-truth map — consult before adding new content to any doc.

**ARCHITECTURE — Vapi/Twilio provider confusion + missing CA DID**
What happened: Docs described AIRecruit phone as "US Twilio" and stated "we already have Twilio via Vapi." Both inaccurate. Vapi abstracts Twilio internally but Careified has no direct Twilio access. Created false assumption that Phase 2 SMS/WhatsApp would reuse the Vapi Twilio account. Separately, no CA DID was provisioned despite Canada-first launch — Ontario PSWs would receive calls from a US number, killing pickup rate.
Do instead: When integrating any orchestration layer (Vapi, similar), explicitly document what is OWNED vs what is ABSTRACTED. Twilio under Vapi = abstracted (not Careified's). Twilio for SMS = will be owned (Careified opens own account Phase 2). Geography-first launches require geography-specific phone numbers from Day 1. Pickup rate is a launch metric — protect it.

---

## PATTERNS TO WATCH

These mistakes happen repeatedly — extra vigilance needed:

1. **Auth gaps** — new routes added without checking proxy.ts publicRoutes
2. **Silent failures** — form fields that reject input without showing errors
3. **Agent trust** — accepting agent summary without verifying raw output
4. **Copy liability** — recommender language slipping into UI copy
5. **Env var drift** — new vars added to Vercel but not .env.local or vice versa
6. **One file rule** — temptation to batch multiple files in one commit

---
_Add new entries at the end of every session. Never delete old entries._