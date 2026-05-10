# INTEGRATIONS.md — Careified Third-Party Integrations
# Purpose: What connects to Careified and how
# Updated: May 9 2026
# Update trigger: When integrations are built or new ones are planned
# Owner: Both
# DO NOT DUPLICATE: AI flows (AI_PLAYBOOK.md), env vars (CLAUDE.md)

---

## CURRENT INTEGRATIONS (Live)

| Service | Purpose | Status | Key |
|---------|---------|--------|-----|
| Clerk | Auth + user management | ✅ Live (dev keys) | CLERK_SECRET_KEY |
| Render PostgreSQL | Primary database | ✅ Live | DATABASE_URL |
| Vercel | Hosting + deployment | ✅ Live | Auto via GitHub |
| OpenRouter | AI scoring + resume parsing | ✅ Live | OPENROUTER_API_KEY |
| Vapi | AI voice calls (AIRecruit) | ✅ Live | VAPI_API_KEY |
| Microsoft Clarity | Session recording | ✅ Live | NEXT_PUBLIC_CLARITY_ID |
| Ybug | Bug reporting | ✅ Live | NEXT_PUBLIC_YBUG_ID |

---

## PHASE 1 INTEGRATIONS (June 15)

### CSV Import (build in-house)
Purpose: Agency uploads existing caregiver roster
Complexity: Low — 1 week build
No third-party needed — parse CSV server-side

CSV template columns:
first_name, last_name, email, phone,
role, years_experience, city, province_state

Flow:
1. Agency downloads template
2. Fills in caregiver data
3. Uploads CSV
4. Server parses with papaparse (already in stack)
5. Creates stub caregiver profiles
6. Sends claim emails to caregivers

---

## PHASE 2 INTEGRATIONS (August 2026)

### Twilio WhatsApp Business API
Purpose: WhatsApp notifications to agencies,
         caregivers, and families
Cost: ~$0.005 USD per message (low volume)
Setup time: 3-5 days (Meta approval required)

Setup steps:
1. Twilio account (already have via Vapi)
2. Enable WhatsApp in Twilio console
3. Create WhatsApp Business profile
4. Submit message templates for approval
5. Add env vars:
   TWILIO_ACCOUNT_SID
   TWILIO_AUTH_TOKEN
   TWILIO_WHATSAPP_NUMBER
6. Build webhook: /api/whatsapp/webhook
7. Test in Twilio sandbox first

Fallback: SMS via Twilio if WhatsApp unavailable

### Twilio SMS (direct)
Purpose: SMS notifications separate from Vapi
Cost: ~$0.0075 USD per message
Setup: 1 day (already have Twilio via Vapi)

Add to existing Twilio account:
- Provision SMS-capable number
- Build /api/sms/send route
- Add to caregiver_communication_consents

### Telegram Bot API
Purpose: Alternative to WhatsApp for
         agency coordinators
Cost: Free
Setup time: 1 day

Steps:
1. Create bot via @BotFather
2. Get TELEGRAM_BOT_TOKEN
3. Set webhook: /api/telegram/webhook
4. Build command handlers

### Stripe (Billing)
Purpose: Agency and caregiver subscriptions
Cost: 2.9% + $0.30 per transaction
Setup time: 1 week

Prerequisites:
- Stripe account created
- Pricing confirmed (see PRICING.md)
- Legal review complete

Products to create (see PRICING.md for full list)

Key env vars:
STRIPE_SECRET_KEY
STRIPE_PUBLISHABLE_KEY
STRIPE_WEBHOOK_SECRET

Webhook endpoint: /api/stripe/webhook
Events to handle:
- customer.subscription.created
- customer.subscription.updated
- customer.subscription.deleted
- invoice.payment_failed
- invoice.payment_succeeded

---

## PHASE 3 INTEGRATIONS (October 2026)

### OpenAI / OpenRouter — Conversation AI
Purpose: Two-way AI assistant for WhatsApp/Telegram
Currently using: OpenRouter for scoring and parsing
Expand to: Conversation management

Conversation state management:
- No memory between conversations by default
- Context injected per request (agency ID, shortlist, etc.)
- Session window: last 10 messages for context

### Upstash Redis
Purpose:
- Persistent rate limiting (replace in-memory)
- Conversation state caching
- Session management at scale
Cost: Free tier available
Setup: 1 day

env vars:
UPSTASH_REDIS_REST_URL
UPSTASH_REDIS_REST_TOKEN

---

## PHASE 4 INTEGRATIONS (2027)

### Alayacare
Purpose: Canada's leading home care platform
Type: API integration for data sync
Market: Canada
Complexity: High — 3+ months
Value: Agencies already using Alayacare
       can sync caregiver data

### ClearCare / WellSky
Purpose: US market leading home care platform
Type: API integration
Market: USA
Complexity: High — 3+ months
Value: Texas agencies likely using this

### Checkr
Purpose: Background check integration
Market: USA primarily
Type: API — embed in profile builder
Trigger: Step 6 compliance (US version)
Cost: Per-check pricing (~$30-50 USD)

env vars:
CHECKR_API_KEY
CHECKR_WEBHOOK_SECRET

### Persona / Didit
Purpose: Identity verification (PSV)
Type: API — embed in profile builder
Trigger: After Step 1 identity
Cost: Per-verification pricing

### Hireology
Purpose: Recruitment CRM used by some agencies
Type: Data import/export
Complexity: Medium

### Google Calendar
Purpose: Shift scheduling sync
Type: OAuth + Google Calendar API
Market: Both CA and US

### Microsoft Outlook Calendar
Purpose: Alternative calendar sync
Type: Microsoft Graph API

---

## INTEGRATION FALLBACK RULES

Every integration must have a defined fallback:

| Integration | Fallback |
|-------------|---------|
| Vapi down | Queue call, retry when restored |
| OpenRouter down | Cache last score, flag for manual review |
| Clerk down | Show maintenance page, no auth bypass |
| Render DB down | Show maintenance page, no degraded mode |
| Twilio down | In-platform notification only |
| Stripe down | Allow usage, bill retroactively |
| CSV parse error | Show row-level errors, allow partial import |

Never fail silently. Always tell the user what happened
and what they can do about it.

---

## WEBHOOK SECURITY RULES

Every incoming webhook must:
1. Verify signature before processing
2. Return 200 immediately, process async
3. Be idempotent (safe to receive twice)
4. Log to audit_log on receipt
5. Have a dead letter queue for failures

Current webhook endpoints:
- /api/airecruit/webhook (Vapi) ✅ HMAC verified
- /api/stripe/webhook (Stripe) ❌ not built
- /api/whatsapp/webhook (Twilio) ❌ not built
- /api/telegram/webhook (Telegram) ❌ not built

---

## ENV VARS — COMPLETE LIST

### Current (set in .env.local + Vercel)
DATABASE_URL
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
CLERK_SECRET_KEY
NEXT_PUBLIC_LOCALE
OPENROUTER_API_KEY
PHI_ENCRYPTION_KEY
VAPI_API_KEY
VAPI_ASSISTANT_ID
VAPI_PHONE_NUMBER_ID
ADMIN_CLERK_USER_ID
NEXT_PUBLIC_CLARITY_ID
NEXT_PUBLIC_YBUG_ID

### Phase 2 (add when building)
TWILIO_ACCOUNT_SID
TWILIO_AUTH_TOKEN
TWILIO_WHATSAPP_NUMBER
TWILIO_SMS_NUMBER
TELEGRAM_BOT_TOKEN
STRIPE_SECRET_KEY
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
STRIPE_WEBHOOK_SECRET

### Phase 3 (add when building)
UPSTASH_REDIS_REST_URL
UPSTASH_REDIS_REST_TOKEN

### Phase 4 (add when building)
CHECKR_API_KEY
CHECKR_WEBHOOK_SECRET
PERSONA_API_KEY
ALAYACARE_API_KEY
GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET

### Rules for all env vars
- NEVER set via CLI — Vercel dashboard only
- NEVER commit to git
- NEXT_PUBLIC_ prefix = visible to browser —
  never put secrets here
- Add to .env.local immediately after Vercel dashboard
- Document every new var in this file

---

Last updated: May 9 2026