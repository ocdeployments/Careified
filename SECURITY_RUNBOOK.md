# SECURITY_RUNBOOK.md — Careified Security Procedures
# Purpose: Security procedures, incident response, and compliance requirements
# Updated: May 9 2026
# Update trigger: When security fixes are applied or new vulnerabilities found
# Owner: Both
# DO NOT DUPLICATE: Specs (CAREIFIED_SPEC.md), status (CAREIFIED_STATUS.md)

---

## CURRENT SECURITY STATUS

### Fixed ✅
- Admin auth enforced (ADMIN_CLERK_USER_ID) — May 9
- Vapi webhook HMAC verification — May 9
- SQL injection fix lib/db.ts lines 56-68 — May 9
- dangerouslySetInnerHTML removed — May 9
- Reference tokens now UUID — May 9
- Rate limiting on all API routes — May 9
- SSL cert Render DB conditional fix — May 9

### Still Open ❌
- Clerk production keys (pk_test_ → pk_live_)
- PHI encryption not live (columns plain text)
- Gold hex inconsistency (not security but design debt)
- NEXT_PUBLIC_LOCALE missing from Vercel
- Penetration test not commissioned
- Incident response not tested
- OWASP full audit not complete

---

## OWASP TOP 10 STATUS

| # | Vulnerability | Status | Notes |
|---|--------------|--------|-------|
| 1 | Injection (SQL) | ✅ Fixed | Allowlist in lib/db.ts |
| 2 | Broken Authentication | 🔧 Partial | Clerk handles auth, admin fixed |
| 3 | Sensitive Data Exposure | ❌ Open | PHI not encrypted yet |
| 4 | XML External Entities | ✅ N/A | Not using XML |
| 5 | Broken Access Control | 🔧 Partial | Agency/admin fixed, audit needed |
| 6 | Security Misconfiguration | 🔧 Partial | SSL fixed, Clerk keys pending |
| 7 | Cross-Site Scripting | ✅ Fixed | dangerouslySetInnerHTML removed |
| 8 | Insecure Deserialization | 🔍 Verify | Check JSON.parse usage |
| 9 | Known Vulnerabilities | ❌ Audit | npm audit needed |
| 10 | Insufficient Logging | 🔧 Partial | audit_log exists, gaps remain |

---

## PRE-LAUNCH SECURITY CHECKLIST

### Must fix before June 15
- [ ] Clerk production keys upgraded
- [ ] npm audit run — all critical CVEs resolved
- [ ] PHI encryption live before any real health data stored
- [ ] Agency row-level security audit complete
- [ ] Caregiver cannot access another caregiver's data
- [ ] File upload validation (type + size + content)
- [ ] No API keys in client bundle
- [ ] All NEXT_PUBLIC_ vars audited for secrets
- [ ] Webhook signatures verified on all incoming webhooks
- [ ] Rate limiting tested under load

### Should fix before June 15
- [ ] 404 vs 403 — protected pages return 403 not 404
- [ ] Session timeout configured in Clerk
- [ ] Admin IP allowlist (optional but recommended)
- [ ] Security headers configured (CSP, HSTS, X-Frame)

### Post-launch (within 30 days)
- [ ] Penetration test commissioned
- [ ] Bug bounty program set up
- [ ] Quarterly security review scheduled
- [ ] Cyber insurance active

---

## SECURITY HEADERS

Add to next.config.ts before launch:

```javascript
headers: [
  {
    key: 'X-Frame-Options',
    value: 'DENY'
  },
  {
    key: 'X-Content-Type-Options', 
    value: 'nosniff'
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin'
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=()'
  }
]
```

---

## RATE LIMITING — CURRENT STATE

### Built (May 9 2026)
File: lib/rateLimit.ts
In-memory rate limiter — resets on server restart.

### Applied to:
- /api/airecruit/webhook ✅
- /api/references/invite ✅
- /api/auth/send-phone-otp ✅

### Still needs rate limiting:
- /api/profile/save-field (prevent spam saves)
- /api/match/rank (expensive operation)
- /api/profile/parse-resume (LLM cost protection)
- /api/auth/* all routes

### Pre-launch upgrade:
In-memory limiter is not persistent across 
serverless function instances.
Before launch: upgrade to Redis-based rate limiting.
Options: Upstash Redis (free tier available)

---

## AUTHENTICATION AUDIT

### Protected routes (Clerk auth required)
- /profile/build ✅
- /profile/strength ✅
- /opportunities ✅
- /settings/* ✅
- /agency/* ✅ (agency role + approved status)
- /admin/* ✅ (ADMIN_CLERK_USER_ID match)

### Public routes (no auth required)
- / ✅
- /for-caregivers ✅
- /for-agencies ✅
- /for-families ✅
- /about ✅
- /contact ✅
- /privacy ✅
- /terms ✅
- /sign-in ✅
- /sign-up ✅
- /verify/[slug] ✅ (intentionally public)
- /reference/[token] ✅ (intentionally public)
- /demo/* ✅ (intentionally public — gated by signup CTA)

### Audit questions (run before launch)
- Can unauthenticated user hit /agency/search directly?
- Can caregiver role access /agency/* routes?
- Can agency role access /admin/* routes?
- Can agency A access agency B's clients?
- Can caregiver A access caregiver B's profile builder?

---

## PHI ENCRYPTION

### Current state
PHI columns exist but store plain text.
Encryption structure built (AES-256-GCM).
PHI_ENCRYPTION_KEY env var set.

### Before any real health data is stored:
Run migration to encrypt existing columns.
Test decrypt on read path.
Verify no plain text in DB after migration.

### Columns requiring encryption
- client_medical.* (all medical history)
- client_cognitive.* (cognitive assessment)
- client_adl.* (ADL assessment)
- caregivers.date_of_birth
- caregivers.emergency_contact_phone
- caregiver_certifications.document_url

---

## INCIDENT RESPONSE

### Severity levels

CRITICAL — respond immediately (within 1 hour)
- Data breach (PII/PHI exposed)
- Authentication bypass discovered
- Admin access compromised
- Production DB compromised

HIGH — respond same day
- XSS or injection vulnerability discovered
- Fake caregiver profiles detected at scale
- Payment system compromise

MEDIUM — respond within 48 hours
- Single fake profile reported
- Rate limiting bypass
- Broken access control (single instance)

LOW — respond within 1 week
- UI bugs affecting user flow
- Performance degradation
- Single user data issue

---

### Data breach response steps

1. CONTAIN (first 30 minutes)
   - Identify affected systems
   - Disable compromised accounts
   - Rotate affected credentials immediately
   - Take affected service offline if necessary

2. ASSESS (first 2 hours)
   - What data was exposed?
   - How many users affected?
   - CA or US users? (different reporting requirements)
   - How long was the breach active?

3. NOTIFY (within 72 hours — PIPEDA requirement)
   Canada: Office of the Privacy Commissioner
   Report: https://www.priv.gc.ca/en/report-a-concern
   
   USA: Depends on state law
   Texas: Attorney General if 250+ affected
   
   Affected users: notify directly via email
   Message: clear, honest, specific about what happened

4. REMEDIATE
   - Fix the vulnerability
   - Audit for similar vulnerabilities
   - Document what happened
   - Update this runbook

5. REVIEW (within 1 week)
   - Post-incident review
   - What failed in prevention?
   - What failed in detection?
   - Update security checklist

---

### Fake profile response steps

1. Admin flags profile for review
2. Freeze profile (remove from search)
3. Review submitted documents
4. Contact submitter via email
5. If confirmed fake: delete + ban Clerk account
6. Log to audit_log with full detail
7. If agency was harmed: notify agency directly
8. If pattern detected: audit similar profiles

---

## ROLLBACK PROCEDURE

### Vercel rollback (fastest)
Vercel Dashboard → Deployments →
Previous deploy → Promote to Production
Takes: ~2 minutes

### Git rollback
```bash
git revert HEAD
git push origin main
```

### Database rollback
```bash
# Restore from backup
psql $DATABASE_URL < backup_YYYYMMDD_HHMMSS.sql
```

### Safe revert points
- 960aca6 — May 4 2026 (pre-session 9)
- Update this after every stable session

---

## DEPENDENCY SECURITY

Run before every launch and quarterly after:
```bash
npm audit
npm audit --audit-level=critical
```

Fix all critical and high vulnerabilities before launch.
Document medium vulnerabilities with mitigation plan.

---

## SECURITY CONTACTS

Platform security issues: 
security@careified.ca (set up before launch)

Privacy requests (PIPEDA):
privacy@careified.ca (set up before launch)

Penetration test vendor:
[To be selected — book before June 1]

Cyber insurance broker:
[To be selected — before launch]

---

Last updated: May 9 2026
Next review: June 1 2026 (pre-launch)