# Routes Audit Report

Generated: 2026-05-01

## Summary

Total page.tsx files found: 32

---

## Complete Route Map

| URL Route | File | Category | Audience |
|-----------|------|----------|----------|
| / | app/page.tsx | Landing | Public |
| /about | app/about/page.tsx | Static | Public |
| /contact | app/contact/page.tsx | Static | Public |
| /privacy | app/privacy/page.tsx | Static | Public |
| /terms | app/terms/page.tsx | Static | Public |
| /for-caregivers | app/for-caregivers/page.tsx | Landing | Public |
| /for-agencies | app/for-agencies/page.tsx | Landing | Public |
| /for-families | app/for-families/page.tsx | Landing | Public |
| /sign-in | app/sign-in/[[...rest]]/page.tsx | Auth | Public |
| /sign-up | app/sign-up/[[...rest]]/page.tsx | Auth | Public |
| /onboarding | app/onboarding/page.tsx | Onboarding | Agency |
| /verify/[slug] | app/verify/[slug]/page.tsx | Verification | Public |
| /profile/start | app/profile/start/page.tsx | Profile | Caregiver |
| /profile/build | app/profile/build/page.tsx | Profile | Caregiver |
| /profile/strength | app/profile/strength/page.tsx | Profile | Caregiver |
| /profile/demo-preview | app/profile/demo-preview/page.tsx | Profile | Caregiver |
| /profile/[id] | app/profile/[id]/page.tsx | Profile | Caregiver |
| /opportunities | app/opportunities/page.tsx | Opportunities | Caregiver |
| /id/[caregiverId] | app/id/[caregiverId]/page.tsx | ID Card | Caregiver |
| /agency/search | app/agency/search/page.tsx | Agency | Agency |
| /agency/shortlist | app/agency/shortlist/page.tsx | Agency | Agency |
| /agency/clients | app/agency/clients/page.tsx | Agency | Agency |
| /agency/clients/new | app/agency/clients/new/page.tsx | Agency | Agency |
| /agency/clients/[id] | app/agency/clients/[id]/page.tsx | Agency | Agency |
| /agency/pending-approval | app/agency/pending-approval/page.tsx | Agency | Agency |
| /agency/signup | app/agency/signup/page.tsx | Agency | Agency |
| /agency/airecruit | app/agency/airecruit/page.tsx | AIRecruit | Agency |
| /agency/airecruit/new | app/agency/airecruit/new/page.tsx | AIRecruit | Agency |
| /agency/airecruit/[campaignId] | app/agency/airecruit/[campaignId]/page.tsx | AIRecruit | Agency |
| /agency/airecruit/[campaignId]/[callId] | app/agency/airecruit/[campaignId]/[callId]/page.tsx | AIRecruit | Agency |
| /admin/agencies | app/admin/agencies/page.tsx | Admin | Admin |
| /settings/data-rights | app/settings/data-rights/page.tsx | Settings | All |

---

## Navigation Links

### Public Navbar (Navbar.tsx)
- / (Home)
- /about
- /contact
- /profile/strength
- /settings/data-rights
- /sign-in
- /sign-up

### Agency Shell (AgencyShell.tsx)
- /agency/search
- /agency/clients
- /agency/shortlist
- /opportunities
- /settings/data-rights

---

## Orphan Routes (Not in Primary Navigation)

| Route | File | Category | Suggested Integration |
|-------|------|----------|---------------------|
| /for-caregivers | app/for-caregivers/page.tsx | Landing | Add to Navbar |
| /for-agencies | app/for-agencies/page.tsx | Landing | Add to Navbar |
| /for-families | app/for-families/page.tsx | Landing | Add to Navbar |
| /profile/start | app/profile/start/page.tsx | Profile | Add to Navbar (when logged in as caregiver) |
| /profile/build | app/profile/build/page.tsx | Profile | Add to Navbar (when logged in as caregiver) |
| /profile/demo-preview | app/profile/demo-preview/page.tsx | Profile | Add to Navbar (when logged in as caregiver) |
| /profile/[id] | app/profile/[id]/page.tsx | Profile | Add to Navbar (when logged in as caregiver) |
| /id/[caregiverId] | app/id/[caregiverId]/page.tsx | ID Card | Add to Navbar (when logged in as caregiver) |
| /agency/airecruit | app/agency/airecruit/page.tsx | AIRecruit | **CRITICAL: Add to AgencyShell** |
| /agency/airecruit/new | app/agency/airecruit/new/page.tsx | AIRecruit | Add to AgencyShell (under /agency/airecruit) |
| /agency/pending-approval | app/agency/pending-approval/page.tsx | Agency | Add to AgencyShell |
| /agency/signup | app/agency/signup/page.tsx | Agency | Add to AgencyShell |
| /admin/agencies | app/admin/agencies/page.tsx | Admin | Add to AgencyShell (admin only) |
| /verify/[slug] | app/verify/[slug]/page.tsx | Verification | Add to Navbar or keep as direct link |

---

## Critical Findings

### 1. AIRecruit Not in Navigation
**Status:** CRITICAL ORPHAN

The entire AIRecruit module is missing from the AgencyShell navigation:
- /agency/airecruit (hub)
- /agency/airecruit/new (create campaign)
- /agency/airecruit/[campaignId] (campaign detail)
- /agency/airecruit/[campaignId]/[callId] (transcript)

**Recommendation:** Add to AgencyShell immediately. This is a core feature that agencies cannot access.

### 2. Profile Pages Not Linked
Caregiver profile pages are not in the main navigation:
- /profile/start
- /profile/build
- /profile/strength
- /profile/demo-preview
- /profile/[id]
- /id/[caregiverId]

**Recommendation:** Add to Navbar when user is authenticated as caregiver.

### 3. Landing Pages Not Linked
Public landing pages not in Navbar:
- /for-caregivers
- /for-agencies
- /for-families

**Recommendation:** Add to Navbar under "About" or "How It Works" section.

### 4. Agency Sub-pages Not Linked
- /agency/pending-approval
- /agency/signup

**Recommendation:** Add to AgencyShell or handle via redirects.

---

## Comparison with HANDOFF.md Section 10

HANDOFF.md lists these routes:

| HANDOFF.md Route | Found? | In Navigation? |
|------------------|--------|----------------|
| / | ✓ | ✓ |
| /about | ✓ | ✓ |
| /contact | ✓ | ✓ |
| /privacy | ✓ | ✗ (expected) |
| /terms | ✓ | ✗ (expected) |
| /for-caregivers | ✓ | ✗ |
| /for-agencies | ✓ | ✗ |
| /for-families | ✓ | ✗ |
| /profile/[id] | ✓ | ✗ |
| /profile/demo-preview | ✓ | ✗ |
| /profile/start | ✓ | ✗ |
| /profile/build | ✓ | ✗ |
| /profile/strength | ✓ | ✓ |
| /opportunities | ✓ | ✓ |
| /agency/search | ✓ | ✓ |
| /agency/shortlist | ✓ | ✓ |
| /agency/clients | ✓ | ✓ |
| /agency/pending-approval | ✓ | ✗ |
| /agency/airecruit | ✓ | ✗ |
| /agency/airecruit/new | ✓ | ✗ |
| /admin/agencies | ✓ | ✗ |
| /sign-in | ✓ | ✓ |
| /sign-up | ✓ | ✓ |
| /onboarding | ✓ | ✗ |
| /settings/data-rights | ✓ | ✓ |
| /api/airecruit/campaigns | ✓ (API) | N/A |

**Missing from HANDOFF.md but found:**
- /agency/clients/new
- /agency/clients/[id]
- /agency/signup
- /agency/airecruit/[campaignId]
- /agency/airecruit/[campaignId]/[callId]
- /id/[caregiverId]
- /verify/[slug]

---

## Recommendations

1. **Immediate:** Add /agency/airecruit to AgencyShell navigation
2. **High:** Add profile links to Navbar for authenticated caregivers
3. **Medium:** Add landing pages (/for-*) to Navbar
4. **Low:** Add admin routes to AgencyShell for admin users
