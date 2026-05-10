# ACCESSIBILITY.md — Careified Accessibility Standards
# Purpose: WCAG compliance targets and AODA requirements
# Status: NOT YET AUDITED — pre-launch audit required
# Owner: Both

---

## 1. WHY

- **AODA legal exposure** — Ontario-incorporated entity must publish accessibility statement
- **Ethical duty** — Caregivers are 52-year-old PSWs on phones, often ESL
- **Service to families** — Families with disabilities use the family portal

---

## 2. TARGET

- WCAG 2.1 Level AA before launch
- Working toward AAA post-launch

---

## 3. INTERACTION

- **Touch targets:** minimum 44x44px (mobile)
- **Focus states:** visible on every interactive element (gold 2px ring)
- **Keyboard navigation:** full coverage
- **No keyboard trap:** on modals

---

## 4. CONTENT

- **Alt text:** required on every img
- **Form labels:** every input — no placeholder-as-label
- **Error messages:** associated with field via aria-describedby
- **Page language:** declared — html lang="en-CA"

---

## 5. COLOUR

- **Contrast ratio:** 4.5:1 minimum body, 3:1 large text
- **Audit:** gold #C9973A on warm-white #F7F4F0 — confirm passes
- **Never colour as the only signal**

---

## 6. LANGUAGE

- **Plain English** target — Grade 6 reading level for caregiver-facing copy
- **Future:** French (Canada), Spanish (US Texas)

---

## 7. STATUS

NOT YET AUDITED — pre-launch audit required

Tools needed:
- axe DevTools
- Lighthouse
- Manual screen reader pass

AODA-specific:
- Ontario-incorporated entity must publish accessibility statement
- Confirm with lawyer

---

## 8. CHECKLIST

Pre-launch:
- [ ] Run axe DevTools on all 36 pages
- [ ] Run Lighthouse accessibility audit
- [ ] Manual keyboard navigation test (tab through all pages)
- [ ] Manual screen reader test (VoiceOver/NVDA)
- [ ] Contrast ratio audit on all colour combinations
- [ ] Form labels audit — no placeholder-as-label
- [ ] Alt text audit — every image has description
- [ ] Focus state audit — every interactive element has visible focus
- [ ] Touch target audit — all buttons/links minimum 44x44px
- [ ] Publish accessibility statement on /accessibility (new page)
- [ ] Confirm AODA compliance with lawyer

---

Last updated: May 9 2026
Pre-launch: Full accessibility audit required