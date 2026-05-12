# LESSONS_LEARNED.md — Institutional memory
Updated: May 11 2026 | Owner: Both | See BEST_PRACTICES.md, CLAUDE.md

## LOG

### May 8 2026
**CODE — Duplicate merges on large files** → Use bash heredoc. See BEST_PRACTICES.md.
**CODE — Case-sensitive filesystem broke production** → Verify exact filenames. See CLAUDE.md §3.
**CODE — Tailwind v4 breaks on Vercel** → Inline styles only. See CLAUDE.md §7.
**CODE — pg Pool in middleware.ts crashes** → Never in middleware. See CLAUDE.md §3.
**CODE — /profile/build in public routes** → Remove from publicRoutes. See CLAUDE.md §12.
**SECURITY — ADMIN_CLERK_USER_ID not set locally** → Add to .env.local. See CLAUDE.md §12.
**SECURITY — dangerouslySetInnerHTML in production** → Never use it. See CLAUDE.md §30.
**PROCESS — Agent completion cannot be trusted** → Verify via raw output. See BEST_PRACTICES.md.
**PROCESS — Multi-file prompts cause compound errors** → One file per commit. See CLAUDE.md §5.
**PROCESS — Not running Playwright consistently** → Run at session end. See CLAUDE.md §13.
**PROCESS — QA gaps discovered manually** → Run auth + link audits. See CLAUDE.md §13.
**UX — Phone field silently rejects invalid numbers** → Show inline errors. See BEST_PRACTICES.md.
**UX — Email collected redundantly before Clerk** → Let Clerk handle. See BEST_PRACTICES.md.
**UX — Separate sign-in and sign-up pages** → Single auth entry. See CONTEXT.md §18.
**COPY — Non-recommender language violations** → Use alignment_score. See CLAUDE.md §11.
**COPY — Weak value proposition** → Lead with pain. See BEST_PRACTICES.md.
**COPY — "Matching Engine" generic** → Use "Careified Engine". See FOUNDER.md.
**ARCHITECTURE — Demo search called authenticated API** → Use mock data. See CLAUDE.md §15.
**ARCHITECTURE — LiveProfilePreview deferred** → Build user-visible first. See BEST_PRACTICES.md.
**LEGAL — Gold hex inconsistency** → Single design token source. See CLAUDE.md §8.
**TOOLING — Vercel env vars via CLI break** → Dashboard only. See CLAUDE.md §9.
**TOOLING — Never npx vercel --prod** → Push to main branch. See CLAUDE.md §16.

### May 9 2026
**PROCESS — Documentation drift** → Run grep on .md files. See DOC_INDEX.md.
**ARCHITECTURE — Vapi/Twilio confusion** → Document OWNED vs ABSTRACTED. See CLAUDE.md §14.

### May 10 2026 — Autonomous build mode
First autonomous session. Faster execution, no approval delays. One file per commit maintained. TypeScript check non-negotiable.
Rule confirmed: Autonomous fine for building. Never for: pushing, DB destructive ops, deleting large features.

### May 11 2026
**TOOLING — Clerk 7 auth() throws NEXT_REDIRECT in API routes** → auth() returns null in pages but throws NEXT_REDIRECT in API routes when no session. Wrap in try/catch → return 403. See app/api/roster/add/route.ts for pattern.

## PATTERNS TO WATCH
1. Auth gaps — check proxy.ts publicRoutes
2. Silent failures — show inline errors
3. Agent trust — verify raw output
4. Copy liability — avoid recommender language
5. Env var drift — sync Vercel and .env.local
6. One file rule — never batch commits
