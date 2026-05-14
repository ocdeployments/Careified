# TICKETING_SPEC.md — Careified Support Ticketing System
# Purpose: Operational support + PIPEDA compliance (30-day SLA for data rights)
# Status: NOT BUILT — minimum viable required for June 15 launch
# Owner: Both

---

## 1. PURPOSE

### Operational
- Agencies need to submit support requests (billing, technical, onboarding)
- Caregivers need to submit support requests
- Romy needs a queue to action requests

### Legal (PIPEDA)
- Data export requests: 30-day SLA to fulfill
- Data deletion requests: 30-day SLA to fulfill
- Must have system of record for these requests

---

## 2. DB SCHEMA

### Table: support_tickets
```sql
CREATE TABLE support_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_number VARCHAR(20) NOT NULL UNIQUE, -- CRF-TKT-0001
  submitter_id UUID NOT NULL, -- clerk user_id
  submitter_type VARCHAR(20) NOT NULL, -- 'caregiver' | 'agency' | 'admin'
  agency_id UUID REFERENCES agencies(id),
  caregiver_id UUID REFERENCES caregivers(id),
  type VARCHAR(30) NOT NULL, -- 'billing' | 'verification' | 'platform' | 'data_rights' | 'dispute' | 'feature' | 'general'
  priority VARCHAR(20) NOT NULL DEFAULT 'medium', -- 'low' | 'medium' | 'high' | 'urgent'
  status VARCHAR(30) NOT NULL DEFAULT 'open', -- 'open' | 'assigned' | 'in_progress' | 'pending_user' | 'resolved' | 'closed'
  subject VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  admin_notes TEXT,
  assigned_to UUID, -- admin clerk user_id
  sla_due_at TIMESTAMP, -- 30 days from creation for data_rights
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  resolved_at TIMESTAMP,
  closed_at TIMESTAMP
);
```

### Table: ticket_messages
```sql
CREATE TABLE ticket_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL, -- clerk user_id
  sender_type VARCHAR(20) NOT NULL, -- 'caregiver' | 'agency' | 'admin'
  message TEXT NOT NULL,
  internal BOOLEAN NOT NULL DEFAULT FALSE, -- admin-only messages
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

---

## 3. TICKET TYPES & SLA

| Type | Description | SLA |
|------|-------------|-----|
| data_rights | PIPEDA export/delete request | 30 days |
| billing | Payment issues, invoices, refunds | 5 days |
| verification | Credential issues, profile problems | 3 days |
| platform | Bug reports, technical issues | 3 days |
| dispute | Score disputes, placement issues | 7 days |
| feature | Feature requests | No SLA |
| general | Everything else | 5 days |

---

## 4. LIFECYCLE

```
open → assigned → in_progress → pending_user → resolved → closed
  ↓
  └── (reopen if needed within 14 days)
```

### Allowed Transitions
- open → assigned (admin takes ownership)
- assigned → in_progress (working on it)
- in_progress → pending_user (waiting for user response)
- pending_user → in_progress (user responded)
- in_progress → resolved (solution provided)
- resolved → closed (user confirms or 7 days no response)
- closed → open (admin reopens)

---

## 5. AUTO-CREATE TRIGGERS

| Trigger | Ticket Type | Auto-created When |
|---------|-------------|-------------------|
| /settings/data-rights export | data_rights | User clicks "Export my data" |
| /settings/data-rights delete | data_rights | User clicks "Delete my data" |
| Payment failure (Stripe) | billing | stripe.webhook invoice.payment_failed |
| Expiring credentials | verification | Cron job detects credential expiring in 30 days |
| AIRecruit call failure | platform | Webhook receives failed status |

---

## 6. PAGES NEEDED

### Public
- `/support` — Public submission form (no auth required)

### Caregiver (auth required)
- `/caregiver/support` — Pre-filled form, my tickets list

### Agency (auth required)
- `/agency/support` — Pre-filled form, agency tickets list

### Admin
- `/admin/tickets` — Queue with filters (status, type, priority, assignee)
- `/admin/tickets/[id]` — Detail view + message thread + internal notes

---

## 7. LAUNCH MINIMUM (June 15)

For June 15 launch, MUST have:
- [ ] support_tickets + ticket_messages tables exist
- [ ] /settings/data-rights creates data_rights ticket automatically
- [ ] /admin/tickets queue exists for Romy to action
- [ ] /agency/support submission form exists
- [ ] /caregiver/support submission form exists
- [ ] Email confirmation on ticket creation (depends on Issue 6 — Resend)

---

## 8. POST-LAUNCH (Phase 2)

Nice to have after launch:
- [ ] SLA tracking dashboard (overdue highlighting)
- [ ] Auto-assign rules (billing → accounting email)
- [ ] Internal notes UI for admin
- [ ] Message thread UI for user communication
- [ ] Ticket merging (duplicate tickets)
- [ ] Bulk actions (close multiple resolved tickets)

---

## 9. STATUS

| Item | Status |
|------|--------|
| DB tables | ❌ Not created |
| /settings/data-rights integration | ❌ Not wired |
| /admin/tickets queue | ❌ Not built |
| /agency/support | ❌ Not built |
| /caregiver/support | ❌ Not built |
| Email on create | ❌ Blocked on Issue 6 |

**Target:** Minimum viable for June 15 launch

---

Last updated: May 9 2026